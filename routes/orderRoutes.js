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
router.get("/order/:customerId", async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const query = `SELECT 
        p.*,
        o.id AS orderId,
        o.status,
        oi.product_id,
        oi.title AS productTitle,
        oi.price AS productPrice,
        oi.amount AS quantity,
        c.id AS customerId,
        c.firstName AS customerFirstName,
        c.lastName AS customerLastName,
        c.email AS customerEmail
      FROM 
        Orders o
      JOIN 
        OrderItems oi ON o.id = oi.order_id
      JOIN 
        Products p ON oi.product_id = p.id
      JOIN 
        Customers c ON o.customer_id = c.id
      WHERE 
        c.id = ?
      ORDER BY 
        o.id ASC; `;

    // Execute the query
    db.query(query, [customerId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(200).json(results);
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all orders by User conect
router.get("/OrderItems/:id", async (req, res) => {
  try {
    const sql = "SELECT * FROM OrderItems WHERE customer_id = ?";
    const countQuery = `SELECT COUNT(*) AS total FROM Orders`;
    const totalResult = await query(countQuery);
    const totalItems = totalResult[0].total;

    const results = await query(sql, [req.params.id]);

    res.status(200).json({ results, totalItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  // console.log("req", req.body);

  const query =
    "INSERT INTO Orders (id, customer_id, status, total_price, shipping_address) VALUES (? ,? ,? ,? ,?)";

  const { customer_id, status, total_price, shipping_address } = req.body;

  // console.log("req.body", req.body);

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
