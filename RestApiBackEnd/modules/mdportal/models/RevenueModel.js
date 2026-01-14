const sqlHelper = require("../../../helpers/sql");
const helpers = require("../../../helpers/crypto");

const getAllPatient = async (Ehr_Code) => {
  return await sqlHelper.query(
    `
    SELECT 
      PA.DoctorID,
      CONCAT(D.[LAST NAME], ', ', D.[FIRST NAME]) AS FullName,   
      PA.CaseNo,
      PA.Tdate, 
      PA.ORNo,
      PA.PF


    FROM [UERMMMC].[dbo].[PAO_DoctorsFee] AS PA
    LEFT JOIN [UERMMMC].[dbo].[DOCTORS] AS D 
      ON PA.DoctorID = D.CODE

    WHERE D.EHR_CODE = ?

    GROUP BY 
      PA.DoctorID,
      D.[LAST NAME],
      D.[FIRST NAME],
      PA.CaseNo,
      PA.Tdate,
      PA.ORNo,
      PA.PF

    ORDER BY 
      FullName ASC;
  `,
    [Ehr_Code],
  );
};

module.exports = {
  getAllPatient,
};
