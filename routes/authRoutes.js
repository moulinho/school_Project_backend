const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");
require("dotenv").config();

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  // console.log("eq.body====>", req.body);

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
          // console.log("results", results);

          // Generate JWT token
          const token = jwt.sign(
            { id: results.id },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRES_IN,
            }
          );

          res.status(201).json({
            token: token,
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

  console.log("email, password", email, password);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email ou mot de passe incorrect " });
  }

  try {
    // Check if user exists
    const query = "SELECT * FROM Customers WHERE email = ?";

    db.query(query, [email], async (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // console.log("results", results  );

      // res.json(results);

      // Generate JWT token
      const token = jwt.sign(
        { id: results[0].id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      const validPassword = await bcrypt.compare(password, results[0].password);
      // console.log("password", password);
      // console.log("validPassword", validPassword);

      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      res.status(200).json({
        token: token,
        results: results.filter((item) => {
        
          delete item.password;
          return item;
        }),
      });
    });
    // console.log("user===>", user);
  } catch (err) {
    console.error("SQL Error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Protected route example
router.get("/profile", async (req, res) => {
  // console.log("req=>", req);

  const token = req.header("Authorization").replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log("decoded=>", decoded);

    db.query(
      "SELECT * FROM Customers WHERE id = ?",
      [decoded.id],
      async (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
          results: results.filter((item) => {
            delete item.id;
            delete item.password;
            return item;
          }),
        });
      }
    );

    // res.status(200).json(user[0]);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Update user
router.patch("/profile_update", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acces refusé identifiant invlide." });
  }
  const { first_name, last_name, email, contact, address, city, oldPassword } =
    req.body;
  // console.log(" req.body", req.body);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    const userId = req.user.id;

    let query = "UPDATE Customers SET";
    let fields = [];
    let values = [];

    if (first_name) {
      fields.push(" first_name = ?");
      values.push(first_name);
    }

    if (last_name) {
      fields.push(" last_name = ?");
      values.push(last_name);
    }

    if (email) {
      fields.push(" email = ?");
      values.push(email);
    }

    if (contact) {
      fields.push(" contact = ?");
      values.push(contact);
    }
    if (address) {
      fields.push(" address = ?");
      values.push(address);
    }

    if (city) {
      fields.push(" city = ?");
      values.push(city);
    }

    if (oldPassword) {
      const hashedPassword = await bcrypt.hash(oldPassword, 10);
      fields.push(" password = ?");
      values.push(hashedPassword);
    }

    query += fields.join(", ");
    query += " WHERE id = ?";
    values.push(userId);

    // Update new user into the database

    db.query(query, values, (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        // console.log("results", results);
        res.status(200).json({ message: "Profile updated." });
      }
    });
  } catch (err) {
    console.error("SQL Error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

module.exports = router;
