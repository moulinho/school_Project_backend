const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  username: String,
  userImage: String,
  location: String,
  rating: Number,
  date: String,
  reviewTitle: String,
  reviewText: String,
});

const priceSchema = new Schema({
  value: Number,
  text: String,
});

const productSchema = new Schema({
  id: String,
  name: String,
  description: String,
  isInStock: Boolean,
  gender: String,
  category: String,
  availableSizes: [Number],
  rating: Number,
  reviews: [reviewSchema],
  totalReviewCount: Number,
  productionDate: Date,
  price: {
    current: priceSchema,
  },
  brandName: String,
  productCode: Number,
  imageUrl: String,
  additionalImageUrls: [String],
});

module.exports = mongoose.model('Product', productSchema);
