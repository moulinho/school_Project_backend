const express = require("express");
const router = express.Router();
const db = require("../database");

// Get all products
router.get("/", (req, res) => {
  const sql = "SELECT * FROM Products";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Get all products by id

// Get products categories
router.get("/categories", (req, res) => {
  const query = "SELECT * FROM Categories";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // console.log("results", results);

    res.json(results);
  });
});

// Get products by category id
router.get("/categories/:id", (req, res) => {
  const categoryId = req.params.id;

  const query = "SELECT * FROM Products WHERE category_id = ?";

  db.query(query, [categoryId], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Get all Supplier
router.get("/suppliers", (req, res) => {
  const sql = "SELECT * FROM Suppliers";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// GET product by ID
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM Products WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results[0]);
  });
});

// Get products by category name
router.get("/products/by-category/:categoryName", (req, res) => {
  const categoryName = req.params.categoryName;

  const query = `
      SELECT p.*
      FROM Products p
      JOIN Categories c ON p.category_id = c.id
      WHERE c.name = ?
  `;

  db.query(query, [categoryName], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Add a new product
router.post("/", (req, res) => {
  const {
    id,
    name,
    description,
    price,
    stock_quantity,
    unit,
    supplier_id,
    category_id,
  } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Check for undefined or null values
  if (
    !name ||
    !description ||
    !stock_quantity ||
    !price ||
    !unit ||
    !supplier_id ||
    !category_id ||
    !imageUrl
  ) {
    return res.status(400).json({ message: "Tous les champs son require" });
  }

  // Quantity et Prix doivent être un entier
  const quantityNumber = parseInt(stock_quantity, 10);
  const prixNumber = parseFloat(price);
  if (isNaN(quantityNumber) || isNaN(prixNumber)) {
    return res
      .status(400)
      .json({ message: "Quantity et Prix doivent être un entier" });
  }

  const query =
    "INSERT INTO Products (id, name, description, price, category_id, stock_quantity, unit, supplier_id, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.execute(
    query,
    [
      id,
      name,
      description,
      prixNumber,
      category_id,
      quantityNumber,
      unit,
      supplier_id,
      imageUrl,
    ],
    (err, results) => {
      if (err) {
        // console.error('SQL Error:', err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      console.table(results);
      res.status(201).json({
        message: "Product created",
        // product: { id: results.insertId, title, description, status, quantity: quantityNumber, prix: prixNumber, imageUrl }
      });
    }
  );
});

module.exports = router;
