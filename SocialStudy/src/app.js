const express = require("express");
const passport = require("passport");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const AuthRouter = require("./routes/auth");
const UsersRouter = require("./routes/users");
const MessagesRouter = require("./routes/messages");
const ForumsRouter = require("./routes/forums");
const ThreadsRouter = require("./routes/threads");
const SchoolsRouter = require("./routes/schools");
const setupDb = require("./database");

// Load environment variables
require("dotenv").config();

const setupApp = async () => {
  const app = express();

  // TODO: Add CSRF

  if (process.env.NODE_ENV !== "production") {
    app.use(cors());
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await setupDb(app);

  // Passport
  require("./passport");
  app.use(passport.initialize());
  app.use(passport.session());

  // Logger
  if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
  } else if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Routers
  app.use("/api/auth", AuthRouter);
  app.use("/api/users", UsersRouter);
  app.use("/api/messages", MessagesRouter);
  app.use("/api/forums", ForumsRouter);
  app.use("/api/threads", ThreadsRouter);
  app.use("/api/schools", SchoolsRouter);

  app.get("/api", (req, res) => {
    res.send("Index");
  });

  // Serve frontend build files
  app.use(express.static(path.join(__dirname, "../socialstudy", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../socialstudy", "build", "index.html"));
  });

  return app;
};

module.exports = setupApp;
