const express = require("express");
const router = express.Router();
const passport = require("passport");
const postController = require("../../controllers/posts");


router.get("/test", (req, res, next) => {
  res.json({
    message: "Posts Works"
  });
});

//create post
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  postController.createPost
);
// find all
router.get("/", postController.getPosts);
// find by id
router.get("/:id", postController.getPostById);

//delete post
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  postController.deletePostById
);

//Like
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  postController.likeById
);

//unlike
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  postController.unLikeById
);

//comment
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  postController.commentById
);

//delete comment
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  postController.deleteCommentById
);

module.exports = router;
