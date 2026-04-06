import React, { useEffect, useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Swal from "sweetalert2";

export default function PaiementStripe({ totalCents, disabled }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const payer = async () => {
    if (disabled) return;

    if (!stripe || !elements) {
      await Swal.fire({
        icon: "error",
        title: "Stripe non prêt",
        text: "Attends 1 seconde puis réessaie.",
        confirmButtonColor: "#ff3b6b",
      });
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/succes`,
      },
    });

    setLoading(false);

    // Si erreur immédiate (validation, carte refusée, etc.)
    if (error) {
      await Swal.fire({
        icon: "error",
        title: "Paiement refusé",
        text: error.message || "Impossible de compléter le paiement.",
        confirmButtonColor: "#ff3b6b",
      });
    }
  };

  return (
    <div className="card soft">
      <div className="section-title">Paiement par carte (Stripe)</div>

      <PaymentElement />

      <div className="row gap" style={{ marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn primary" onClick={payer} disabled={loading || disabled || !stripe}>
          {loading ? "Paiement..." : "Payer maintenant"}
        </button>

        <div className="muted small">
          Total: <span className="strong">{(totalCents / 100).toFixed(2)} $</span>
        </div>
      </div>
    </div>
  );
}
