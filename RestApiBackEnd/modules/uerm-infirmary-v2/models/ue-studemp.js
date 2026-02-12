const selectManySql = `
  SELECT
    s.code,
    s.firstName,
    s.middleName,
    s.lastName,
    NULL suffixName,
    s.birthDate,
    CASE
      WHEN s.Gender = 'M' THEN 'MALE'
      WHEN s.Gender = 'F' THEN 'FEMALE'
      ELSE NULL
    END gender,
    s.address,
    s.[type] affiliationCode,
    CAST(s.Campus AS VARCHAR) campusCode,
    CASE WHEN s.empClass = 'Faculty' THEN
      1
    ELSE
      0
    END isFaculty,
    s.status,
    s.deptDesc deptName,
    p.PatientNo patientCode
  FROM
    [10.1.2.17].[UERM].dbo.[StudentsEmployees] s
    LEFT JOIN UERMMMC..PatientInfo p ON
      p.INF_CAMPUS = s.Campus
      AND (
        (s.[type] = 'EMP' AND p.EmpNo = CONCAT('UE', s.Code))
        OR (s.[type] = 'STU' AND p.SN = s.Code)
      )
`;

module.exports = {
  selectManySql,
};
