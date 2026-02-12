const sqlHelper = require("../../../helpers/sql");

const getAllQA = async (EmployeeCode) => {
  return await sqlHelper.query(
    `
    SELECT
                IRD.IRNo,
				D.DESCRIPTION AS Department_Description,
                IRS.SubjectName,
                IRRE.SubjectSpecificExam,
				IRD.DivisionCode,
                IRD.SubjectDate,
                IRD.SubjectTime,
                IRD.SubjectLoc,
                IRD.SubjectResponse,
                IRD.RCA,
                IRD.ActionSubStatus,
                IRD.IsReject,
                IRD.RiskGrading,
                IRI.PrimaryDept,
                IRA.CombinedActionItems,
                IRAC.CombinedIRActionItems,
                IRD.QAStatus
            FROM
                IRUP..IRDetails IRD
                LEFT JOIN IRUP..IRDeptInvolved IRI ON IRD.IRNo = IRI.IRNo
                LEFT JOIN IRUP..IREmail IRE ON IRI.PrimaryDept = IRE.DeptCode
                LEFT JOIN [UERMMMC]..SECTIONS D ON IRD.DeptCode = D.CODE
                LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
				LEFT JOIN IRUP..IRReportableChildren IRRE ON IRD.SubjectChilCode = IRRE.SubjectChilCode
				LEFT JOIN IRUP..AreaAssignee A ON IRD.DivisionCode = A.AreaCode
				LEFT JOIN (
				SELECT 
					RC.IRNo,
					STRING_AGG(RC.ActionStatus, ', ') AS CombinedActionItems
				FROM
					IRUP..RCACorrective RC
				LEFT JOIN IRUP..RCAPreventive RP ON RC.IRNo = RP.IRNo
				GROUP BY RC.IRNo
				) IRA ON IRD.IRNo = IRA.IRNo
				LEFT JOIN (
				SELECT 
						IRAC.IRNo,
						STRING_AGG(IRAC.ItemsActionStatus, ', ') AS CombinedIRActionItems
					FROM
						IRUP..IRActionItems IRAC
					GROUP BY IRAC.IRNo
				) IRAC ON IRD.IRNo = IRAC.IRNo
				WHERE
					A.EmployeeCode = ?  
					AND IRS.SubjectCode != 'others' 
          AND IRD.IsReject = '1'
				ORDER BY
					IRD.QAStatus DESC,
					IRD.DateTimeCreated DESC`,
    [EmployeeCode],
  );
};

const getSuperAuditQA = async () => {
  return await sqlHelper.query(`
    SELECT
                IRD.IRNo,
				D.DESCRIPTION AS Department_Description,
                IRS.SubjectName,
                IRRE.SubjectSpecificExam,
				IRD.DivisionCode,
                IRD.SubjectDate,
                IRD.SubjectTime,
                IRD.SubjectLoc,
                IRD.SubjectResponse,
                IRD.RCA,
                IRD.ActionSubStatus,
                IRD.IsReject,
                IRD.RiskGrading,
                IRI.PrimaryDept,
                IRA.CombinedActionItems,
                IRAC.CombinedIRActionItems,
                IRD.QAStatus
            FROM
                IRUP..IRDetails IRD
                LEFT JOIN IRUP..IRDeptInvolved IRI ON IRD.IRNo = IRI.IRNo
                LEFT JOIN IRUP..IREmail IRE ON IRI.PrimaryDept = IRE.DeptCode
                LEFT JOIN [UERMMMC]..SECTIONS D ON IRD.DeptCode = D.CODE
                LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
				LEFT JOIN IRUP..IRReportableChildren IRRE ON IRD.SubjectChilCode = IRRE.SubjectChilCode
				LEFT JOIN (
				SELECT 
					RC.IRNo,
					STRING_AGG(RC.ActionStatus, ', ') AS CombinedActionItems
				FROM
					IRUP..RCACorrective RC
				LEFT JOIN IRUP..RCAPreventive RP ON RC.IRNo = RP.IRNo
				GROUP BY RC.IRNo
				) IRA ON IRD.IRNo = IRA.IRNo
				LEFT JOIN (
				SELECT 
						IRAC.IRNo,
						STRING_AGG(IRAC.ItemsActionStatus, ', ') AS CombinedIRActionItems
					FROM
						IRUP..IRActionItems IRAC
					GROUP BY IRAC.IRNo
				) IRAC ON IRD.IRNo = IRAC.IRNo
				WHERE
					IRS.SubjectCode != 'others' 
          AND IRD.IsReject = '1'
				ORDER BY
					IRD.QAStatus DESC,
					IRD.DateTimeCreated DESC`);
};

