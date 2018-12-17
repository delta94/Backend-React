var express = require("express");
var router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/"
  }),
  (req, res, next) => {
    const payload = {
      id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar
    };

    jwt.sign(payload, keys.secretOrKey, { expiresIn: "1h" }, (err, token) => {
      const tokenAuth = "Bearer " + token;
      res.redirect(
        "https://datfc97pro.github.io/deploy-react/login/" + tokenAuth
      );
    });
  }
);

// router.get('/', (req, res, next) => {
//   const avatarX = req.user.avatar.split('?');
//   avatarX
// })

module.exports = router;
