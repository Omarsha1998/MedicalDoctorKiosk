const db = require("../helpers/db.js");

const config = require("../config.js");

const get = async (req, res) => {
  if (!req.query.searchStr) {
    res.status(400).json("URL query `searchStr` is required.");
    return;
  }

  if (req.query.searchStr.length < 5) {
    res
      .status(400)
      .json("URL query `searchStr` should be at least 5 characters.");
    return;
  }

  const response = await db.query(
    `
      SELECT
        p.PatientNo code,
        p.firstName,
        p.middleName,
        p.lastName,
        p.Suffix suffixName,
        p.DBirth birthDate,
        p.Sex gender,
        p.address
      FROM
        UERMMMC..PatientInfo p
      WHERE
        CONCAT(p.LastName, ', ', p.FirstName) LIKE ?
        OR CONCAT(p.FirstName, ' ', p.LastName) LIKE ?;
    `,
    [`%${req.query.searchStr}%`, `%${req.query.searchStr}%`],
  );

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(response);
};

const post = async (req, res) => {
  if (
    !req.body ||
    !req.body.studempCode ||
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.birthDate ||
    !req.body.campusCode ||
    !req.body.affiliationCode
  ) {
    res.status(400).json("Request body is malformed.");
    return;
  }

  const response = await db.transact(async (txn) => {
    const existingPatient = (
      await db.query(
        `
          SELECT TOP 1
            PatientNo code,
            dBirth birthDate,
            firstName,
            middleName,
            lastName,
            suffix suffixName,
            sex gender,
            CASE WHEN ISNULL(EmpNo, '') = '' THEN
              SN
            ELSE
              EmpNo
            END studempCode,
            CASE WHEN ISNULL(EmpNo, '') = '' THEN
              'STU'
            ELSE
              'EMP'
            END affiliationCode,
            CAST(INF_CAMPUS AS VARCHAR) campusCode
          FROM
            UERMMMC..PatientInfo
          WHERE
            ISNULL(INF_CAMPUS, '2') = ?
            AND (
              ('EMP' = ? AND EmpNo = CONCAT('UE', ?))
              OR ('STU' = ? AND SN = ?)
            );
        `,
        [
          req.body.campusCode,
          req.body.affiliationCode,
          req.body.studempCode,
          req.body.affiliationCode,
          req.body.studempCode,
        ],
        txn,
      )
    )[0];

    if (existingPatient) {
      // console.log("Patient exists.");
      return existingPatient;
    }

    const generatedPatientCode = (
      await db.query(
        `
          SELECT
            CONCAT(
              RIGHT(YEAR(GETDATE()), 2),
              FORMAT(
                ISNULL(MAX(CAST(RIGHT(PatientNo, LEN(PatientNo) - 2) AS BIGINT)), 0) + 1,
                '00000000'
              )
            ) generatedPatientCode
          FROM         
            [UERMMMC]..[PatientInfo]
          WHERE
            RIGHT(PatientNo, 1) <> 'W';
        `,
        [],
        txn,
      )
    )[0].generatedPatientCode;

    await db.query(
      `
        INSERT INTO UERMMMC..PatientInfo (
          patientNo,
          dBirth,
          firstName,
          middleName,
          lastName,
          suffix,
          sex,
          EmpNo,
          SN,
          INF_CAMPUS,
          isEmployeeDependentVerified,
          UDF_MODULE,
          UDF_AppName,
          DATE_ENCODED
        ) VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          GETDATE()
        );
      `,
      [
        generatedPatientCode,
        new Date(req.body.birthDate),
        req.body.firstName,
        req.body.middleName || null,
        req.body.lastName,
        req.body.suffixName || null,
        req.body.gender,
        req.body.affiliationCode === "EMP" ? `UE${req.body.studempCode}` : null,
        req.body.affiliationCode === "STU" ? req.body.studempCode : null,
        req.body.campusCode,
        false,
        config.appCode,
        config.appCode,
      ],
      txn,
    );

    return {
      ...req.body,
      code: generatedPatientCode,
    };
  });

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(response);
};

module.exports = {
  get,
  post,
};
