const db = require("../helpers/db.js");

const insertReferral = async (
  userCode,
  caseCode,
  isEmergency,
  referralTypeName,
  referralTypeOther,
  admissionTypeCode,
  problem,
  doctorCode,
  doctorDeptCode,
  remarks,
  studempCampusName,
  studempDeptName,
  studempAffiliationName,
  studempIsFaculty,
  txn,
) => {
  if (!caseCode || !caseCode || !admissionTypeCode || !doctorDeptCode || !txn) {
    throw new Error("Incomplete arguments.");
  }

  await db.query(
    `
      INSERT INTO Infirmary..INF_Referrals (
        CaseCode,
        IsEmergency,
        ReferralType,
        ReferralTypeOther,
        AdmissionTypeCode,
        Problem,
        DoctorCode,
        DoctorDeptCode,
        StudempCampusName,
        StudempDeptName,
        StudempAffiliationName,
        StudempIsFaculty,
        CreatedBy,
        DateTimeCreated,
        Remarks
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
        GETDATE(),
        ?
      );
    `,
    [
      caseCode,
      isEmergency,
      referralTypeName,
      referralTypeOther,
      admissionTypeCode,
      problem,
      doctorCode,
      doctorDeptCode,
      studempCampusName,
      studempDeptName,
      studempAffiliationName,
      studempIsFaculty,
      userCode,
      remarks || null,
    ],
    txn,
  );
};

module.exports = {
  insertReferral,
};