const getIREPORT = async (IRNo) => {
  return await sqlHelper.query(
    `
SELECT 
                IRD.IRNo,
                IRS.SubjectName,
                IRD.SubjectDate,
                IRD.SubjectTime,
                IRD.SubjectLoc,
                IRD.SubjectNote,
                IRD.SubjectCause,
                IRD.SubjectResponse,
                IRE.SubjectSpecificExam,
                IRD.SubjectFileName,
                IRD.SubjectFile,
                IRD.DateTimeCreated,
                IRA.ActionItem,
                DeptDesc.PrimaryDept,
                DeptDesc.DeptCodeInvDescriptions
                
            FROM
                IRUP..IRDetails IRD
            LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
            LEFT JOIN IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
            LEFT JOIN (
                SELECT 
                    ID.IRNo,
                    D1.Dept_Desc AS PrimaryDept,
                    STRING_AGG(D2.Dept_Desc, ', ') AS DeptCodeInvDescriptions
                FROM 
                    IRUP..IRDeptInvolved ID
                LEFT JOIN IRUP..IREmail D1 ON ID.PrimaryDept = D1.DeptCode
                CROSS APPLY STRING_SPLIT(ID.DeptCodeInv, ',') AS SplitDeptCode
                LEFT JOIN IRUP..IREmail D2 
                    ON LTRIM(RTRIM(SplitDeptCode.value)) = D2.DeptCode
                GROUP BY ID.IRNo, D1.Dept_Desc
            ) DeptDesc ON IRD.IRNo = DeptDesc.IRNo
            LEFT JOIN IRUP..IRActionItems IRA ON IRD.IRNo = IRA.IRNo 
            WHERE
                IRD.IRNo = ? `,
    [IRNo],
  );
};

const getIRDept = async () => {
  return await sqlHelper.query(`
    SELECT DeptCode, Dept_Desc
        FROM IRUP..IREmail
        ORDER BY Dept_Desc ASC;`);
};

const getIRDeptList = async () => {
  return await sqlHelper.query(`
    SELECT 
      S.CODE,
      S.DESCRIPTION
    FROM [UERMMMC]..SECTIONS S
    LEFT JOIN [IRUP].[dbo].[IREmail] E
        ON S.DESCRIPTION = E.Dept_Desc
    WHERE S.DESCRIPTION NOT LIKE '%INACTIVE%'
      AND S.DESCRIPTION NOT LIKE '%N/A%'
      AND E.DeptCode IS NULL
    ORDER BY S.DESCRIPTION ASC;
`);
};

const insertIncidentReportQA = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRDeptInvolved`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getsActionItem = async (IRNo) => {
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

const getsApprovedActionItem = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT
        id.IRNo,
        d.RiskGrading,
        irs.SubjectName,
        ire.SubjectSpecificExam,
        irc.newConclusion,
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
      LEFT JOIN IRUP..IRConclusion irc ON id.IRNo = irc.IRNo
          WHERE id.IRNo = ?`,
    [IRNo],
  );
};

