const router = require("express").Router();

router.use("/app", require("./app.js"));
router.use("/user", require("./user.js"));
router.use("/ue-studemp", require("./ue-studemp.js"));
router.use("/voucher", require("./voucher.js"));
router.use("/referral", require("./referral.js"));

router.use("/patient", require("./patient.js"));
router.use("/med-hist", require("./med-hist.js"));

module.exports = router;
