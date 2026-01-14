const sqlHelper = require("../../../helpers/sql");
const helpers = require("../../../helpers/crypto");
const md5 = require("md5");

const getDocDetails = async (Ehr_Code) => {
  return await sqlHelper.query(
    `SELECT 
          D.EHR_CODE,
          D.CODE AS EmployeeCode,
          CONCAT(D.[LAST NAME], ', ', D.[FIRST NAME]) AS FullName,
          D.WebPassword,
          D.GENDER,
          MS.Code AS DeptCode,
          MS.Name AS Department_Description,
          MS.Parent,
          CASE 
              WHEN UE.Value IS NOT NULL THEN UE.Value
              WHEN E.Value IS NOT NULL THEN E.Value
              ELSE NULL
          END AS email
      FROM [UERMMMC].[dbo].[DOCTORS] AS D
      LEFT JOIN [UERMMMC].[dbo].[DoctorSpecialties] AS DS 
          ON D.EHR_CODE = DS.DoctorEHRCode
      LEFT JOIN [UERMMMC].[dbo].[MedicalDepartments] AS MS 
          ON DS.SpecialtyCode = MS.CODE
      LEFT JOIN [UERMMMC].[dbo].[DoctorContactInfo] AS UE
          ON D.EHR_CODE = UE.DoctorCode
          AND UE.Type = 'UERM_EMAIL'
          AND UE.Value IS NOT NULL
      LEFT JOIN [UERMMMC].[dbo].[DoctorContactInfo] AS E
          ON D.EHR_CODE = E.DoctorCode
          AND E.Type = 'EMAIL'
          AND E.Value IS NOT NULL
      WHERE D.EHR_CODE = ?
        AND MS.Parent IS NULL
        AND D.DELETED = '0';`,
    [Ehr_Code],
  );
};

const matchPassword = (WebPassword, correctPassword) => {
  if (WebPassword && correctPassword) {
    return md5(WebPassword.trim()) === correctPassword.trim();
  }
  return false;
};

const getPicture = async (ehrCode) => {
  return await sqlHelper.query(
    `SELECT TOP 1 * 
      FROM (
        SELECT Picture AS pictureData, 1 AS Priority 
        FROM PictureDatabase..PictureMD 
        WHERE EHRCode = ?

        UNION ALL

        SELECT PictureImage AS pictureData, 2 AS Priority 
        FROM PictureDatabase..Picture 
        WHERE PictureId = ?
      ) AS Combined
      ORDER BY Priority`,
    [ehrCode, ehrCode],
  );
};

const generateAccessToken = (doctorData, PictureData) => {
  if (!doctorData) {
    throw new Error("User data is undefined or empty");
  }
  const user = {
    EHR_CODE: doctorData[0].eHR_CODE,
    FullName: doctorData[0].fullName,
    Email: doctorData[0].email,
    EmployeeCode: doctorData[0].employeeCode,
    Gender: doctorData[0].gENDER,
    Department_Description: doctorData[0].department_Description,
    PictureMD: PictureData,
  };
  return helpers.generateAccessToken(user);
};

module.exports = {
  getDocDetails,
  getPicture,
  matchPassword,
  generateAccessToken,
};
