var router = require("express").Router();
import User from "../models/user";
import Product from "../models/product";

Product.createMapping((err, mapping) => {
  if (err) {
    console.log("error creating mapping");
    console.log(err);
  } else {
    console.log("Mapping created");
    console.log(mapping);
  }
});

var stream = Product.synchronize();
var count = 0;

stream.on("data", () => {
  count++;
});

stream.on("close", () => {
  console.log("Indexed " + count + " documents");
});

stream.on("error", err => {
  console.log(err);
});

router.post("/search", (req, res, next) => {
  res.redirect("/search?q=" + req.body.q);
});

router.get("/search", (req, res, next) => {
  if (req.query.q) {
    Product.search(
      {
        query_string: { query: req.query.q }
      },
      (err, results) => {
        results: if (err) return next(err);
        var data = results.hits.hits.map(hit => {
          return hit;
        });
        res.render("main/search-result", {
          query: req.query.q,
          data: data
        });
      }
    );
  }
});

router.get("/", (req, res) => {
  res.render("main/home");
});

router.get("/about", (req, res) => {
  res.render("main/about");
});

router.get("/products/:id", (req, res, next) => {
  Product.find({ category: req.params.id })
    .populate("category")
    .exec((err, products) => {
      if (err) return next(err);
      res.render("main/category", {
        products: products
      });
    });
});

router.get("/product/:id", (req, res, next) => {
  Product.findById({ _id: req.params.id }, (err, product) => {
    if (err) return next(err);
    res.render("main/product", {
      product
    });
  });
});

module.exports = router;
