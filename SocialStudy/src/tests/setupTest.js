const setupApp = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");

const clearDB = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
    await collection.dropIndexes();
  }
};

module.exports = () => {
  let client, app;
  beforeAll(async () => {
    app = await setupApp();
    await clearDB();
  }, 20000);

  beforeEach(async () => {
    client = supertest.agent(app);
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await clearDB();
    await mongoose.connection.close();
  });

  return () => client;
};
