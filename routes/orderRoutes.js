const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../database");
const id = uuidv4();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

// Get all Order
router.get("/", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acces refusé identifiant invalide." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    const userId = req.user.id;

    const sql = "SELECT * FROM Orders";
    const countQuery = `SELECT COUNT(*) AS total FROM Orders`;

    const result = await query(sql, [userId]);
    const totalResult = await query(countQuery);
    const totalItems = totalResult[0].total;

    const orders = [];
    // if (result < totalItems) {
    for (let index = 0; index < result.length; index++) {
      let order = result[index];
      orders.push(order);
    }
    // }

    res.status(200).json({
      total: totalItems,
      orders: orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders by User conect
router.get("/OrderHistory/:email", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acces refusé identifiant invalide." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    const userId = req.user.id;

    const customer_email = req.params.email;

    const page = parseInt(req.query.page) || 1; // Current page (default is 1)
    const pageSize = 10;

    const offset = (page - 1) * pageSize;

    const sql =
      "SELECT * FROM OrderHistory WHERE customer_email = ? LIMIT ? OFFSET ?";

    const history = await query(sql, [
      customer_email,
      pageSize,
      offset,
      userId,
    ]); // Execute the query with LIMIT and OFFSET

    // Optionally, get the total count of products for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM OrderHistory`;
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
    // console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all ordersHistory
router.get("/OrderHistory", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acces refusé identifiant invalide." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1; // Current page (default is 1)
    const pageSize = 10;

    const offset = (page - 1) * pageSize;
    const sql = "SELECT * FROM OrderHistory LIMIT ? OFFSET ?";

    const history = await query(sql, [pageSize, offset, userId]); // Execute the query with LIMIT and OFFSET

    // Optionally, get the total count of products for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM Orders`;
    const totalResult = await query(countQuery);
    const totalItems = totalResult[0].total;

    res.status(200).json({
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      history,
    });
  } catch (err) {
    // console.error("Error:", err);
    res.status(500).json({ error });
  }
});

// Get all orders Pedding
router.get("/orderPedding", async (req, res) => {
  try {
    // const pageSize = 10;
    // const status = "en attente" || "pending";
    // Execute the query with LIMIT and OFFSET

    // Optionally, get the total count of products for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM Orders WHERE status = 'en attente' OR status = 'pending' `;
    const totalResult = await query(countQuery);
    const totalItems = totalResult[0].total;
    // console.log("totalResult", totalResult);

    res.status(200).json({
      totalItems,
    });
  } catch (err) {
    // console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all orders shipped
router.get("/orderShipped", async (req, res) => {
  try {
    // const pageSize = 10;
    // Execute the query with LIMIT and OFFSET

    // Optionally, get the total count of products for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM Orders WHERE status = 'expédié' OR status = 'shipped' `;
    const totalResult = await query(countQuery);
    const totalItems = totalResult[0].total;

    res.status(200).json({
      totalItems,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all orders refuse
router.get("/orderRefuse", async (req, res) => {
  try {
    // const pageSize = 10;
    // Execute the query with LIMIT and OFFSET

    // Optionally, get the total count of products for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM Orders WHERE status = 'Réfusé'`;
    const totalResult = await query(countQuery);
    const totalItems = totalResult[0].total;

    res.status(200).json({
      totalItems,
    });
  } catch (err) {
    // console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update status orders
router.put("/orderStatus", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acces refusé identifiant invalide." });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    const userId = req.user.id;

    const { order_id, status } = req.body;
    // const pageSize = 10;
    // Execute the query with LIMIT and OFFSET

    // Optionally, get the total count of products for pagination metadata
    const sql = `UPDATE Orders SET status = ? WHERE id = ?`;
    const result = await query(sql, [status, order_id, userId]);
    // const totalItems = totalResult[0].total;
    // console.log("result", result);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Order status updated successfully." });
    } else {
      res.status(404).json({ message: "Order not found." });
    }
  } catch (err) {
    // console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/orderItems", async (req, res) => {
  const { cartItems, order_id } = req.body;

  // Validate request body
  if (cartItems?.length === 0 || cartItems?.length === undefined) {
    return res
      .status(400)
      .json({ error: "Request body must be a non-empty array" });
  }

  const queryOrderItems =
    " INSERT INTO OrderItems (id, order_id, product_id, quantity, price_per_unit)  VALUES ?";

  const values = cartItems.map((item) => {
    if (item && order_id) {
      const idOrderItem = uuidv4();

      return [idOrderItem, order_id, item.id, item.quantity, item.price];
    }
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
      // console.error(error);
      res.status(500).json({ error });
    }
  }
});

// Create a new order
router.post("/", async (req, res) => {
  // console.log("req", req.body);
  const ids = uuidv4();

  const query =
    "INSERT INTO Orders (id, customer_id,total_price, status,  shipping_address) VALUES (? ,? ,? ,? ,?)";

  const { customer_id, total_price, status, shipping_address } = req.body;

  db.execute(
    query,
    [ids, customer_id, total_price, status, shipping_address],
    (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
        if (err.sqlMessage.includes("Duplicate")) {
          return res
            .status(500)
            .json({ message: "La commande est déjà effectué" });
        }
      }
      res.status(201).json({
        message: "Oder created",
        id: ids,
      });
    }
  );
});

module.exports = router;
