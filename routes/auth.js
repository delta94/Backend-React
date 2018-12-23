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
      res.redirect("/login/" + tokenAuth);
    });
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"]
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook"),
  (req, res, next) => {
    const payload = {
      id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar
    };

    res.json(req.user);
    // jwt.sign(payload, keys.secretOrKey, { expiresIn: "1h" }, (err, token) => {
    //   const tokenAuth = "Bearer " + token;
    //   res.redirect("https://react-datngo97.netlify.com/login/" + tokenAuth);
    // });
  }
);

module.exports = router;
