const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const keys = require("./keys");
const User = require("../models/UserSchema");

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
