require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

//DB Config
const db = require("./config/keys").mongoURI;
const passport = require("passport");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const userRouter = require("./routes/api/user");
const profileRouter = require("./routes/api/profile");
const postsRouter = require("./routes/api/posts");

var app = express();

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

//passport
app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/posts", postsRouter);

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
