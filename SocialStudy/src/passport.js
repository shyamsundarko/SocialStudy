const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("./models/User");

const fields = {
  usernameField: "credential",
  passwordField: "password",
};

const verify = (credential, password, done) => {
  User.findOne({ $or: [{ username: credential }, { email: credential }] })
    .then((user) => {
      // No user is found
      if (!user) {
        return done(null, false);
      }

      const isValid = user.comparePassword(password);

      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch((err) => {
      done(err);
    });
};

passport.use(new LocalStrategy(fields, verify));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      const userInformation = {
        _id: user._id,
        username: user.username,
        email: user.email,
        admin: user.admin,
      };
      done(null, userInformation);
    })
    .catch((err) => done(err));
});
