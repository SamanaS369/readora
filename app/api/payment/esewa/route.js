import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { payments } from "@/db/schema";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      userId,
      amount = "500",
      productCode = "READORA_PREMIUM",
    } = body;

    // -----------------------------
    // Validate user
    // -----------------------------
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Validate amount
    // -----------------------------
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Environment variables
    // -----------------------------
    const merchantCode =
      process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";

    const secretKey =
      process.env.ESEWA_SECRET_KEY;

    const paymentUrl =
      process.env.ESEWA_PAYMENT_URL ||
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    if (!secretKey) {
      console.error("ESEWA_SECRET_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          error:
            "eSewa secret key is missing. Check your .env.local file.",
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Create transaction UUID
    // -----------------------------
    const transactionUuid = crypto.randomUUID();

    const totalAmount = numericAmount.toFixed(2);

    // -----------------------------
    // Save payment as PENDING
    // -----------------------------
    await db.insert(payments).values({
      userId,
      transactionUuid,
      amount: totalAmount,
      productCode,
      status: "PENDING",
      paymentMethod: "esewa",
    });

    // -----------------------------
    // eSewa signature
    // -----------------------------
    const signedFieldNames =
      "total_amount,transaction_uuid,product_code";

    const message =
      `total_amount=${totalAmount},` +
      `transaction_uuid=${transactionUuid},` +
      `product_code=${merchantCode}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    // -----------------------------
    // URLs
    // -----------------------------
    const successUrl =
      `${siteUrl}/api/payment/esewa/success`;

    const failureUrl =
      `${siteUrl}/api/payment/esewa/failure`;

    // -----------------------------
    // Return payment information
    // -----------------------------
    return NextResponse.json({
      success: true,

      paymentUrl,

      amount: totalAmount,

      tax_amount: "0",

      total_amount: totalAmount,

      transaction_uuid: transactionUuid,

      product_code: merchantCode,

      product_service_charge: "0",

      product_delivery_charge: "0",

      success_url: successUrl,

      failure_url: failureUrl,

      signed_field_names: signedFieldNames,

      signature,
    });
  } catch (error) {
    console.error("=================================");
    console.error("eSewa payment creation failed");
    console.error("=================================");

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to create eSewa payment.",
      },
      { status: 500 }
    );
  }
}