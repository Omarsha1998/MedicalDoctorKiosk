const sqlHelper = require("../../../helpers/sql");

const getAuditDetails = async () => {
  return await sqlHelper.query(`
    SELECT 
                i.IRNo, 
                us.FullName AS TransferFullName,
                us1.FullName AS MainFullName,
                irs.SubjectName,
                d.description AS Department_Description, 
                i.AuditStatus 

            FROM IRUP..IRDetails i
            LEFT JOIN [UE Database]..Department d ON i.DeptCode = d.DeptCode
            LEFT JOIN IRUP..IRSubjectName irs ON i.SubjectCode = irs.SubjectCode
            LEFT JOIN IRUP..Users us1 ON irs.EmployeeCode = us1.EmployeeCode
            LEFT JOIN IRUP..IRQATransfer irt ON i.IRNo = irt.IRNo
            LEFT JOIN IRUP..IRSubjectName irs1 ON irt.SubjectCode = irs1.SubjectCode
            LEFT JOIN IRUP..Users us ON irt.EmpTransfer = us.EmployeeCode
            WHERE
                IRS.SubjectCode != 'others'

                ORDER BY 
                i.AuditStatus DESC,
                i.DateTimeCreated DESC;`);
};

const getAuditHead = async () => {
  return await sqlHelper.query(`
    	SELECT * FROM [IRUP].[dbo].[IREmail] ORDER BY Dept_Desc ASC;
    `);
};

const updateArea = async function (
  payload,
  condition,
  txn,
  DateTimeUpdatedField,
) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IREmail`,
      payload,
      condition,
      txn,
      DateTimeUpdatedField,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const insertAreaUser = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.AreaAssignee`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const updateDeleteArea = async function (
  payload,
  condition,
  txn,
  DateTimeUpdatedField,
) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.AreaAssignee`,
      payload,
      condition,
      txn,
      DateTimeUpdatedField,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const getAuditRequest = async () => {
  return await sqlHelper.query(`
      SELECT 
      A.Id,
      IE.DeptCode,
      IE.Dept_Desc AS Department, 
      A.EmployeeCode,
      CONCAT(E.LastName, ', ', E.FirstName, ' ', CASE WHEN E.MiddleName IS NOT NULL THEN LEFT(E.MiddleName, 1) + '.' ELSE '' END) AS FullName,
      A.isActive

      FROM [IRUP].[dbo].[IRRequestAccess] A
      LEFT JOIN [IRUP].[dbo].[IREmail] IE ON A.DeptCode = IE.DeptCode
      LEFT JOIN [UE database]..Employee E ON A.EmployeeCode = E.EmployeeCode
      WHERE A.isActive = '1'
    `);
};

const insertRequestUser = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRRequestAccess`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const updateRequestAccess = async function (
  payload,
  condition,
  txn,
  DateTimeUpdatedField,
) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IRRequestAccess`,
      payload,
      condition,
      txn,
      DateTimeUpdatedField,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const insertHead = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IREmail`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getUser = async (EmployeeCode) => {
  return await sqlHelper.query(
    `
    SELECT 
    EmployeeCode,
    CONCAT(LastName, ', ', FirstName, ' ', CASE WHEN MiddleName IS NOT NULL THEN LEFT(MiddleName, 1) + '.' ELSE '' END) AS FullName,
    UERMEmail

    FROM [UE database]..Employee 
    WHERE EmployeeCode = ? AND Isactive = '1' 
    `,
    [EmployeeCode],
  );
};

const getAuditArea = async () => {
  return await sqlHelper.query(`
    SELECT 
        A.Id,
        A.AreaCode,
        D.Division,
        A.EmployeeCode,
        CONCAT(
          E.LastName, ', ', E.FirstName, ' ',
          CASE 
            WHEN E.MiddleName IS NOT NULL 
            THEN LEFT(E.MiddleName, 1) + '.' 
            ELSE '' 
          END
        ) AS FullName,
        A.isActive
    FROM [IRUP].[dbo].[AreaAssignee] A
    LEFT JOIN (
        SELECT DivisionCode, MAX(Division) AS Division
        FROM [IRUP].[dbo].[IRDivision]
        GROUP BY DivisionCode
    ) D ON A.AreaCode = D.DivisionCode
    LEFT JOIN [UE database]..Employee E 
        ON A.EmployeeCode = E.EmployeeCode
    WHERE A.isActive = '1';
    `);
};

const getDeptName = async (DeptCode) => {
  return await sqlHelper.query(
    `
    SELECT 
    CODE,
    DESCRIPTION
    FROM [UERMMMC]..SECTIONS
    WHERE CODE = ? AND 
    DESCRIPTION not LIKE '%INACTIVE%' and DESCRIPTION not LIKE '%N/A%'
    ORDER BY DESCRIPTION ASC; 
    `,
    [DeptCode],
  );
};

const getReportable = async () => {
  return await sqlHelper.query(`
    SELECT 
      SubjectCode,
      SubjectName,
      SubjectReptDescription
    FROM IRUP..IRSubjectName
    WHERE SubjectCode <> 'others' 
    ORDER BY 
      SubjectCode ASC,
      DateTimeCreated DESC`);
};

