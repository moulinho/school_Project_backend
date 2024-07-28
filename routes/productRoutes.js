const express = require("express");
const router = express.Router();
const db = require("../database");

// Get all products
router.get("/", (req, res) => {
  const sql = "SELECT * FROM product";
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
  const { title, description, status, quantity, prix } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  console.log({ title, description, status, quantity, prix, imageUrl });

  // Check for undefined or null values
  if (
    !title ||
    !description ||
    status === undefined ||
    !quantity ||
    !prix ||
    !imageUrl
  ) {
    return res.status(400).json({ message: "Tous les champs son require" });
  }

  // Quantity et Prix doivent être un entier
  const quantityNumber = parseInt(quantity, 10);
  const prixNumber = parseFloat(prix);
  if (isNaN(quantityNumber) || isNaN(prixNumber)) {
    return res
      .status(400)
      .json({ message: "Quantity et Prix doivent être un entier" });
  }

  const query =
    "INSERT INTO product (title, description, status, quantity, prix, imageUrl) VALUES (?, ?, ?, ?, ?, ?)";
  db.execute(
    query,
    [title, description, status, quantityNumber, prixNumber, imageUrl],
    (err, results) => {
      if (err) {
        // console.error('SQL Error:', err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(201).json({
        message: "Product created",
        // product: { id: results.insertId, title, description, status, quantity: quantityNumber, prix: prixNumber, imageUrl }
      });
    }
  );
});

module.exports = router;
