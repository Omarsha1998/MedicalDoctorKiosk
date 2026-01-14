const sql = require("../../../helpers/sql.js");
// const util = require("../../../helpers/util.js");
const primaryEmail = require("../helper/primaryEmail.js");
const model = require("../models/primaryModel.js");

const PrimaryACTDisAll = async (req, res) => {
  try {
    const deptCode = req.user?.DeptCode || null;
    const userCode = req.user?.EmployeeCode || null;

    let result;

    if (userCode) {
      result = await model.getACTUnderEmployee(deptCode, userCode);
    } else {
      result = await model.getACTHead(deptCode);
    }

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};

const PrimaryRCADisAll = async (req, res) => {
  try {
    const deptCode = req.user?.DeptCode || null;
    const userCode = req.user?.EmployeeCode || null;

    let result;

    if (userCode) {
      result = await model.getRCAUnderEmployee(deptCode, userCode);
    } else {
      result = await model.getRCAHead(deptCode);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

///////////////////////////////////////////////// ACTION ITEM //////////////////////////////////////////////////////////////

const FormActionItemVL = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.IRNo;
    const actionItem = req.body.ActionItem;
    const timelineFromDate = req.body.TimelineFromDate;
    const timelineToDate = req.body.TimelineToDate;
    const prefix = "ACI";

    // INSERT ALL ACTION ITEMS
    const insertedList = await sql.transact(async (txn) => {
      const results = [];

      for (let i = 0; i < actionItem.length; i++) {
        const code = await sql.generateUniqueCode(
          "IRUP.dbo.IRActionItemsLog",
          prefix.toUpperCase(),
          2,
          txn,
        );

        const payload = {
          IRNo: iRNo,
          Code: code,
          CreatedBy: employeeCode,
          ActionItem: actionItem[i],
          TimelineFromDate: timelineFromDate[i],
          TimelineToDate: timelineToDate[i],
        };

        const record = await model.insertactionItemVL(payload, txn);
        results.push(record);
      }

      return results; // return ALL inserted records
    });

    // UPDATE STATUS
    await sql.transact(async (txn) => {
      const updatePayload = {
        IRNo: iRNo,
        ActionSubStatus: "2",
        ActionDateTimeUpdated: new Date(),
      };

      return await model.updateRCAStatus(updatePayload, { IRNo: iRNo }, txn);
    });

    // GET ACTION ITEMS FOR EMAIL
    const actionItems = await model.getselectActionItem(iRNo);

    if (actionItems?.length > 0) {
      const {
        iRNo,
        riskGrading,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = actionItems[0];

      const formattedDate = new Date(dateTimeCreated)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })
        .toUpperCase();

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

      await primaryEmail.NotifyActionItemVL(
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
    }

    // ⭐ FINAL RESPONSE — returns ALL INSERTED RECORDS
    res.status(200).json({
      message: "Action items saved successfully.",
      insertedActionItems: insertedList,
      totalInserted: insertedList.length,
    });
  } catch (error) {
    console.error("VL ACTION ITEM ERROR: ", error);
    res.status(500).json({
      message: "Incident report Action item for V & L Risk Grading Error",
      error: error.message,
    });
  }
};

const FormDisActionDetails = async (req, res) => {
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

const FormFilterActionReturn = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const resultFilterAction = await model.getFilterActionItems(IRNo);

    const uniqueResults = {};

    resultFilterAction.forEach(
      ({ actionStatus, revisionActionCode, dateTimeCreated }) => {
        const key = `${revisionActionCode}-${actionStatus}`;

        // If the key doesn't exist OR the new dateTimeCreated is earlier, update it
        if (
          !uniqueResults[key] ||
          new Date(dateTimeCreated) <
            new Date(uniqueResults[key].dateTimeCreated)
        ) {
          uniqueResults[key] = {
            actionStatus,
            revisionActionCode,
            dateTimeCreated,
          };
        }
      },
    );

    // Group by revisionActionCode
    const grouped = {};
    Object.values(uniqueResults).forEach(
      ({ actionStatus, revisionActionCode, dateTimeCreated }) => {
        if (!grouped[revisionActionCode]) {
          grouped[revisionActionCode] = [];
        }
        grouped[revisionActionCode].push({
          actionStatus,
          revisionActionCode,
          dateTimeCreated,
        });
      },
    );
    return res.status(200).json(grouped);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormDisplayReturnAction = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const RevisionActionCode = req.query.revisionActionCode;
    const result = await model.getReturnActionItems(IRNo, RevisionActionCode);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

const FormAddReturnAction = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const iRNo = req.body.iRNo;
    const ActionContentItems = req.body.actionContentItems;

    const DisApprovedReturnAction = await sql.transact(async (txn) => {
      for (const actionlogs of ActionContentItems) {
        const payload = {
          IRNo: actionlogs.iRNo,
          Code: actionlogs.code,
          RevisionActionCode: actionlogs.revisionActionCode,
          ActionItem: actionlogs.actionItem,
          TimelineFromDate: actionlogs.timelineFromDate,
          TimelineToDate: actionlogs.timelineToDate,
          ActionStatus: "For Review",
          RevisionActionCodeStatus: "Completed",
          CreatedBy: employeeCode,
        };

        const result = await model.insertReturnActionItems(payload, txn);
      }

      const updateAction = await model.updateRCAStatus(
        { IRNo: iRNo, ActionSubStatus: 4, ActionDateTimeUpdated: new Date() },
        { IRNo: iRNo },
        txn,
      );
      if (!updateAction) throw new Error("Failed to update Action Status");

      return {
        success: true,
        updateAction,
      };
    });

    if (DisApprovedReturnAction.success) {
      const disEmailReturnAction = await model.getselectActionItem(iRNo);

      const {
        riskGrading,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = disEmailReturnAction[0];

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

      await primaryEmail.sendReturnActionEmail(
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
      return res
        .status(200)
        .json(
          { message: "Disapproved RCA Form submitted successfully" },
          DisApprovedReturnAction,
        );
    } else {
      return res
        .status(500)
        .json({ message: "Transaction failed unexpectedly." });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

const FormActionApprovedDetails = async (req, res) => {
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

////////////////////////////////////////////////// RCA /////////////////////////////////////////////////////////////////////

const FormRCAItem = async (req, res) => {
  try {
    const {
      Manwhy = [],
      Methodwhy = [],
      Machinewhy = [],
      Materialwhy = [],
      Measurementwhy = [],
      Environmentwhy = [],
      CorrectiveAction = [],
      CorTimelineFromDate = [],
      CorTimelineToDate = [],
      AccountablePer = [],
      PreventiveMeasure = [],
      PreTimelineFromDate = [],
      PreTimelineToDate = [],
      ResponsiblePer = [],
      RiskItems = [],
      ManProbStatement = "",
      MethodStatement = "",
      MachineStatement = "",
      MaterialStatement = "",
      MeasurementStatement = "",
      EnvironmentStatement = "",
    } = req.body;

    const employeeCode = req.user?.EmployeeCode;
    const iRNo = req.body?.IRNo;
    const actionableRoot = req.body?.actionableRoot;
    const domainActionable = req.body?.domainActionable;

    if (!iRNo || !employeeCode) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const generateCode = async (table, prefix, length, txn) => {
      return await sql.generateUniqueCode(
        `IRUP.dbo.RCAProblemStatmentLogs`,
        prefix,
        length,
        txn,
      );
    };

    const RCACreated = await sql.transact(async (txn) => {
      const problemCode = [
        "MANPOWER",
        "METHOD",
        "MACHINE",
        "MATERIAL",
        "MEASUREMENT",
        "ENVIRONMENT",
      ];

      const problemDescription = [
        ManProbStatement,
        MethodStatement,
        MachineStatement,
        MaterialStatement,
        MeasurementStatement,
        EnvironmentStatement,
      ];

      const insertedProblems = [];
      const insertedWhys = [];
      const insertedCorrective = [];
      const insertedPreventive = [];
      const insertedRiskItems = [];
      let insertedActionable = null;

      // PROBLEMS + WHY
      for (let i = 0; i < problemDescription.length; i++) {
        if (!problemDescription[i]?.trim()) continue;

        const code = await generateCode(
          "RCAProblemStatmentLogs",
          "PMS",
          6,
          txn,
        );
        const payload = {
          IRNo: iRNo,
          Code: code,
          ProblemCode: problemCode[i],
          Description: problemDescription[i],
          Status: "In Progress",
          CreatedBy: employeeCode,
        };
        const insertedDatalog = await model.insertrcaproblemstatmentlog(
          payload,
          txn,
        );
        if (!insertedDatalog) {
          throw new Error(
            `Failed to insert Problem Statement for ${problemCode[i]}`,
          );
        }

        insertedProblems.push(payload);

        // WHY logs
        const processWhyLogs = async (prefix, whyArray = []) => {
          if (!whyArray.length) {
            return [];
          }
          const whyLogs = [];

          for (const desc of whyArray) {
            const whyCode = await generateCode("RCAWhyLog", prefix, 4, txn);
            const whyPayload = {
              IRNo: iRNo,
              Code: whyCode,
              ProblemCode: code,
              ProblemName: problemCode[i],
              Description: desc,
              Status: "In Progress",
              CreatedBy: employeeCode,
            };
            await model.insertrcawhylog(whyPayload, txn);
            whyLogs.push(whyPayload);
          }

          insertedWhys.push(...whyLogs);
          return whyLogs;
        };

        switch (problemCode[i]) {
          case "MANPOWER":
            await processWhyLogs("MNP", Manwhy);
            break;
          case "METHOD":
            await processWhyLogs("MET", Methodwhy);
            break;
          case "MACHINE":
            await processWhyLogs("MAC", Machinewhy);
            break;
          case "MATERIAL":
            await processWhyLogs("MAT", Materialwhy);
            break;
          case "MEASUREMENT":
            await processWhyLogs("MST", Measurementwhy);
            break;
          case "ENVIRONMENT":
            await processWhyLogs("ENV", Environmentwhy);
            break;
        }
      }

      // CORRECTIVE
      for (let i = 0; i < CorrectiveAction.length; i++) {
        const cpCode = await generateCode("RCACorrectiveLog", "CL", 6, txn);
        const cpPayload = {
          IRNo: iRNo,
          Code: cpCode,
          CorrectiveAction: CorrectiveAction[i],
          CorTimelineFromDate: CorTimelineFromDate[i] || null,
          CorTimelineToDate: CorTimelineToDate[i] || null,
          AccountablePer: AccountablePer[i] || null,
          Status: "In Progress",
          CreatedBy: employeeCode,
        };
        await model.insertCorrectiveActionlog(cpPayload, txn);
        insertedCorrective.push(cpPayload);
      }

      // PREVENTIVE
      for (let i = 0; i < PreventiveMeasure.length; i++) {
        const pvCode = await generateCode("RCAPreventiveLog", "PV", 6, txn);
        const pvPayload = {
          IRNo: iRNo,
          Code: pvCode,
          PreventiveMeasure: PreventiveMeasure[i],
          PreTimelineFromDate: PreTimelineFromDate[i] || null,
          PreTimelineToDate: PreTimelineToDate[i] || null,
          ResponsiblePer: ResponsiblePer[i] || null,
          Status: "In Progress",
          CreatedBy: employeeCode,
        };
        await model.insertPreventiveMeasurelog(pvPayload, txn);
        insertedPreventive.push(pvPayload);
      }

      // RISK
      for (let i = 0; i < RiskItems.length; i++) {
        const riCode = await generateCode("RCARisk", "RIT", 6, txn);
        const riPayload = {
          IRNo: iRNo,
          Code: riCode,
          RiskItem: RiskItems[i],
          Status: "In Progress",
          CreatedBy: employeeCode,
        };
        const riskInserted = await model.insertRisklog(riPayload, txn);
        if (!riskInserted) throw new Error("Failed to insert RCA Risk Item");
        insertedRiskItems.push(riPayload);
      }

      // UPDATE RCA STATUS
      const updateRCA = await model.updateRCAStatus(
        { IRNo: iRNo, RCA: "2", DateTimeRCAUpdated: new Date() },
        { IRNo: iRNo },
        txn,
      );

      if (!updateRCA) throw new Error("Failed to update RCA Status");

      // ACTIONABLE ROOT
      const actCode = await generateCode("RCAActionableLog", "ACT", 6, txn);
      const actPayload = {
        IRNo: iRNo,
        Code: actCode,
        Actionable: actionableRoot,
        Domain: domainActionable,
        Status: "In Progress",
        CreatedBy: employeeCode,
      };
      const actionableInserted = await model.insertActionablelog(
        actPayload,
        txn,
      );
      if (!actionableInserted)
        throw new Error("Failed to insert RCA Actionable Log");
      insertedActionable = actPayload;

      return {
        success: true,
        iRNo,
        RCAStatus: "Updated to 2 (In Progress)",
        Problems: insertedProblems,
        WhyLogs: insertedWhys,
        CorrectiveActions: insertedCorrective,
        PreventiveMeasures: insertedPreventive,
        RiskItems: insertedRiskItems,
        Actionable: insertedActionable,
      };
    });

    return res.status(200).json(RCACreated);
  } catch (error) {
    return res.status(500).json({
      message: "RCA Form submission failed.",
      error: error.message,
    });
  }
};

const FormRCAReviewItem = async (req, res) => {
  try {
    const employeeCode = req.user.EmployeeCode;
    const IRNo = req.body.iRNo;
    const {
      RCAProblemStatementLogs: rcaproblemstatementlogs,
      RCAWhyLog: rcawhylogs,
      RCAActionableLog: rcaactionableLogs,
      RCACorrectiveLog: rcacorrectivelogs,
    } = req.body;

    const responseRCAReview = await sql.transact(async (txn) => {
      const insertedProblems = [];
      const insertedWhys = [];
      const insertedActionable = [];
      const insertedCorrectives = [];

      // Insert Problem Statement Logs
      for (const log of rcaproblemstatementlogs) {
        const payload = {
          IRNo: log.iRNo,
          Code: log.code,
          RevisionCode: log.revisionCode,
          ProblemCode: log.problemCode,
          Description: log.description,
          Status: "For Review",
          RevisionCodeStatus: "Completed",
          CreatedBy: employeeCode,
        };
        const result = await model.insertrcaproblemstatmentlog(payload, txn);
        if (!result) throw new Error("Failed to insert Problem Statement Log");
        insertedProblems.push(result);
      }

      // Insert Why Logs
      for (const log of rcawhylogs) {
        const payload = {
          IRNo: log.iRNo,
          Code: log.code,
          RevisionCode: log.revisionCode,
          ProblemCode: log.problemCode,
          ProblemName: log.problemName,
          Description: log.description,
          Status: "For Review",
          RevisionCodeStatus: "Completed",
          CreatedBy: employeeCode,
        };
        const result = await model.insertrcawhylog(payload, txn);
        if (!result) throw new Error("Failed to insert Why Log");
        insertedWhys.push(result);
      }

      // Insert Actionable Logs
      for (const log of rcaactionableLogs) {
        const payload = {
          IRNo: log.iRNo,
          Code: log.code,
          RevisionCode: log.revisionCode,
          Actionable: log.actionable,
          Domain: log.domain,
          Status: "For Review",
          RevisionCodeStatus: "Completed",
          CreatedBy: employeeCode,
        };
        const result = await model.insertActionablelog(payload, txn);
        if (!result) throw new Error("Failed to insert Actionable Log");
        insertedActionable.push(result);
      }

      // Insert Corrective Action Logs
      for (const log of rcacorrectivelogs) {
        const payload = {
          IRNo: log.iRNo,
          Code: log.code,
          RevisionCode: log.revisionCode,
          AccountablePer: log.accountablePer,
          CorrectiveAction: log.correctiveAction,
          CorTimelineFromDate: log.corTimelineFromDate,
          CorTimelineToDate: log.corTimelineToDate,
          Status: "For Review",
          RevisionCodeStatus: "Completed",
          CreatedBy: employeeCode,
        };
        const result = await model.insertCorrectiveActionlog(payload, txn);
        if (!result) throw new Error("Failed to insert Corrective Action Log");
        insertedCorrectives.push(result);
      }

      // Update RCA status
      const updateRCA = await model.updateRCAStatus(
        { IRNo: IRNo, RCA: "4", DateTimeRCAUpdated: new Date() },
        { IRNo: IRNo },
        txn,
      );
      if (!updateRCA) throw new Error("Failed to update RCA Status");

      // Return all inserted and updated data
      return {
        success: true,
        message: "RCA Review data processed successfully.",
        IRNo,
        updatedRCA: updateRCA,
        inserted: {
          problemStatements: insertedProblems,
          whyLogs: insertedWhys,
          actionable: insertedActionable,
          correctiveActions: insertedCorrectives,
        },
      };
    });

    if (responseRCAReview.success) {
      const resultRCAEmail = await model.getselectActionItem(
        responseRCAReview.iRNo,
      );

      const {
        iRNo,
        riskGrading,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        dateTimeCreated,
      } = resultRCAEmail[0];

      const formattedDate = new Date(dateTimeCreated)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })
        .toUpperCase();

      const riskLabels = {
        1: "VERY LOW RISK",
        2: "LOW RISK",
        3: "MODERATE RISK",
        4: "HIGH RISK",
        5: "VERY HIGH RISK",
      };

      const riskLabel = riskLabels[riskGrading] || `UNKNOWN (${riskGrading})`;

      await primaryEmail.NotifyRCAItem(
        iRNo,
        riskLabel,
        subjectName,
        subjectSpecificExam,
        pDName,
        pDEmail,
        qAName,
        qAEmail,
        formattedDate,
        riskLabel,
      );
    }
    return res.status(200).json(responseRCAReview);
  } catch (error) {
    res.status(500).json({
      message: "Incident report action item error.",
      error: error.message,
    });
  }
};

const FormDisRCADetails = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;

    if (!IRNo) {
      return res.status(400).json({ message: "IRNo is required" });
    }

    const queries = {
      RCAProblemStatementLogs: model.getRCAProblemStatmentLogs,
      RCAWhyLog: model.getRCAWhyLog,
      RCACorrectiveLog: model.getRCACorrectiveLog,
      RCAActionableLog: model.getRCAActionableLog,
      RCARisk: model.getRCARisk,
    };

    const responseData = {};

    for (const [key, func] of Object.entries(queries)) {
      const result = await func(IRNo);
      responseData[key] = result;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormDisRCADetailsReturn = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const RevisionCode = req.query.revisionCode;
    if (!IRNo) {
      return res.status(400).json({ message: "IRNo is required" });
    }
    const queries = {
      RCAProblemStatementLogsReturn: model.getRCAProblemStatmentLogsReturn,
      RCAWhyLogReturn: model.getRCAWhyLogReturn,
      RCAActionableLogReturn: model.getRCAActionableLogReturn,
      RCACorrectiveLogReturn: model.getRCACorrectiveLogReturn,
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

const FormReviewDisRCADetailsReturn = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const Status = req.query.status;
    const RevisionCode = req.query.revisionCode;

    if (!IRNo) {
      return res.status(400).json({ message: "IRNo is required" });
    }
    const queries = {
      RCAProblemStatementReviewLogsReturn:
        model.getRCAProblemStatmentReviewLogs,
      RCAWhyReviewLogReturn: model.getRCAWhyReviewLog,
      RCAActionableReviewLogReturn: model.getRCAActionableReviewLog,
      RCACorrectiveReviewLogReturn: model.getRCACorrectiveReviewLog,
    };

    const responseData = {};
    for (const [key, func] of Object.entries(queries)) {
      responseData[key] = await func(IRNo, Status, RevisionCode);
    }
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const FormFilterDisRCADetailsReturn = async (req, res) => {
  try {
    const IRNo = req.query.iRNo;
    const queries = [
      model.getRCAFilterProblemStatmentLogs,
      model.getRCAFilterWhyLog,
      model.getRCAFilterActionableLog,
      model.getRCAFilterCorrectiveLog,
    ];

    let allResults = [];
    for (const func of queries) {
      const results = await func(IRNo);
      allResults = allResults.concat(results);
    }

    // Store the earliest date per revisionCode-status combination
    const uniqueResults = {};

    allResults.forEach(({ status, revisionCode, dateTimeCreated }) => {
      const key = `${revisionCode}-${status}`;

      // If the key doesn't exist OR the new dateTimeCreated is earlier, update it
      if (
        !uniqueResults[key] ||
        new Date(dateTimeCreated) < new Date(uniqueResults[key].dateTimeCreated)
      ) {
        uniqueResults[key] = { status, revisionCode, dateTimeCreated };
      }
    });
    // Group by revisionCode
    const grouped = {};
    Object.values(uniqueResults).forEach(
      ({ status, revisionCode, dateTimeCreated }) => {
        if (!grouped[revisionCode]) {
          grouped[revisionCode] = [];
        }
        grouped[revisionCode].push({ status, revisionCode, dateTimeCreated });
      },
    );
    return res.status(200).json(grouped);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  PrimaryRCADisAll,
  PrimaryACTDisAll,
  FormActionItemVL,
  FormRCAItem,
  FormRCAReviewItem,
  FormDisRCADetails,
  FormDisRCADetailsReturn,
  FormReviewDisRCADetailsReturn,
  FormFilterDisRCADetailsReturn,
  FormDisActionDetails,
  FormFilterActionReturn,
  FormDisplayReturnAction,
  FormAddReturnAction,
  FormActionApprovedDetails,
};
