import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    async function loadStripeAsync() {
      const stripeInstance = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!
      );
      setStripe(stripeInstance);
    }

    loadStripeAsync();
  }, []);

  async function createStripeCheckout({
    metadata,
    billingPeriod,
  }: {
    metadata: any;
    /**
     * "monthly"  -> assinatura mensal
     * "yearly"   -> assinatura anual
     * "lifetime" -> pagamento único / vitalício
     */
    billingPeriod: "monthly" | "yearly" | "lifetime";
  }) {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata, billingPeriod }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redireciona para o Stripe Checkout
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateStripePortal() {
    const response = await fetch("/api/stripe/create-portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    window.location.href = data.url;
  }

  return { createStripeCheckout, handleCreateStripePortal };
}
