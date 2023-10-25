const { User } = require("../models/User");

// TODO: Add default values for avatar
const addUser = (username, email, password, bio, avatar) => {
  return User.create({
    username,
    email,
    password,
    bio,
    avatar,
  });
};

module.exports = {
  addUser,
};
