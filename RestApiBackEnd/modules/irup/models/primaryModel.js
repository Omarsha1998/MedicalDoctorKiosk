const sqlHelper = require("../../../helpers/sql");

const getACTHead = async (DeptCode) => {
  return await sqlHelper.query(
    `
        SELECT 
                IRD.IRNo,
                IRD.SubjectDate,
                IRD.SubjectTime,
                IRD.SubjectLoc,
                IRD.SubjectResponse,
                IRS.SubjectName AS SubjectName,
                IRE.SubjectSpecificExam,
                IRD.ActionSubStatus,
                IRI.PrimaryDept,
                IRD.RiskGrading,
                IRD.QAStatus
            FROM
                IRUP..IRDetails IRD
            LEFT JOIN
                IRUP..IRDeptInvolved IRI ON IRD.IRNo = IRI.IRNo
            LEFT JOIN 
                IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
            LEFT JOIN 
                IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
            LEFT JOIN 
                IRUP..DirectorUser DU ON IRI.PrimaryDept = DU.DeptCode
            WHERE 
                IRD.QAStatus = '1'
                AND IRS.SubjectCode != 'others' 
                AND IRI.PrimaryDept = ?
                AND IRD.RiskGrading IN (1, 2)
            ORDER BY
                IRD.DateTimeCreated DESC;`,
    [DeptCode],
  );
};

const getACTUnderEmployee = async (DeptCode, EmployeeCode) => {
  return await sqlHelper.query(
    `
    SELECT 
        IRD.IRNo,
        IRD.SubjectDate,
        IRD.SubjectTime,
        IRD.SubjectLoc,
        IRD.SubjectResponse,
        IRS.SubjectName,
        IRE.SubjectSpecificExam,
        IRD.ActionSubStatus,
        IRI.PrimaryDept,
        IRD.RiskGrading,
        IRD.QAStatus
    FROM
        IRUP..IRDetails IRD
    LEFT JOIN 
        IRUP..IRDeptInvolved IRI 
        ON IRD.IRNo = IRI.IRNo
    LEFT JOIN 
        IRUP..IRReportableChildren IRE 
        ON IRD.SubjectChilCode = IRE.SubjectChilCode
    LEFT JOIN 
        IRUP..IRSubjectName IRS 
        ON IRD.SubjectCode = IRS.SubjectCode
    LEFT JOIN 
        IRUP..IRRequestAccess IRA 
        ON IRI.PrimaryDept = IRA.DeptCode
        AND IRA.DeptCode = ?
        AND IRA.EmployeeCode = ?
    WHERE 
        IRD.QAStatus = '1'
        AND IRD.RiskGrading IN (1, 2)
    ORDER BY 
        IRD.DateTimeCreated DESC;`,
    [DeptCode, EmployeeCode],
  );
};

const getRCAHead = async (DeptCode) => {
  return await sqlHelper.query(
    `
        SELECT 
        IRD.IRNo,
        IRD.SubjectDate,
        IRD.SubjectTime,
        IRD.SubjectLoc,
        IRD.SubjectResponse,
        IRD.RCA,
        IRS.SubjectName,
        IRE.SubjectSpecificExam,
        IRI.PrimaryDept,
        IRD.RiskGrading,
        IRD.QAStatus
    FROM
        IRUP..IRDetails IRD
    LEFT JOIN 
        IRUP..IRDeptInvolved IRI ON IRD.IRNo = IRI.IRNo
    LEFT JOIN 
        IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
    LEFT JOIN 
        IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
    WHERE 
        (IRS.SubjectCode IS NULL OR IRS.SubjectCode != 'others')  -- Handle NULLs properly
        AND IRD.QAStatus = '1'
        AND IRI.PrimaryDept = ?
        AND IRD.RiskGrading IN (3, 4, 5)
    ORDER BY 
        IRD.DateTimeCreated DESC;`,
    [DeptCode],
  );
};

const getRCAUnderEmployee = async (DeptCode, EmployeeCode) => {
  return await sqlHelper.query(
    `
    SELECT 
        IRD.IRNo,
        IRD.SubjectDate,
        IRD.SubjectTime,
        IRD.SubjectLoc,
        IRD.SubjectResponse,
        IRD.RCA,
        IRS.SubjectName,
        IRE.SubjectSpecificExam,
        IRI.PrimaryDept,
        IRD.RiskGrading,
        IRD.QAStatus
    FROM
        IRUP..IRDetails IRD
    LEFT JOIN 
        IRUP..IRDeptInvolved IRI 
        ON IRD.IRNo = IRI.IRNo
    LEFT JOIN 
        IRUP..IRReportableChildren IRE 
        ON IRD.SubjectChilCode = IRE.SubjectChilCode
    LEFT JOIN 
        IRUP..IRSubjectName IRS 
        ON IRD.SubjectCode = IRS.SubjectCode
    LEFT JOIN 
        IRUP..IRRequestAccess IRA 
        ON IRI.PrimaryDept = IRA.DeptCode
        AND IRA.DeptCode = ?
        AND IRA.EmployeeCode = ?
    WHERE 
        IRD.QAStatus = '1'
        AND IRD.RiskGrading IN (3, 4, 5)
    ORDER BY 
        IRD.DateTimeCreated DESC;`,
    [DeptCode, EmployeeCode],
  );
};

