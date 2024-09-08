const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../database");
const id = uuidv4();

// Helper function to execute SQL queries
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

// Decrease quatity product
router.post("/decrease", async (req, res) => {
  const items = req.body;

  if (items && items.length > 0) {
    try {
      // Execute all queries
      for (const item of items) {
        const queryInventory = `
        UPDATE Inventory 
        SET quantity = quantity - ?
        WHERE product_id = ?;
      `;
        await query(queryInventory, [item.quantity, item.id]);

        const queryProduct = `
        UPDATE Products
        SET stock_quantity = stock_quantity - ?
        WHERE id = ?;
        `;
        await query(queryProduct, [item.quantity, item.id]);
      }

      res
        .status(200)
        .json({ message: "Stock quantities updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: "No items provided" });
  }
});

// Increase quatity product
router.post("/increat", async (req, res) => {
  const items = req.body;

  if (items && items.length > 0) {
    try {
      // Execute all queries
      for (const item of items) {
        const queryInventory = `
        UPDATE Inventory 
        SET quantity = quantity + ?
        WHERE product_id = ?;
      `;
        await query(queryInventory, [item.quantity, item.id]);

        const queryProduct = `
        UPDATE Products
        SET stock_quantity = stock_quantity + ?
        WHERE id = ?;
        `;
        await query(queryProduct, [item.quantity, item.id]);
      }

      res
        .status(200)
        .json({ message: "Stock quantities updated successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(400).json({ message: "No items provided" });
  }
});
// Get all orders by User conect
router.get("/:id", async (req, res) => {
  try {
    const query = "";
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
