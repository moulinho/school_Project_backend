const express = require("express");
const router = express.Router();
const db = require("../database");

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

// Get all users
router.get("/", async (req, res) => {
  // const sql = "SELECT * FROM Customers";
  const countQuery = `SELECT COUNT(*) AS total FROM Customers WHERE role = 'customer'`;

  try {
    // const result = await query(sql);
    const totalResult = await query(countQuery);
    const totalItems = totalResult[0].total;

    // const processedCustomers = [];
    // if (result < totalItems) {
    // for (let index = 0; index < result.length; index++) {
    //   let customer = result[index];
    //   processedCustomers.push(customer);
    // }
    // }

    res.status(200).json({
      total: totalItems,
      // user: processedCustomers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
