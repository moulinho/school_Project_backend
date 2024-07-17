const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();

//cors
app.use(cors());

// console.log("dotenv", process.env.DB);
// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(
  process.env.DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
