const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const UserSchema = Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  date: { type: Date, default: Date.now }
});

UserSchema.plugin(uniqueValidator);

const User = mongoose.model("users", UserSchema);

module.exports = User;
