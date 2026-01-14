const sqlHelper = require("../../../helpers/sql");

const getHRREPDetails = async () => {
  return await sqlHelper.query(`SELECT
            IRD.IRNo,
            IRD.DeptCode AS Department_Code,
			D.DESCRIPTION AS Department_Description,
            IRS.SubjectName,
			IRRE.SubjectSpecificExam,
            IRD.RCA,
            IRD.FinancialLiability,
            IRN.newHRNote,
            IRD.HRStatus
        FROM
            IRUP..IRDetails IRD
        LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
		LEFT JOIN IRUP..IRReportableChildren IRRE ON IRD.SubjectChilCode = IRRE.SubjectChilCode
		LEFT JOIN [UERMMMC]..SECTIONS D ON IRD.DeptCode = D.CODE
        LEFT JOIN (
            SELECT
                newHRNote,
                IRNo
            FROM
                IRUP..IRHRNote
        ) IRN ON IRD.IRNo = IRN.IRNo
        WHERE
            IRS.SubjectCode != 'others'
        ORDER BY
            IRD.HRStatus DESC,
            IRD.DateTimeCreated DESC;`);
};

const getHRREFDetails = async () => {
  return await sqlHelper.query(`
      SELECT
        IRD.IRNo,
        IRD.DeptCode AS Department_Code,
        D.DESCRIPTION AS Department_Description,
        IRS.SubjectName,
        IRRE.SubjectSpecificExam,
        IRD.RCA,
        IRD.FinancialLiability,
        IRN.newHRNote,
        IRD.hrReferral,
        IRD.HRStatus

      FROM IRUP..IRDetails IRD
        LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
        LEFT JOIN IRUP..IRReportableChildren IRRE ON IRD.SubjectChilCode = IRRE.SubjectChilCode
        LEFT JOIN [UERMMMC]..SECTIONS D ON IRD.DeptCode = D.CODE
        LEFT JOIN (
            SELECT
                newHRNote,
                IRNo
            FROM
                IRUP..IRHRNote
        ) IRN ON IRD.IRNo = IRN.IRNo
        WHERE
            IRS.SubjectCode != 'others'
            AND IRD.hrReferral IS NOT NULL
        ORDER BY
            IRD.HRStatus DESC,
            IRD.DateTimeCreated DESC;`);
};

const getHRIREPORT = async (IRNo) => {
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
                IRD.DateTimeCreated,
                IRD.SubjectFileName,
                IRD.SubjectFile,
                IRN.newHRNote,
                IRA.ActionItem,
                DeptDesc.PrimaryDept,
                DeptDesc.DeptCodeInvDescriptions
                
            FROM
                IRUP..IRDetails IRD
            LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
            LEFT JOIN IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
            LEFT JOIN IRUP..IRHRNote IRN ON IRD.IRNo = IRN.IRNo
            LEFT JOIN (
                SELECT 
                    ID.IRNo,
                    D1.Dept_Desc AS PrimaryDept,
                    STRING_AGG(D2.Dept_Desc, ', ') AS DeptCodeInvDescriptions
                FROM 
                    IRUP..IRDeptInvolved ID
                LEFT JOIN IRUP..IREmail D1 ON ID.PrimaryDept = D1.DeptCode
                CROSS APPLY STRING_SPLIT(ID.DeptCodeInv, ',') AS SplitDeptCode
                LEFT JOIN IRUP..IREmail D2 ON SplitDeptCode.value = D2.DeptCode
                GROUP BY ID.IRNo, D1.Dept_Desc
            ) DeptDesc ON IRD.IRNo = DeptDesc.IRNo
            LEFT JOIN IRUP..IRActionItems IRA ON IRD.IRNo = IRA.IRNo 
            WHERE
                IRD.IRNo = ? `,
    [IRNo],
  );
};

const updateHRFinLiability = async function (payload, condition, txn) {
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

const insertFormHRCollectNotes = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRHRNote`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const insertFormHRCloseNotes = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRHRNote`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const updateCloseNoteSta = async function (payload, condition, txn) {
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

const updateIRHRStatus = async function (payload, condition, txn) {
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
  getHRREPDetails,
  getHRREFDetails,
  getHRIREPORT,
  updateHRFinLiability,
  insertFormHRCollectNotes,
  insertFormHRCloseNotes,
  updateCloseNoteSta,
  updateIRHRStatus,
};