const updateRiskGrading = async function (payload, condition, txn) {
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

const updateRCAStatus = async function (payload, condition, txn) {
  try {
    const result = await sqlHelper.update(
      `IRUP.dbo.IRDetails`,
      payload,
      condition,
      txn,
    );
    return result;
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

const getReturnActionItemsLogs = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[IRActionItemsLog]
    WHERE IRNo = ? AND RevisionActionCode IS NOT NULL`,
    [IRNo],
  );
};

const getActionRecord = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT CountReturnActionItems 
    FROM IRUP.dbo.IRDetails
    WHERE IRNo = ?`,
    [IRNo],
  );
};

const getActionReviewLog = async (IRNo, RevisionActionCode) => {
  const result = await sqlHelper.query(
    `
	SELECT * FROM [IRUP].[dbo].[IRActionItemsLog]
    WHERE IRNo = ? AND ActionStatus = 'For Review' AND RevisionActionCode IS NOT NULL AND RevisionActionCode = ?
    ORDER BY DateTimeCreated DESC `,
    [IRNo, RevisionActionCode],
  );
  return result;
};

const insertactionreturn = async (payload, txn) => {
  try {
    const result = await sqlHelper.insert(
      `IRUP.dbo.IRActionItems`,
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

const UpdateVLActStatus = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IRActionItems`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const UpdateActAccomplishStatus = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IRActionItems`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const getQAs = async () => {
  return await sqlHelper.query(`
    SELECT EmployeeCode, FullName
        FROM IRUP..Users
        ORDER BY FullName ASC;`);
};

const getupdatedIR = async (IRNo) => {
  return await sqlHelper.query(
    `SELECT TOP 1
            i.IRNo,
            i.PrimaryDept,
            i.DeptCodeInv,
            i.DateTimeCreated,	
            irs.SubjectCode,
            irs.SubjectName,
            u.FULLNAME,
            u.UERMEmail,
            e.UERMEmail AS transferEmail,
            d.RiskGrading,
            d.SubjectNote,
            d.SubjectCause,
            d.SubjectResponse,
            ire.SubjectSpecificExam
        FROM
            IRUP..IRDeptInvolved i
        LEFT JOIN
            IRUP..IRDetails d ON i.IRNo = d.IRNo
        LEFT JOIN
            IRUP..IRSubjectName irs ON d.SubjectCode = irs.SubjectCode
        LEFT JOIN
            [UE Database]..vw_Employees u ON i.CreatedBy = u.CODE 
        LEFT JOIN 
              IRUP..IRReportableChildren ire ON d.SubjectChilCode = ire.SubjectChilCode
        LEFT JOIN 
            IRUP..IRQATransfer irt ON i.IRNo = irt.IRNo
        LEFT JOIN 
            IRUP..IRSubjectName irsn ON irt.SubjectCode = irsn.SubjectCode
        LEFT JOIN 
            [UE Database]..vw_Employees e ON irt.EmpTransfer = e.CODE
        WHERE i.IRNo = ? `,
    [IRNo],
  );
};

const getPrimaryEmail = async (DeptCode) => {
  return await sqlHelper.query(
    `
    SELECT FullName, UERMEmail
    FROM IRUP..IREmail
    WHERE DeptCode LIKE ?
    `,
    [`%${DeptCode}%`],
  );
};

const getDirectorEmail = async (DeptCode) => {
  return await sqlHelper.query(
    `
    SELECT Fullname, UERMEmail
        FROM IRUP..DirectorUser
        WHERE DeptCode LIKE ? `,
    [`%${DeptCode}%`],
  );
};

const getAccessEmail = async (DeptCode) => {
  return await sqlHelper.query(
    `
    SELECT 
        AA.DeptCode, 
        E.FirstName,
        E.UERMEmail,
        CONCAT(
          LastName, ', ', FirstName, ' ',
          CASE 
            WHEN MiddleName IS NOT NULL THEN LEFT(MiddleName, 1) + '.' 
            ELSE '' 
          END
        ) AS FullName
      FROM [IRUP].[dbo].[IRRequestAccess] AA
      LEFT JOIN [UE database]..Employee E
        ON E.EmployeeCode = AA.EmployeeCode
      WHERE AA.DeptCode = ? AND AA.isActive = '1'`,
    [DeptCode],
  );
};

const getRecord = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT CountReturnRCA 
    FROM IRUP.dbo.IRDetails
    WHERE IRNo = ?`,
    [IRNo],
  );
};

const UpdateRCACountstatus = async function (payload, condition, txn) {
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

const insertdisapprovedRCA = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRConclusion`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const updateProblemStatment = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.RCAProblemStatmentLogs`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const updateWhy = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.RCAWhyLog`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const updateCorrectivePreventive = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.RCACorrectivePreventiveLog`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const getdisapprovedConclusion = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT TOP 1 
            irc.IRNo,
            irs.SubjectName AS SubjectName,
            ire.SubjectSpecificExam,
            irc.newConclusion,
            e.FULLNAME as PrimaryName,
            e.UERMEmail as PrimaryEmail,
            us.FULLNAME AS QAName,
            us.UERMEmail AS QAEmail
            
        FROM 
            IRUP..IRConclusion irc
        LEFT JOIN
            IRUP..IRDetails d ON irc.IRNo = d.IRNo
        LEFT JOIN
            IRUP..IRSubjectName irs ON d.SubjectCode = irs.SubjectCode
        LEFT JOIN 
            IRUP..IRDeptInvolved ird ON irc.IRNo = ird.IRNo
        LEFT JOIN 
              IRUP..IRReportableChildren ire ON d.SubjectChilCode = ire.SubjectChilCode
        LEFT JOIN 
            IRUP..IREmail e ON ird.PrimaryDept = e.DeptCode
		LEFT JOIN 
            IRUP..Users us ON irs.EmployeeCode = us.EmployeeCode
        WHERE irc.IRNo =  ? `,
    [IRNo],
  );
};

const insertRecomConclusion = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRConclusion`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertapprovedRCA = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRActionItems`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const updateapprovedRCA = async function (payload, condition, txn) {
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

const getselectApprovedRCA = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT 
                ira.IRNo,
                ira.ActionItem,
                irs.SubjectName,
                ire.SubjectSpecificExam,
                ire1.FULLNAME AS PrimaryName,
                ire1.UERMEmail AS PrimaryEmail,
                us.FULLNAME AS QAName,
                us.UERMEmail AS QAEmail
                
            FROM 
                IRUP..IRActionItems ira 
            LEFT JOIN IRUP..IRDetails d ON ira.IRNo = d.IRNo
            LEFT JOIN IRUP..IRSubjectName irs ON d.SubjectCode = irs.SubjectCode
            LEFT JOIN IRUP..IRDeptInvolved ird ON ira.IRNo = ird.IRNo
            LEFT JOIN IRUP..IRReportableChildren ire ON d.SubjectChilCode = ire.SubjectChilCode
            LEFT JOIN IRUP..IREmail ire1 ON ird.PrimaryDept = ire1.DeptCode
            LEFT JOIN IRUP..Users us ON irs.EmployeeCode = us.EmployeeCode
            WHERE ira.IRNo = ? `,
    [IRNo],
  );
};

const DisCorrectiveItems = async (IRNo) => {
  return await sqlHelper.query(
    `SELECT 
        RCA.Id,
        RCA.IRNo,
        RCA.Code,
        CONCAT(LastName, ', ', FirstName, ' ', CASE WHEN MiddleName IS NOT NULL THEN LEFT(MiddleName, 1) + '.' ELSE '' END) AS FullName,
        RCA.CorrectiveAction,
        RCA.CorTimelineFromDate,
        RCA.CorTimelineToDate,
        RCA.ActionStatus,
        IRS.SubjectName,
        IRE.SubjectSpecificExam,
        RCA.AccomplishStatus,
        RCA.AccomplishDate
      
      FROM IRUP..RCACorrective RCA 
        LEFT JOIN IRUP..IRDetails IRD ON RCA.IRNo = IRD.IRNo
        LEFT JOIN [UE database]..Employee E ON RCA.AccountablePer = E.EmployeeCode
        LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
        LEFT JOIN IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
      WHERE RCA.IRNo = ?`,
    [IRNo],
  );
};

const DisRiskItems = async (IRNo) => {
  return await sqlHelper.query(`SELECT * FROM IRUP..RCARisk WHERE IRNo = ?`, [
    IRNo,
  ]);
};

// const DisPreventiveItems = async (IRNo) => {
//   return await sqlHelper.query(
//     `SELECT
//       RPM.Id,
//       RPM.IRNo,
//       RPM.Code,
//       CONCAT(LastName, ', ', FirstName, ' ', CASE WHEN MiddleName IS NOT NULL THEN LEFT(MiddleName, 1) + '.' ELSE '' END) AS FullName,
//       RPM.PreventiveMeasure,
//       RPM.PreTimelineFromDate,
//       RPM.PreTimelineToDate,
//       RPM.ActionStatus,
//       IRS.SubjectName,
//       IRE.SubjectSpecificExam

// FROM IRUP..RCAPreventive RPM
//       LEFT JOIN IRUP..IRDetails IRD ON RPM.IRNo = IRD.IRNo
//       LEFT JOIN [UE database]..Employee E ON RPM.ResponsiblePer = E.EmployeeCode
//       LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
//       LEFT JOIN IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
//       WHERE RPM.IRNo = ?`,
//     [IRNo],
//   );
// };

const UpdateCorrectiveActStatus = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.RCACorrective`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const UpdateAccomplishStatus = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.RCACorrective`,
      payload,
      condition,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const UpdateRiskStatus = async function (payload, condition, txn) {
  try {
    return await sqlHelper.update(`IRUP.dbo.RCARisk`, payload, condition, txn);
  } catch (error) {
    return { error: error.message };
  }
};

// const UpdatePreventiveActStatus = async function (payload, condition, txn) {
//   try {
//     return await sqlHelper.update(
//       `IRUP.dbo.RCAPreventive`,
//       payload,
//       condition,
//       txn,
//     );
//   } catch (error) {
//     return { error: error.message };
//   }
// };

const getPendingRemarks = async () => {
  return await sqlHelper.query(
    `
     SELECT *
        FROM IRUP..IRPendingRemarks
        ORDER BY DateTimeCreated DESC`,
  );
};

const getEmployeeName = async () => {
  return await sqlHelper.query(
    `
    SELECT 
        E.EmployeeCode,
        CONCAT(LastName, ', ', FirstName, ' ', CASE WHEN MiddleName IS NOT NULL THEN LEFT(MiddleName, 1) + '.' ELSE '' END) AS FullName
    FROM 
        [UE database]..Employee E
    WHERE E.Isactive = '1'
    ORDER BY FullName ASC;`,
  );
};

const insertPendingRem = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRPendingRemarks`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const UpdateQADoneStatus = async function (payload, condition, txn) {
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

const insertrcaprobstatlog = async (payload, txn) => {
  try {
    return await sqlHelper.insert(
      `IRUP.dbo.RCAProblemStatmentLogs`,
      payload,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcaprobsta = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAProblemStatment`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcawhylog = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAWhyLog`, payload, txn);
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

const insertrcaactionablelog = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAActionableLog`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcaactionable = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAActionable`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcacorrectiveLog = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCACorrectiveLog`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcacorrective = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCACorrective`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcapreventiveLog = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAPreventiveLog`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertrcapreventive = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.RCAPreventive`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
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

const getRCAProblemStatmentReviewLogs = async (IRNo, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAProblemStatmentLogs]
    WHERE IRNo = ? AND Status = 'For Review' AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC 
    `,
    [IRNo, RevisionCode],
  );
  return result;
};

const getRCAWhyReviewLog = async (IRNo, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT *
    FROM IRUP..RCAWhyLog 
    WHERE IRNo = ? AND Status = 'For Review' AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC `,
    [IRNo, RevisionCode],
  );
  return result;
};

const getRCACorrectiveReviewLog = async (IRNo, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCACorrectiveLog]
    WHERE IRNo = ? AND Status = 'For Review' AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC `,
    [IRNo, RevisionCode],
  );
  return result;
};

