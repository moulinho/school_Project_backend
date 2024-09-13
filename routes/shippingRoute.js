const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../database");
const id = uuidv4();
const { format } = require("date-fns");

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
router.get("/", async (req, res) => {
  const getShipping = "SELECT * FROM Shipping";

  try {
    // Attempt to execute the query
    const result = await query(getShipping);
    // Send a success response
    res.json(result);
  } catch (error) {
    // Handle any errors

    // console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const { order_id, shipping_method, shipping_cost, tracking_number } =
    req.body;
  const shippedDate = format(new Date(), "yyyy-MM-dd HH:mm:ss"); // Example shipped_date

  const sql = `
    INSERT INTO Shipping (id, order_id, shipping_method, shipping_cost, tracking_number, delivery_date) 
    VALUES (?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL 5 DAY) )
  `;

  try {
    const result = await query(sql, [
      id,
      order_id,
      shipping_method,
      shipping_cost,
      tracking_number,
      shippedDate,
    ]);
    res.status(201).json({ message: "Shipping record inserted", result });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
