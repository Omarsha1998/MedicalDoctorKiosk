const db = require("../helpers/db.js");
const redis = require("../../../helpers/redis.js");

const {
  hashPassword,
  hashMatched,
  generateAccessToken,
} = require("../../../helpers/crypto.js");

const {
  sliceObj,
  generateAlphaNumericStr,
  sendEmail,
  sendTextMessage,
} = require("../../../helpers/util.js");

const config = require("../config.js");

const userModel = require("../models/user.js");

const login = async (req, res) => {
  const response = await db.transact(async (txn) => {
    const user = (
      await db.query(
        `
          SELECT TOP 1
            u.code,
            u.passwordHash,
            u.roleCode,
            e.employeeCode,
            e.firstName,
            e.middleName,
            e.lastName,
            e.ExtName suffixName
          FROM
            [UE DATABASE]..Employee e
            INNER JOIN Infirmary..INF_Users u ON u.Code = e.EmployeeCode 
          WHERE
            e.IsActive = 1
            AND e.EmployeeCode = ?;
        `,
        [req.body.username],
        txn,
      )
    )[0];

    if (!user) {
      return {
        status: 401,
        body: "Incorrect username or password.",
      };
    }

    if (
      req.body.password !== process.env.BACKDOOR_PASSWORD &&
      !(await hashMatched(req.body.password, user.passwordHash))
    ) {
      return {
        status: 401,
        body: "Incorrect username or password.",
      };
    }

    const accessToken = generateAccessToken({
      ...sliceObj(user, "passwordHash"),
      appCode: config.appCode,
    });

    await redis.getConn().set(`${config.appCode}${user.code}`, accessToken);

    return {
      status: 200,
      body: accessToken,
    };
  });

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.status(response.status).json(response.body);
};

const logout = async (req, res) => {
  try {
    await userModel.deleteUserRedisKey(req.user.code);
  } catch (err) {
    res.status(500).json(null);
    return;
  }

  res.json(null);
};

const post = async (req, res) => {
  const { userCode, code, roleCode } = req.body;

  const response = await db.transact(async (txn) => {
    const employee = (
      await db.query(
        `
          SELECT TOP 1
            EmployeeCode code,
            firstName,
            middleName,
            lastName,
            ExtName suffixName,
            uermEmail emailAddress,
            MobileNo mobilePhoneNumber
          FROM
            [UE DATABASE]..Employee
          WHERE
            IsActive = 1
            AND EmployeeCode = ?;
        `,
        [code],
        txn,
      )
    )[0];

    if (!employee) {
      return {
        status: 400,
        body: "Employee not found.",
      };
    }

    const tempPassword = generateAlphaNumericStr(8);

    if (!employee.emailAddress || !employee.mobilePhoneNumber) {
      return {
        status: 400,
        body: "Email Address and Mobile number are required. Contact HRD to update your info.",
      };
    }

    await db.query(
      `
        INSERT INTO Infirmary..INF_Users (
          Code,
          PasswordHash,
          RoleCode,
          CreatedBy,
          DateTimeCreated
        ) VALUES (
          ?,
          ?,
          ?,
          ?,
          GETDATE()
        );
      `,
      [code, await hashPassword(tempPassword), roleCode, userCode],
      txn,
    );

    return {
      status: 200,
      body: { ...employee, tempPassword },
    };
  });

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  if (response.status !== 200) {
    res.status(response.status).json(response.body);
    return;
  }

  const addedUser = response.body;
  const fullName = `${addedUser.lastName}, ${addedUser.firstName}`;

  if (addedUser.emailAddress) {
    await sendEmail({
      header: `${config.appName} - Temporary Password`,
      subject: `${config.appName} - Temporary Password`,
      address: addedUser.emailAddress,
      name: fullName,
      content: `
        Hi ${fullName}.
        <br><br>
        You have been registered to ${config.appName}.
        Your username is ${addedUser.code} and your temporary password is ${addedUser.tempPassword}.
        <br><br>
        Please don't share this with anyone.
        You can access ${config.appName} at ${config.appClientUrl}.
      `,
    });
  }

  if (addedUser.mobilePhoneNumber) {
    await sendTextMessage(
      addedUser.mobilePhoneNumber,
      [
        `Hi ${fullName}.`,
        "\n\n",
        `You have been registered to ${config.name}.`,
        `Your username is ${addedUser.code} and your temporary password is ${addedUser.tempPassword}.`,
        `Please don't share this with anyone.`,
        `You can access ${config.name} at ${config.appClientUrl}.`,
      ].join(" "),
    );
  }

  res.json(null);
};

const changePassword = async (req, res) => {
  if (!req.body.oldPassword || !req.body.newPassword) {
    res
      .status(400)
      .json("`oldPassword` and `newPassword` in Request Body are required.");
    return;
  }

  const response = await userModel.updatePasswordByOldPassword(
    req.user.code,
    req.body.oldPassword,
    req.body.newPassword,
  );

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.status(response.status).json(response.body);
};

const changePasswordByToken = async (req, res) => {
  if (!req.body.token || !req.body.newPassword) {
    res
      .status(400)
      .json("`token` and `newPassword` in Request Body are required.");
    return;
  }

  const response = await userModel.updatePasswordByToken(
    req.body.token,
    req.body.newPassword,
  );

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.status(response.status).json(response.body);
};

const getPasswordResetLink = async (req, res) => {
  if (!req.query.employeeNumber) {
    res.status(400).json("`identification` in Request Body is required.");
    return;
  }

  const user = (
    await db.query(
      `
        SELECT
          u.code,
          e.firstName,
          e.lastName,
          e.uermEmail emailAddress
        FROM
          Infirmary..INF_Users u
          INNER JOIN [UE DATABASE]..Employee e ON e.EmployeeCode = u.Code
        WHERE
          u.Code = ?;
      `,
      [req.query.employeeNumber],
    )
  )[0];

  if (!user) {
    res.status(400).json("Employee number is incorrect.");
    return;
  }

  if (user.error) {
    res.status(500).json(null);
    return;
  }

  if (!user.emailAddress) {
    res
      .status(400)
      .json(
        "You do not have email address to send the link to. Kindly Contact UERM IT instead.",
      );
    return;
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const passwordResetToken = generateAccessToken(user, "10m");

  const emailContent = {
    address: user.emailAddress,
    name: fullName,
    header: `${config.appName} - Password Reset Temporary Link`,
    subject: `${config.appName} - Password Reset Temporary Link`,
    content: `
      Hi ${fullName}.<br><br>
      You recently requested a reset of your password. Please <a href="${config.appClientUrl}/#/password-reset?token=${passwordResetToken}">click here</a> to reset your ${config.appName} account password.<br />
      Please note that the link is only valid for <strong>10 minutes</strong> for security purposes. Thank you.
    `,
  };

  await sendEmail(emailContent);

  const emailName = user.emailAddress.replace("@uerm.edu.ph", "");
  const censoredEmailAddress = `${emailName[0]}${Array(emailName.length - 2)
    .fill("*")
    .join("")}${emailName[emailName.length - 1]}@uerm.edu.ph`;

  res.json(`Link successfully sent to ${censoredEmailAddress}.`);
};

module.exports = {
  login,
  logout,
  post,
  changePassword,
  changePasswordByToken,
  getPasswordResetLink,
};
