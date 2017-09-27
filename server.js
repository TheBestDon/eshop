import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import config from "config";
import ejs from "ejs";
import ejsMate from "ejs-mate";

var User = require("./models/user");

var app = express();

require("./models").connect(config.dbUri);

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.post("/create-user", (req, res) => {
  var user = new User();

  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;

  user.save((err, user) => {
    if (err) return next(err);

    res.json("Succesfully created user!");
  });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(config.port, config.host, () => {
  console.log(
    `Server is running on http://localhost:${config.port} or http://127.0.0.1:${config.port}`
  );
});
