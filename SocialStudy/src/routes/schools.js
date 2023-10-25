const express = require("express");
const router = express.Router();

const SchoolsController = require("../controllers/schools");

router.get("/", SchoolsController.getAllSchools);

module.exports = router;
