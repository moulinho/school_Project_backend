const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../database");
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

// Get all Supplier
router.get("/suppliers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page (default is 1)
    const pageSize = 12;

    // Calculate the offset
    const offset = (page - 1) * pageSize;

    const sql = "SELECT * FROM Suppliers";
    const suppliers = await query(sql, [offset]);
    const countQuery = `SELECT COUNT(*) AS total FROM Suppliers`;
    // console.log("countQuery", countQuery);

    const totalResult = await query(countQuery);
    const total = totalResult[0].total;
    res.status(200).json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      suppliers,

    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});
// Get all products
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page (default is 1)
    const pageSize = 12;

    // Calculate the offset
    const offset = (page - 1) * pageSize;
    const sql = "SELECT * FROM Products LIMIT 12 OFFSET ?";
    const countQuery = `SELECT COUNT(*) AS total FROM Products`;

    const products = await query(sql, [offset]); // Execute the query with LIMIT and OFFSET
    const totalResult = await query(countQuery);
    // Optionally, get the total count of products for pagination metadata
    // console.log("countQuery", countQuery);

    const totalItems = totalResult[0].total;
    res.status(200).json({
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      products,
    });
  } catch (error) {
    console.log("error", error);
  }

  // console.log("products", products);
});

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
router.get("/categories/:id", async (req, res) => {
  const categoryId = req.params.id;

  const page = parseInt(req.query.page) || 1; // Current page (default is 1)
  const pageSize = 12;

  // Calculate the offset
  const offset = (page - 1) * pageSize;

  const sql = "SELECT * FROM Products WHERE category_id = ? LIMIT ? OFFSET ?";

  const products = await query(sql, [categoryId, pageSize, offset]); // Execute the query with LIMIT and OFFSET

  // Optionally, get the total count of products for pagination metadata
  const countQuery = `SELECT COUNT(*) AS total FROM Products`;
  const totalResult = await query(countQuery, [categoryId]);
  const totalItems = totalResult[0].total;
  res.status(200).json({
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    products,
  });
});

router.get("/:name", (req, res) => {
  const name = req.query.name; // Récupère le paramètre aliment depuis le front end

  const query = `
            SELECT *
            FROM Products
            WHERE LOWER(name) LIKE LOWER(CONCAT('%', ?, '%'))
        `;

  db.query(query, [req.params.name, name], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // console.log("results", results);

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
  const id = uuidv4();

  const {
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
      .json({ message: "Quantity et Prix doivent être des entiers" });
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
        return res.status(500).json({ message: "server error", error: err });
      }
      res.status(201).json({
        message: "Product created",
        // product: { id: results.insertId, title, description, status, quantity: quantityNumber, prix: prixNumber, imageUrl }
      });
    }
  );
});

// post Supplier
router.post("/suppliers", async (req, res) => {
  const { name, contact_person, phone, email, address, city, country } =
    req.body;

  const id = uuidv4();

  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acces refusé identifiant invalide." });
  }

  try {
    const sqlExistence = "SELECT * FROM Suppliers WHERE email = ?";

    const supplierExistance = await query(sqlExistence, [email]);

    if (supplierExistance.length > 0) {
      return res.status(400).json({ message: "Ce compte existe déjà" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    const userId = req.user.id;

    const sql =
      "INSERT INTO Suppliers (id, name, contact_person, phone, email, address, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    const supplier = await query(sql, [
      id,
      name,
      contact_person,
      phone,
      email,
      address,
      city,
      country,
      userId,
    ]);

    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
