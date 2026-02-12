const router = require("express").Router();

const {
  validateAccessToken,
  checkWhiteList,
} = require("../../../helpers/controller.js");

const controller = require("../controllers/user.js");

router.get("/password-reset-link", controller.getPasswordResetLink);

router.post("/", validateAccessToken, checkWhiteList, controller.post);
router.post("/login", controller.login);
router.post("/logout", validateAccessToken, checkWhiteList, controller.logout);

router.put("/logout", validateAccessToken, checkWhiteList, controller.logout);

router.put(
  "/password",
  validateAccessToken,
  checkWhiteList,
  controller.changePassword,
);

router.put("/password-by-token", controller.changePasswordByToken);

module.exports = router;
