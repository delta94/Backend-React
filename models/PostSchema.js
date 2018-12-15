const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchame = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "users" },
  text: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  handle: { type: String },
  likes: [
    {
      user: { type: Schema.Types.ObjectId, ref: "users" }
    }
  ],
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "users" },
      text: { type: String, required: true },
      name: { type: String },
      avatar: { type: String },
      date: { type: Date, default: Date.now },
      handle: { type: String, required: true }
    }
  ],
  date: { type: Date, default: Date.now }
});

const Post = mongoose.model("posts", PostSchame);

module.exports = Post;
