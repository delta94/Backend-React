const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../../controllers/user");

router.get("/test", (req, res, next) => {
  res.json({
    message: "user works"
  });
});

router.post("/register", userController.userRegister);

router.post("/login", userController.userLogin);

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  userController.userCurrent
);

module.exports = router;
