const { School } = require("../models/School");

const getAllSchools = async (req, res) => {
  const schools = await School.find({});

  res.json(schools);
};

module.exports = {
  getAllSchools,
};
