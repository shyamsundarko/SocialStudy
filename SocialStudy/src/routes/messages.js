const express = require("express");
const AuthMiddleware = require("../middlewares/auth");
const MessagesMiddleware = require("../middlewares/messages");
const MessagesController = require("../controllers/messages");
const router = express.Router();

router.post(
  "/",
  AuthMiddleware.protectedRoute,
  MessagesMiddleware.createMessage,
  MessagesController.createMessage
);

router.post(
  "/:messageId/upvote",
  AuthMiddleware.protectedRoute,
  MessagesController.upvoteMessage
);

router.post(
  "/:messageId/downvote",
  AuthMiddleware.protectedRoute,
  MessagesController.downvoteMessage
);

router.post(
  "/:messageId/clear-upvote",
  AuthMiddleware.protectedRoute,
  MessagesController.clearUpvoteThread
);

router.post(
  "/:messageId/clear-downvote",
  AuthMiddleware.protectedRoute,
  MessagesController.clearDownvoteThread
);

router.patch(
  "/:messageId",
  AuthMiddleware.protectedRoute,
  MessagesMiddleware.editMessage,
  MessagesController.editMessage
);

router.delete(
  "/:messageId",
  AuthMiddleware.protectedRoute,
  MessagesController.deleteMessage
);

module.exports = router;
