const express = require("express");
// const mongoose = require("mongoose");
const mysql = require("mysql2");

const cors = require("cors");
const dotenv = require("dotenv");
// const routes = express.Router();
const bodyParser = require("body-parser");

dotenv.config();

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
// app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Routes
app.use(
  "/api/products",
  router.post("/", (req, res) => {
    const newProduct = req.body;
    const sql = "INSERT INTO 	Product SET ?";
    db.query(sql, newProduct, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(result);
    });
  })
);

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// module.exports = db;
