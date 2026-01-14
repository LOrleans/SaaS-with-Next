import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
})

// para rodar: stripe listen --forward-to localhost:3000/api/stripe/webhook

export default stripe;