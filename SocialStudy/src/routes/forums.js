const express = require("express");
const AuthMiddleware = require("../middlewares/auth");
const ForumMiddleware = require("../middlewares/forums");
const ForumController = require("../controllers/forums");
const router = express.Router();

router.get("/", ForumController.getAllForums);

router.get("/:forumId", ForumController.getForum);

router.post(
  "/:forumId/star",
  AuthMiddleware.protectedRoute,
  ForumController.starForum
);

router.post(
  "/:forumId/unstar",
  AuthMiddleware.protectedRoute,
  ForumController.unstarForum
);

router.post(
  "/",
  AuthMiddleware.adminProtectedRoute,
  ForumMiddleware.createForum,
  ForumController.createForum
);

router.patch(
  "/:forumId",
  AuthMiddleware.adminProtectedRoute,
  ForumController.editForum
);

router.delete(
  "/:forumId",
  AuthMiddleware.adminProtectedRoute,
  ForumController.deleteForum
);

module.exports = router;
