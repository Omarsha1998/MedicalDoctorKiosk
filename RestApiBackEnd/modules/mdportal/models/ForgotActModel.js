const sqlHelper = require("../../../helpers/sql");
const helpers = require("../../../helpers/crypto");
const md5 = require("md5");

const generateForgotAccessToken = (doctorData) => {
  if (!doctorData) {
    throw new Error("User data is undefined or empty");
  }
  const user = {
    EHR_CODE: doctorData[0].eHR_CODE,
    FullName: doctorData[0].fullName,
    Email: doctorData[0].email,
    Code: doctorData[0].code,
    Gender: doctorData[0].gENDER,
    Department_Description: doctorData[0].department_Description,
  };
  return helpers.generateAccessToken(user, "5m");
};

module.exports = {
  generateForgotAccessToken,
};
