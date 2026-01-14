const sql = require("../../../helpers/sql.js");
// const util = require("../../../helpers/util.js");
const qaEmail = require("../helper/qaEmail.js");
const model = require("../models/qaModel.js");

const QAFormDisAll = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const areaCode = req.user.AreaCode;

    let result;

    if (areaCode) {
      // If AreaCode is NOT null
      result = await model.getAllQA(employeeCode);
    } else {
      // If AreaCode is null
      result = await model.getSuperAuditQA();
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: `Error: ${error.message}` });
  }
};

const FormDisIRF = async (req, res) => {
  try {
    const { iRNo } = req.query;

    if (!iRNo) {
      return res.status(400).json({ message: "IR number is required" });
    }
    const resultIR = await model.getIREPORT(iRNo);
    if (!resultIR || resultIR.length === 0) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    const formattedResult = resultIR.map((item) => ({
      ...item,
      subjectFile: item.subjectFile
        ? Buffer.isBuffer(item.subjectFile)
          ? item.subjectFile.toString("base64")
          : item.subjectFile
        : null,
    }));
    const combinedResult = buildCombinedIRResult(formattedResult);
    return res.status(200).json(combinedResult);
  } catch (error) {
    console.error("FormDisIRF error:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    subjectSpecificExam,
    subjectFile,
    subjectFileName,
    primaryDept,
    actionItem,
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
    subjectSpecificExam,
    subjectFile,
    subjectFileName,
    actionItem,
    primaryDept,
    dateTimeCreated,
    deptCodeInvDescriptions,
  };

  // combinedResult.actionItem = result
  //   .filter((item) => item.actionItem)
  //   .map((item) => item.actionItem);

  return combinedResult;
};

const FormDepDis = async (req, res) => {
  try {
    const result = await model.getIRDept();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormDepListDis = async (req, res) => {
  try {
    const result = await model.getIRDeptList();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormRiskGrading = async (req, res) => {
  try {
    const { IRNo: iRNo, RiskGrading: riskgrading } = req.body;

    const updateriskGrading = await sql.transact(async (txn) => {
      return await model.updateRiskGrading(
        {
          IRNo: iRNo,
          RiskGrading: riskgrading,
          DateTimeRistGradingUpdated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );
    });

    return res.status(200).json({
      message: "Risk Grading updated successfully",
      updateriskGrading,
    });
  } catch (error) {
    return res.status(500).json({ message: "FAILED TO UPDATE RISK GRADING" });
  }
};

const QAActionInsertEmail = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const {
      IRNo: iRNo,
      PrimaryDept: primaryDept,
      DeptCodeInv: deptCodeInvArray,
    } = req.body;

    const insertReportActionEmail = await sql.transact(async (txn) => {
      const insertActionEmailPayload = {
        IRNo: iRNo,
        PrimaryDept: primaryDept.trim(),
        DeptCodeInv: deptCodeInvArray.map((code) => code.trim()).join(", "),
        CreatedBy: employeeCode,
      };
      return await model.insertIncidentReportQA(insertActionEmailPayload, txn);
    });

    if (insertReportActionEmail?.iRNo) {
      const updateAction = await sql.transact(async (txn) => {
        const updatePayload = {
          IRNo: insertReportActionEmail.iRNo,
          ActionSubStatus: "1",
          ActionDateTimeUpdated: new Date(),
        };
        return await model.updateRCAStatus(
          updatePayload,
          { IRNo: insertReportActionEmail.iRNo },
          txn,
        );
      });

      const updatedActionResult = await model.getupdatedIR(
        insertReportActionEmail.iRNo,
      );

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const primaryDepartment = updatedActionResult[0]?.primaryDept;
      const primaryDeptEmail = await model.getPrimaryEmail(primaryDepartment);

      if (
        primaryDeptEmail?.length > 0 &&
        updatedActionResult?.length > 0 &&
        updatedActionResult[0]?.iRNo
      ) {
        const PrimaryEmail = primaryDeptEmail[0].uERMEmail.trim();
        const PrimaryName = primaryDeptEmail[0].fullName.trim();

        const {
          iRNo,
          dateTimeCreated,
          uERMEmail,
          transferEmail,
          subjectName,
          subjectSpecificExam,
          riskGrading,
        } = updatedActionResult[0];

        const formattedDate = new Date(dateTimeCreated)
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })
          .toUpperCase();

        const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

        const displayEmail =
          transferEmail?.length > 0 ? transferEmail : uERMEmail;

        await qaEmail.ActionPrimaryEmail(
          PrimaryEmail,
          PrimaryName,
          iRNo,
          subjectName,
          subjectSpecificExam,
          formattedDate,
          displayEmail,
          riskLabel,
        );
      }

      if (primaryDepartment) {
        const directorEmail = await model.getDirectorEmail(primaryDepartment);
        if (directorEmail && directorEmail?.length > 0) {
          const { uERMEmail: DirectorEmail, fullname: DirectorName } =
            directorEmail[0];
          const { iRNo, subjectName, subjectSpecificExam, riskGrading } =
            updatedActionResult[0];

          const riskLabel =
            riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

          await qaEmail.ActionDirector(
            DirectorEmail,
            DirectorName,
            iRNo,
            subjectName,
            subjectSpecificExam,
            riskLabel,
          );
        }

        if (updatedActionResult[0].deptCodeInv) {
          const secondarydeptCodes = updatedActionResult[0].deptCodeInv
            .split(",")
            .map((code) => code.trim());

          const secondaryEmails = await Promise.all(
            secondarydeptCodes.map((dept) => model.getPrimaryEmail(dept)),
          );

          for (const secondaryEmail of secondaryEmails) {
            const {
              iRNo,
              dateTimeCreated,
              subjectName,
              subjectNote,
              subjectCause,
              subjectResponse,
              subjectSpecificExam,
              riskGrading,
            } = updatedActionResult[0];

            const { fullName, uERMEmail } = primaryDeptEmail[0];
            const primaryDepartmentName = fullName.trim();
            const primaryDepartmentEmail = uERMEmail.trim();

            const { fullName: secondaryDepartmentName } = secondaryEmail[0];
            const { uERMEmail: secondaryDepartmentEmail } = secondaryEmail[0];

            const riskLabel =
              riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

            const formattedDate = new Date(dateTimeCreated)
              .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              })
              .toUpperCase();

            await qaEmail.ActionSecondryEmail(
              secondaryDepartmentEmail,
              secondaryDepartmentName,
              iRNo,
              subjectName,
              subjectSpecificExam,
              subjectNote,
              subjectCause,
              subjectResponse,
              primaryDepartmentName,
              primaryDepartmentEmail,
              formattedDate,
              riskLabel,
            );
          }
        }
      }
      return res.status(200).json({
        message: "QA Email data inserted and Action updated successfully",
        updatedActionResult,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to insert QA Email data" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error inserting QA email data", error: error.message });
  }
};

const FormInsertReject = async (req, res) => {
  try {
    const userCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const rejectNote = req.body.RejectNote;

    const updateRejectIR = await sql.transact(async (txn) => {
      return await model.UpdateQADoneStatus(
        {
          IsReject: "false",
          RejectNote: rejectNote,
          RejectedBy: userCode,
        },
        { IRNo: iRNo },
        txn,
        "RejectedDateTime",
      );
    });
    return res.status(200).json(updateRejectIR);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error inserting QA email data", error: error.message });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const QARCAInsertEmail = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const {
      IRNo: iRNo,
      PrimaryDept: primaryDept,
      DeptCodeInv: deptCodeInvArray,
    } = req.body;

    const insertReportRCAEmail = await sql.transact(async (txn) => {
      const insertRCAEmailPayload = {
        IRNo: iRNo,
        PrimaryDept: primaryDept.trim(),
        DeptCodeInv: deptCodeInvArray.map((code) => code.trim()).join(", "),
        CreatedBy: employeeCode,
      };
      return await model.insertIncidentReportQA(insertRCAEmailPayload, txn);
    });

    if (insertReportRCAEmail?.iRNo) {
      const updateRCA = await sql.transact(async (txn) => {
        return await model.updateRCAStatus(
          {
            IRNo: insertReportRCAEmail.iRNo,
            RCA: "1",
            DateTimeRCAUpdated: new Date(),
          },
          { IRNo: insertReportRCAEmail.iRNo },
          txn,
        );
      });
      if (!updateRCA) {
        return res.status(500).json({ message: "Failed to update RCA Status" });
      }

      const updatedRCAResult = await model.getupdatedIR(
        insertReportRCAEmail.iRNo,
      );

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const primaryDepartment = updatedRCAResult[0].primaryDept;
      const primaryDeptEmail = await model.getPrimaryEmail(primaryDepartment);

      if (
        primaryDeptEmail?.length > 0 &&
        updatedRCAResult?.length > 0 &&
        updatedRCAResult[0]?.iRNo
      ) {
        const PrimaryEmail = primaryDeptEmail[0].uERMEmail.trim();
        const PrimaryName = primaryDeptEmail[0].fullName.trim();
        const {
          iRNo,
          dateTimeCreated,
          uERMEmail,
          transferEmail,
          subjectName,
          subjectSpecificExam,
          riskGrading,
        } = updatedRCAResult[0];
        const formattedDate = new Date(dateTimeCreated)
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })
          .toUpperCase();
        const displayEmail =
          transferEmail && transferEmail.length > 0 ? transferEmail : uERMEmail;

        const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

        await qaEmail.RCAPrimaryEmail(
          PrimaryEmail,
          PrimaryName,
          iRNo,
          subjectName,
          subjectSpecificExam,
          formattedDate,
          displayEmail,
          riskLabel,
        );
      }

      if (primaryDepartment) {
        const directorEmail = await model.getDirectorEmail(primaryDepartment);

        if (directorEmail && directorEmail?.length > 0) {
          const { uERMEmail: DirectorEmail, fullname: DirectorName } =
            directorEmail[0];
          const { iRNo, subjectName, subjectSpecificExam, riskGrading } =
            updatedRCAResult[0];

          const riskLabel =
            riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

          await qaEmail.RCADirector(
            DirectorEmail,
            DirectorName,
            iRNo,
            subjectName,
            subjectSpecificExam,
            riskLabel,
          );
        }

        if (updatedRCAResult[0].deptCodeInv) {
          const secondarydeptCodes = updatedRCAResult[0].deptCodeInv
            .split(",")
            .map((code) => code.trim());

          const secondaryEmails = await Promise.all(
            secondarydeptCodes.map((dept) => model.getPrimaryEmail(dept)),
          );

          for (const secondaryEmail of secondaryEmails) {
            const {
              iRNo,
              dateTimeCreated,
              subjectName,
              subjectNote,
              subjectCause,
              subjectResponse,
              subjectSpecificExam,
              riskGrading,
            } = updatedRCAResult[0];
            const { fullName: primaryDepartmentName } = primaryDeptEmail[0];
            const { uERMEmail: primaryDepartmentEmail } = primaryDeptEmail[0];
            const { fullName: secondaryDepartmentName } = secondaryEmail[0];
            const { uERMEmail: secondaryDepartmentEmail } = secondaryEmail[0];
            const formattedDate = new Date(dateTimeCreated)
              .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              })
              .toUpperCase();

            const riskLabel =
              riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

            await qaEmail.RCASecondryEmail(
              secondaryDepartmentEmail,
              secondaryDepartmentName,
              iRNo,
              subjectName,
              subjectSpecificExam,
              subjectNote,
              subjectCause,
              subjectResponse,
              primaryDepartmentName,
              primaryDepartmentEmail,
              formattedDate,
              riskLabel,
            );
          }
        }
      }
      return res.status(200).json({
        message: "QA Email data inserted and Action updated successfully",
        updatedRCAResult,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to insert QA Email data" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error inserting QA email data", error: error.message });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const FormEmployeeName = async (req, res) => {
  try {
    const result = await model.getEmployeeName();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const QADisAll = async (req, res) => {
  try {
    const result = await model.getQAs();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ msg: `Error` });
  }
};