const getRCAPreventiveReviewLog = async (IRNo, RevisionCode) => {
  const result = await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAPreventiveLog]
    WHERE IRNo = ? AND Status = 'For Review' AND RevisionCode IS NOT NULL AND RevisionCode = ?
    ORDER BY DateTimeCreated DESC `,
    [IRNo, RevisionCode],
  );
  return result;
};

const getRCAApprovedProblemStatmentLogs = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAProblemStatment]
    WHERE IRNo = ? AND Status = 'Resolved'
    ORDER BY DateTimeCreated DESC `,
    [IRNo],
  );
};

const getRCAApprovedWhyLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAWhy]
    WHERE IRNo = ? AND Status = 'Resolved'
    ORDER BY DateTimeCreated DESC `,
    [IRNo],
  );
};

const getRCAApprovedActionableLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCAActionable]
    WHERE IRNo = ? AND Status = 'Resolved'
    ORDER BY DateTimeCreated DESC `,
    [IRNo],
  );
};

const getRCAApprovedCorrectiveLog = async (IRNo) => {
  return await sqlHelper.query(
    `
     SELECT * FROM [IRUP].[dbo].[RCACorrective]
    WHERE IRNo = ? AND Status = 'Resolved'
    ORDER BY DateTimeCreated DESC `,
    [IRNo],
  );
};

