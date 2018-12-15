const Post = require("../models/PostSchema");
const Profile = require("../models/profileSchema");
const validatePostInput = require("../validation/post");

module.exports.createPost = (req, res, next) => {
  const { errors, isValid } = validatePostInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(404).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.user.avatar,
        user: req.user.id,
        handle: profile.handle
      });

      newPost
        .save()
        .then(post => {
          res.json(post);
        })
        .catch(err => {});
    })
    .catch(err => {});
};

module.exports.getPosts = (req, res, next) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
};

module.exports.getPostById = (req, res, next) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that ID" })
    );
};

module.exports.deletePostById = (req, res, next) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (post.user.toString() !== req.user.id) {
          return res.status(404).json({
            notauthorized: "User not authorized"
          });
        }

        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
};

module.exports.likeById = (req, res, next) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already liked this post" });
        }

        post.likes.unshift({ user: req.user.id });
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
};

module.exports.unLikeById = (req, res, next) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ notliked: "You have not yet like this poet" });
        }
        //get remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        //splice
        post.likes.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
};

module.exports.commentById = (req, res, next) => {
  const { errors, isValid } = validatePostInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(404).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.user.avatar,
            user: req.user.id,
            handle: profile.handle
          };

          //add comment
          post.comments.unshift(newComment);
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    })
    .catch(err => res.status(404).json({ postnotfound: "No post found" }));
};

module.exports.deleteCommentById = (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res
          .status(404)
          .json({ commentnotexists: "Comment does not exist" });
      }

      //get remove index
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      post.comments.splice(removeIndex, 1);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: "No post found" }));
};
