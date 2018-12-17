const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const keys = require("./keys");
const User = require("../models/UserSchema");
const FacebookStrategy = require("passport-facebook");

// ma hoa thong tin user bang id
passport.serializeUser((user, done) => {
  done(null, user.email);
});

// giai ma thong tin user qua id
passport.deserializeUser((email, done) => {
  User.findOne({ email })
    .then(user => done(null, user))
    .catch(err => done(null, false));
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/redirect",
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      profileFields: ["email", "gender", "locale", "displayName"]
    },
    (accessToken, refreshToken, profile, done) => {
      let getValue = profile._json;
      const email = getValue.emails[0].value;
      const name = getValue.displayName;
      const imageURL = getValue.image.url.split("?");
      const avatar = imageURL[0] + `?sz=200`;
      User.findOne({ email: email })
        .then(currentUser => {
          if (currentUser) {
            done(null, currentUser);
          } else {
            new User({
              name: name,
              email: email,
              avatar: avatar
            }).save((err, user) => {
              if (err) {
                done(null, false);
              } else {
                done(null, user);
              }
            });
          }
        })
        .catch(err => console.log(err));
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      callbackURL: "/auth/facebook/callback",
      clientID: keys.facebook.clientID,
      clientSecret: keys.facebook.clientSecret,
      profileFields: [
        "id",
        "displayName",
        "picture.width(200).height(200)",
        "first_name",
        "middle_name",
        "last_name",
        "gender",
        "link",
        "email",
        "location",
        "friends"
      ]
    },
    (accessToken, refreshToken, profile, done) => {
      let getValue = profile._json;
      const email = getValue.email;
      const name = getValue.displayName;
      const avatar = getValue.picture;
      User.findOne({ email: email })
        .then(currentUser => {
          if (currentUser) {
            done(null, currentUser);
          } else {
            new User({
              name: name,
              email: email,
              avatar: avatar
            }).save((err, user) => {
              if (err) {
                done(null, false);
              } else {
                done(null, user);
              }
            });
          }
        })
        .catch(err => console.log(err));
    }
  )
);
