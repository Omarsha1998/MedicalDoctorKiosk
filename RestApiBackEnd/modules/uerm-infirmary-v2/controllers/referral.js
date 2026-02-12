const db = require("../helpers/db.js");
const { campusesMap, affiliationsMap } = require("../constants.js");

const patientModel = require("../models/patient.js");
const caseModel = require("../models/case.js");
const referralModel = require("../models/referral.js");

const get = async (req, res) => {
  const sqlWhereStrArr = [];
  const sqlWhereArgs = [];

  if (req.query?.patientCode) {
    sqlWhereStrArr.push("p.PatientNo = ?");
    sqlWhereArgs.push(req.query.patientCode);
  } else if (req.query?.patientName) {
    sqlWhereStrArr.push(
      "(CONCAT(p.LastName, ', ', p.FirstName) LIKE ? OR CONCAT(p.FirstName, ' ', p.LastName) LIKE ?)",
    );
    sqlWhereArgs.push(
      `%${req.query.patientName}%`,
      `%${req.query.patientName}%`,
    );
  }

  const response = await db.query(
    `
      SELECT ${sqlWhereStrArr.length === 0 ? "TOP 5" : ""}
        r.id,
        r.isEmergency,
        r.ReferralType referralTypeName,
        r.ReferralTypeOther referralTypeOther,
        r.admissionTypeCode,
        r.problem,
        CONCAT(e.LastName, ', ', e.FirstName, ' ', e.MiddleName) createdBy,
        r.dateTimeCreated,

        r.DoctorCode doctorCode,
        CASE WHEN r.DoctorCode IS NULL THEN
          NULL
        ELSE
          CONCAT(
            d.[LAST NAME],
            ', ',
            d.[FIRST NAME],
            ' ',
            d.[MIDDLE NAME],
            ' ',
            d.[EXT NAME]
          )
        END doctorFullName,
        dp.Code doctorDeptCode,
        dp.[name] doctorDeptName,

        c.CaseNo caseCode,
        c.DateAd caseDateTimeAdmitted,

        p.PatientNo patientCode,
        p.FirstName patientFirstName,
        p.MiddleName patientMiddleName,
        p.LastName patientLastName,
        p.Suffix patientSuffixName,
        p.Sex patientGender,
        p.DBirth patientBirthDate,

        CASE WHEN ISNULL(p.SN, '') = '' THEN
          p.EmpNo
        ELSE
          p.SN
        END studempCode,
        r.studempCampusName,
        r.studempDeptName,
        r.studempAffiliationName,
        r.studempIsFaculty
      FROM
        Infirmary..INF_Referrals r
        INNER JOIN [UE DATABASE]..Employee e ON e.EmployeeCode = r.createdBy
        INNER JOIN UERMMMC..Cases c ON c.CaseNo = r.CaseCode
        INNER JOIN UERMMMC..PatientInfo p ON p.PatientNo = c.PatientNo
        INNER JOIN UERMMMC..MedicalDepartments dp ON dp.Code = r.DoctorDeptCode
        LEFT JOIN UERMMMC..Doctors d ON d.Code = r.DoctorCode
      ${
        sqlWhereStrArr.length > 0
          ? "WHERE ".concat(sqlWhereStrArr.join(" AND "))
          : ""
      }
      ${sqlWhereStrArr.length === 0 ? "ORDER BY Id DESC" : ""};
    `,
    sqlWhereArgs,
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
    !req.body.studemp ||
    !req.body.referralTypeName ||
    !req.body.admissionTypeCode ||
    !req.body.doctorDeptCode ||
    !req.body.problem
  ) {
    res.status(400).json("Request body is malformed.");
    return;
  }

  if (!req.body.studemp.patientCode) {
    res.status(400).json("Student/Employee is not yet registered as patient.");
    return;
  }

  const response = await db.transact(async (txn) => {
    const patient = await patientModel.selectPatient(
      req.body.studemp.patientCode,
      txn,
    );

    if (!patient) {
      return { status: 400, body: "Patient not found." };
    }

    const insertedCase = await caseModel.insertCase(
      `${req.user.lastName}, ${req.user.firstName}${
        req.user.suffixName ? " ".concat(req.user.suffixName) : ""
      }${
        req.user.middleName
          ? " ".concat(req.user.middleName[0]).concat(".")
          : ""
      }`,
      patient,
      req.body.studemp.campusCode,
      req.body.studemp.affiliationCode,
      req.body.studemp.isFaculty,
      req.body.problem,
      txn,
    );

    await referralModel.insertReferral(
      req.user.code,

      insertedCase.code,
      req.body.isEmergency || false,
      req.body.referralTypeName,
      req.body.referralTypeOther || null,
      req.body.admissionTypeCode,
      req.body.problem,
      req.body.doctorCode || null,
      req.body.doctorDeptCode,
      req.body.remarks,

      campusesMap[req.body.studemp.campusCode]?.name || "",
      req.body.studemp.deptName,
      affiliationsMap[req.body.studemp.affiliationCode]?.name || "",
      req.body.studemp.isFaculty,

      txn,
    );

    return {
      status: 200,
      body: {
        studemp: req.body.studemp,
        patient,
        problem: req.body.problem,
      },
    };
  });

  if (response?.error) {
    res.status(500).json(null);
    return;
  }

  res.status(response.status).json(response.body);
};

module.exports = {
  get,
  post,
};
