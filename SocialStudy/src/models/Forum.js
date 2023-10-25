const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const forumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    school: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "School",
      index: true,
    },
    threads: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Thread",
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

forumSchema.methods.edit = async function (newDescription) {
  if (newDescription !== undefined) this.description = newDescription;
  this.edited = true;
  await this.save();
};

forumSchema.methods.addThread = async function (threadId) {
  // Add new threadId to the threads array
  await Forum.findByIdAndUpdate(this._id, { $push: { threads: threadId } });
};

forumSchema.plugin(uniqueValidator);

const Forum = mongoose.model("Forum", forumSchema);

module.exports = { Forum, forumSchema };
