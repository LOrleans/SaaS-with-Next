import { db } from "@/app/lib/firebase";
import stripe from "@/app/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return new Error("Stripe webhook secret is not set");
    }

    const event = stripe.webhooks.constructEvent(body, signature, secret);
    console.log("Webhook event type:", event.type);
    console.log(
      "Webhook event data:",
      JSON.stringify(event.data.object, null, 2)
    );

    switch (event.type) {
      case "checkout.session.completed":
        // Usuario completou o checkout - assinatura ou pagamento unico
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed - mode:", session.mode);
        console.log("Checkout session metadata:", session.metadata);

        if (session.payment_status === "paid") {
          const userId = session.client_reference_id;
          const billingPeriod =
            (session.metadata?.billingPeriod as
              | "monthly"
              | "yearly"
              | "lifetime"
              | undefined) || null;

          console.log("Updating user:", {
            userId,
            billingPeriod,
            isSubscribed: true,
          });

          if (userId) {
            await db.collection("users").doc(userId).update({
              isSubscribed: true,
              billingPeriod,
            });
            console.log("User updated successfully");
          }
        }
        // Verificar se foi boleto
        if (session.payment_status === "unpaid" && session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent.toString()
          );
          const hostedVoucherUrl =
            paymentIntent.next_action?.boleto_display_details
              ?.hosted_voucher_url;

          if (hostedVoucherUrl) {
            const userEmail = session.customer_details?.email;
            console.log("Enviar email para o cliente com o boleto");
          }
        }
        break;

      case "checkout.session.async_payment_succeeded":
        // Usuario pagou o boleto
        const asyncSession = event.data.object as Stripe.Checkout.Session;
        if (asyncSession.payment_status === "paid") {
          const userId = asyncSession.client_reference_id;
          const billingPeriod =
            (asyncSession.metadata?.billingPeriod as
              | "monthly"
              | "yearly"
              | "lifetime"
              | undefined) || null;
          console.log("Async payment succeeded - updating user:", {
            userId,
            billingPeriod,
          });
          if (userId) {
            await db.collection("users").doc(userId).update({
              isSubscribed: true,
              billingPeriod,
            });
          }
        }
        break;

      case "customer.subscription.created":
        // Assinatura criada - buscar metadata da subscription ou da checkout session
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription created:", subscription.id);
        console.log("Subscription metadata:", subscription.metadata);

        const customerId = subscription.customer as string;
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;

        const userId = customer.metadata?.userId;

        // Tentar buscar billingPeriod do metadata da subscription ou da última checkout session
        let billingPeriod: "monthly" | "yearly" | "lifetime" | null = null;

        if (subscription.metadata?.billingPeriod) {
          billingPeriod = subscription.metadata.billingPeriod as
            | "monthly"
            | "yearly"
            | "lifetime";
        } else {
          // Buscar na última checkout session do customer
          const checkoutSessions = await stripe.checkout.sessions.list({
            customer: customerId,
            limit: 1,
          });

          if (checkoutSessions.data.length > 0) {
            const lastSession = checkoutSessions.data[0];
            billingPeriod =
              (lastSession.metadata?.billingPeriod as
                | "monthly"
                | "yearly"
                | "lifetime"
                | undefined) || null;
          }
        }

        console.log("Subscription created - updating user:", {
          userId,
          billingPeriod,
        });

        if (userId) {
          await db.collection("users").doc(userId).update({
            isSubscribed: true,
            billingPeriod,
          });
          console.log("User updated from subscription.created");
        }
        break;

      case "invoice.payment_succeeded":
        // Pagamento de invoice bem-sucedido (para assinaturas recorrentes)
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment succeeded:", invoice.id);

        // A propriedade subscription pode estar como string ou objeto expandido
        const invoiceSubscriptionId = (invoice as any).subscription
          ? typeof (invoice as any).subscription === "string"
            ? (invoice as any).subscription
            : (invoice as any).subscription?.id
          : null;

        if (invoiceSubscriptionId) {
          const subscriptionData = await stripe.subscriptions.retrieve(
            invoiceSubscriptionId
          );
          const invoiceCustomerId = subscriptionData.customer as string;

          const invoiceCustomer = (await stripe.customers.retrieve(
            invoiceCustomerId
          )) as Stripe.Customer;

          const invoiceUserId = invoiceCustomer.metadata?.userId;

          // Buscar billingPeriod
          let invoiceBillingPeriod: "monthly" | "yearly" | "lifetime" | null =
            null;

          if (subscriptionData.metadata?.billingPeriod) {
            invoiceBillingPeriod = subscriptionData.metadata.billingPeriod as
              | "monthly"
              | "yearly"
              | "lifetime";
          } else {
            // Determinar pelo intervalo da subscription
            const interval =
              subscriptionData.items.data[0]?.price?.recurring?.interval;
            if (interval === "month") {
              invoiceBillingPeriod = "monthly";
            } else if (interval === "year") {
              invoiceBillingPeriod = "yearly";
            }
          }

          console.log("Invoice payment succeeded - updating user:", {
            userId: invoiceUserId,
            billingPeriod: invoiceBillingPeriod,
          });

          if (invoiceUserId) {
            await db.collection("users").doc(invoiceUserId).update({
              isSubscribed: true,
              billingPeriod: invoiceBillingPeriod,
            });
            console.log("User updated from invoice.payment_succeeded");
          }
        }
        break;
      case "customer.subscription.deleted":
        // Usuario cancelou a assinatura
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedCustomerId = deletedSubscription.customer as string;

        if (deletedCustomerId) {
          const deletedCustomer = (await stripe.customers.retrieve(
            deletedCustomerId
          )) as Stripe.Customer;

          if (deletedCustomer && deletedCustomer.metadata.userId) {
            const deletedUserId = deletedCustomer.metadata.userId;

            await db.collection("users").doc(deletedUserId).update({
              isSubscribed: false,
              billingPeriod: null,
            });
          }
        }
        break;
      case "invoice.payment_failed":
        // Pagamento de invoice falhou
        const failedInvoice = event.data.object as Stripe.Invoice;
        const customerIdFailure = failedInvoice.customer as string;

        // Buscar o cliente para pegar o userId nos metadados
        const customerFailure = (await stripe.customers.retrieve(
          customerIdFailure
        )) as Stripe.Customer;
        const userIdFailure = customerFailure.metadata?.userId;

        if (userIdFailure) {
          // Ação recomendada: Bloquear o acesso ou marcar como inadimplente
          await db.collection("users").doc(userIdFailure).update({
            isSubscribed: false, // Ou criar um status "past_due"
          });

          console.log(
            `Pagamento falhou para o usuário ${userIdFailure}. Acesso removido.`
          );

          // Aqui você poderia integrar um serviço de e-mail (ex: Resend)
          // para avisar o cliente que o cartão falhou.
        }
        break;
      case "invoice.upcoming": {
        const upcomingInvoice = event.data.object as Stripe.Invoice;
        // Receber o id do cliente
        const upcomingCustomerId = upcomingInvoice.customer as string;
        // Buscamos os dados do cliente para pegar o e-mail e o userId
        const customer = (await stripe.customers.retrieve(upcomingCustomerId)) as Stripe.Customer
        const userEmail = customer.email
        const userId = customer.metadata?.userId;

        if(userEmail){
          console.log(`Enviando lembrete de renovação para: ${userEmail}`);
          // sendEmail()
        }
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return new NextResponse(null, { status: 500 });
  }
}