const FormCountRCASta = async (req, res) => {
  try {
    const iRNo = req.body.IRNo;
    const countRCA = Number(req.body.CountRCA);

    const existingRecord = await model.getRecord(iRNo);
    if (!existingRecord || existingRecord.length === 0) {
      return res.status(404).json({ message: "Incident report not found." });
    }

    const currentCount = Number(existingRecord[0].countReturnRCA) || 0; // Ensure currentCount is a number
    const addRCA = currentCount + countRCA; // Perform numerical addition

    const updateCountRCA = await sql.transact(async (txn) => {
      return await model.UpdateRCACountstatus(
        {
          IRNo: iRNo,
          CountReturnRCA: addRCA, // Update the count
        },
        { IRNo: iRNo },
        txn,
      );
    });

    if (!updateCountRCA) {
      return res
        .status(500)
        .json({ message: "Incident report counting RCA status failed" });
    }

    res
      .status(200)
      .json({ message: "Incident report RCA count updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

//////////////////////////////////////////////////////////// ACTION //////////////////////////////////////////////////////////////////////////////////////////

const FormActionDetails = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    if (!IRNo) {
      return res.status(400).json({ msg: "IRNO is required" });
    }
    const resultforAction = await model.getActionItemsLogs(IRNo);
    return res.status(200).json(resultforAction);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

const FormDisApprovedAction = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const {
      IRNo: iRNo,
      QASelectedActionItem: actionitemlogs,
      QANotSelActionItem: actionitems,
    } = req.body;

    if (
      !iRNo ||
      !Array.isArray(actionitemlogs) ||
      !Array.isArray(actionitems)
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid request data" });
    }

    const actioncode = await sql.generateUniqueCode(
      "IRUP.dbo.IRActionItemsLog",
      "RAC",
      6,
    );

    const wasDisapproved = await sql.transact(async (txn) => {
      for (const aclog of actionitemlogs) {
        const payload = {
          IRNo: aclog.iRNo,
          Code: aclog.code,
          RevisionActionCode: actioncode,
          ActionItem: aclog.actionItem,
          TimelineFromDate: aclog.timelineFromDate,
          TimelineToDate: aclog.timelineToDate,
          ActionNote: aclog.actionNote,
          TimelineFromQA: aclog.timelineFromQA,
          TimelineToQA: aclog.timelineToQA,
          ActionStatus: "For Revision",
          CreatedBy: employeeCode,
        };
        await model.insertactionitemlog(payload, txn);
      }

      for (const acitem of actionitems) {
        const payload = {
          IRNo: acitem.iRNo,
          Code: acitem.code,
          ActionItem: acitem.actionItem,
          TimelineFromDate: acitem.timelineFromDate,
          TimelineToDate: acitem.timelineToDate,
          isActive: "1",
          ActionStatus: "Resolved",
          CreatedBy: employeeCode,
        };
        await model.insertactionitem(payload, txn);
      }

      const updateActions = await model.updateRCAStatus(
        {
          IRNo: iRNo,
          ActionSubStatus: 3,
          ActionUpdatedBY: employeeCode,
          ActionDateTimeUpdated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );

      if (!updateActions) throw new Error("Failed to update Action Status");
      return true;
    });

    if (wasDisapproved) {
      const disAppActionItems = await model.getsActionItem(iRNo);

      const {
        riskGrading,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = disAppActionItems[0];

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

      const formattedDate = dateTimeCreated
        ? new Date(dateTimeCreated)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })
            .toUpperCase()
        : "UNKNOWN DATE";

      await qaEmail.sendDisapprovalActionEmail(
        iRNo,
        riskLabel,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        formattedDate,
      );

      return res.status(200).json({
        message: "Disapproved RCA Form submitted successfully",
        wasDisapproved,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Transaction failed unexpectedly." });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error FormDisApprovedRCA",
      error: error.message,
    });
  }
};

const FormReturnActionDetails = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    if (!IRNo) {
      return res.status(400).json({ msg: "IRNO is required" });
    }
    const resultforReturnAction = await model.getReturnActionItemsLogs(IRNo);
    return res.status(200).json(resultforReturnAction);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

const FormCountActionItem = async (req, res) => {
  try {
    const iRNo = req.body.IRNo;
    const countActionItem = Number(req.body.CountActionItem);

    const existingRecord = await model.getActionRecord(iRNo);
    const currentCount = Number(existingRecord[0].countReturnActionItems) || 0; // Ensure currentCount is a number
    const addAction = currentCount + countActionItem; // Perform numerical addition

    const updateCountRCA = await sql.transact(async (txn) => {
      return await model.UpdateRCACountstatus(
        {
          IRNo: iRNo,
          CountReturnActionItems: addAction, // Update the count
        },
        { IRNo: iRNo },
        txn,
      );
    });
    return res.status(200).json(updateCountRCA);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

const FormRevisionActionDetails = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const RevisionActionCode = req.query.revisionActionCode;

    const resultforRevisionAction = await model.getActionReviewLog(
      IRNo,
      RevisionActionCode,
    );
    return res.status(200).json(resultforRevisionAction);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

const FormDisAppActionEmail = async (req, res) => {
  try {
    const iRNo = req.body.IRNo;
    const employeeCode = req.user.EmployeeCode;
    const newConclusions = req.body.newConclusion;

    const insertDisActionItem = await sql.transact(async (txn) => {
      const insertActionDisApproved = {
        IRNo: iRNo,
        newConclusion: newConclusions,
        CreatedBy: employeeCode,
      };
      return await model.insertdisapprovedRCA(insertActionDisApproved, txn);
    });

    res.status(200).json({
      message: "RCA status updated successfully",
      insertDisActionItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Error FormDisApprovedRCA" });
  }
};

const FormDisapprovedReturnAction = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const returnactionitemlogs = req.body.ReturnSelectedActionItem;
    const returnactionitems = req.body.ReturnNotSelActionItem;

    const actioncode = await sql.generateUniqueCode(
      "IRUP.dbo.IRActionItemsLog",
      "RAC",
      6,
    );

    const wasReturnDisapproved = await sql.transact(async (txn) => {
      for (const aclog of returnactionitemlogs) {
        const payload = {
          IRNo: aclog.iRNo,
          Code: aclog.code,
          RevisionActionCode: actioncode,
          ActionItem: aclog.actionItem,
          TimelineFromDate: aclog.timelineFromDate,
          TimelineToDate: aclog.timelineToDate,
          ActionNote: aclog.actionNote,
          TimelineFromQA: aclog.timelineFromQA,
          TimelineToQA: aclog.timelineToQA,
          ActionStatus: "For Revision",
          CreatedBy: employeeCode,
        };
        const resultpayloadaclog = await model.insertactionitemlog(
          payload,
          txn,
        );
      }

      for (const acitem of returnactionitems) {
        const payload = {
          IRNo: acitem.iRNo,
          Code: acitem.code,
          ActionItem: acitem.actionItem,
          TimelineFromDate: acitem.timelineFromDate,
          TimelineToDate: acitem.timelineToDate,
          isActive: "1",
          ActionStatus: "Resolved",
          CreatedBy: employeeCode,
        };
        const resultpayloadacitem = await model.insertactionitem(payload, txn);
      }

      const updateActions = await model.updateRCAStatus(
        {
          IRNo: iRNo,
          ActionSubStatus: 3,
          ActionUpdatedBY: employeeCode,
          ActionDateTimeUpdated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );

      if (!updateActions) throw new Error("Failed to update Action Status");

      return true;
    });

    if (wasReturnDisapproved) {
      const disAppActionItems = await model.getsActionItem(iRNo);

      const {
        riskGrading,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = disAppActionItems[0];

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

      const formattedDate = dateTimeCreated
        ? new Date(dateTimeCreated)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })
            .toUpperCase()
        : "UNKNOWN DATE";

      await qaEmail.sendDisapprovalActionEmail(
        iRNo,
        riskLabel,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        formattedDate,
      );

      return res.status(200).json({
        message: "Return Disapproved Action Form submitted successfully",
        wasReturnDisapproved,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Transaction failed unexpectedly." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error FormDisapprovedReturnAction" });
  }
};

/////////////////////////////////////////////

const FormActionApprovedReturnDetails = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    if (!IRNo) {
      return res.status(400).json({ msg: "IRNO is required" });
    }
    const resultAPAction = await model.getApprovedActionItems(IRNo);
    return res.status(200).json(resultAPAction);
  } catch (error) {
    res.status(500).json({ message: "Error FormDisApprovedRCA" });
  }
};

///////////////////////////////////////////

const FormApprovedReturnAction = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const aPReturnActionContent = req.body.APReturnActionContent;
    const newConclusionInput = req.body.newConclusion;

    const insertApprovedRCA = await sql.transact(async (txn) => {
      // Insert all return action items
      for (const item of aPReturnActionContent) {
        const payload = {
          IRNo: item.iRNo,
          Code: item.code,
          ActionItem: item.actionItem.trim(),
          TimelineFromDate: item.timelineFromDate,
          TimelineToDate: item.timelineToDate,
          isActive: "1",
          ActionStatus: "Resolved",
          CreatedBy: employeeCode,
        };
        const result = await model.insertactionreturn(payload, txn);
        if (!result) throw new Error("Failed to insert action item");
      }

      // Update status
      const updateAction = await model.updateRCAStatus(
        {
          IRNo: iRNo,
          ActionSubStatus: "5",
          ActionDateTimeUpdated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );
      if (!updateAction) throw new Error("Failed to update Action Status");

      // Insert conclusion
      const insertRCAApproved = {
        IRNo: iRNo,
        newConclusion: newConclusionInput,
        CreatedBy: employeeCode,
      };
      const result = await model.insertRecomConclusion(insertRCAApproved, txn);
      if (!result) throw new Error("Failed to insert Conclusion");
      return result;
    });

    if (insertApprovedRCA?.iRNo) {
      const AppActionItems = await model.getsApprovedActionItem(
        insertApprovedRCA.iRNo,
      );

      const {
        riskGrading,
        subjectName,
        subjectSpecificExam,
        newConclusion,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = AppActionItems[0];

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };
      const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

      const formattedDate = dateTimeCreated
        ? new Date(dateTimeCreated)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })
            .toUpperCase()
        : "UNKNOWN DATE";

      await qaEmail.sendApprovedActionEmail(
        iRNo,
        riskLabel,
        subjectName,
        subjectSpecificExam,
        newConclusion,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        formattedDate,
      );

      return res.status(200).json({
        message: "Action Status submitted successfully",
        insertApprovedRCA,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Transaction failed unexpectedly." });
    }
  } catch (error) {
    console.error("Error in FormApprovedReturnAction:", error);
    return res.status(500).json({
      message: "Error while approving action items.",
    });
  }
};

///////////////////////////////////////////////////////

const FormApprovedAction = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const aPActionContent = req.body.APActionContent;
    const newConclusionInput = req.body.newConclusion;

    const wasApproved = await sql.transact(async (txn) => {
      for (const item of aPActionContent) {
        const payload = {
          IRNo: item.iRNo,
          Code: item.code,
          ActionItem: item.actionItem.trim(),
          TimelineFromDate: item.timelineFromDate,
          TimelineToDate: item.timelineToDate,
          isActive: "1",
          ActionStatus: "Resolved",
          CreatedBy: employeeCode,
        };

        const result = await model.insertactionreturn(payload, txn);
        if (!result) throw new Error("Failed to insert action item");
      }

      const updateAction = await model.updateRCAStatus(
        {
          IRNo: iRNo,
          ActionSubStatus: "5",
          ActionDateTimeUpdated: new Date(),
        },
        { IRNo: iRNo },
        txn,
      );
      if (!updateAction) throw new Error("Failed to update Action Status");

      const insertRCAApproved = {
        IRNo: iRNo,
        newConclusion: newConclusionInput,
        CreatedBy: employeeCode,
      };
      const result = await model.insertRecomConclusion(insertRCAApproved, txn);

      if (!result) throw new Error("Failed to insert Conclusion");
      return result;
    });

    if (wasApproved?.iRNo) {
      const AppActionItems = await model.getsApprovedActionItem(
        wasApproved.iRNo,
      );

      const {
        riskGrading,
        subjectName,
        subjectSpecificExam,
        newConclusion,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = AppActionItems[0];

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };
      const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

      const formattedDate = dateTimeCreated
        ? new Date(dateTimeCreated)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })
            .toUpperCase()
        : "UNKNOWN DATE";

      await qaEmail.sendApprovedActionEmail(
        iRNo,
        riskLabel,
        subjectName,
        subjectSpecificExam,
        newConclusion,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        formattedDate,
      );

      return res.status(200).json({
        message: "Action Status submitted successfully",
        wasApproved,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Transaction failed unexpectedly." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error while approving action items." });
  }
};

