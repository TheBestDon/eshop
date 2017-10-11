var router = require("express").Router();
import User from "../models/user";
import Product from "../models/product";
import Cart from "../models/cart";
import config from "../config/secret";

var stripe = require("stripe")(config.keySecret);

const paginate = (req, res, next) => {
  var perPage = 9;
  var page = req.params.page;

  Product.find()
    .skip(perPage * page)
    .limit(perPage)
    .populate("category")
    .exec((err, products, next) => {
      if (err) return next(err);
      Product.count().exec((err, count) => {
        if (err) return next(err);
        res.render("main/product-main", {
          products: products,
          pages: count / perPage
        });
      });
    });
};

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

router.get("/cart", (req, res) => {
  Cart.findOne({ owner: req.user._id })
    .populate("items.item")
    .exec((err, foundCart) => {
      res.render("main/cart", {
        foundCart: foundCart,
        message: req.flash("remove")
      });
    })
    .catch(console.error);
});

router.post("/remove", (req, res, next) => {
  Cart.findOne({ owner: req.user._id }, (err, foundCart) => {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart
      .save()
      .then(found => {
        req.flash("remove", "Succesfully removed");
        res.redirect("/cart");
      })
      .catch(console.error);
  });
});

router.post("/product/:product_id", (req, res) => {
  Cart.findOne({ owner: req.user._id }, (err, cart) => {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save().then(res.redirect("/cart"));
  }).catch(console.error);
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

router.get("/", (req, res, next) => {
  if (req.user) {
    paginate(req, res, next);
  } else {
    res.render("main/home");
  }
});

router.get("/page/:page", (req, res, next) => {
  paginate(req, res, next);
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

router.post("/payment", (req, res) => {
  var token = req.body.stripeToken;
  let amount = Math.round(req.body.stripeMoney * 100);

  stripe.customers
    .create({
      email: req.body.email,
      card: req.body.id,
      source: token
    })
    .then(customer =>
      stripe.charges.create({
        amount,
        description: "Sample Charge",
        currency: "usd",
        customer: customer.id
      })
    )
    .then(charge =>
      Cart.findOne({ owner: req.user._id }, (err, cart) => {
        User.findOne({ _id: req.user._id }, (err, user) => {
          if (user) {
            for (var i = 0; i < cart.items.length; i++) {
              user.history.push({
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }

            user
              .save((err, user, next) => {
                if (err) return next(err);
              })
              .then(user => {
                Cart.update(
                  { owner: user._id },
                  { $set: { items: [], total: 0 } },
                  (err, updated) => {
                    if (updated) {
                      res.redirect("profile");
                    }
                  }
                );
              });
          }
        });
      })
    )
    .catch(err => {
      console.log("Error:", err);
      res.status(500).send({ error: "Purchase Failed" });
    });
});

module.exports = router;
