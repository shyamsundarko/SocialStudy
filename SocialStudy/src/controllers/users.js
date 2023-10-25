const mongoose = require("mongoose");
const { User } = require("../models/User");

const getUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await User.findById(userId).select(["-password"]);

  // If user not found
  if (!user) {
    return res.status(404).json({ message: `User not found` });
  }

  res.json(user);
};

const getUsers = async (req, res) => {
  const { username = "" } = req.query;

  // Regex to find the users that contains the specified username in filter
  const usernameRegex = new RegExp(`.*${username}.*`);

  const users = await User.find({
    $or: [{ username: { $regex: usernameRegex, $options: "i" } }],
  })
    .select(["-password", "-bio"])
    .sort({ username: "asc" });

  res.json(users);
};

const updateUser = async (req, res) => {
  const {
    username: newUsername,
    email: newEmail,
    password: newPassword,
    bio: newBio,
    // avatar: newAvatar,
    // major: newMajor,
  } = req.body;


  try {
    // Do not allow a user to edit other user's account
    if (req.user._id.toString() !== req.params.userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit other user's profile" });
    }

    //Check if username only contains numbers and characters
    const pattern = /^[a-zA-z0-9]+$/i

    if(pattern.test(newUsername) == false){
      return res.status(400).json({ message: "Username must only contain alphanumeric characters" });
    }  


    const user = await User.findById(req.user._id);

    if (newUsername) user.username = newUsername;
    if (newEmail) user.email = newEmail;
    if (newPassword) user.password = newPassword;
    if (newBio) user.bio = newBio;
    // if (newAvatar) user.avatar = newAvatar;
    // if (newMajor) user.major = newMajor;

    await user.save();
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  res.json({ message: "Update profile successful" });
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  // Do not allow a user to delete other user's account
  if (req.user._id.toString() !== userId) {
    return res
      .status(403)
      .json({ message: "You are not allowed to delete other user's account" });
  }

  await User.findByIdAndRemove(userId);
  req.logout();

  res.json({ message: `User deleted successfully` });
};

const getStarredForums = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const user = await User.findById(req.params.userId).populate("starredForums");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user.starredForums);
};

module.exports = {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  getStarredForums,
};
