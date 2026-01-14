const express = require("express");
const router = express.Router();
const DoctorLoginController = require("../controllers/LoginController");
const DoctorProfile = require("../controllers/ProfileController");
const DoctorForgotAct = require("../controllers/ForgotActController");
const DoctorRevenue = require("../controllers/RevenueController");
const { validateAccessToken } = require("../../../helpers/crypto");

router.post("/Login", DoctorLoginController.Login);

/// FORGOT PASSWORD ///
router.post("/ForgotAccount", DoctorForgotAct.ForgotDetails);

///// DOCTOR PROFILE /////
router.post("/DisplayDoctor", DoctorProfile.DisplayMD);

//// DOCTOE REVENUE /////
router.get(
  "/DisplayPatientDetails",
  validateAccessToken,
  DoctorRevenue.PatientDetails,
);

module.exports = router;
