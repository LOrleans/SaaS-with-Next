import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/firebase";
import stripe from "@/app/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const { metadata, billingPeriod } = await req.json();

  // Definir preço e modo de pagamento com base no período
  let price: string | undefined;
  let mode: "subscription" | "payment";
  let payment_method_types: string[];

  if (billingPeriod === "monthly") {
    price = process.env.STRIPE_SUBSCRIPTION_MONTH_PRICE_ID;
    mode = "subscription";
    payment_method_types = ["card"];
  } else if (billingPeriod === "yearly") {
    price = process.env.STRIPE_SUBSCRIPTION_YEAR_PRICE_ID;
    mode = "subscription";
    payment_method_types = ["card"];
  } else {
    // Pagamento único / vitalício
    price = process.env.STRIPE_PRICE_ONLY_ID;
    mode = "payment";
    payment_method_types = ["card", "boleto"];
  }

  if (!price) {
    return NextResponse.json(
      { error: "Stripe price ID not configured for this billing period" },
      { status: 500 }
    );
  }

  const userSession = await auth();

  if (!userSession || !userSession.user?.id || !userSession.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userSession.user?.id;
  const userEmail = userSession.user?.email;
  const userName = userSession.user?.name;

  const userRef = db.collection("users").doc(userId || "");
  const userDoc = await userRef.get();

  let customerId;

  if (userDoc.exists) {
    customerId = userDoc.data()?.customerId;
  }

  if (!customerId) {
    const newCustomer = await stripe.customers.create({
      email: userEmail,
      name: userName || "Sem nome",
      metadata: {
        userId: userId,
      },
    });

    customerId = newCustomer.id;

    await userRef.update({
      customerId,
    });
  }

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    line_items: [{ price: price, quantity: 1 }],
    mode,
    payment_method_types: payment_method_types as any,
    success_url: `${req.headers.get("origin")}/${metadata.profileId}`,
    cancel_url: `${req.headers.get("origin")}/${metadata.profileId}/upgrade`,
    client_reference_id: userId,
    metadata: { ...metadata, billingPeriod },
  };

  // Para assinaturas, passar metadata também para a subscription
  if (mode === "subscription") {
    sessionConfig.subscription_data = {
      metadata: {
        ...metadata,
        billingPeriod,
        userId: userId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return NextResponse.json({
    sessionId: session.id,
    url: session.url,
  });
}
