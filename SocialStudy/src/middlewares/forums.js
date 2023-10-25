const { validate, body } = require("./validator");

const createForum = validate([
  body("name").exists(),
  body("description").exists(),
  body("school").exists(),
]);

module.exports = { createForum };
