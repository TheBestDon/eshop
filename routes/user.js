var router = require("express").Router();
var User = require("../models/user");
var Cart = require("../models/cart");
var passport = require("passport");
var passportConf = require("../config/passport");

router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("accounts/login", { message: req.flash("loginMessage") });
});

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/profile", passportConf.isAuthenticated, (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .populate("history.item")
    .exec((err, foundUser) => {
      if (err) return next(err);

      res.render("accounts/profile", { user: foundUser });
    });
});

router.get("/signup", (req, res, next) => {
  res.render("accounts/signup", {
    errors: req.flash("errors")
  });
});

router.post("/signup", (req, res, next) => {
  var user = new User();

  user.profile.firstName = req.body.firstName;
  user.profile.lastName = req.body.lastName;
  user.email = req.body.email;
  user.password = req.body.password;
  user.profile.picture = user.gravatar();

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (existingUser) {
      req.flash("errors", "Account with that email address already exists");
      return res.redirect("/signup");
    } else {
      user
        .save()
        .then(user => {
          var cart = new Cart();
          cart.owner = user._id;
          cart.save().then(
            req.logIn(user, () => {
              res.redirect("/profile");
            })
          );
        })
        .catch(console.error);
    }
  });
});

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

router.get("/edit-profile", (req, res, next) => {
  res.render("accounts/edit-profile", { message: req.flash("success") });
});

router.post("/edit-profile", (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return next(err);

    if (req.body.firstName) user.profile.firstName = req.body.firstName;
    if (req.body.lastName) user.profile.lastName = req.body.lastName;
    if (req.body.address) user.address = req.body.address;

    user.save(err => {
      if (err) return next(err);
      req.flash("success", "Successfully Edited your profile");
      return res.redirect("/profile");
    });
  });
});

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/login"
  })
);

module.exports = router;
