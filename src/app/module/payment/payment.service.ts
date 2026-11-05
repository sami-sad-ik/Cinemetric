/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/schema/enums";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findUnique({
    where: {
      stripeEventId: event.id,
    },
  });
  if (existingPayment) {
    console.log(`Payment with Stripe Event ID ${event.id} already exists.`);
    return {
      message: `Payment with Stripe Event ID ${event.id} already exists.skipping...`,
    };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const paymentId = session.metadata?.paymentId;
      if (!userId || !paymentId) {
        console.error("Missing userId or paymentId in session metadata.");
        return {
          message: "Missing userId or paymentId in session metadata.",
        };
      }

      const userData = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userData) {
        console.error(`User with ID ${userId} not found.`);
        return {
          message: `User with ID ${userId} not found.`,
        };
      }
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,

            stripeEventId: event.id,
            paymentGatewayData: session as any,
          },
        });
        if (session.payment_status === "paid") {
          await tx.user.update({
            where: { id: userId },
            data: { subscribed: true },
          });
        }
      });
      console.log(
        `Processed checkout completed event for user ${userId} and payment ${paymentId}.`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        await prisma.payment.updateMany({
          where: { id: paymentId, status: { not: PaymentStatus.PAID } },
          data: {
            status: PaymentStatus.FAILED,
            stripeEventId: event.id,
            paymentGatewayData: session as any,
          },
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(
        `Payment intent ${session.id} failed. Marking associated payment as failed`,
      );
      break;
    }
    default: {
      console.log(`Unhandled event type ${event.type}`);
    }
  }
  console.log(`Stripe webhook event ${event.id} processed successfully.`);
};

export const paymentService = {
  handlerStripeWebhookEvent,
};
