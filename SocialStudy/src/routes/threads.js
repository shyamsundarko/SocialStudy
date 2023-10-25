const express = require("express");
const AuthMiddleware = require("../middlewares/auth");
const ThreadMiddleware = require("../middlewares/threads");
const ThreadController = require("../controllers/threads");
const router = express.Router();

router.get("/:threadId", ThreadController.getThread);

router.post(
  "/",
  AuthMiddleware.protectedRoute,
  ThreadMiddleware.createThread,
  ThreadController.createThread
);

router.post(
  "/:threadId/upvote",
  AuthMiddleware.protectedRoute,
  ThreadController.upvoteThread
);

router.post(
  "/:threadId/downvote",
  AuthMiddleware.protectedRoute,
  ThreadController.downvoteThread
);

router.post(
  "/:threadId/clear-upvote",
  AuthMiddleware.protectedRoute,
  ThreadController.clearUpvoteThread
);

router.post(
  "/:threadId/clear-downvote",
  AuthMiddleware.protectedRoute,
  ThreadController.clearDownvoteThread
);

router.patch(
  "/:threadId",
  AuthMiddleware.protectedRoute,
  ThreadMiddleware.editThread,
  ThreadController.editThread
);

router.delete(
  "/:threadId",
  AuthMiddleware.protectedRoute,
  ThreadController.deleteThread
);

module.exports = router;
