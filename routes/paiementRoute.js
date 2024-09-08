
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const db = require("../database");
const id = uuidv4();

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/paiment-intent", async (req, res) => {
  const { total } = req.body;

  // console.log("req.body", req.body);
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
      // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
      dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
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
  const query =
    "INSERT INTO Payments (id, order_id, payment_method, amount, status) VALUES (? ,? ,? ,? ,?)";

    // console.log("req.body",req.body);
    
  const { order_id, payment_method, amount, status } = req.body;
  db.execute(
    query,
    [id, order_id, payment_method, amount, status],
    (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return res.status(500).json({ message: "Il y'a une erreur" });
      }
      res.status(201).json({
        message: "Payement success",
        id: id,
      });
    }
  );
});

module.exports = router;