const insertactionItemVL = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRActionItemsLog`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getActionItemsLogs = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[IRActionItemsLog]
    WHERE IRNo = ? AND RevisionActionCode IS NULL`,
    [IRNo],
  );
};

const getselectActionItem = async (IRNo) => {
  return await sqlHelper.query(
    `
      SELECT
        id.IRNo,
        d.RiskGrading,
        irs.SubjectName,
        ire.SubjectSpecificExam,
        ie.FullName AS PDName,
        ie.UERMEmail AS PDEmail,
        us.FULLNAME AS QAName,
        us.UERMEmail AS QAEmail,
        d.DateTimeCreated

      FROM
        IRUP..IRDeptInvolved id
      LEFT JOIN IRUP..IRDetails d ON id.IRNo = d.IRNo
      LEFT JOIN IRUP..IRSubjectName irs ON d.SubjectCode = irs.SubjectCode
      LEFT JOIN IRUP..IRReportableChildren ire ON d.SubjectChilCode = ire.SubjectChilCode
      LEFT JOIN IRUP..IREmail ie ON id.PrimaryDept = ie.DeptCode
      LEFT JOIN IRUP..Users us ON id.CreatedBy = us.EmployeeCode
          WHERE id.IRNo = ?`,
    [IRNo],
  );
};

const getFilterActionItems = async (IRNo) => {
  return await sqlHelper.query(
    `
     SELECT * FROM [IRUP].[dbo].[IRActionItemsLog]
    WHERE IRNo = ? AND RevisionActionCode IS NOT NULL `,
    [IRNo],
  );
};

const getReturnActionItems = async (IRNo, RevisionCode) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[IRActionItemsLog]
    WHERE IRNo = ? AND RevisionActionCode IS NOT NULL AND RevisionActionCode = ?
    ORDER BY DateTimeCreated DESC`,
    [IRNo, RevisionCode],
  );
};

const insertReturnActionItems = async (payload, txn) => {
  try {
    const result = await sqlHelper.insert(
      `IRUP.dbo.IRActionItemsLog`,
      payload,
      txn,
    );
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

const getApprovedActionItems = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[IRActionItems]
    WHERE IRNo = ? AND  ActionStatus = 'Resolved'
    ORDER BY DateTimeCreated DESC `,
    [IRNo],
  );
};

////////////////////////////////////////// RCA ////////////////////////////////

const insertrcaproblemstatmentlog = async (payload, txn) => {
  try {
    const result = await sqlHelper.insert(
      `IRUP.dbo.RCAProblemStatmentLogs`,
      payload,
      txn,
    );
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcawhylog = async (payload, txn) => {
  try {
    const result = await sqlHelper.insert(`IRUP.dbo.RCAWhyLog`, payload, txn);
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

const insertActionablelog = async (payload, txn) => {
  try {
    const result = await sqlHelper.insert(
      `IRUP.dbo.RCAActionableLog`,
      payload,
      txn,
    );
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

const insertCorrectiveActionlog = async (payload, txn) => {
  try {
    const result = await sqlHelper.insert(
      `IRUP.dbo.RCACorrectiveLog`,
      payload,
      txn,
    );
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

const insertRisklog = async (payload, txn) => {
  try {
    const result = await sqlHelper.insert(`IRUP.dbo.RCARisk`, payload, txn);
    return result;
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcaproblemstatment = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAProblemStatment`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcawhy = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAWhy`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertActionable = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAActionable`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertCorrectiveAction = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCACorrective`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

// const insertPreventiveMeasurelog = async (payload, txn) => {
//   try {
//     return await sqlHelper.insert(`IRUP.dbo.RCAPreventiveLog`, payload, txn);
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// const insertPreventiveMeasure = async (payload, txn) => {
//   try {
//     return await sqlHelper.insert(`IRUP.dbo.RCAPreventive`, payload, txn);
//   } catch (error) {
//     return { error: error.message };
//   }
// };

const updateRCAStatus = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IRDetails`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const getRCAProblemStatmentLogs = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAProblemStatmentLogs]
    WHERE IRNo = ? AND RevisionCode IS NULL `,
    [IRNo],
  );
};

const getRCAWhyLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAWhyLog 
    WHERE IRNo = ? AND RevisionCode IS NULL `,
    [IRNo],
  );
};

const getRCACorrectiveLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCACorrectiveLog]
    WHERE IRNo = ? AND RevisionCode IS NULL `,
    [IRNo],
  );
};

const getRCAActionableLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAActionableLog]
    WHERE IRNo = ? AND RevisionCode IS NULL `,
    [IRNo],
  );
};

const getRCARisk = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCARisk]
    WHERE IRNo = ?`,
    [IRNo],
  );
};

const getRCAFilterProblemStatmentLogs = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAProblemStatmentLogs]
    WHERE IRNo = ? AND RevisionCode IS NOT NULL `,
    [IRNo],
  );
};

const getRCAFilterWhyLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAWhyLog 
    WHERE IRNo = ? AND RevisionCode IS NOT NULL `,
    [IRNo],
  );
};

const getRCAFilterActionableLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAActionableLog 
    WHERE IRNo = ? AND RevisionCode IS NOT NULL `,
    [IRNo],
  );
};

const getRCAFilterCorrectiveLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCACorrectiveLog]
    WHERE IRNo = ? AND RevisionCode IS NOT NULL `,
    [IRNo],
  );
};

// const getRCAFilterPreventiveLog = async (IRNo) => {
//   return await sqlHelper.query(
//     `
//     SELECT * FROM [IRUP].[dbo].[RCAPreventiveLog]
//     WHERE IRNo = ? AND RevisionCode IS NOT NULL `,
//     [IRNo],
//   );
// };

const getRCAProblemStatmentLogsReturn = async (IRNo, RevisionCode) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAProblemStatmentLogs]
    WHERE IRNo = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC`,
    [IRNo, RevisionCode],
  );
};

const getRCAWhyLogReturn = async (IRNo, RevisionCode) => {
  return await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAWhyLog
    WHERE IRNo = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC`,
    [IRNo, RevisionCode],
  );
};

const getRCAActionableLogReturn = async (IRNo, RevisionCode) => {
  return await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAActionableLog
    WHERE IRNo = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC`,
    [IRNo, RevisionCode],
  );
};

const getRCACorrectiveLogReturn = async (IRNo, RevisionCode) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCACorrectiveLog]
    WHERE IRNo = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC`,
    [IRNo, RevisionCode],
  );
};

// const getRCAPreventiveLogReturn = async (IRNo, RevisionCode) => {
//   return await sqlHelper.query(
//     `
//     SELECT * FROM [IRUP].[dbo].[RCAPreventiveLog]
//     WHERE IRNo = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
//     ORDER BY DateTimeCreated DESC`,
//     [IRNo, RevisionCode],
//   );
// };

const getRCAProblemStatmentReviewLogs = async (IRNo, Status, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAProblemStatmentLogs]
    WHERE IRNo = ? AND Status = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC 
    `,
    [IRNo, Status, RevisionCode],
  );
  return result;
};

const getRCAWhyReviewLog = async (IRNo, Status, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAWhyLog 
    WHERE IRNo = ? AND Status = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC `,
    [IRNo, Status, RevisionCode],
  );
  return result;
};

const getRCAActionableReviewLog = async (IRNo, Status, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAWhyLog 
    WHERE IRNo = ? AND Status = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC `,
    [IRNo, Status, RevisionCode],
  );
  return result;
};

const getRCACorrectiveReviewLog = async (IRNo, Status, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAActionableLog]
    WHERE IRNo = ? AND Status = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC `,
    [IRNo, Status, RevisionCode],
  );
  return result;
};

// const getRCAPreventiveReviewLog = async (IRNo, Status, RevisionCode) => {
//   const result = await sqlHelper.query(
//     `
//     SELECT * FROM [IRUP].[dbo].[RCAPreventiveLog]
//     WHERE IRNo = ? AND Status = ? AND RevisionCode IS NOT NULL AND RevisionCode = ?
//     ORDER BY DateTimeCreated DESC `,
//     [IRNo, Status, RevisionCode],
//   );
//   return result;
// };

module.exports = {
  getACTUnderEmployee,
  getACTHead,

  getRCAUnderEmployee,
  getRCAHead,

  insertactionItemVL,
  getselectActionItem,
  updateRCAStatus,

  getRCAProblemStatmentLogs,
  getRCAWhyLog,
  getRCACorrectiveLog,
  getRCAActionableLog,
  getRCARisk,

  insertrcaproblemstatmentlog,
  insertrcaproblemstatment,
  insertrcawhylog,
  insertrcawhy,
  insertActionablelog,
  insertActionable,
  // insertPreventiveMeasurelog,
  // insertPreventiveMeasure,
  insertCorrectiveActionlog,
  insertCorrectiveAction,
  insertRisklog,

  getRCAProblemStatmentLogsReturn,
  getRCAWhyLogReturn,
  getRCAActionableLogReturn,
  getRCACorrectiveLogReturn,
  // getRCAPreventiveLogReturn,

  getRCAProblemStatmentReviewLogs,
  getRCAWhyReviewLog,
  getRCAActionableReviewLog,
  getRCACorrectiveReviewLog,
  // getRCAPreventiveReviewLog,

  getRCAFilterProblemStatmentLogs,
  getRCAFilterWhyLog,
  getRCAFilterActionableLog,
  getRCAFilterCorrectiveLog,
  // getRCAFilterPreventiveLog,

  getActionItemsLogs,
  getFilterActionItems,
  getReturnActionItems,
  insertReturnActionItems,
  getApprovedActionItems,
};
