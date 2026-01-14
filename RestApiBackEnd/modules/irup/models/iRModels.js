const sqlHelper = require("../../../helpers/sql");

const getED = async () => {
  return await sqlHelper.query(`
    SELECT
    CODE AS EmployeeCode,
    DEPT_CODE AS DeptCode,
    DEPT_DESC
    FROM [UE database]..vw_Employees
    WHERE DEPT_CODE IS NOT NULL
      AND LTRIM(RTRIM(DEPT_CODE)) <> '';`);
};

const getSubName = async () => {
  return await sqlHelper.query(`
    SELECT 
        irs.SubjectCode, 
        irs.SubjectName,
        irs.SubjectReptDescription
    FROM IRUP..IRSubjectName irs
    ORDER BY 
        CASE WHEN irs.SubjectName = 'Others' THEN 1 ELSE 0 END,
        SubjectName ASC; `);
};

// const getSubCategory = async () => {
//   return await sqlHelper.query(`
//     SELECT DISTINCT
//             DomainCode,
//             RiskDomain
//         FROM IRUP..IRRiskDictionary
//         ORDER BY DomainCode ASC`);
// };

const getDivision = async () => {
  return await sqlHelper.query(`
    SELECT DISTINCT
            DivisionCode,
            Division
        FROM IRUP..IRDivision
        ORDER BY DivisionCode ASC`);
};

const getDivisionEmail = async (Division) => {
  return await sqlHelper.query(
    `
    SELECT 
      DivisionCode,
      Division, 
      DivisionEmail
    FROM IRUP..IRDivision
    WHERE DivisionCode = ?
    ORDER BY DivisionCode ASC`,
    [Division],
  );
};

const incidentReport = async (payload, txn) => {
  try {
    return await sqlHelper.insert(`IRUP.dbo.IRDetails`, payload, txn);
  } catch (error) {
    return { error: error.message };
  }
};

const getIncidentReport = async () => {
  return await sqlHelper.query(`
    SELECT TOP 1 
            IRD.IRNo,
            IRS.SubjectCode,
            IRD.DivisionCode,
			IRS.SubjectName,
			IRE.SubjectSpecificExam,
			D.description AS Description,
            IRD.SubjectDate,
            IRD.SubjectTime,
            IRD.SubjectLoc,
            IRD.SubjectNote,
            IRD.SubjectCause,
            IRD.SubjectResponse,
			IRD.SubjectBriefDes,
			ID.DivisionEmail

    FROM IRUP..IRDetails IRD
		LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode 
		LEFT JOIN [IRUP].[dbo].[IRDivision] ID ON IRD.DivisionCode = ID.DivisionCode
		LEFT JOIN IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
		LEFT JOIN [UE database]..Department D ON IRD.DeptCode = D.DeptCode
    ORDER BY 
      IRD.DateTimeCreated DESC;`);
};

const getDashboard = async () => {
  return await sqlHelper.query(`
    SELECT
            IRD.IRNo,
            IRS.SubjectName,
            D.DESCRIPTION AS Department_Description,
            IRE.SubjectSpecificExam,
            IRD.QAStatus
        FROM
            IRUP..IRDetails IRD
        LEFT JOIN 
            [UERMMMC]..SECTIONS D ON IRD.DeptCode = D.CODE
        LEFT JOIN
            IRUP..IRDeptInvolved id ON IRD.IRNo = id.IRNo
        LEFT JOIN 
            IRUP..IRReportableChildren IRE ON IRD.SubjectChilCode = IRE.SubjectChilCode
        LEFT JOIN
            IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
		WHERE 
			IRD.QAStatus = '1' AND IRS.SubjectCode != 'others'
        ORDER BY
            IRD.DateTimeCreated DESC;
    `);
};

module.exports = {
  getED,
  getSubName,
  // getSubCategory,
  getDivision,
  incidentReport,
  getIncidentReport,
  getDivisionEmail,
  getDashboard,
};
