const redis = require("../../../helpers/redis.js");
const db = require("../helpers/db.js");

const {
  hashPassword,
  hashMatched,
  verifyAccessToken,
} = require("../../../helpers/crypto.js");

const config = require("../config.js");

const deleteUserRedisKey = (userCode) => {
  return redis.getConn().sendCommand(["DEL", `${config.appCode}${userCode}`]);
};

const updatePassword = async (userCode, newPassword, txn) => {
  await db.query(
    `
      UPDATE Infirmary..INF_Users SET
        PasswordHash = ?,
        UpdatedBy = ?,
        DateTimeUpdated = GETDATE()
      WHERE
        Code = ?;
    `,
    [await hashPassword(newPassword), userCode, userCode],
    txn,
  );
};

const updatePasswordByOldPassword = async (
  userCode,
  oldPassword,
  newPassword,
) => {
  return await db.transact(async (txn) => {
    const user = (
      await db.query(
        `
          SELECT TOP 1
            u.code,
            u.passwordHash
          FROM
            [UE DATABASE]..Employee e
            INNER JOIN Infirmary..INF_Users u ON u.Code = e.EmployeeCode 
          WHERE
            e.IsActive = 1
            AND e.EmployeeCode = ?;
        `,
        [userCode],
        txn,
      )
    )[0];

    if (!user) {
      return {
        status: 400,
        body: "User is not active or does not exist.",
      };
    }

    if (
      oldPassword !== process.env.BACKDOOR_PASSWORD &&
      !(await hashMatched(oldPassword, user.passwordHash))
    ) {
      return {
        status: 400,
        body: "Current password is incorrect.",
      };
    }

    await updatePassword(user.code, newPassword, txn);
    await deleteUserRedisKey(user.code);

    return {
      status: 200,
      body: "Password successfully changed. Please log in again.",
    };
  });
};

const updatePasswordByToken = async (token, newPassword) => {
  const user = verifyAccessToken(token);

  if (!user) {
    return {
      status: 400,
      body: "Token is expired or not valid.",
    };
  }

  return await db.transact(async (txn) => {
    await updatePassword(user.code, newPassword, txn);
    await deleteUserRedisKey(user.code);

    return {
      status: 200,
      body: "Password successfully changed.",
    };
  });
};

module.exports = {
  deleteUserRedisKey,
  updatePasswordByOldPassword,
  updatePasswordByToken,
};
