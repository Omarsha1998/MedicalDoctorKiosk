const sql = require("../../../helpers/sql.js");
const model = require("../models/hrModel.js");

const FormHRREPDetails = async (req, res) => {
  try {
    const result = await model.getHRREPDetails();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormHRREFDetails = async (req, res) => {
  try {
    const result = await model.getHRREFDetails();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormDisHRIRF = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const result = await model.getHRIREPORT(IRNo);
    if (result.length > 0) {
      result.forEach((list) => {
        if (list.subjectFile !== null) {
          list.subjectFile = Buffer.from(list.subjectFile).toString("base64");
        }
      });
    }
    const combinedResult = buildCombinedIRResult(result);
    return res.status(200).json(combinedResult);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const buildCombinedIRResult = (result) => {
  const {
    iRNo,
    subjectName,
    subjectDate,
    subjectTime,
    subjectLoc,
    subjectNote,
    subjectCause,
    subjectResponse,
    subjectFileName,
    subjectFile,
    subjectSpecificExam,
    primaryDept,
    actionItem,
    newHRNote,
    dateTimeCreated,
    deptCodeInvDescriptions,
  } = result[0];

  const combinedResult = {
    iRNo,
    subjectName,
    subjectDate,
    subjectTime,
    subjectLoc,
    subjectNote,
    subjectCause,
    subjectResponse,
    subjectFileName,
    subjectFile,
    subjectSpecificExam,
    actionItem,
    newHRNote,
    primaryDept,
    dateTimeCreated,
    deptCodeInvDescriptions,
  };

  combinedResult.actionItem = result
    .filter((item) => item.actionItem) // Filter items that have an actionItem
    .map((item) => item.actionItem); // Extract actionItem values into an array

  return combinedResult;
};

const FormFinancialLiability = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const financialLiability = req.body.FinancialLiability;

    const updateFinLiability = await sql.transact(async (txn) => {
      return await model.updateHRFinLiability(
        {
          FinancialLiability: financialLiability,
          CreatedByLiability: employeeCode,
          DateTimeLiability: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );
    });

    if (!updateFinLiability) {
      return res.status(500).json({ message: "Failed to update FinLiability" });
    }

    return res.status(200).json({
      message: "FinLiability updated successfully",
      updateFinLiability,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

const FormHRN = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.iRNo;
    const newHRNote = req.body.newHRNote;

    const insertFormHRN = await sql.transact(async (txn) => {
      const insertFormHRNoteCol = {
        IRNo: iRNo,
        newHRNote: newHRNote,
        CreatedBy: employeeCode,
      };
      return await model.insertFormHRCollectNotes(insertFormHRNoteCol, txn);
    });

    return res.status(200).json({
      message: "Collected Notes inserted successfully",
      insertFormHRN,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

const FormHRNotes = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.iRNo;
    const newHRNote = req.body.newHRNote;

    const insertFormHRNotes = await sql.transact(async (txn) => {
      const insertFormHRNoteClose = {
        IRNo: iRNo,
        newHRNote: newHRNote,
        CreatedBy: employeeCode,
      };
      return await model.insertFormHRCloseNotes(insertFormHRNoteClose, txn);
    });

    if (insertFormHRNotes?.iRNo) {
      const updateCloseNote = await sql.transact(async (txn) => {
        return await model.updateCloseNoteSta(
          {
            HRStatus: "0",
            HRUpdatedBy: employeeCode,
            DateTimeHRUpdated: new Date(),
          },
          { IRNo: iRNo },
          txn,
        );
      });

      if (!updateCloseNote) {
        return res
          .status(500)
          .json({ message: "Failed to update Note & Status" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

const FormHRStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const hRStatus = req.body.HRStatus;
    const iRNo = req.body.IRNo;

    const updateHRStatus = await sql.transact(async (txn) => {
      return await model.updateIRHRStatus(
        {
          HRStatus: hRStatus,
          HRUpdatedBy: employeeCode,
          DateTimeHRUpdated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );
    });

    if (!updateHRStatus) {
      return res.status(500).json({ message: "Failed to update HR Status" });
    }
    return res.status(200).json({
      message: "HR Status updated successfully",
      updateHRStatus,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

module.exports = {
  FormHRREPDetails,
  FormHRREFDetails,
  FormDisHRIRF,
  FormFinancialLiability,
  FormHRN,
  FormHRNotes,
  FormHRStatus,
};
