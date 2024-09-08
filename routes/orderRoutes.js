const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../database");
const id = uuidv4();
const Order = require("../models/Order");

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

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders by User conect
router.get("/OrderHistory/:email", async (req, res) => {
  const customer_email = req.params.email;

  const page = parseInt(req.query.page) || 1; // Current page (default is 1)
  const pageSize = 10;

  const offset = (page - 1) * pageSize;

  try {
    const sql =
      "SELECT * FROM OrderHistory WHERE customer_email = ? LIMIT ? OFFSET ?";

    const history = await query(sql, [customer_email, pageSize, offset]); // Execute the query with LIMIT and OFFSET

    // Optionally, get the total count of products for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM Products`;
    const totalResult = await query(countQuery, [customer_email]);
    const totalItems = totalResult[0].total;

    res.status(200).json({
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      history,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  // console.log("req", req.body);

  const query =
    "INSERT INTO Orders (id, customer_id, status, total_price, shipping_address) VALUES (? ,? ,? ,? ,?)";

  const { customer_id, status, total_price, shipping_address } = req.body;

  console.log("Orders", req.body);

  db.execute(
    query,
    [id, customer_id, status, total_price, shipping_address],
    (err, results) => {
      if (err) {
        // console.error('SQL Error:', err);
        if (err.sqlMessage.includes("Duplicate")) {
          return res
            .status(500)
            .json({ message: "La commande est déjà effectué" });
        }
      }
      res.status(201).json({
        message: "Oder created",
        id: id,
      });
    }
  );
});

router.post("/orderItems", async (req, res) => {
  const items = req.body;
  // console.log("items", items);

  // Validate request body
  if (items.length === 0) {
    return res
      .status(400)
      .json({ error: "Request body must be a non-empty array" });
  }

  const queryOrderItems =
    " INSERT INTO OrderItems (id, order_id, product_id, quantity, price_per_unit)  VALUES ?";

  const values = items.map((item) => {
    const idOrderItem = uuidv4();

    return [idOrderItem, id, item.id, item.quantity, item.price];
  });
  // console.log("values", values);

  try {
    // Attempt to execute the query
    const result = await query(queryOrderItems, [values]);
    // Send a success response
    res.status(201).json({ message: "Order items created", result });
  } catch (error) {
    // Handle any errors
    if (!res.headersSent) {
      // Ensure headers are not already sent
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

module.exports = router;
