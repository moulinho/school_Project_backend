const express = require("express");
// const mongoose = require("mongoose");

const cors = require("cors");
// const routes = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
// dotenv.config();
const db = require("./database");

const app = express();

const PORT = process.env.PORT || 5000;

// Database connection
// mongoose
//   .connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error(err));
  
// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
app.use(
  "/api/products",
  upload.single("image"),
  require("./routes/productRoutes")
);

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/auths", require("./routes/authRoutes"));
app.use("/api/paiment", require("./routes/paiementRoute"));
app.use("/api/shipping", require("./routes/shippingRoute"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
