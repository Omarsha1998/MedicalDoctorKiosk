const db = require("../helpers/db.js");

const getAnnualMedicalExams = async (req, res) => {
  if (!req.query?.studempCode) {
    res.status(400).json("`studempCode` in URL query is required.");
    return;
  }

  const result = await db.query(
    `
      SELECT
        ve.Id id,
        e.[Name] name,
        ved.Id paramId,
        ep.[Name] paramName,
        ved.ExamParamValue paramValue,
        ved.ExamParamUnit paramUnit,
        ved.ExamParamNormalRange paramNormalRange,
        ved.ExamParamValueFlag paramValueFlag,
        u.FirstName doctorFirstName,
        u.MiddleName doctorMiddleName,
        u.LastName doctorLastName,
        u.ExtName doctorSuffixName,
        ve.dateTimeCompleted 
      FROM
        AnnualPhysicalExam..Patients p
        INNER JOIN AnnualPhysicalExam..Visits v ON v.PatientId = p.Id
        INNER JOIN AnnualPhysicalExam..VisitExams ve ON ve.VisitId = v.Id
        INNER JOIN AnnualPhysicalExam..Users u ON u.Code = ve.CompletedBy
        INNER JOIN AnnualPhysicalExam..VisitExamDetails ved ON ved.VisitExamId = ve.Id
        INNER JOIN AnnualPhysicalExam..Exams e ON e.Code = ve.ExamCode
        INNER JOIN AnnualPhysicalExam..ExamParams ep ON
          e.Id = ep.ExamId AND ep.Code = ved.ExamParamCode
      WHERE
        p.IdentificationCode = ?;
    `,
    [req.query.studempCode],
  );

  if (result?.error) {
    res.status(500).json(null);
    return;
  }

  res.json(result);
};

module.exports = {
  getAnnualMedicalExams,
};
