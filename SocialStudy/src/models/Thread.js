const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    forum: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Forum",
      required: true,
      index: true,
    },
    upvotes: [
      {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
      },
    ],
    downvotes: [
      {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "User",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.SchemaTypes.ObjectID,
        ref: "Message",
        required: true,
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

threadSchema.methods.upvote = async function (userId) {
  // Remove downvote
  await Thread.updateOne({ _id: this._id }, { $pull: { downvotes: userId } });

  // Add upvote
  await Thread.updateOne(
    { _id: this._id, upvotes: { $ne: userId } },
    { $push: { upvotes: userId } }
  );
};

threadSchema.methods.downvote = async function (userId) {
  // Remove upvote
  await Thread.updateOne({ _id: this._id }, { $pull: { upvotes: userId } });

  // Add downvote
  await Thread.updateOne(
    { _id: this._id, downvotes: { $ne: userId } },
    { $push: { downvotes: userId } }
  );
};

threadSchema.methods.clearUpvote = async function (userId) {
  // Remove upvote
  await Thread.updateOne({ _id: this._id }, { $pull: { upvotes: userId } });
};

threadSchema.methods.clearDownvote = async function (userId) {
  // Remove downvote
  await Thread.updateOne({ _id: this._id }, { $pull: { downvotes: userId } });
};

threadSchema.methods.edit = async function (newTitle, newContent) {
  if (newTitle !== undefined) this.title = newTitle;
  if (newContent !== undefined) this.content = newContent;
  this.edited = true;
  await this.save();
};

threadSchema.methods.addMessage = async function (messageId) {
  // Add new messageId to the messages array
  await Thread.findByIdAndUpdate(this._id, { $push: { messages: messageId } });
};

const Thread = mongoose.model("Thread", threadSchema);

module.exports = { Thread, threadSchema };
