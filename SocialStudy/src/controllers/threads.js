const mongoose = require("mongoose");
const { Thread } = require("../models/Thread");
const { Forum } = require("../models/Forum");

const getVotesInfo = (upvotes, downvotes, req) => {
  return {
    upvotes: upvotes.length,
    downvotes: downvotes.length,
    upvoted: req.isAuthenticated() ? upvotes.includes(req.user._id) : false,
    downvoted: req.isAuthenticated() ? downvotes.includes(req.user._id) : false,
  };
};

const getThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  const { threadId } = req.params;

  const thread = await Thread.findById(threadId)
    .populate("author", "_id username admin")
    .populate("messages");

  // If not exist
  if (!thread) {
    return res.status(404).json({ message: "Thread not found" });
  }

  const messagesData = thread.messages.map((message) => {
    return {
      ...message.toJSON(),
      ...getVotesInfo(message.upvotes, message.downvotes, req),
    };
  });

  const threadVotesData = getVotesInfo(thread.upvotes, thread.downvotes, req);

  res.json({
    ...thread.toJSON(),
    messages: messagesData,
    ...threadVotesData,
  });
};

const createThread = async (req, res) => {
  const { forum: forumId, title, content } = req.body;

  if (!mongoose.isValidObjectId(forumId)) {
    return res.status(400).json({ message: "Invalid forum id" });
  }

  const forum = await Forum.findById(forumId);

  // Check if forum exists
  if (!forum) {
    return res.status(400).json({ message: "Forum not found" });
  }

  const thread = await Thread.create({
    forum: forumId,
    author: req.user._id,
    title,
    content,
  });

  // Add thread to forum document
  await forum.addThread(thread._id);

  res.json(thread);
};

const upvoteThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  const thread = await Thread.findById(req.params.threadId);

  // If does not exist
  if (!thread) {
    return res.status(404).json({ message: "Thread not found" });
  }

  await thread.upvote(req.user._id);

  res.json({ message: "Thread upvoted successfully" });
};

const downvoteThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  const thread = await Thread.findById(req.params.threadId);

  // If does not exist
  if (!thread) {
    return res.status(404).json({ message: "Thread not found" });
  }

  await thread.downvote(req.user._id);

  res.json({ message: "Thread downvoted successfully" });
};

const clearUpvoteThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  const thread = await Thread.findById(req.params.threadId);

  // If does not exist
  if (!thread) {
    return res.status(404).json({ message: "Thread not found" });
  }

  await thread.clearUpvote(req.user._id);
  res.json({ message: "Thread upvote removed successfully" });
};

const clearDownvoteThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  const thread = await Thread.findById(req.params.threadId);

  // If does not exist
  if (!thread) {
    return res.status(404).json({ message: "Thread not found" });
  }

  await thread.clearDownvote(req.user._id);
  res.json({ message: "Thread downvote removed successfully" });
};

const editThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  const { title: newTitle, content: newContent } = req.body;

  const thread = await Thread.findById(req.params.threadId);

  // If does not exist
  if (!thread) {
    return res.status(404).json({ message: "Thread not found" });
  }

  // Check if the user is not the author
  if (!thread.author.equals(req.user._id)) {
    return res
      .status(403)
      .json({ message: "You are not allowed to edit other user's threads" });
  }

  await thread.edit(newTitle, newContent);

  res.json({ message: "Thread edited successfully" });
};

const deleteThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  const thread = await Thread.findById(req.params.threadId);

  // If does not exist
  if (!thread) {
    return res.status(404).json({ message: "Thread not found" });
  }

  // Check if the user is the author
  if (!thread.author.equals(req.user._id)) {
    return res
      .status(403)
      .json({ message: "You are not allowed to delete other user's threads" });
  }


  await Thread.findOneAndRemove({_id: req.params.threadId});


  res.json({ message: "Thread deleted successfully" });
};

module.exports = {
  getThread,
  createThread,
  upvoteThread,
  downvoteThread,
  clearUpvoteThread,
  clearDownvoteThread,
  editThread,
  deleteThread,
};
