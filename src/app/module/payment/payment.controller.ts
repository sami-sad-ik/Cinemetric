/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { envVars } from "../../../config/env";
import { sendResponse } from "../../shared/sendResponse";
import { paymentService } from "./payment.service";
import { stripe } from "../../../config/stripe.config";

const handlerStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE_CONFIG.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret.");
      return res
        .status(status.BAD_REQUEST)
        .json({ message: "Missing Stripe signature or webhook secret." });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      console.error("Error constructing Stripe event:", err.message);
      return res
        .status(status.BAD_REQUEST)
        .json({ message: "Error processing Stripe webhook." });
    }
    try {
      const result = await paymentService.handlerStripeWebhookEvent(event);
      sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Stripe webhook event processed successfully.",
        data: result,
      });
    } catch (err: any) {
      console.error("Error handling Stripe webhook event:", err.message);
      sendResponse(res, {
        httpStatusCode: status.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error handling Stripe webhook event.",
      });
    }
  },
);

export const paymentController = {
  handlerStripeWebhookEvent,
};
