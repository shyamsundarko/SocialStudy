const { validate, body } = require("./validator");

const createThread = validate([
  body("title").isLength({ min: 1 }),
  body("content").isLength({ min: 1 }),
]);

const editThread = validate([
  body("title").isLength({ min: 1 }).optional(),
  body("content").isLength({ min: 1 }).optional(),
]);

module.exports = { createThread, editThread };
