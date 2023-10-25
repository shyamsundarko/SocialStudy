const { validate, body } = require("./validator");

const createMessage = validate([
  body("thread").exists(),
  body("content").isLength({ min: 1 }),
]);

const editMessage = validate([body("content").isLength({ min: 1 })]);

module.exports = { createMessage, editMessage };
