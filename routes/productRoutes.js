// const express = require("express");
// const bodyParser = require("body-parser");
// const app = express();

// const router = express.Router();
// const Product = require("../models/Product");
// app.use("/api", router);

// // body-parser
// router.use(bodyParser.urlencoded({ extended: false }));
// router.use(bodyParser.json());
// // Get all products
// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Add a new product
// router.post("/", async (req, res) => {
//   const product = new Product(req.body);
//   try {
//     const newProduct = await product.save();
//     res.status(201).json(newProduct);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../server");
// console.log("db", db);

// Get all products
router.get("/", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Add a new product
router.post("/", (req, res) => {
  const newProduct = req.body;
  const sql = "INSERT INTO products SET ?";
  db.query(sql, newProduct, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(result);
  });
});

module.exports = router;
