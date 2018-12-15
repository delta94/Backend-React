const Post = require("../models/PostSchema");

const Profile = require("../models/profileSchema");
const User = require("../models/UserSchema");
const validateProfileInput = require("../validation/profile");
const validateExperienceInput = require("../validation/experience");
const validateEducationInput = require("../validation/education");

module.exports.getProfile = (req, res, next) => {
  const errors = {};

  Profile.findOne({ user: req.user.id })
    .populate("user", ["avatar", "name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
};

module.exports.createProfile = (req, res, next) => {
  const { errors, isValid } = validateProfileInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.avatar) {
    profileFields.avatar = req.body.avatar;
  } else {
    profileFields.avatar = req.user.avatar;
  }
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;
  // skills = spilt into array
  if (typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(",");
  }

  profileFields.social = {};

  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
      //update
      Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      )
        .then(profile => {
          User.findOne({ _id: req.user.id }).then(user => {
            user.avatar = profileFields.avatar;
            user.save();
          });

          Post.findOne({ user: req.user.id }).then(post => {
            if (post) {
              post.avatar = profileFields.avatar;
              const x = post.comments.find(item => item.user == req.user.id);
              x.avatar = profileFields.avatar;
              post.save();
            }
          });

          return profile;
        })
        .then(profile => res.json(profile));
    } else {
      // create

      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exists";
          res.status(400).json(errors);
        }

        new Profile(profileFields)
          .save()
          .then(profile => {
            User.findOne({ _id: req.user.id }).then(user => {
              user.avatar = profileFields.avatar;
              user.save();
            });

            Post.findOne({ user: req.user.id }).then(post => {
              if (post) {
                post.avatar = profileFields.avatar;
                const x = post.comments.find(item => item.user == req.user.id);
                x.avatar = profileFields.avatar;
                post.save();
              }
            });
            return profile;
          })
          .then(profile => res.json(profile));
      });
    }
  });
};

module.exports.getHandle = (req, res, next) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["avatar", "name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "The is no profile for ther user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
};

module.exports.getProfiles = (req, res, next) => {
  const errors = {};
  Profile.find()
    .populate("user", ["avatar", "name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There are no profiles";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({
        profile: "There is no profile  for this user"
      });
    });
};

module.exports.getProfileByUser = (req, res, next) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["avatar", "name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "The is no profile for ther user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({
        profile: "There is no profile  for this user"
      })
    );
};

module.exports.createExperience = (req, res, next) => {
  const { errors, isValid } = validateExperienceInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({ user: req.user.id }).then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.experience.unshift(newExp);
    profile.save().then(profile => res.json(profile));
  });
};

module.exports.createEducation = (req, res, next) => {
  const { errors, isValid } = validateEducationInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({ user: req.user.id }).then(profile => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.education.unshift(newEdu);
    profile.save().then(profile => res.json(profile));
  });
};

module.exports.deleteExperienceById = (req, res, next) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.experience
        .map(item => item._id)
        .indexOf(req.params.exp_id);

      //Splice out of array
      profile.experience.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
};

module.exports.deleteEducationById = (req, res, next) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.education
        .map(item => item._id)
        .indexOf(req.params.edu_id);

      //Splice out of array
      profile.education.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
};

module.exports.deleteProfile = (req, res, next) => {
  Profile.findOneAndRemove({ user: req.user.id }).then(() => {
    User.findOneAndRemove({ _id: req.user.id }).then(() =>
      Post.findOneAndRemove({ user: req.user.id }).then(user => {
        if (user) {
          return res.json({
            success: true
          });
        }

        res.json({
          success: true
        });
      }).catch(err => console.log(err))
    );
  });
};
