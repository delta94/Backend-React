const express = require("express");
const router = express.Router();
const passport = require("passport");
const profileController = require("../../controllers/profile");

router.get("/test", (req, res, next) => {
  res.json({
    message: "Profile Works"
  });
});

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileController.getProfile
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileController.createProfile
);

router.get("/handle/:handle", profileController.getHandle);

router.get("/all", profileController.getProfiles);

router.get("/user/:user_id", profileController.getProfileByUser);

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  profileController.createExperience
);

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  profileController.createEducation
);

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  profileController.deleteExperienceById
);

router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  profileController.deleteEducationById
);

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileController.deleteProfile
);

module.exports = router;
