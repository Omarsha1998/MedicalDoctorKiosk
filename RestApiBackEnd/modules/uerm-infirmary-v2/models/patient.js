const db = require("../helpers/db.js");

const selectPatient = async (patientCode, txn) => {
  return (
    await db.query(
      `
        SELECT TOP 1
          PatientNo code,

          FirstName firstName,
          MiddleName middleName,
          LastName lastName,
          Suffix suffixName,
          Sex gender,
          DBirth birthDate,

          EmpNo employeeCode,
          SN studentCode,
          SCIDNO seniorCitizenIdCode,
          PWD_IDNo pwdIdCode,
          CASE WHEN SCIDNO <> '' AND DATEDIFF(HOUR, CAST(DBIRTH AS DATETIME), GETDATE()) / 8766 >= 60 THEN
            1
          ELSE
            0
          END isSeniorCitizen,
          CASE WHEN SCIDNO = '' AND ISNULL(PWD_IDNo, '') NOT IN ('', '0') THEN
            1
          ELSE
            0
          END isPWD
        FROM
          UERMMMC..PatientInfo
        WHERE
          PatientNo = ?;
      `,
      [patientCode],
      txn,
    )
  )[0];
};

module.exports = {
  selectPatient,
};
