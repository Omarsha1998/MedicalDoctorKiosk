const sqlHelper = require("../../../helpers/sql");
const helpers = require("../../../helpers/crypto");
const md5 = require("md5");
const { user } = require("../../../config/databaseConfig");

const getUser = async (EmployeeCode) => {
  return await sqlHelper.query(
    `SELECT 
        E.DeptCode,
        E.EmployeeCode,
        E.FirstName,
        E.UERMEmail,
        WebPassword,
        CONCAT(LastName, ', ', FirstName, ' ', CASE WHEN MiddleName IS NOT NULL THEN LEFT(MiddleName, 1) + '.' ELSE '' END) AS FullName,
        D.description AS Department_Description,
        A.AreaCode

    FROM [UE database]..Employee E
    LEFT JOIN [UERMMMC]..SECTIONS D ON E.DeptCode = D.CODE
    LEFT JOIN [IRUP].[dbo].[AreaAssignee] A ON E.EmployeeCode = A.EmployeeCode
    WHERE 
        E.EmployeeCode = ?`,
    [EmployeeCode],
  );
};

const matchPassword = (WebPassword, correctPassword) => {
  if (WebPassword && correctPassword) {
    return md5(WebPassword.trim()) === correctPassword.trim();
  }
  return false;
};

const generateAccessToken = (userData) => {
  if (!userData) {
    throw new Error("User data is undefined or empty");
  }
  const user = {
    EmployeeCode: userData[0].employeeCode,
    Department_Description: userData[0].department_Description,
    DeptCode: userData[0].deptCode,
    FullName: userData[0].fullName,
    FirstName: userData[0].firstName,
    AreaCode: userData[0].areaCode,
  };
  return helpers.generateAccessToken(user);
};

const getReportList = async (EmployeeCode) => {
  return await sqlHelper.query(
    `
    SELECT TOP (100) 
      IRD.IRNo,
      IRS.SubjectName,
      IRRE.SubjectSpecificExam, 
      IRD.DateTimeCreated, 
      IRD.IsReject, 
      IRD.QAStatus
    FROM IRUP..IRDetails IRD
      LEFT JOIN IRUP..IRSubjectName IRS ON IRD.SubjectCode = IRS.SubjectCode
      LEFT JOIN IRUP..IRReportableChildren IRRE ON IRD.SubjectChilCode = IRRE.SubjectChilCode
    WHERE EmployeeCode = ?
    ORDER BY 
      IRD.QAStatus DESC,
      IRD.DateTimeCreated DESC`,
    [EmployeeCode],
  );
};

module.exports = {
  getUser,
  matchPassword,
  generateAccessToken,
  getReportList,
};
