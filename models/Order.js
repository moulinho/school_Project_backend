const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  id: String,
  title: String,
  image: String,
  rating: Number,
  price: Number,
  brandName: String,
  amount: Number,
  selectedSize: String,
  isInWishList: Boolean,
});

const orderSchema = new Schema({
  userId: String,
  orderStatus: String,
  subtotal: Number,
  cartItems: [cartItemSchema],
  id: String,
});

module.exports = mongoose.model('Order', orderSchema);
