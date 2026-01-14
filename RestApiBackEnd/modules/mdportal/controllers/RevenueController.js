const models = require("../models/RevenueModel");

const PatientDetails = async (req, res) => {
  try {
    console.log("Authorization header:", req.headers.authorization);
    console.log(req.user);
    const result = await models.getAllPatient(EhrCode);
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  PatientDetails,
};
