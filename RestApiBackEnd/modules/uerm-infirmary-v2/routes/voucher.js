const router = require("express").Router();

const {
  validateAccessToken,
  checkWhiteList,
} = require("../../../helpers/controller.js");

const controller = require("../controllers/voucher.js");

router.get("/", validateAccessToken, checkWhiteList, controller.get);
router.post("/", validateAccessToken, checkWhiteList, controller.post);
router.delete("/:id", validateAccessToken, checkWhiteList, controller._delete);

module.exports = router;
