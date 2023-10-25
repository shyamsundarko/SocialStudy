const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    thread: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Thread",
      index: true,
      required: true,
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

messageSchema.methods.upvote = async function (userId) {
  // Remove downvote (if applicable)
  await Message.updateOne({ _id: this._id }, { $pull: { downvotes: userId } });

  // Add upvote
  await Message.updateOne(
    { _id: this._id, upvotes: { $ne: userId } },
    { $push: { upvotes: userId } }
  );
};

messageSchema.methods.downvote = async function (userId) {
  // Remove upvote (if applicable)
  await Message.updateOne({ _id: this._id }, { $pull: { upvotes: userId } });

  // Add downvote
  await Message.updateOne(
    { _id: this._id, downvotes: { $ne: userId } },
    { $push: { downvotes: userId } }
  );
};

messageSchema.methods.clearUpvote = async function (userId) {
  await Message.updateOne({ _id: this._id }, { $pull: { upvotes: userId } });
};

messageSchema.methods.clearDownvote = async function (userId) {
  await Message.updateOne({ _id: this._id }, { $pull: { downvotes: userId } });
};

messageSchema.methods.edit = async function (newContent) {
  this.content = newContent;
  this.edited = true;
  await this.save();
};

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message, messageSchema };
