const express = require("express");
const AuthMiddleware = require("../middlewares/auth");
const AuthController = require("../controllers/auth");
const passport = require("passport");

const router = express.Router();

// TODO: Not sure if we need to check if the request is already authenticated

router.post(
  "/register",
  AuthMiddleware.notAuthenticated,
  AuthMiddleware.register,
  AuthController.register
);

router.post(
  "/login",
  AuthMiddleware.notAuthenticated,
  AuthMiddleware.login,
  passport.authenticate("local"),
  AuthController.login
);

router.post(
  "/logout",
  AuthMiddleware.protectedRoute,
  AuthMiddleware.logout,
  AuthController.logout
);

router.get("/user", AuthMiddleware.protectedRoute, AuthController.getUser);

module.exports = router;
