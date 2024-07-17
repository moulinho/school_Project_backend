const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  id: Number,
  title: String,
  image: String,
  rating: Number,
  price: Number,
  brandName: String,
  amount: Number,
  selectedSize: String,
  isInWishList: Boolean,
});

const userSchema = new Schema({
  id: String,
  name: String,
  lastname: String,
  email: String,
  phone: String,
  address: String,
  password: String,
  userWishlist: [wishlistSchema],
});

module.exports = mongoose.model('User', userSchema);
