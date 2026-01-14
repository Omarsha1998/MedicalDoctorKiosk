const { mode } = require("crypto-js");
const sql = require("../../../helpers/sql.js");
const generatecode = require("../helper/generateCode.js");
const model = require("../models/auditModel.js");

const FormAuditTable = async (req, res) => {
  try {
    const result = await model.getAuditDetails();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditHead = async (req, res) => {
  try {
    const result = await model.getAuditHead();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditEditHead = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const employeeHead = req.body.EmployeeCode;
    const resultUser = await model.getUser(employeeHead);

    const updateEditHead = await sql.transact(async (txn) => {
      return await model.updateArea(
        {
          EmployeeCode: resultUser[0].employeeCode,
          FullName: resultUser[0].fullName,
          UERMEmail: resultUser[0].uERMEmail,
          UpdatedBy: employeeCode,
        },
        { Id: id },
        txn,
        "DateTimeUpdated",
      );
    });
    return res.status(200).json(updateEditHead);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditAddHead = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const employeeHead = req.body.EmployeeDeptCode;
    const deptHead = req.body.DeptCode;

    const resultUser = await model.getUser(employeeHead);
    const resultDept = await model.getDeptName(deptHead);

    const insertDeptHead = await sql.transact(async (txn) => {
      const deptHeadData = {
        DeptCode: deptHead,
        Dept_Desc: resultDept[0].dESCRIPTION,
        EmployeeCode: employeeHead,
        FullName: resultUser[0].fullName,
        UERMEmail: resultUser[0].uERMEmail,
        CreatedBy: userCode,
      };
      return await model.insertHead(deptHeadData, txn);
    });
    return res.status(200).json(insertDeptHead);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditArea = async (req, res) => {
  try {
    const result = await model.getAuditArea();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditAddArea = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const employeeArea = req.body.EmployeeAreaCode;
    const areaCode = req.body.DivisionAreaCode;

    const insertAreaUser = await sql.transact(async (txn) => {
      const areaUserData = {
        EmployeeCode: employeeArea,
        AreaCode: areaCode,
        isActive: "1",
        CreatedBy: userCode,
      };
      return await model.insertAreaUser(areaUserData, txn);
    });

    return res.status(200).json(insertAreaUser);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditDeleteArea = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const isActive = req.body.isActive;

    const updateDeleteHead = await sql.transact(async (txn) => {
      return await model.updateDeleteArea(
        {
          isActive: isActive,
          UpdatedBy: userCode,
        },
        { Id: id },
        txn,
        "dateTimeUpdated",
      );
    });
    return res.status(200).json(updateDeleteHead);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditRequest = async (req, res) => {
  try {
    const result = await model.getAuditRequest();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditAddRequest = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const employeeReq = req.body.RequestEmployeeCode;
    const deptReq = req.body.RequestDeptCode;

    const insertReqAccess = await sql.transact(async (txn) => {
      const reqAccessData = {
        EmployeeCode: employeeReq,
        DeptCode: deptReq,
        isActive: "1",
        CreatedBy: userCode,
      };
      return await model.insertRequestUser(reqAccessData, txn);
    });

    return res.status(200).json(insertReqAccess);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditRemoveRequest = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const isActive = req.body.isActive;

    const updateDeleteAccess = await sql.transact(async (txn) => {
      return await model.updateRequestAccess(
        {
          isActive: isActive,
          UpdatedBy: userCode,
        },
        { Id: id },
        txn,
        "DateTimeUpdated",
      );
    });
    return res.status(200).json(updateDeleteAccess);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditReportable = async (req, res) => {
  try {
    const result = await model.getReportable();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditAddReportable = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const subjectName = req.body.SubjectName;
    const subjectReptDescription = req.body.SubjectReptDescription;
    const subjectCode = await generatecode.formatSubCode();

    const insertReportableDetails = await sql.transact(async (txn) => {
      const reportData = {
        SubjectCode: subjectCode,
        SubjectName: subjectName,
        SubjectReptDescription: subjectReptDescription,
        CreatedBy: userCode,
      };
      return await model.insertReportable(reportData, txn);
    });

    return res.status(200).json(insertReportableDetails);
  } catch (error) {
    res.status(500).json({
      message: "ERROR CREATING INCIDENT REPORT",
    });
  }
};

const FormAuditChild = async (req, res) => {
  try {
    const result = await model.getChild();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditAddChild = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const subjectChilCode = await generatecode.formatChilCode();
    const subjectCode = req.body.SubjectCode;
    const subjectSpecificExam = req.body.SubjectSpecificExam;
    const subjectRiskCode = req.body.SubjectRiskCode;
    const subjectRiskSubCode = req.body.SubjectRiskSubCode;

    const insertChildDetails = await sql.transact(async (txn) => {
      const childData = {
        SubjectChilCode: subjectChilCode,
        SubjectCode: subjectCode,
        SubjectSpecificExam: subjectSpecificExam,
        SubjectRiskDomain: subjectRiskCode,
        SubjectRiskSubDomain: subjectRiskSubCode,
        CreatedBy: userCode,
      };
      return await model.insertChild(childData, txn);
    });
    return res.status(200).json(insertChildDetails);
  } catch (error) {
    res.status(500).json({
      message: "ERROR CREATING INCIDENT REPORT",
    });
  }
};

const FormAuditDictionary = async (req, res) => {
  try {
    const result = await model.getDictionary();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditAddDictionary = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const resultSubDomain = await model.getDictionary();
    const domainRisk = req.body.DomainRisk;
    const riskCode = generatecode.formatRiskSubCode(
      domainRisk,
      resultSubDomain,
    );

    const riskSub = req.body.RiskSub;
    const riskSubDescription = req.body.RiskSubDescription;

    const insertDictionaryDetails = await sql.transact(async (txn) => {
      const dictionaryData = {
        DomainCode: domainRisk,
        RiskCode: riskCode,
        Risk: riskSub,
        RiskDescription: riskSubDescription,
        CreatedBy: userCode,
      };
      return await model.insertDisctionary(dictionaryData, txn);
    });
    return res.status(200).json(insertDictionaryDetails);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormAuditDomainCode = async (req, res) => {
  try {
    const result = await model.getAuditDomainCode();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormAuditAddDomain = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const resultDomain = await model.getAuditDomainCode();
    const domainCode = generatecode.formatDomainCode(resultDomain);
    const riskDomain = req.body.RiskDomain;

    const insertDomainDetails = await sql.transact(async (txn) => {
      const domainData = {
        DomainCode: domainCode,
        RiskDomain: riskDomain,
        CreatedBy: userCode,
      };
      return await model.insertDomain(domainData, txn);
    });

    return res.status(200).json(insertDomainDetails);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// const FormAuditRiskCode = async (req, res) => {
//   try {
//     const insertRiskCode = await sql.transact(async (txn) => {
//       const employeeCode = req.user.EmployeeCode;
//       const riskDomain = req.body.RiskDomain;
//       const risk = req.body.Risk;
//       const riskDescription = req.body.RiskDescription;

//       const domainCode = req.body.DomainCode;
//       const riskCode = await formatRiskCode(domainCode);

//       const riskCodeData = {
//         DomainCode: domainCode,
//         RiskDomain: riskDomain,
//         RiskCode: riskCode,
//         Risk: risk,
//         RiskDescription: riskDescription,
//         CreatedBy: employeeCode,
//       };
//       return await model.insertFormRiskCode(riskCodeData, txn);
//     });

//     if (!insertRiskCode) {
//       return res
//         .status(500)
//         .json({ message: "Risk Dictionary creation failed" });
//     }

//     const result = await model.getRiskDictionary();
//     return res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "ERROR CREATING RISK DICTIONARY" });
//   }
// };

// async function formatRiskCode(domainCode) {
//   const result = await model.getformatRiskCode(domainCode);
//   let ascNumber = 1;

//   if (result && result.length > 0) {
//     const lastRiskCode = result[0].riskCode;
//     const lastAscNumber = parseInt(lastRiskCode.split("-").pop(), 10);
//     ascNumber = lastAscNumber + 1;
//   }

//   const cleanedDomainCode = domainCode.replace("-", "");
//   const generateRiskCode = `RC-${cleanedDomainCode}-${ascNumber.toString().padStart(3, "0")}`;
//   return generateRiskCode;
// }

const FormAuditRemarks = async (req, res) => {
  try {
    const insertAuditRemarks = await sql.transact(async (txn) => {
      const employeeCode = req.user.EmployeeCode;
      const iRNo = req.body.iRNo;
      const note = req.body.note;
      const policyCode = req.body.policyCode;

      const remarksData = {
        IRNo: iRNo,
        NewNote: note,
        PolicyCode: policyCode,
        IsActive: "1",
        CreatedBy: employeeCode,
      };
      return await model.insertRemarks(remarksData, txn);
    });

    if (!insertAuditRemarks) {
      return res.status(500).json({ message: "Remarks creation failed" });
    }
    return res.status(200).json({ message: "Success: Remarks created" });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

const FormRemarksNote = async (req, res) => {
  try {
    const iRNo = req.query.iRNo;
    const result = await model.getDisplayRemarks(iRNo);
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormEditNote = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const newNote = req.body.newNote;

    const updateEditNote = await sql.transact(async (txn) => {
      return await model.updateeditNote(
        {
          NewNote: newNote,
          UpdatedEditBy: employeeCode,
        },
        { Id: id },
        txn,
        "DateTimeEditUpdated",
      );
    });

    if (!updateEditNote) {
      return res.status(500).json({ message: "Failed to update Edit Note" });
    }
    return res.status(200).json(updateEditNote);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormDeleteNote = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;

    const updateFormDeleteNote = await sql.transact(async (txn) => {
      return await model.updatedeleteNote(
        {
          isActive: "0",
          UpdateActiveBy: employeeCode,
        },
        { Id: id },
        txn,
        "UpdateActiveDateTime",
      );
    });
    if (!updateFormDeleteNote) {
      return res.status(500).json({ message: "Failed to update Delete Note" });
    }
    return res.status(200).json(updateFormDeleteNote);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormAuditStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const auditStatus = req.body.AuditStatus;
    const iRNo = req.body.IRNo;

    const updateFormAuditStatus = await sql.transact(async (txn) => {
      return await model.updateauditStatus(
        {
          AuditStatus: auditStatus,
          AuditUpdatedby: employeeCode,
        },
        { IRNo: iRNo },
        txn,
        "DateTimeAuditUpdated",
      );
    });

    if (!updateFormAuditStatus) {
      return res.status(500).json({ message: "Failed to update Status" });
    }
    return res.status(200).json(updateFormAuditStatus);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

module.exports = {
  FormAuditTable,
  FormAuditReportable,
  FormAuditAddReportable,

  FormAuditChild,
  FormAuditAddChild,

  FormAuditDictionary,
  FormAuditAddDictionary,

  FormAuditDomainCode,
  FormAuditAddDomain,

  // FormAuditRiskCode,
  FormAuditRemarks,
  FormRemarksNote,
  FormEditNote,
  FormDeleteNote,
  FormAuditStatus,

  FormAuditHead,
  FormAuditEditHead,
  FormAuditAddHead,
  FormAuditArea,
  FormAuditAddArea,
  FormAuditDeleteArea,

  FormAuditRequest,
  FormAuditAddRequest,
  FormAuditRemoveRequest,
};
