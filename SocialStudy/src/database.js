const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const session = require("express-session");

const setupDb = async (app) => {
  // Live DB as default
  let MONGODB_URI = process.env.DB_URI;

  // Use in-memory DB for testing
  if (process.env.NODE_ENV === "test") {
    const { MongoMemoryServer } = require("mongodb-memory-server");

    const mongod = await MongoMemoryServer.create();
    MONGODB_URI = mongod.getUri();
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${process.env.NODE_ENV} database`);

  // Create store for sessions
  const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions",
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: sessionStore,
      cookie: {
        // httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      },
    })
  );
};

module.exports = setupDb;
