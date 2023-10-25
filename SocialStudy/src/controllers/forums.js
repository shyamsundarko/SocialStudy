const mongoose = require("mongoose");
const { School } = require("../models/School");
const { Forum } = require("../models/Forum");
const { User } = require("../models/User");

const getAllForums = async (req, res) => {
  const { keyword, school: schoolName } = req.query;

  let school;

  // Check if school exists
  if (schoolName !== undefined) {
    school = await School.findOne({ name: schoolName });

    if (!school) {
      return res.status(400).json({ message: "School not found" });
    }
  }

  let forumsQuery = Forum.find({
    $or: [
      { name: new RegExp(keyword, "i") },
      { description: new RegExp(keyword, "i") },
    ],
  });

  // Apply school filter if given
  if (schoolName !== undefined) {
    forumsQuery = forumsQuery.find({ school: school._id });
  }

  const forums = await forumsQuery.populate("school", { name: 1 });

  res.send(forums);
};

const getForum = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.forumId)) {
    return res.status(400).json({ message: "Invalid forum id" });
  }

  const forum = await Forum.findById(req.params.forumId).populate("threads");

  if (!forum) {
    return res.status(404).json({ message: "Forum not found" });
  }

  res.json(forum);
};

const createForum = async (req, res) => {
  const { name, description, school: schoolName } = req.body;

  if (await Forum.exists({ name })) {
    return res
      .status(400)
      .json({ message: "Forum with the same name already exists" });
  }

  const school = await School.findOne({ name: schoolName });

  if (!school) {
    return res.status(400).json({ message: "School does not exist" });
  }

  const forum = await Forum.create({ name, description, school: school._id });
  res.json(forum);
};

// TODO: Decide if allow to edit school
const editForum = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.forumId)) {
    return res.status(400).json({ message: "Invalid forum id" });
  }

  const { description: newDescription } = req.body;

  const forum = await Forum.findById(req.params.forumId);

  if (!forum) {
    return res.status(404).json({ message: "Forum not found" });
  }

  await forum.edit(newDescription);

  res.json(forum);
};

const deleteForum = async (req, res) => {
  const { forumId } = req.params;

  if (!mongoose.isValidObjectId(forumId)) {
    return res.status(400).json({ message: "Invalid forum id" });
  }

  if (!(await Forum.exists({ _id: forumId }))) {
    return res.status(404).json({ message: "Forum not found" });
  }

  await Forum.findByIdAndRemove(forumId);
  res.json({ message: "Forum deleted successfully" });
};

const starForum = async (req, res) => {
  const { forumId } = req.params;

  if (!mongoose.isValidObjectId(forumId)) {
    return res.status(400).json({ message: "Invalid forum id" });
  }

  if (!(await Forum.exists({ _id: forumId }))) {
    return res.status(404).json({ message: "Forum not found" });
  }

  const user = await User.findById(req.user._id);
  await user.starForum(forumId);

  res.json({ message: "Forum starred successfully" });
};

const unstarForum = async (req, res) => {
  const { forumId } = req.params;

  if (!mongoose.isValidObjectId(forumId)) {
    return res.status(400).json({ message: "Invalid forum id" });
  }

  if (!(await Forum.exists({ _id: forumId }))) {
    return res.status(404).json({ message: "Forum not found" });
  }

  const user = await User.findById(req.user._id);
  await user.unstarForum(forumId);

  res.json({ message: "Forum unstarred successfully" });
};

module.exports = {
  getAllForums,
  getForum,
  createForum,
  editForum,
  deleteForum,
  starForum,
  unstarForum,
};
