const router = require("express").Router();

const {
  validateAccessToken,
  checkWhiteList,
} = require("../../../helpers/controller.js");

const controller = require("../controllers/ue-studemp.js");

router.get("/", validateAccessToken, checkWhiteList, controller.get);

module.exports = router;
