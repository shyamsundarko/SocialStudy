const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
});

// TODO: Handle on delete effect

schoolSchema.plugin(uniqueValidator);

const School = mongoose.model("School", schoolSchema);

module.exports = { School, schoolSchema };
