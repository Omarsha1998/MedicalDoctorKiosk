const sql = require("../../../helpers/sql.js");
const model = require("../models/secondaryModel.js");

const SecondaryDisAll = async (req, res) => {
  try {
    const deptCode = req.user?.DeptCode;
    if (!deptCode) {
      return res.status(400).json({ msg: "Department code is required" });
    }
    const resultforSecondary = await model.getAllSecondary(deptCode);
    return res.status(200).json(resultforSecondary);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};

module.exports = {
  SecondaryDisAll,
};
