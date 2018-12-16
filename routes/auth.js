var express = require("express");
var router = express.Router();
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google"),
  (req, res, next) => {
    res.json(req.user);
  }
);

module.exports = router;