const insertReportable = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRSubjectName`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getDictionary = async () => {
  return await sqlHelper.query(`
    SELECT 
      RR.RiskCode, 
      RR.Risk, 
      RR.DomainCode,
      RD.RiskDomain,
      RR.RiskDescription
              
    FROM IRUP..IRRiskDictionary RR
    LEFT JOIN [IRUP].[dbo].[IRRiskDomain] RD ON RR.DomainCode = RD.DomainCode
    WHERE RR.DomainCode <> 'OTHER'
    ORDER BY 
      RR.DomainCode DESC,
      RR.RiskCode ASC;`);
};

const insertDisctionary = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRRiskDictionary`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getFormRiskChildren = async () => {
  return await sqlHelper.query(`
    SELECT TOP 1 * 
        FROM 
            IRUP..IRReportableChildren
        ORDER BY 
            DateTimeCreated DESC;`);
};

const getAuditDomainCode = async () => {
  return await sqlHelper.query(`
    SELECT 
      DomainCode, 
      RiskDomain
    FROM IRUP..IRRiskDomain
    ORDER BY DomainCode DESC`);
};

const insertDomain = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRRiskDomain`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getFormSubjectDetails = async () => {
  return await sqlHelper.query(`
    SELECT TOP 1 * 
        FROM 
            IRUP..IRSubjectName
        ORDER BY 
            DateTimeCreated DESC;`);
};

const insertFormRiskChildren = async (payload, txn) => {
  try {
    return await sqlHelper.insert(
      `IRUP.dbo.IRReportableChildren`,
      payload,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const getChild = async () => {
  return await sqlHelper.query(`
    SELECT
			irr.SubjectChilCode,
			irr.SubjectSpecificExam,
			irr.SubjectCode,
			irs.SubjectName,
			irrd.DomainCode,
			irrd.RiskDomain, 
			ird.DomainCode AS SubDomainCode,
			ird.Risk AS RiskSubDomain

        FROM 
            IRUP..IRReportableChildren irr 
		LEFT JOIN IRUP..IRSubjectName irs ON irr.SubjectCode = irs.SubjectCode
		LEFT JOIN IRRiskDictionary ird ON irr.SubjectRiskSubDomain = ird.RiskCode
		LEFT JOIN [IRUP].[dbo].[IRRiskDomain] irrd ON irr.SubjectRiskDomain = irrd.DomainCode
        ORDER BY 
            irr.SubjectChilCode ASC;`);
};

const insertChild = async (payload, txn) => {
  try {
    return await sqlHelper.insert(
      `IRUP.dbo.IRReportableChildren`,
      payload,
      txn,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const insertFormRiskCode = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRRiskDictionary`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getformatRiskCode = async (DomainCode) => {
  return await sqlHelper.query(
    `
    SELECT TOP 1 RiskCode 
        FROM IRRiskDictionary 
        WHERE DomainCode = ?
    ORDER BY DateTimeCreated DESC `,
    [DomainCode],
  );
};

const getRiskDictionary = async () => {
  return await sqlHelper.query(`
     SELECT TOP 1 * 
            FROM IRRiskDictionary 
            ORDER BY DateTimeCreated DESC`);
};

const insertRemarks = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRNote`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getDisplayRemarks = async (IRNo) => {
  return await sqlHelper.query(
    `
    SELECT *
        FROM IRUP..IRNote
        WHERE IRNo = ?
        AND IsActive = 1
        ORDER BY DateTimeCreated DESC `,
    [IRNo],
  );
};

const updateeditNote = async function (
  payload,
  condition,
  txn,
  DateTimeUpdatedField,
) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IRNote`,
      payload,
      condition,
      txn,
      DateTimeUpdatedField,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const updatedeleteNote = async function (
  payload,
  condition,
  txn,
  DateTimeUpdatedField,
) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IRNote`,
      payload,
      condition,
      txn,
      DateTimeUpdatedField,
    );
  } catch (error) {
    return { error: error.message };
  }
};

const updateauditStatus = async function (
  payload,
  condition,
  txn,
  DateTimeUpdatedField,
) {
  try {
    return await sqlHelper.update(
      `IRUP.dbo.IRDetails`,
      payload,
      condition,
      txn,
      DateTimeUpdatedField,
    );
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = {
  getAuditDetails,

  getReportable,
  insertReportable,

  getChild,
  insertChild,

  getDictionary,
  insertDisctionary,

  getAuditDomainCode,
  insertDomain,

  getFormSubjectDetails,
  insertFormRiskChildren,
  getFormRiskChildren,

  insertFormRiskCode,
  getformatRiskCode,
  getRiskDictionary,
  insertRemarks,
  getDisplayRemarks,
  updateeditNote,
  updatedeleteNote,
  updateauditStatus,

  getAuditHead,
  insertHead,
  updateArea,
  getUser,
  getDeptName,
  getAuditArea,
  insertAreaUser,
  updateDeleteArea,

  getAuditRequest,
  insertRequestUser,
  updateRequestAccess,
};
