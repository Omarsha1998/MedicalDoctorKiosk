const sql = require("../../../helpers/sql.js");
const irEmail = require("../helper/irEmail.js");
const generatecode = require("../helper/generateCode.js");
const model = require("../models/iRModels.js");

const FormEmdept = async (req, res) => {
  try {
    const result = await model.getED();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Employee Data Error" });
  }
};

const FormSubName = async (req, res) => {
  try {
    const result = await model.getSubName();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Subject Data Error" });
  }
};

// const FormSubCategory = async (req, res) => {
//   try {
//     const result = await model.getSubCategory();
//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(500).json({ message: "Category Data Error" });
//   }
// };

const FormDivision = async (req, res) => {
  try {
    const result = await model.getDivision();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Division Data Error" });
  }
};

const FormIncident = async (req, res) => {
  try {
    const prefix = "CODE";

    const filePayload = {};

    for (const fileKey in req.files) {
      const file = req.files[fileKey];
      filePayload[fileKey] = {
        name: file.name,
        data: file.data,
      };
    }

    const insertedIncident = await sql.transact(async (txn) => {
      const code = await sql.generateUniqueCode(
        "IRUP.dbo.IRDetails",
        prefix.toUpperCase(),
        2,
        txn,
      );
      const iRNo = await generatecode.generatedIRNo();

      const incidentData = {
        Code: code,
        IRNo: iRNo,
        EmployeeCode: req.body.EmployeeCode,
        DeptCode: req.body.DeptCode,
        DivisionCode: req.body.DivisionCode,
        SubjectBriefDes: req.body.SubjectBriefDes,
        SubjectCode: req.body.SubjectCode,
        SubjectChilCode: req.body.SubjectChilCode,
        SubjectDate: req.body.SubjectDate,
        SubjectTime: req.body.SubjectTime,
        SubjectLoc: req.body.SubjectLoc?.toUpperCase().trim() ?? null,
        SubjectNote: req.body.SubjectNote?.trim() ?? null,
        SubjectCause: req.body.SubjectCause,
        SubjectResponse: req.body.SubjectResponse,
        SubjectFile: filePayload.SubjectFile?.data || Buffer.from([]), // Binary data
        SubjectFileName: filePayload.SubjectFile?.name || null, // File name
      };
      return await model.incidentReport(incidentData, txn);
    });

    if (!insertedIncident) {
      return res
        .status(500)
        .json({ message: "Incident report creation failed" });
    }

    const recordsDisplayIncidentRep = await model.getIncidentReport();

    if (!recordsDisplayIncidentRep.length) {
      throw new Error("No incident report found");
    }

    const incident = recordsDisplayIncidentRep[0];

    const {
      iRNo,
      subjectCode,
      subjectName,
      subjectSpecificExam,
      subjectDate,
      subjectTime,
      subjectLoc,
      description,
      subjectBriefDes,
      divisionCode,
    } = incident;

    // ⛔ STOP EVERYTHING kapag "others"
    if (subjectCode === "others") {
      await irEmail.OtherSubjectCode(iRNo, description, subjectBriefDes);
      return;
    }

    const resultDivision = await model.getDivisionEmail(divisionCode);
    const resultArea = await model.getAreaAssignee(divisionCode);

    if (!resultDivision.length) {
      throw new Error("No division email found");
    }

    const { division, divisionEmail } = resultDivision[0];

    // 🔹 Email to division
    await irEmail.UniqueSubjectCode(
      iRNo,
      subjectName,
      subjectSpecificExam,
      subjectDate,
      subjectTime,
      subjectLoc,
      division,
      divisionEmail,
    );

    // 🔹 Email to EACH area assignee
    for (const area of resultArea) {
      const { fullName, uERMEmail } = area;

      await irEmail.AreaSubjectCode(
        iRNo,
        subjectName,
        subjectSpecificExam,
        subjectDate,
        subjectTime,
        subjectLoc,
        fullName,
        uERMEmail,
      );
    }

    return res.status(200).json(incident);
  } catch (error) {
    res.status(500).json({
      message: "ERROR CREATING INCIDENT REPORT",
      error: error.message,
    });
  }
};

const FormDashboard = async (req, res) => {
  try {
    const result = await model.getDashboard();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Dashboard Error" });
  }
};

module.exports = {
  FormEmdept,
  FormSubName,
  // FormSubCategory,
  FormDivision,
  FormIncident,
  FormDashboard,
};
