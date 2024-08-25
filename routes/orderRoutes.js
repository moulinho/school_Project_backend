const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const Order = require("../models/Order");
const db = require("../database");

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  const query =
    "INSERT INTO Orders (id, customer_id, status, total_price, shipping_address) VALUES (? ,? ,? ,? ,?)";
  const { customer_id, status, total_price, shipping_address } = req.body;
  const id = uuidv4();
  db.execute(
    query,
    [id, customer_id, status, total_price, shipping_address],
    (err, results) => {
      if (err) {
        // console.error('SQL Error:', err);
        return res.status(500).json({ message: "server error", error: err });
      }
      res.status(201).json({
        message: "Oder created",
      });
    }
  );

  // try {
  //   const newOrder = await order.save();
  //   res.status(201).json(newOrder);
  // } catch (err) {
  //   res.status(400).json({ message: err.message });
  // }
});

module.exports = router;
