const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    console.log("=== BODY REÇU ===");
    console.log(JSON.stringify(req.body, null, 2));

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Aucun article reçu." });
    }

    const line_items = items.map((item) => {
      const unit_amount = Number(item.unit_amount_cents);
      const quantity = Number(item.quantity);
      const name = String(item.name || "").trim();

      console.log("ITEM ANALYSÉ =", {
        name,
        unit_amount_cents: item.unit_amount_cents,
        unit_amount,
        quantity: item.quantity,
      });

      if (!name) {
        throw new Error("Nom produit manquant.");
      }

      if (!Number.isInteger(unit_amount) || unit_amount <= 0) {
        throw new Error(`Montant invalide pour ${name}: ${item.unit_amount_cents}`);
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`Quantité invalide pour ${name}: ${item.quantity}`);
      }

      return {
        price_data: {
          currency: "cad",
          product_data: { name },
          unit_amount,
        },
        quantity,
      };
    });

    console.log("=== LINE ITEMS ===");
    console.log(JSON.stringify(line_items, null, 2));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${process.env.CLIENT_URL}/paiement?success=1`,
      cancel_url: `${process.env.CLIENT_URL}/paiement?cancel=1`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("ERREUR STRIPE =", err);
    return res.status(400).json({ error: err.message || "Stripe error" });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`✅ Stripe server: http://localhost:${PORT}`);
});
