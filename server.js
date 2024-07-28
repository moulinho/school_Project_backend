const express = require("express");
// const mongoose = require("mongoose");

const cors = require("cors");
// const routes = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("node:path");
// dotenv.config();
const db = require("./database");

const app = express();
const router = express.Router();

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
    console.log("file", file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
// app.use("/api/products", upload.single('image'), require("./routes/productRoutes"));

app.post("/api/products", upload.single("image"), (req, res) => {
  const { title, description, status, quantity, prix, image } = req.body;
  const imageUrl = image ? `/uploads/${image.filename}` : null;

  // Check for undefined or null values
  // if (!title || !description || status === undefined || !quantity || !prix || !imageUrl) {
  //   return res.status(400).json({ message: 'All fields are required' });
  // }

  // Ensure quantity and prix are numbers
  const quantityNumber = parseInt(quantity, 10);
  const prixNumber = parseFloat(prix);
  // if (isNaN(quantityNumber) || isNaN(prixNumber)) {
  //   return res.status(400).json({ message: 'Quantity and Prix must be numbers' });
  // }

  const query =
    "INSERT INTO product (title, description, status, quantity, prix, imageUrl) VALUES (?, ?, ?, ?, ?, ?)";
  db.execute(
    query,
    [title, description, status, quantityNumber, prixNumber, imageUrl],
    (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(201).json({
        message: "Product created",
        product: {
          id: results.insertId,
          title,
          description,
          status,
          quantity: quantityNumber,
          prix: prixNumber,
          imageUrl,
        },
      });
    }
  );
});
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
