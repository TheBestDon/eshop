import Cart from "../models/cart";

module.exports = (req, res, next) => {
  if (req.user) {
    var total = 0;
    Cart.findOne({ owner: req.user._id }, cart => {
      if (cart) {
        for (var i = 0; i < cart.items.length; i++) {
          total += cart.items[i].quantity;
        }
        res.locals.cart = total;
      } else {
        res.locals.cart = 0;
      }
      next();
    }).catch(console.error);
  } else {
    next();
  }
};
