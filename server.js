import express from "express";
import morgan from "morgan";
import mongoose from 'mongoose';
import config from "config";

var app = express();

require("./models").connect(config.dbUri);


app.use(morgan("dev"));

app.get("/", (req, res) => {
  var name = "Donatas";
  res.json("My name is " + name);
});

app.get("/cat", (req, res) => {
  res.json("Catwoman");
});

app.listen(config.port, config.host, () => {
  console.log(
    `Server is running on http://localhost:${config.port} or http://127.0.0.1:${config.port}`
  );
});
