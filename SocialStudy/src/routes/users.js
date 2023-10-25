const express = require("express");
const UsersController = require("../controllers/users");
const AuthMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get("/", UsersController.getUsers);
router.get("/:userId", UsersController.getUser);

router.get("/:userId/starred-forums", UsersController.getStarredForums);

router.patch(
  "/:userId",
  AuthMiddleware.protectedRoute,
  UsersController.updateUser
);
router.delete(
  "/:userId",
  AuthMiddleware.protectedRoute,
  UsersController.deleteUser
);

module.exports = router;
