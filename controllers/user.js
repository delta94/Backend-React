const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");

const User = require("../models/UserSchema");
const keys = require("../config/keys");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hyeieisi@gmail.com",
    pass: "Ngocdat21"
  }
});

module.exports.userRegister = (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "Email already exists";
        return res.status(400).json(errors);
      } else {
        let mailOptions = {
          from: "hyeieisi@gmail.com",
          to: req.body.email,
          subject: "Thanks for registering my web",
          html: `<h1>Welcome !</h1><br><p>You have successfully registered your account: ${
            req.body.email
          } and Password: ${req.body.password}<br></p>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });

        const avatar = gravatar.url(req.body.email, {
          s: "200",
          r: "pg",
          d: "mm"
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar: "http:" + avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                res.json(user);
              })
              .catch(err => {
                console.log(err);
              });
          });
        });
      }
    })
    .catch(err => console.log(err));
};

module.exports.userLogin = (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        errors.email = "User email not found";
        return res.status(404).json(errors);
      }

      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //User Match
          const payload = {
            id: user._id,
            name: user.name,
            avatar: user.avatar
          };
          //Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: "1h" },
            (err, token) => {
              res.json({
                sucess: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          errors.password = "Password incorrect";
          return res.status(404).json(errors);
        }
      });
    })
    .catch(err => console.log(err));
};

module.exports.userCurrent = (req, res, next) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email
  });
};
