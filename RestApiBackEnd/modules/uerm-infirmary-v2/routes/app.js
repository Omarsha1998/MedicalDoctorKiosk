const router = require("express").Router();

const {
  validateAccessToken,
  checkWhiteList,
} = require("../../../helpers/controller.js");

const controller = require("../controllers/app.js");

router.get(
  "/current-date-time",
  validateAccessToken,
  checkWhiteList,
  controller.getCurrentDateTime,
);

router.get(
  "/procedure",
  validateAccessToken,
  checkWhiteList,
  controller.getProcedures,
);

router.get(
  "/doctor",
  validateAccessToken,
  checkWhiteList,
  controller.getDoctors,
);

router.get(
  "/clinical-department",
  validateAccessToken,
  checkWhiteList,
  controller.getClinicalDepartments,
);

module.exports = router;
