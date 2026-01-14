const models = require("../models/ForgotActModel");
const modelLogin = require("../models/LoginModel");
const Email = require("../helper/Emails");
const crypto = require("crypto");

const ForgotDetails = async (req, res) => {
  try {
    const Ehr_Code = req.body.ehrCodeFP;
    const DoctorUser = await modelLogin.getDocDetails(Ehr_Code);

    if (!DoctorUser || DoctorUser.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const TemporaryPassword = generateSecurePassword(8);
    const { email } = DoctorUser[0];
    await Email.sendForgotEmail(email, TemporaryPassword);

    res.status(200).json({
      message: "Reset password email sent successfully",
      email: email,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

function generateSecurePassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from(
    { length },
    () => chars[crypto.randomInt(0, chars.length)],
  ).join("");
}
module.exports = {
  ForgotDetails,
};
