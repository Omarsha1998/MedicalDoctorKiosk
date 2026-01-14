const model = require("../models/ProfileModel");

const DisplayMD = async (req, res) => {
  try {
    const EhrCode = req.body.params.ehrCode;
    const result = await model.getMDPersonalInfor(EhrCode);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: `Error: ${error.message}` });
  }
};

module.exports = {
  DisplayMD,
};
