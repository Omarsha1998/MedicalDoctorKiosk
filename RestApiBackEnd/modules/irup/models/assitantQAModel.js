const sqlHelper = require("../../../helpers/sql");
// const getSuperAuditQAA = async () => {
//   return await sqlHelper.query(`
//     SELECT
//                 i.IRNo,
//                 d.description AS Department_Description,
//                 CASE
//                     WHEN uaq1.Division IS NOT NULL AND uaq1.DivisionCode IS NOT NULL
//                     THEN uaq1.Division
//                     ELSE uaq.Division
//                 END AS Division,
//                 CASE
//                     WHEN uaq1.Division IS NOT NULL AND uaq1.DivisionCode IS NOT NULL
//                     THEN uaq1.DivisionCode
//                     ELSE uaq.DivisionCode
//                 END AS DivisionCode,
//                 irs.SubjectCode
//             FROM IRUP..IRDetails i
//             LEFT JOIN [UE Database]..Department d ON i.DeptCode = d.DeptCode
//             LEFT JOIN IRUP..IRSubjectName irs ON i.SubjectCode = irs.SubjectCode
//             LEFT JOIN IRUP..IRDivision uaq ON i.DivisionCode = uaq.DivisionCode
//             LEFT JOIN IRUP..IRDivision uaq1 ON i.TransferDivisionCode = uaq1.DivisionCode
//             WHERE
//                 irs.SubjectCode = 'others'
//             ORDER BY
//                 i.DateTimeCreated DESC;`);
// };

const getAllAssistantQA = async () => {
  return await sqlHelper.query(
    ` SELECT
      i.IRNo,
      d.description AS Department_Description,
      irs.SubjectCode,
      uaq.Division,
      i.AQAStatus

      FROM IRUP..IRDetails i
      LEFT JOIN [UERMMMC]..SECTIONS d ON i.DeptCode = d.CODE
      LEFT JOIN IRUP..IRSubjectName irs ON i.SubjectCode = irs.SubjectCode
      LEFT JOIN IRUP..IRDivision uaq ON i.DivisionCode = uaq.DivisionCode
      WHERE irs.SubjectCode = 'others' 
      ORDER BY i.DateTimeCreated DESC;`,
  );
};

const getIREPORT = async (IRNo) => {
  return await sqlHelper.query(
    `SELECT 
                IRD.IRNo,
                IRS.SubjectName,
                IRD.SubjectBriefDes,
                IRD.SubjectDate,
                IRD.SubjectTime,
                IRD.SubjectLoc,
                IRD.SubjectNote,
                IRD.SubjectCause,
                IRD.SubjectResponse,
                IRD.SubjectFileName,
                IRD.SubjectFile,
                IRD.DateTimeCreated

            FROM
                IRUP..IRDetails IRD
            LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
            WHERE
                IRD.IRNo = ? `,
    [IRNo],
  );
};

const getSubjectName = async () => {
  return await sqlHelper.query(`
    SELECT * 
            FROM IRUP..IRSubjectName 
            WHERE SubjectCode <> 'others'`);
};

const getDivisionName = async () => {
  return await sqlHelper.query(`
    SELECT DISTINCT
                DivisionCode,
                Division
            FROM IRUP..IRDivision
            ORDER BY DivisionCode ASC`);
};

const UpdateDivisionCode = async function (payload, condition, txn) {
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

const getTransferDivisionQA = async (IRNo) => {
  return await sqlHelper.query(
    `WITH EmployeeInfo AS (
        -- Aggregates information for QA and QAAssistant for the main division
        SELECT
            UAQ.DivisionCode,
            E.FULLNAME AS QANameOwner,
            E.UERMEmail AS QAEmailOwner,
            E1.FULLNAME AS QAANameOwner,
            E1.UERMEmail AS QAAEmailOwner
        FROM
            IRUP..IRDivision UAQ
        LEFT JOIN
            [UE database]..vw_Employees E ON UAQ.QA = E.CODE
        LEFT JOIN
            [UE database]..vw_Employees E1 ON UAQ.QAAssitant = E1.CODE
    ),
    TransferEmployeeInfo AS (
        -- Aggregates information for QA and QAAssistant for the transfer division
        SELECT
            UAQ1.DivisionCode,
            ES.FULLNAME AS TransferQAName,
            ES.UERMEmail AS TransferQAEmail,
            ES1.FULLNAME AS TransferQAAName,
            ES1.UERMEmail AS TransferQAAEmail
        FROM
            IRUP..IRDivision UAQ1
        LEFT JOIN
            [UE database]..vw_Employees ES ON UAQ1.QA = ES.CODE
        LEFT JOIN
            [UE database]..vw_Employees ES1 ON UAQ1.QAAssitant = ES1.CODE
    )
    SELECT
        IRD.IRNo,
        IRD.DivisionCode,
        IRD.TransferDivisionCode,
        IRD.SubjectBriefDes,
        EI.QANameOwner,
        EI.QAEmailOwner,
        EI.QAANameOwner,
        EI.QAAEmailOwner,
        TEI.TransferQAName,
        TEI.TransferQAEmail,
        TEI.TransferQAAName,
        TEI.TransferQAAEmail
    FROM 
        IRUP..IRDetails IRD
    LEFT JOIN 
        IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
    LEFT JOIN 
        IRUP..IRDivision UAQ ON IRD.DivisionCode = UAQ.DivisionCode
    LEFT JOIN 
        EmployeeInfo EI ON IRD.DivisionCode = EI.DivisionCode
    LEFT JOIN 
        IRUP..IRDivision UAQ1 ON IRD.TransferDivisionCode = UAQ1.DivisionCode
    LEFT JOIN 
        TransferEmployeeInfo TEI ON IRD.TransferDivisionCode = TEI.DivisionCode
    WHERE
        IRD.IRNo = ?
    ORDER BY 
        IRD.DateTimeCreated DESC
    `,
    [IRNo],
  );
};

const UpdateSubjectCode = async function (payload, condition, txn) {
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

const getTransferSubjectCode = async (IRNo) => {
  return await sqlHelper.query(
    `SELECT TOP 1
        IRD.IRNo, 
        IRS.SubjectCode,
        IRS.SubjectName,
        IRD.DivisionCode,
        E.FULLNAME AS TransferName,
        US1.FULLNAME AS QANAME,
        E.UERMEmail AS TransferEmail, 
        US1.UERMEmail AS QAEMAIL
    FROM 
        IRUP..IRDetails IRD 
    LEFT JOIN 
        IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode 
    LEFT JOIN 
        [UE database]..vw_Employees E ON IRD.EmUpdSubCode = E.CODE
    LEFT JOIN 
        IRUP..Users US1 ON IRS.EmployeeCode = US1.EmployeeCode
    WHERE
        IRD.IRNo = ?
    ORDER BY 
    IRD.DateTimeCreated DESC;
    `,
    [IRNo],
  );
};

module.exports = {
  getAllAssistantQA,
  getIREPORT,
  getSubjectName,
  getDivisionName,
  UpdateDivisionCode,
  getTransferDivisionQA,
  UpdateSubjectCode,
  getTransferSubjectCode,
};
