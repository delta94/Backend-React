require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

//DB Config
const db = require("./config/keys").mongoURI;
const passport = require("passport");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const userRouter = require("./routes/api/user");
const profileRouter = require("./routes/api/profile");
const postsRouter = require("./routes/api/posts");
const authRouter = require("./routes/auth");

const keys = require("./config/keys");
const passportSetup = require("./config/passport-google");

var app = express();
// app.use(
//   session({
//     secret: keys.session.cookie,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       maxAge: 60 * 60 * 1000
//     }
//   })
// );

//passport
app.use(passport.initialize());
require("./config/passport")(passport);
// app.use(passport.session());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Requested-With, Origin, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATH, PUT, DELETE, OPTIONS"
  );
  next();
});

//mongoose
const mongoose = require("mongoose");
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch(() => {
    console.log("Connect failed!");
  });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/posts", postsRouter);
app.use("/auth", authRouter);

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
  });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
