const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      index: true,
      set: function (val) {
        return val.toLowerCase();
      },
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      index: true,
      set: function (val) {
        return val.toLowerCase();
      },
    },
    password: {
      type: String,
      required: true,
      // Hash password before setting
      set: function (val) {
        const SALT_ROUNDS = 10;
        return bcrypt.hashSync(val, SALT_ROUNDS);
      },
    },
    starredForums: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Forum",
        required: true,
      },
    ],
    // TODO: Add major and year of study
    bio: String,
    // TODO: Provide default avatar, resolve type to be either Buffer or String
    // avatar: Buffer,
    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.starForum = async function (forumId) {
  await User.updateOne(
    { _id: this._id, starredForums: { $ne: forumId } },
    { $push: { starredForums: forumId } }
  );
};

userSchema.methods.unstarForum = async function (forumId) {
  await User.updateOne(
    { _id: this._id, starredForums: { $eq: forumId } },
    { $pull: { starredForums: forumId } }
  );
};

userSchema.query.byCredential = function (credential) {
  return this.or([{ username: credential }, { email: credential }]);
};

// Check for field uniqueness
userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = { User, userSchema };
