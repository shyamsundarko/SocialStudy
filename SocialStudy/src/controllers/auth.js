const { User } = require("../models/User");
const UserService = require("../services/users");

const register = async (req, res) => {

  
  // Check if username is unique
  if (await User.findOne({ username: req.body.username })) {
    return res.status(400).json({ message: "Username has been taken" });
  }

  //Check if username only contains numbers and characters
  const pattern = /^[a-zA-z0-9]+$/i

  if(pattern.test(req.body.username) == false){
    return res.status(400).json({ message: "Username must only contain alphanumeric characters" });
  }

  // Check if email is unique
  if (await User.findOne({ email: req.body.email })) {
    return res.status(400).json({ message: "Email has been taken" });
  }

  // Check if password and confirmPassword match
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Save entry to database
  await UserService.addUser(
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.bio,
    req.body.avatar
  );

  res.json({ message: "A new user has been created" });
};

const login = async (req, res) => {
  res.json({ message: "Login successful" });
};

const logout = (req, res) => {
  req.logout();
  // res.redirect("/login");
  res.json({ message: "Logout successful" });
};

const getUser = (req, res) => {
  res.send(req.user);
};

module.exports = { register, login, logout, getUser };
