const sqlHelper = require("../../../helpers/sql");

const getMDPersonalInfor = async (Ehr_Code) => {
  return await sqlHelper.query(
    `SELECT 
        D.EHR_CODE AS EhrCode,
        D.CODE AS Code,
        CONCAT(D.[LAST NAME], ', ', D.[FIRST NAME]) AS FullName,
        D.[FIRST NAME] AS FirstName,
        D.[LAST NAME] AS LastName,
        D.GENDER AS Gender,
        D.LIC AS Lic,
        D.[LIC EXP DATE] AS LicDate,
      D.PHIC AS Phic,
      D.[PHIC EXP DATE] AS PhicDate,
        D.MPN1 AS Number,
        D.email AS Email,

        -- Main Department (walang parent)
        STRING_AGG(CASE WHEN MS.Parent IS NULL THEN MS.Name END, ', ') AS Department,

        -- SubDepartment (may parent)
        STRING_AGG(CASE WHEN MS.Parent IS NOT NULL THEN MS.Name END, ', ') AS SubDepartment

    FROM [UERMMMC].[dbo].[DOCTORS] D
    LEFT JOIN [UERMMMC].[dbo].[DoctorSpecialties] DS 
        ON D.EHR_CODE = DS.DoctorEHRCode
    LEFT JOIN [UERMMMC].[dbo].[MedicalDepartments] MS
        ON DS.SpecialtyCode = MS.Code
    WHERE 
    GROUP BY 
        D.EHR_CODE,
        D.CODE,
        D.[FIRST NAME],
        D.[LAST NAME],
        D.GENDER,
        D.LIC,
        D.[LIC EXP DATE],
      D.PHIC,
      D.[PHIC EXP DATE],
        D.MPN1,
        D.email
    `,
    [Ehr_Code],
  );
};

module.exports = {
  getMDPersonalInfor,
};
