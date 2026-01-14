const sql = require("../../../helpers/sql.js");
const model = require("../models/directorModel.js");

const DirectorFormDisAll = async (req, res) => {
  try {
    const employeeCode = req.user?.EmployeeCode;
    const deptCode = req.user?.DeptCode;

    if (!employeeCode) {
      return res.status(400).json({ msg: "Employee code is required" });
    }
    const resultforDirector = await model.getAllDirector(employeeCode);
    if (resultforDirector.length === 0) {
      const headResult = await model.getAllHead(deptCode);
      return res.status(200).json(headResult);
    }
    return res.status(200).json(resultforDirector);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

const FormDisDirectorIRF = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const result = await model.getIREPORT(IRNo);
    if (result.length > 0) {
      result.forEach((list) => {
        if (list.subjectFile !== null) {
          list.subjectFile = Buffer.from(list.subjectFile).toString("base64");
        }
      });
    }
    return res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormDirectorRecommendation = async (req, res) => {
  try {
    const iRNo = req.body.IRNo;
    const lostRec = req.body.lostRec;
    const employeeCode = req.user.EmployeeCode;
    const financialLiability = req.body.FinancialLiability;

    const insertDirectorLostRec = await sql.transact(async (txn) => {
      return await model.insertdirectorLostRec(
        {
          IRNo: iRNo,
          lostRec: lostRec,
          FinancialLiability: financialLiability,
          LostRecUpdatedBy: employeeCode,
          LostRecDateTimeCreated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );
    });

    if (!insertDirectorLostRec) {
      return res
        .status(500)
        .json({ message: "Incident report creation failed" });
    }

    return res.status(200).json(insertDirectorLostRec);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

module.exports = {
  DirectorFormDisAll,
  FormDisDirectorIRF,
  FormDirectorRecommendation,
};
