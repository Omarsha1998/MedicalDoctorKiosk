const sqlHelper = require("../../../helpers/sql");

const getAllDirector = async (EmployeeCode) => {
  return await sqlHelper.query(
    `
    SELECT
                IRD.IRNo,
                IRD.lostRec,
                IRS.SubjectName AS SubjectName,
                IRE.SubjectSpecificExam,
                IRI.PrimaryDept,
                D.description AS Department_Description,
                US.FullName AS TransferFullName,
                US1.FullName AS MainFullName
                
            FROM
                IRUP..IRDetails IRD
            LEFT JOIN
                [UE Database]..Department D ON IRD.DeptCode = D.DeptCode
            LEFT JOIN
                IRUP..IRDeptInvolved IRI ON IRD.IRNo = IRI.IRNo
            LEFT JOIN 
                IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
            LEFT JOIN 
                IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
            LEFT JOIN 
                IRUP..Users US1 ON IRS.EmployeeCode = US1.EmployeeCode
            LEFT JOIN 
                IRUP..IRQATransfer IRT ON IRD.IRNo = IRT.IRNo
            LEFT JOIN 
                IRUP..IRSubjectName IRS1 ON IRT.SubjectCode = IRS1.SubjectCode
            LEFT JOIN 
                IRUP..Users US ON IRT.EmpTransfer = US.EmployeeCode
            LEFT JOIN 
                IRUP..DirectorUser DU ON IRI.PrimaryDept = DU.DeptCode
            WHERE 
                IRD.QAStatus = '1'
                AND IRS.SubjectCode != 'others' 
                AND DU.EmployeeCode = ?
            ORDER BY
                CASE WHEN IRD.lostRec IS NULL THEN 0 ELSE 1 END,
                IRD.DateTimeCreated DESC;`,
    [EmployeeCode],
  );
};

const getAllHead = async (DeptCode) => {
  return await sqlHelper.query(
    `
    SELECT 
      IRD.IRNo,
      IRD.lostRec,
      D.description AS Department_Description,
      IRS.SubjectName AS SubjectName,
      IRE.SubjectSpecificExam,
      IRI.PrimaryDept

    FROM IRUP..IRDetails IRD 
      LEFT JOIN [UE Database]..Department D ON IRD.DeptCode = D.DeptCode
      LEFT JOIN IRUP..IRDeptInvolved IRI ON IRD.IRNo = IRI.IRNo
      LEFT JOIN IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
      LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
      
    WHERE 
      IRD.QAStatus = '1' 
      AND IRS.SubjectCode != 'others' 
      AND IRI.PrimaryDept = ?

    ORDER BY 
      CASE WHEN IRD.lostRec IS NULL THEN 0 ELSE 1 END, 
      IRD.DateTimeCreated DESC;`,

    [DeptCode],
  );
};

const getSuperAuditDT = async () => {
  return await sqlHelper.query(`
    SELECT
                IRD.IRNo,
                IRD.lostRec,
                IRS.SubjectName AS SubjectName,
                IRI.PrimaryDept,
                D.description AS Department_Description,
                US.FullName AS TransferFullName,
                US1.FullName AS MainFullName
            FROM
                IRUP..IRDetails IRD
            LEFT JOIN
                [UE Database]..Department D ON IRD.DeptCode = D.DeptCode
            LEFT JOIN
                IRUP..IRDeptInvolved IRI ON IRD.IRNo = IRI.IRNo
            LEFT JOIN 
                IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
            LEFT JOIN 
                IRUP..Users US1 ON IRS.EmployeeCode = US1.EmployeeCode
            LEFT JOIN 
                IRUP..IRQATransfer IRT ON IRD.IRNo = IRT.IRNo
            LEFT JOIN 
                IRUP..IRSubjectName IRS1 ON IRT.SubjectCode = IRS1.SubjectCode
            LEFT JOIN 
                IRUP..Users US ON IRT.EmpTransfer = US.EmployeeCode
            WHERE 
                IRD.QAStatus = '1'
                AND IRS.SubjectCode != 'others' 
            ORDER BY
                CASE WHEN IRD.lostRec IS NULL THEN 0 ELSE 1 END,
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
                IRD.SubjectFileName,
                IRD.SubjectFile,
                IRD.DateTimeCreated,
                IRE.SubjectSpecificExam,
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
                LEFT JOIN IRUP..IREmail D2 ON SplitDeptCode.value = D2.DeptCode
                GROUP BY ID.IRNo, D1.Dept_Desc
            ) DeptDesc ON IRD.IRNo = DeptDesc.IRNo
            WHERE
                IRD.IRNo = ? `,
    [IRNo],
  );
};

const insertdirectorLostRec = async function (payload, condition, txn) {
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
  getAllDirector,
  getAllHead,
  getSuperAuditDT,
  getIREPORT,
  insertdirectorLostRec,
};