///////////////////////////////////////////////////////

const FormApprovedActionItems = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    if (!IRNo) {
      return res.status(400).json({ msg: "IRNO is required" });
    }
    const resultforAction = await model.getApprovedActionItems(IRNo);
    return res.status(200).json(resultforAction);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

const FormVLActItemStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const actionStatus = req.body.ActionStatus;

    const updatevlactionstatus = await sql.transact(async (txn) => {
      return await model.UpdateVLActStatus(
        {
          UpdatedBy: employeeCode,
          ItemsActionStatus: actionStatus,
        },
        { Id: id },
        txn,
      );
    });

    if (!updatevlactionstatus) {
      return res
        .status(500)
        .json({ message: "Incident report counting Action status failed" });
    }
    return res.status(200).json({
      message: "Incident report Action status updated successfully",
      updatevlactionstatus,
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

///////////////////////////////////////////////////////

const FormAccomplishmentActStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const accomplishDate = req.body.AccomplishDate;

    const updatedateactionstatus = await sql.transact(async (txn) => {
      return await model.UpdateActAccomplishStatus(
        {
          AccomplishStatus: "0",
          AccomplishDate: accomplishDate,
          AccomplishBy: employeeCode,
        },
        { Id: id },
        txn,
      );
    });

    return res.status(200).json({
      message: "Incident report updated accomplishment status successfully",
      updatedateactionstatus,
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

//////////////////////////////////////////////////////////// RCA //////////////////////////////////////////////////////////////////////////////////////////

const FormDisApprovedRCA = async (req, res) => {
  try {
    const iRNo = req.body.IRNo;
    const employeeCode = req.user.EmployeeCode;
    const newConclusions = req.body.newConclusion;

    const insertDisRCA = await sql.transact(async (txn) => {
      const insertRCADisApproved = {
        IRNo: iRNo,
        newConclusion: newConclusions,
        CreatedBy: employeeCode,
      };
      return await model.insertdisapprovedRCA(insertRCADisApproved, txn);
    });

    const countReturnRCA = await countRCA(insertDisRCA.iRNo);

    if (insertDisRCA?.iRNo) {
      const updateRCAdisapproved = await sql.transact(async (txn) => {
        return await model.updateRCA(
          {
            CountReturnRCA: countReturnRCA,
            RCAIsApproved: "1",
            RCAApprovedBY: employeeCode,
          },
          { IRNo: insertDisRCA.iRNo },
          txn,
        );
      });
      if (!updateRCAdisapproved) {
        return res
          .status(500)
          .json({ message: "Incident report RCA disapproved" });
      }
    }
    res.status(200).json({
      message: "RCA status updated successfully",
      insertDisRCA,
    });
  } catch (error) {
    res.status(500).json({ message: "Error FormDisApprovedRCA" });
  }
};

async function countRCA(IRNo) {
  let rcaNumber = 1;
  if (!IRNo) {
    throw new Error("IRNo is required.");
  }

  const result = await sql.query(
    `SELECT CountReturnRCA FROM IRUP..IRDetails WHERE IRNo = ?`,
    [IRNo],
  );

  if (Array.isArray(result) && result.length > 0) {
    rcaNumber = result[0].countReturnRCA + 1; // Ensure correct property name
  }
  return rcaNumber;
}

const FormReturnDisApprovedRCA = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;

    const {
      RCAProblemStatement: problemstatementlogs = [],
      RCANotSelProblemStatement: notSelProblemStatements = [],
      RCAWhy: whylogs = [],
      RCANotSelWhyItems: notSelWhys = [],
      RCAActionable: actionablelogs = [],
      RCANotSelActionableItems: notSelActionables = [],
      RCACorrective: correctivelogs = [],
      RCANotSelCorrective: notSelCorrectives = [],
      RCAPreventive: preventivelogs = [],
      RCANotSelPreventive: notSelPreventives = [],
    } = req.body;

    const code = await sql.generateUniqueCode(
      "IRUP.dbo.RCAProblemStatmentLogs",
      "RCA",
      6,
    );

    const resultDisApprovedRCA = await sql.transact(async (txn) => {
      // Problem Statement Logs
      for (const log of problemstatementlogs) {
        await model.insertrcaprobstatlog(
          {
            IRNo: log.iRNo,
            Code: log.code,
            RevisionCode: code,
            ProblemCode: log.problemCode,
            Description: log.description,
            ProblemStatmentNote: log.notes,
            Status: "For Revision",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      // Why Logs
      for (const log of whylogs) {
        await model.insertrcawhylog(
          {
            IRNo: log.iRNo,
            Code: log.code,
            RevisionCode: code,
            ProblemCode: log.problemCode,
            ProblemName: log.problemName,
            Description: log.description,
            WhyNote: log.notes,
            Status: "For Revision",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      // Actionable Logs
      for (const log of actionablelogs) {
        await model.insertrcaactionablelog(
          {
            IRNo: log.iRNo,
            Code: log.code,
            RevisionCode: code,
            Actionable: log.actionable,
            ActionableQANote: log.notes,
            Domain: log.domain,
            Status: "For Revision",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      // Corrective Logs
      for (const log of correctivelogs) {
        await model.insertrcacorrectiveLog(
          {
            IRNo: log.iRNo,
            Code: log.code,
            RevisionCode: code,
            AccountablePer: log.accountablePer,
            CorrectiveAction: log.correctiveAction,
            CorTimelineFromDate: log.corTimelineFromDate,
            CorTimelineToDate: log.corTimelineToDate,
            CorrectiveNote: log.notes,
            Status: "For Revision",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      // Preventive Logs
      for (const log of preventivelogs) {
        await model.insertrcapreventiveLog(
          {
            IRNo: log.iRNo,
            Code: log.code,
            RevisionCode: code,
            ResponsiblePer: log.responsiblePer,
            PreventiveMeasure: log.preventiveMeasure,
            PreTimelineFromDate: log.preTimelineFromDate,
            PreTimelineToDate: log.preTimelineToDate,
            PreventiveNote: log.notes,
            Status: "For Revision",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      // Reinsert non-selected items as "Resolved"
      for (const item of notSelProblemStatements) {
        await model.insertrcaprobsta(
          {
            IRNo: item.iRNo,
            Code: item.code,
            ProblemCode: item.problemCode || item.problemName,
            Description: item.description,
            isActive: "1",
            Status: "Resolved",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      for (const item of notSelWhys) {
        await model.insertrcawhy(
          {
            IRNo: item.iRNo,
            Code: item.code,
            ProblemCode: item.problemCode,
            ProblemName: item.problemName,
            Description: item.description,
            isActive: "1",
            Status: "Resolved",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      for (const item of notSelActionables) {
        await model.insertrcaactionable(
          {
            IRNo: item.iRNo,
            Code: item.code,
            Actionable: item.actionable,
            Domain: item.domain,
            Status: "Resolved",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      for (const item of notSelCorrectives) {
        await model.insertrcacorrective(
          {
            IRNo: item.iRNo,
            Code: item.code,
            AccountablePer: item.accountablePer,
            CorrectiveAction: item.correctiveAction,
            CorTimelineFromDate: item.corTimelineFromDate,
            CorTimelineToDate: item.corTimelineToDate,
            isActive: "1",
            Status: "Resolved",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      for (const item of notSelPreventives) {
        await model.insertrcapreventive(
          {
            IRNo: item.iRNo,
            Code: item.code,
            ResponsiblePer: item.responsiblePer,
            PreventiveMeasure: item.preventiveMeasure,
            PreTimelineFromDate: item.preTimelineFromDate,
            PreTimelineToDate: item.preTimelineToDate,
            isActive: "1",
            Status: "Resolved",
            CreatedBy: employeeCode,
          },
          txn,
        );
      }

      const updateRCA = await model.updateRCAStatus(
        { IRNo: iRNo, RCA: "3", DateTimeRCAUpdated: new Date() },
        { IRNo: iRNo },
        txn,
      );

      if (!updateRCA) throw new Error("Failed to update RCA Status");

      return { success: true, code };
    });

    if (resultDisApprovedRCA?.success) {
      const disAppRCAItems = await model.getsActionItem(iRNo);
      const {
        riskGrading,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = disAppRCAItems[0] || {};

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const riskLabel = riskLabels[riskGrading] ?? `UNKNOWN (${riskGrading})`;
      const formattedDate = dateTimeCreated
        ? new Date(dateTimeCreated)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })
            .toUpperCase()
        : "UNKNOWN DATE";

      await qaEmail.sendDisapprovalRCAEmail(
        iRNo,
        riskLabel,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        formattedDate,
      );

      return res.status(200).json({
        message:
          "RCA Disapproval successfully processed and returned for revision",
        revisionCode: resultDisApprovedRCA.code,
      });
    }

    res.status(200).json({
      message: "RCA Disapproval successfully processed",
      revisionCode: code,
    });
  } catch (error) {
    console.error("Error FormDisApprovedRCA:", error);
    res.status(500).json({
      message: "Error FormDisApprovedRCA",
      error: error.message,
    });
  }
};

const FormFilterQAReviewDisRCADetailsReturn = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    if (!IRNo) {
      return res.status(400).json({ message: "IRNo is required" });
    }

    const queries = {
      RCAProblemStatementReviewLogsReturn:
        model.getRCAFilterProblemStatmentLogs,
      RCAWhyReviewLogReturn: model.getRCAFilterWhyLog,
      RCACorrectiveReviewLogReturn: model.getRCAFilterCorrectiveLog,
    };

    const responseData = {};

    for (const [key, func] of Object.entries(queries)) {
      try {
        const result = await func(IRNo);
        responseData[key] = result;
      } catch (innerErr) {
        responseData[key] = [];
      }
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormApprovedRCA = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const newConclusion = req.body.NewConclusion;
    const iRNo = req.body.IRNo;

    const {
      RCAProblemStatement: problemstate,
      RCAWhy: why,
      RCACorrective: corrective,
      RCAActionable: actionable,
    } = req.body;

    const resultApprovedRCA = await sql.transact(async (txn) => {
      const insertedProblemStatements = [];
      const insertedWhys = [];
      const insertedActionable = [];
      const insertedCorrectives = [];

      // Insert Problem Statements
      for (const item of problemstate) {
        const payload = {
          IRNo: item.iRNo,
          Code: item.code,
          ProblemCode: item.problemCode,
          Description: item.description,
          isActive: "1",
          Status: "Resolved",
          CreatedBy: employeeCode,
        };

        const insertRes = await model.insertrcaprobsta(payload, txn);
        insertedProblemStatements.push(insertRes);
      }

      // Insert Why Items
      for (const item of why) {
        const payload = {
          IRNo: item.iRNo,
          Code: item.code,
          ProblemCode: item.problemCode,
          ProblemName: item.problemName,
          Description: item.description,
          isActive: "1",
          Status: "Resolved",
          CreatedBy: employeeCode,
        };

        const insertRes = await model.insertrcawhy(payload, txn);
        insertedWhys.push(insertRes);
      }

      for (const item of actionable) {
        const payload = {
          IRNo: item.iRNo,
          Code: item.code,
          Actionable: item.actionable,
          Domain: item.domain,
          Status: "Resolved",
          CreatedBy: employeeCode,
        };
        const insertRes = await model.insertrcaactionable(payload, txn);
        insertedActionable.push(insertRes);
      }

      // Insert Corrective Actions
      for (const item of corrective) {
        const payload = {
          IRNo: item.iRNo,
          Code: item.code,
          AccountablePer: item.accountablePer,
          CorrectiveAction: item.correctiveAction,
          CorTimelineFromDate: item.corTimelineFromDate,
          CorTimelineToDate: item.corTimelineToDate,
          isActive: "1",
          Status: "Resolved",
          CreatedBy: employeeCode,
        };

        const insertRes = await model.insertrcacorrective(payload, txn);
        insertedCorrectives.push(insertRes);
      }

      // Update RCA Status
      const updateRCA = await model.updateRCAStatus(
        { IRNo: iRNo, RCA: "5", DateTimeRCAUpdated: new Date() },
        { IRNo: iRNo },
        txn,
      );
      if (!updateRCA) throw new Error("Failed to update RCA Status");

      // Insert Conclusion
      const insertRCAApproved = {
        IRNo: iRNo,
        newConclusion: newConclusion,
        CreatedBy: employeeCode,
      };

      const insertedConclusion = await model.insertRecomConclusion(
        insertRCAApproved,
        txn,
      );

      if (!insertedConclusion) throw new Error("Failed to insert Conclusion");

      // What we return from the transaction
      return {
        problemStatements: insertedProblemStatements,
        whys: insertedWhys,
        correctives: insertedCorrectives,
        rcaStatusUpdated: updateRCA,
        conclusion: insertedConclusion,
      };
    });

    if (resultApprovedRCA?.iRNo) {
      const AppActionItems = await model.getsApprovedActionItem(
        resultApprovedRCA.iRNo,
      );

      const {
        riskGrading,
        subjectName,
        subjectSpecificExam,
        newConclusion,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = AppActionItems[0];

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

      const formattedDate = dateTimeCreated
        ? new Date(dateTimeCreated)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })
            .toUpperCase()
        : "UNKNOWN DATE";

      await qaEmail.sendApprovedRCAEmail(
        iRNo,
        riskLabel,
        subjectName,
        subjectSpecificExam,
        newConclusion,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        formattedDate,
      );

      return res.status(200).json({
        message: "RCA submitted successfully",
      });
    }

    return res.status(200).json(resultApprovedRCA);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormQAReviewDisRCADetailsReturn = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const RevisionCode = req.query.revisionCode;

    if (!IRNo) {
      return res.status(400).json({ message: "IRNo is required" });
    }
    const queries = {
      RCAProblemStatementReviewLogsReturn:
        model.getRCAProblemStatmentReviewLogs,
      RCAWhyReviewLogReturn: model.getRCAWhyReviewLog,
      RCACorrectiveReviewLogReturn: model.getRCACorrectiveReviewLog,
    };

    const responseData = {};
    for (const [key, func] of Object.entries(queries)) {
      responseData[key] = await func(IRNo, RevisionCode);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormREConclusion = async (req, res) => {
  try {
    const { IRNo: iRNo, newConclusion: newConclusions } = req.body;
    const employeeCode = req.user?.EmployeeCode;

    const insertRecomConclusion = await sql.transact(async (txn) => {
      const insertConRecom = {
        IRNo: iRNo,
        newConclusion: newConclusions,
        CreatedBy: employeeCode,
      };

      return await model.insertRecomConclusion(insertConRecom, txn);
    });
    res.status(200).json({
      message: "Conclusion updated successfully",
      insertRecomConclusion,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status. Please try again later." });
  }
};

const FormApprovedDetails = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;

    if (!IRNo) {
      return res.status(400).json({ message: "IRNo is required" });
    }
    const queries = {
      RCAProblemStatementApproved: model.getRCAApprovedProblemStatmentLogs,
      RCAWhyApproved: model.getRCAApprovedWhyLog,
      RCAActionableApproved: model.getRCAApprovedActionableLog,
      RCACorrectiveApproved: model.getRCAApprovedCorrectiveLog,
      RCARiskApproved: model.getRCAApprovedRiskLog,
    };

    const responseData = {};
    for (const [key, func] of Object.entries(queries)) {
      responseData[key] = await func(IRNo);
    }
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// const FormApprovedRCA = async (req, res) => {
//   try {
//     const { EmployeeCode } = req.user;
//     const {
//       IRNo: iRNo,
//       ActionItem: actionItem,
//       TimelineFromDate: timelineFromDate,
//       TimelineToDate: timelineToDate,
//     } = req.body;
//     const prefix = "ACI";

//     // Validate input lengths
//     if (
//       actionItem.length !== timelineFromDate.length ||
//       actionItem.length !== timelineToDate.length
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Invalid input: lengths do not match" });
//     }

//     // Transaction for inserting RCA approvals
//     await sql.transact(async (txn) => {
//       for (let i = 0; i < actionItem.length; i++) {
//         const code = await sql.generateUniqueCode(
//           "IRUP.dbo.IRActionItems",
//           prefix.toUpperCase(),
//           2,
//           txn,
//         ); // Generate a unique code for each item
//         const insertRCAApproved = {
//           IRNo: iRNo,
//           CreatedBy: EmployeeCode,
//           Code: code,
//           ActionItem: actionItem[i],
//           TimelineFromDate: timelineFromDate[i],
//           TimelineToDate: timelineToDate[i],
//         };
//         await model.insertapprovedRCA(insertRCAApproved, txn);
//       }
//     });

//     // Update RCA status
//     const updateRCAapproved = await sql.transact(async (txn) => {
//       return await model.updateapprovedRCA(
//         { IRNo: iRNo, RCA: "3" },
//         { IRNo: iRNo },
//         txn,
//       );
//     });

//     if (updateRCAapproved?.iRNo) {
//       const resultselectApproved = await model.getselectApprovedRCA(
//         updateRCAapproved.iRNo,
//       );

//       if (resultselectApproved && resultselectApproved.length > 0) {
//         const combinedResult = buildCombinedResult(resultselectApproved);
//         const {
//           IRNo,
//           SubjectName,
//           SubjectSpecificExam,
//           PrimaryName,
//           PrimaryEmail,
//           QAName,
//           QAEmail,
//         } = combinedResult;

//         const actionItems = Object.keys(combinedResult)
//           .filter((key) => key.startsWith("ActionItem"))
//           .map((key) => combinedResult[key]);

//         // Send email if PrimaryEmail exists
//         if (PrimaryEmail) {
//           try {
//             await ActionitemEmail(
//               IRNo,
//               SubjectName,
//               SubjectSpecificExam,
//               PrimaryName,
//               PrimaryEmail,
//               QAName,
//               QAEmail,
//               actionItems,
//             );
//           } catch (emailError) {
//             res.status(500).json({
//               message: "Error updating status",
//               error: emailError.message,
//             });
//           }
//         }
//         return res
//           .status(200)
//           .json({ message: "Success: action items created" });
//       }
//     }

//     res.status(200).json(updateRCAapproved);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error updating status", error: error.message });
//   }
// };

// const buildCombinedResult = (resultselectApproved) => {
//   const combinedResult = {
//     IRNo: resultselectApproved[0].iRNo,
//     SubjectName: resultselectApproved[0].subjectName,
//     SubjectSpecificExam: resultselectApproved[0].subjectSpecificExam,
//     PrimaryName: resultselectApproved[0].primaryName,
//     PrimaryEmail: resultselectApproved[0].primaryEmail,
//     QAName: resultselectApproved[0].qAName,
//     QAEmail: resultselectApproved[0].qAEmail,
//   };

//   resultselectApproved.forEach((item, index) => {
//     combinedResult[`ActionItem${index + 1}`] = item.actionItem;
//   });

//   return combinedResult;
// };

// const ActionitemEmail = async (
//   IRNo,
//   SubjectName,
//   SubjectSpecificExam,
//   PrimaryName,
//   PrimaryEmail,
//   QAName,
//   QAEmail,
//   actionItems,
// ) => {
//   if (PrimaryEmail) {
//     const emailContent = {
//       subject: "IMPLEMENTIVE ACTION OF THE INCIDENT REPORT",
//       header: "CORRECTIVE/ PREVENTIVE ACTION OF THE INCIDENT REPORT<br />",
//       content: `
//         Good Day!<br>
//         Dear <b>${PrimaryName},</b><br><br>
//         We are writing to inform you about the necessary corrective and
//         preventive actions required following the recent incident report for the <b>${SubjectName}${SubjectSpecificExam ? ` - ${SubjectSpecificExam}` : ""}</b>.
//         <br><br>
//         <b>Action Details:</b><br>
//         <b>• Incident Report Number:</b> ${IRNo}<br>
//         ${actionItems.map((action, index) => `<b>• Action Item ${index + 1}:</b> ${action}<br/>`).join("")}
//         <br><br>
//         For any questions, feel free to contact:<br>
//         <b>• Quality Officer Name:</b> ${QAName}<br>
//         <b>• Quality Officer Email:</b> ${QAEmail}<br><br>
//       `,
//       email: "jppaalcio@uerm.edu.ph",
//       name: "JOHN BRIAN",
//     };

//     await util.sendEmail(emailContent);
//   }
// };

const FormDisCorrectiveItems = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const result = await model.DisCorrectiveItems(IRNo);
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormDisRiskItems = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const result = await model.DisRiskItems(IRNo);
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

// const FormDisPreventiveItems = async (req, res) => {
//   try {
//     const IRNo = req.query.iRNo;
//     const result = await model.DisPreventiveItems(IRNo);
//     return res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "ERROR" });
//   }
// };

const FormCorrectiveActStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const actionStatus = req.body.ActionStatus;

    const updateactionstatus = await sql.transact(async (txn) => {
      return await model.UpdateCorrectiveActStatus(
        {
          UpdatedBy: employeeCode,
          ActionStatus: actionStatus,
        },
        { Id: id },
        txn,
      );
    });

    if (!updateactionstatus) {
      return res
        .status(500)
        .json({ message: "Incident report counting Action status failed" });
    }
    return res.status(200).json({
      message: "Incident report Action status updated successfully",
      updateactionstatus,
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormAccomplishmentStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const accomplishDate = req.body.AccomplishDate;

    const updateaccomplishstatus = await sql.transact(async (txn) => {
      return await model.UpdateCorrectiveActStatus(
        {
          AccomplishStatus: "0",
          AccomplishDate: accomplishDate,
          AccomplishBy: employeeCode,
        },
        { Id: id },
        txn,
      );
    });

    return res.status(200).json({
      message: "Incident report updated accomplishment status successfully",
      updateaccomplishstatus,
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormRiskStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const id = req.body.Id;
    const ermID = req.body.ErmID;
    const processID = req.body.ProcessID;
    const processTitle = req.body.ProcessTitle;
    const policyOwner = req.body.PolicyOwner;

    const updateriskstatus = await sql.transact(async (txn) => {
      return await model.UpdateRiskStatus(
        {
          ErmID: ermID,
          ProcessID: processID,
          ProcessTitle: processTitle,
          PolicyOwner: policyOwner,
          Status: "Completed",
          UpdatedBy: employeeCode,
        },
        { Id: id },
        txn,
      );
    });

    return res.status(200).json({
      message: "Incident report Risk status updated successfully",
      updateriskstatus,
    });
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

// const FormPreventiveActStatus = async (req, res) => {
//   try {
//     const employeeCode = req.user.EmployeeCode;
//     const id = req.body.Id;
//     const actionStatus = req.body.ActionStatus;

//     const updateactionstatus = await sql.transact(async (txn) => {
//       return await model.UpdatePreventiveActStatus(
//         {
//           UpdatedBy: employeeCode,
//           ActionStatus: actionStatus,
//         },
//         { Id: id },
//         txn,
//       );
//     });

//     if (!updateactionstatus) {
//       return res
//         .status(500)
//         .json({ message: "Incident report counting Action status failed" });
//     }
//     return res.status(200).json({
//       message: "Incident report Action status updated successfully",
//       updateactionstatus,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "ERROR" });
//   }
// };

const FormPendingRemarks = async (req, res) => {
  try {
    const result = await model.getPendingRemarks();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormPostPendingRemarks = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const code = req.body.Code;
    const pendingRemarks = req.body.PendingRemarks;

    const insertRemarks = await sql.transact(async (txn) => {
      const insertpendingRemarks = {
        IRNo: iRNo,
        PendingRemarks: pendingRemarks,
        Code: code,
        CreatedBy: employeeCode,
      };
      return await model.insertPendingRem(insertpendingRemarks, txn);
    });
    res
      .status(200)
      .json({ message: "Conclusion updated successfully", insertRemarks });
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

const FormQADoneStatus = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const qAStatus = req.body.QAStatus;

    const updateqastatus = await sql.transact(async (txn) => {
      return await model.UpdateQADoneStatus(
        {
          IRNo: iRNo,
          QAStatus: qAStatus,
          QAUpdatedBy: employeeCode,
        },
        { IRNo: iRNo },
        txn,
      );
    });
    return res.status(200).json(updateqastatus);
  } catch (error) {
    res.status(500).json({ message: "ERROR" });
  }
};

// const sendEmail = async () => {
//   const resultDisplayTime = await model.getTime();

//   for (const recordDetails of resultDisplayTime) {
//     const {
//       iRNo,
//       subjectName,
//       subjectSpecificExam,
//       primaryName,
//       primaryEmail,
//       dateTimeCreated,
//       dateTimeRCAUpdated,
//       sendEmailCounts,
//     } = recordDetails;

//     if (!dateTimeRCAUpdated) {
//       const currentDateTime = new Date();
//       const irCreatedDate = new Date(dateTimeCreated);
//       const differenceInHours =
//         Math.abs(currentDateTime - irCreatedDate) / 3600000;

//       const countsMapping = {
//         12: "1",
//         24: "2",
//         36: "3",
//         48: "4",
//       };

//       const targetCount = countsMapping[differenceInHours];

//       const emailCount = sendEmailCounts ? parseInt(sendEmailCounts) : 0;

//       if (targetCount && emailCount === parseInt(targetCount) - 1) {
//         await sql.transact(async (txn) => {
//           await model.updateSendEmailCounts(
//             { IRNo: iRNo, SendEmailCounts: targetCount },
//             { IRNo: iRNo },
//             txn,
//           );
//         });

//         await qaEmail.PendingEmail(
//           iRNo,
//           subjectName,
//           subjectSpecificExam,
//           primaryName,
//           primaryEmail,
//         );
//       }
//     }
//   }
// };

module.exports = {
  QAFormDisAll,
  FormDisIRF,
  QARCAInsertEmail,
  FormDepDis,
  FormDepListDis,
  QADisAll,
  FormEmployeeName,
  FormRiskGrading,
  FormCountRCASta,
  FormDisApprovedRCA,
  FormApprovedRCA,
  FormApprovedDetails,
  FormReturnDisApprovedRCA,
  FormREConclusion,

  FormDisCorrectiveItems,
  FormDisRiskItems,
  // FormDisPreventiveItems,

  FormCorrectiveActStatus,
  FormRiskStatus,

  // FormPreventiveActStatus,
  FormPendingRemarks,
  FormPostPendingRemarks,
  FormQADoneStatus,
  FormQAReviewDisRCADetailsReturn,
  FormFilterQAReviewDisRCADetailsReturn,
  // sendEmail,

  FormActionDetails,
  FormDisApprovedAction,
  FormReturnActionDetails,
  FormCountActionItem,
  FormRevisionActionDetails,

  FormDisAppActionEmail,
  FormDisapprovedReturnAction,
  FormApprovedReturnAction,
  FormActionApprovedReturnDetails,
  QAActionInsertEmail,

  FormApprovedAction,
  FormVLActItemStatus,
  FormApprovedActionItems,

  FormInsertReject,
  FormAccomplishmentStatus,
  FormAccomplishmentActStatus,
};
