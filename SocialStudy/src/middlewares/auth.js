const { validate, body } = require("./validator");

const register = validate([
  body("username").toLowerCase().isLength({ min: 1 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("must be at least 8 characters long"),
  body("bio").escape(),
  body("avatar").isBase64(),
]);

const login = validate([
  body("credential").exists().toLowerCase(),
  body("password").exists(),
]);

const logout = validate([]);

const notAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) next();
  else res.status(403).json({ message: "You are currently logged in" });
};

const protectedRoute = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.status(401).json({ message: "Access not allowed" });
};

const adminProtectedRoute = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) next();
  else res.status(401).json({ message: "Access not allowed (admins only)" });
};

module.exports = {
  register,
  login,
  logout,
  notAuthenticated,
  protectedRoute,
  adminProtectedRoute,
};
