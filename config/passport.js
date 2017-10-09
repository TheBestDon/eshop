var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
import secret from "./secret";
import User from "../models/user";
import Cart from "../models/cart";
import async from "async";

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//Middleware
passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(
            null,
            false,
            req.flash("loginMessage", "No user has been found")
          );
        }

        if (!user.comparePassword(password)) {
          return done(
            null,
            false,
            req.flash("loginMessage", "Oops! Wrong Password pal")
          );
        }
        return done(null, user);
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    secret.facebook,
    (token, refreshToken, profile, done) => {
      User.findOne({ facebook: profile.id }, (err, user) => {
        if (err) return done(err);

        if (user) {
          return done(null, user);
        } else {
          async.waterfall([
            function(callback) {
              var newUser = new User();
              newUser.email = profile._json.email;
              newUser.facebook = profile.id;
              newUser.tokens.push({ kind: "facebook", token: token });
              newUser.profile.name = profile.displayName;
              newUser.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;

              newUser.save(err => {
                if (err) throw err;

                callback(err, newUser);
              });
            },
            function(newUser) {
              console.log(newUser);

              var cart = new Cart();
              cart.owner = newUser._id;
              cart.save(err => {
                if (err) return done(err);
                return done(err, newUser);
              });
            }
          ]);
        }
      });
    }
  )
);

//custom function to validate
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
