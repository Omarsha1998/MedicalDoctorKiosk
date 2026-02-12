const router = require("express").Router();

const {
  validateAccessToken,
  checkWhiteList,
} = require("../../../helpers/controller.js");

const controller = require("../controllers/med-hist.js");

router.get(
  "/ame",
  validateAccessToken,
  checkWhiteList,
  controller.getAnnualMedicalExams,
);

module.exports = router;
