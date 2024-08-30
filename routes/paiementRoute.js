const express = require("express");
const router = express.Router();
// const db = require("../database");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  const { items } = req.body;

  // console.log("req.body", items[0].amount);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: items[0].amount,
      currency: "xof",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      // automatic_payment_methods: {
      //   enabled: true,
      // },
      payment_method_options: {
        card: {
          request_three_d_secure: 'any',
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

module.exports = router;
