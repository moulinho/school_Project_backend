const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");
require("dotenv").config();

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  console.log("eq.body====>", req.body);

  const { id, firstName, lastName, email, contact, address, city, password } =
    req.body;

  if (!firstName || !address || !contact || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    // Check if user already exists
    db.query(
      "SELECT * FROM Customers WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          res.status(500).send(err);
        } else {
          if (results.length > 0) {
            return res.status(400).json({ message: "User already exists" });
          }
        }
      }
    );

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    db.query(
      "INSERT INTO Customers (id, first_name, last_name, email, contact, address, city, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, firstName, lastName, email, contact, address, city, hashedPassword],
      (err, results) => {
        if (err) {
          res.status(500).send(err);
        } else {
          console.log("results", results);

          // Generate JWT token
          const token = jwt.sign(
            { id: results.id },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRES_IN,
            }
          );

          res.status(201).json({
            token,
            user: {
              firstName,
              lastName,
              email,
              contact,
              address,
              city,
            },
          });
          // res.json(results);
        }
      }
    );
  } catch (err) {
    console.error("SQL Error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email anoud mo de passe incorrect " });
  }

  try {
    // Check if user exists
    const query = "SELECT * FROM Customers WHERE email = ?";

    db.query(query, [email], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // console.log("results", results);

      // res.json(results);

      // Generate JWT token
      const token = jwt.sign(
        { id: results[0].id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      res.status(200).json({
        token: token,
        results: { ...results },
      });
    });
    // console.log("user===>", user);

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("SQL Error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Protected route example
router.get("/profile", async (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await db.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [decoded.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user[0]);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
