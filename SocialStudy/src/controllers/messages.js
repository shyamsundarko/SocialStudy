const mongoose = require("mongoose");
const { Message } = require("../models/Message");
const { Thread } = require("../models/Thread");

const createMessage = async (req, res) => {
  const { thread: threadId, content } = req.body;

  if (!mongoose.isValidObjectId(threadId)) {
    return res.status(400).json({ message: "Invalid thread id" });
  }

  // Check if thread exists
  const thread = await Thread.findOne({ _id: threadId });
  if (!thread) {
    return res.status(400).json({ message: "Thread not found" });
  }

  const message = await Message.create({
    thread: threadId,
    content,
    author: req.user._id,
  });

  // Add message id to thread.messages array
  await thread.addMessage(message._id);

  res.json(message);
};

const upvoteMessage = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const message = await Message.findById(req.params.messageId);

  // If does not exist
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  await message.upvote(req.user._id);

  res.json({ message: "Message upvoted successfully" });
};

const downvoteMessage = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const message = await Message.findById(req.params.messageId);

  // If does not exist
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  await message.downvote(req.user._id);

  res.json({ message: "Message downvoted successfully" });
};

const clearUpvoteThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const message = await Message.findById(req.params.messageId);

  // If does not exist
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  await message.clearUpvote(req.user._id);
  res.json({ message: "Message upvote removed successfully" });
};

const clearDownvoteThread = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const message = await Message.findById(req.params.messageId);

  // If does not exist
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }
  await message.clearDownvote(req.user._id);
  res.json({ message: "Message downvote removed successfully" });
};

const editMessage = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const { content: newContent } = req.body;

  const message = await Message.findById(req.params.messageId);

  // If does not exist
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  // Check if the user is not the author
  if (!message.author.equals(req.user._id)) {
    return res
      .status(403)
      .json({ message: "You are not allowed to edit other user's messages" });
  }

  await message.edit(newContent);

  res.json({ message: "Message edited successfully" });
};

const deleteMessage = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const message = await Message.findById(req.params.messageId);

  // If does not exist
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  // Check if the user is the author
  if (!message.author.equals(req.user._id)) {
    return res
      .status(403)
      .json({ message: "You are not allowed to delete other user's messages" });
  }

  await Message.findByIdAndRemove(req.params.messageId);

  res.json({ message: "Message deleted successfully" });
};

module.exports = {
  createMessage,
  upvoteMessage,
  downvoteMessage,
  clearUpvoteThread,
  clearDownvoteThread,
  editMessage,
  deleteMessage,
};
