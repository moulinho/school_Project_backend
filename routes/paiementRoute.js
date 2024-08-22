const express = require("express");
const router = express.Router();
// const db = require("../database");

const stripe = require("stripe")(
  "sk_test_51MC7omBNMWYOuX4LTfOnn0mq5YoN0tOKzkV6JYyAhPpDqc4Iezc49n5E2aWI6BKZevuf8nF9XaoWchRircs9sPjl00zt7rxToq"
);

router.post("/paiment", async (req, res) => {
  const YOUR_DOMAIN = "http://localhost:3000";
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.log("error");
  }
  //   res.redirect(303, session.url);
});

module.exports = router;
