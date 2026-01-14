const sqlHelper = require("../../../helpers/sql");

const getAllSecondary = async (DeptCode) => {
  return await sqlHelper.query(
    `
    SELECT 
    IRD.IRNo,
    IRS.SubjectName AS SubjectName,
    IRE.SubjectSpecificExam,
    IRD.RiskGrading
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
        IRS.SubjectCode != 'others' 
        AND IRI.PrimaryDept = ?
        AND IRD.RiskGrading IN (3, 4, 5)
    ORDER BY
        IRD.DateTimeCreated DESC;`,
    [DeptCode],
  );
};

module.exports = {
  getAllSecondary,
};
