const db = require("../helpers/db.js");
const { campusesMap, affiliationsMap } = require("../constants.js");

const config = require("../config.js");

const insertCase = async (
  userName,
  patient,
  campusCode,
  affiliationCode,
  isFaculty,
  problem,
  txn,
) => {
  if (!patient || !txn) {
    throw new Error("Incomplete arguments.");
  }

  const caseCode = (
    await db.query("EXEC UERMHIMS..SP_JMS_ADM_GetNewNumber 'OPD', '';", [], txn)
  )[0]?.NewCaseNo;

  await db.query(
    `
      INSERT INTO UERMMMC..Cases (
        ADMITTED_BY,
        CaseNo,
        PatientNo,
        DISC_CODE,
        PATIENTTYPE,
        CC,
        PATIENT_CATEGORY,
        DISCHARGE,
        UERM_STUD_EMPLOYEE,
        DeptId,
        IsPay,
        EmpCode,
        PWD_IDNo,
        IsSenior,
        ApplicationName,
        UDF_AppVersion,
        UDF_SCIDNO,
        UDF_IsPWD,
        UDF_CaseDept,
        UDF_isAutoDischarged
      )
      VALUES (
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
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      );
    `,
    [
      userName, // ADMITTED_BY
      caseCode, // CaseNo
      patient.code, // PatientNo
      "PAY", // DISC_CODE
      "OPD", // PATIENT_TYPE
      `${config.appName} Referral - ${problem}`, // CC
      "PAY", // PATIENT_CATEGORY
      "N", // DISCHARGE
      `${
        isFaculty ? "Faculty" : affiliationsMap[affiliationCode]?.name || ""
      } - ${campusesMap[campusCode]?.name || ""}`,
      "INF_CH", // UERM_STUD_EMPLOYEE
      1, // IsPay
      patient.employeeCode || null, // EmpCode
      patient.pwdIdCode || null, // PWD_IDNo
      patient.isSeniorCitizen, // IsSenior
      "INFIRMARY", // ApplicationName
      `${config.appName} ${config.appVersion}`, // UDF_AppVersion
      patient.seniorCitizenIdCode || null, // UDF_SCIDNO
      patient.isPWD, // UDF_IsPWD
      "INFIRMARY", // UDF_CaseDept
      1, // UDF_isAutoDischarged
    ],
    txn,
  );

  return (
    await db.query(
      `
        SELECT TOP 1
          CaseNo AS code,
          PatientNo AS patientCode,
          DateAd AS dateTimeAdmitted
        FROM
          UERMMMC..Cases
        ORDER BY
          Id DESC;
      `,
      [],
      txn,
    )
  )[0];
};

module.exports = {
  insertCase,
};
