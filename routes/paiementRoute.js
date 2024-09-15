const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const db = require("../database");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



router.post("/paiment-intent", async (req, res) => {
  const { total } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "xof",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
      payment_method_options: {
        card: {
          request_three_d_secure: "any",
        },
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
  // Create a PaymentIntent with the order amount and currency
});

router.post("/paiment-register", async (req, res) => {
  const id = uuidv4();

  try {
    // Log the Authorization header

    // Destructure request body
    const { order_id, payment_method, amount, status } = req.body;

    // Insert query
    const query =
      "INSERT INTO Payments (id, order_id, payment_method, amount, status) VALUES (?, ?, ?, ?, ?)";

    // Execute the SQL query
    db.execute(
      query,
      [id, order_id, payment_method, amount, status],
      (err, results) => {
        if (err) {
          console.error("SQL Error:", err);
          return res
            .status(500)
            .json({ message: "Erreur SQL: " + err.message });
        }

        // Respond with success
        res.status(201).json({
          message: "Paiement réussi",
          id: id,
        });
      }
    );
  } catch (err) {
    // Catch JWT verification or other errors
    return res
      .status(401)
      .json({ message: "Accès refusé. Token invalide.", error: err.message });
  }
});

module.exports = router;
