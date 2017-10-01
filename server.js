import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import config from "./config/secret";
import ejs from "ejs";
import ejsMate from "ejs-mate";
import session from "express-session";
import cookieParser from "cookie-parser";
import flash from "express-flash";
import passport from "passport";
const MongoStore = require("connect-mongo")(session);

var User = require("./models/user");
var Category = require("./models/category");

var app = express();

mongoose.Promise = require("bluebird");
mongoose.connect(
  config.dbUri,
  {
    useMongoClient: true
  },
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to database");
    }
  }
);

app.use(express.static("public"));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: config.secretKey,
    store: new MongoStore({ url: config.dbUri, autoReconect: true })
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

var mainRoutes = require("./routes/main");
var userRoutes = require("./routes/user");
var adminRoutes = require("./routes/admin");
var apiRoutes = require("./api/api");

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use("/api", apiRoutes);

app.listen(config.port, config.host, () => {
  console.log(
    `Server is running on http://localhost:${config.port} or http://127.0.0.1:${config.port}`
  );
});