// const getRCAApprovedPreventiveLog = async (IRNo) => {
//   return await sqlHelper.query(
//     `
//     SELECT * FROM [IRUP].[dbo].[RCAPreventive]
//     WHERE IRNo = ? AND Status = 'Resolved'
//     ORDER BY DateTimeCreated DESC `,
//     [IRNo],
//   );
// };

const getRCAApprovedRiskLog = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT * FROM [IRUP].[dbo].[RCARisk]
    WHERE IRNo = ?
    ORDER BY DateTimeCreated DESC`,
    [IRNo],
  );
};

const insertactionitemlog = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRActionItemsLog`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertactionitem = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRActionItems`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getTime = async () => {
  return await sqlHelper.query(`
      SELECT
            i.IRNo,
            i.DateTimeCreated,
            i.DateTimeRCAUpdated,
            irs.SubjectName AS SubjectName,
            irre.SubjectSpecificExam,
            ue.UERMEmail AS PrimaryEmail,
            ue.FULLNAME AS PrimaryName,
            i.SendEmailCounts
    FROM
        IRUP..IRDetails i
        LEFT JOIN IRUP..IRDeptInvolved id ON i.IRNo = id.IRNo
        LEFT JOIN IRUP..IRSubjectName irs ON i.SubjectCode = irs.SubjectCode
        LEFT JOIN IRUP..IRReportableChildren irre ON i.SubjectChilCode = irre.SubjectChilCode
        LEFT JOIN IRUP..IREmail ire ON id.PrimaryDept = ire.DeptCode
        LEFT JOIN [UE Database]..vw_Employees ue ON ire.EmployeeCode = ue.CODE
        WHERE i.SubjectCode <> 'others'
        AND i.DateTimeRCAUpdated IS NULL;`);
};

const updateSendEmailCounts = async function (payload, condition, txn) {
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

module.exports = {
  getAllQA,
  getSuperAuditQA,
  getIREPORT,
  insertIncidentReportQA,
  getIRDept,
  getIRDeptList,
  updateRiskGrading,
  updateRCAStatus,
  getupdatedIR,
  getPrimaryEmail,
  getDirectorEmail,
  getAccessEmail,

  getQAs,
  getRecord,
  getEmployeeName,
  UpdateRCACountstatus,
  insertdisapprovedRCA,
  updateProblemStatment,
  updateWhy,
  updateCorrectivePreventive,
  getdisapprovedConclusion,
  insertRecomConclusion,
  insertapprovedRCA,
  updateapprovedRCA,
  getselectApprovedRCA,
  DisCorrectiveItems,
  DisRiskItems,

  // DisPreventiveItems,
  UpdateCorrectiveActStatus,
  UpdateRiskStatus,
  // UpdatePreventiveActStatus,
  getPendingRemarks,
  insertPendingRem,
  UpdateQADoneStatus,

  insertrcaprobstatlog,
  insertrcaprobsta,
  insertrcawhylog,
  insertrcawhy,
  insertrcaactionablelog,
  insertrcaactionable,
  insertrcacorrectiveLog,
  insertrcacorrective,
  insertrcapreventiveLog,
  insertrcapreventive,

  getRCAProblemStatmentReviewLogs,
  getRCAWhyReviewLog,
  getRCACorrectiveReviewLog,
  getRCAPreventiveReviewLog,
  getTime,
  updateSendEmailCounts,

  getRCAFilterProblemStatmentLogs,
  getRCAFilterWhyLog,
  getRCAFilterCorrectiveLog,
  // getRCAFilterPreventiveLog,

  getRCAApprovedProblemStatmentLogs,
  getRCAApprovedWhyLog,
  getRCAApprovedActionableLog,
  getRCAApprovedCorrectiveLog,
  // getRCAApprovedPreventiveLog,
  getRCAApprovedRiskLog,

  getActionItemsLogs,
  insertactionitemlog,
  insertactionitem,
  getReturnActionItemsLogs,
  getActionRecord,
  getActionReviewLog,
  insertactionreturn,
  getApprovedActionItems,

  getsActionItem,
  UpdateVLActStatus,
  getsApprovedActionItem,
  UpdateAccomplishStatus,
  UpdateActAccomplishStatus,
};
