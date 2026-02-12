const router = require("express").Router();

const {
  validateAccessToken,
  checkWhiteList,
} = require("../../../helpers/controller.js");

const controller = require("../controllers/patient.js");

router.get("/", validateAccessToken, checkWhiteList, controller.get);
router.post("/", validateAccessToken, checkWhiteList, controller.post);

module.exports = router;
