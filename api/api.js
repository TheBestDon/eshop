var router = require("express").Router();
import faker from "faker";
import Category from "../models/category";
import Product from "../models/product";

router.get("/:name", (req, res) => {
  Category.findOne({ name: req.params.name })
    .then(category => {
      for (var i = 0; i < 30; i++) {
        var product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();

        product.save();
      }
    })
    .catch(console.error);

  res.json({ message: "Success" });
});

module.exports = router;
