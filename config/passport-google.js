const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const keys = require("./keys");
const User = require("../models/UserSchema");

// ma hoa thong tin user bang id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// giai ma thong tin user qua id
passport.deserializeUser((id, done) => {
  User.find({ id })
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
      const id = getValue.id;
      const imageURL = getValue.image.url;
      User.findOne({ id })
        .then(currentUser => {
          if (currentUser) {
            //console.log(`User is: ${currentUser}`);
            done(null, currentUser);
          } else {
            new User({
              name: name,
              email: email,
              avatar: imageURL
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
