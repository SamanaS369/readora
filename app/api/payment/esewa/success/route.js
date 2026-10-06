import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, profiles } from "@/db/schema";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // eSewa sends payment response in the "data" parameter
    const encodedData = searchParams.get("data");

    if (!encodedData) {
      console.error("eSewa: data parameter missing");

      return NextResponse.redirect(
        new URL(
          "/premium?status=verification_failed",
          request.url
        )
      );
    }

    // Decode Base64
    const decodedData = Buffer.from(
      encodedData,
      "base64"
    ).toString("utf-8");

    console.log("eSewa decoded response:", decodedData);

    let esewaData;

    try {
      esewaData = JSON.parse(decodedData);
    } catch (error) {
      console.error("Invalid eSewa JSON:", error);

      return NextResponse.redirect(
        new URL(
          "/premium?status=verification_failed",
          request.url
        )
      );
    }

    const {
      status,
      transaction_code,
      total_amount,
      transaction_uuid,
      product_code,
    } = esewaData;

    console.log("eSewa status:", status);
    console.log("eSewa transaction:", transaction_code);
    console.log("eSewa amount:", total_amount);
    console.log("eSewa UUID:", transaction_uuid);
    console.log("eSewa product:", product_code);

    // Payment must be COMPLETE
    if (status !== "COMPLETE") {
      console.error(
        "Payment was not completed:",
        status
      );

      return NextResponse.redirect(
        new URL(
          "/premium?status=failed",
          request.url
        )
      );
    }

    // Find payment in our database
    const paymentResult = await db
      .select()
      .from(payments)
      .where(
        eq(
          payments.transactionUuid,
          transaction_uuid
        )
      )
      .limit(1);

    if (paymentResult.length === 0) {
      console.error(
        "Payment not found:",
        transaction_uuid
      );

      return NextResponse.redirect(
        new URL(
          "/premium?status=verification_failed",
          request.url
        )
      );
    }

    const payment = paymentResult[0];

    // Check amount
    if (
      Number(payment.amount) !==
      Number(total_amount)
    ) {
      console.error(
        "Amount mismatch:",
        payment.amount,
        total_amount
      );

      await db
        .update(payments)
        .set({
          status: "FAILED",
          updatedAt: new Date(),
        })
        .where(
          eq(
            payments.transactionUuid,
            transaction_uuid
          )
        );

      return NextResponse.redirect(
        new URL(
          "/premium?status=verification_failed",
          request.url
        )
      );
    }

    // For UAT, eSewa product code is EPAYTEST
    if (product_code !== "EPAYTEST") {
      console.error(
        "Invalid product code:",
        product_code
      );

      return NextResponse.redirect(
        new URL(
          "/premium?status=verification_failed",
          request.url
        )
      );
    }

    // Verify transaction with eSewa
    const verifyUrl =
      process.env.ESEWA_VERIFY_URL ||
      "https://rc.esewa.com.np/api/epay/transaction/status/";

    const verificationUrl =
      `${verifyUrl}` +
      `?product_code=${encodeURIComponent(product_code)}` +
      `&total_amount=${encodeURIComponent(total_amount)}` +
      `&transaction_uuid=${encodeURIComponent(transaction_uuid)}`;

    console.log(
      "Checking eSewa transaction..."
    );

    const verificationResponse =
      await fetch(verificationUrl, {
        method: "GET",
        cache: "no-store",
      });

    if (!verificationResponse.ok) {
      console.error(
        "eSewa verification failed:",
        verificationResponse.status
      );

      return NextResponse.redirect(
        new URL(
          "/premium?status=verification_failed",
          request.url
        )
      );
    }

    const verification =
      await verificationResponse.json();

    console.log(
      "eSewa verification:",
      verification
    );

    // Verify payment status and amount
    if (
      verification.status !== "COMPLETE" ||
      Number(verification.total_amount) !==
        Number(total_amount)
    ) {
      console.error(
        "eSewa transaction verification failed"
      );

      await db
        .update(payments)
        .set({
          status: "FAILED",
          updatedAt: new Date(),
        })
        .where(
          eq(
            payments.transactionUuid,
            transaction_uuid
          )
        );

      return NextResponse.redirect(
        new URL(
          "/premium?status=verification_failed",
          request.url
        )
      );
    }

    // Prevent duplicate processing
    if (payment.status === "COMPLETE") {
      console.log(
        "Payment already completed."
      );

      return NextResponse.redirect(
        new URL(
          "/premium?status=success",
          request.url
        )
      );
    }

    // Update payment
    await db
      .update(payments)
      .set({
        status: "COMPLETE",
        referenceId:
          verification.ref_id ||
          transaction_code ||
          null,
        transactionCode:
          transaction_code || null,
        updatedAt: new Date(),
      })
      .where(
        eq(
          payments.transactionUuid,
          transaction_uuid
        )
      );

    // Upgrade user's profile
    await db
      .update(profiles)
      .set({
        plan: "premium",
      })
      .where(
        eq(
          profiles.id,
          payment.userId
        )
      );

    console.log(
      "===================================="
    );
    console.log(
      "READORA PREMIUM ACTIVATED"
    );
    console.log(
      "User:",
      payment.userId
    );
    console.log(
      "Transaction:",
      transaction_code
    );
    console.log(
      "===================================="
    );

    // Go back to Premium page
    return NextResponse.redirect(
      new URL(
        "/premium?status=success",
        request.url
      )
    );
  } catch (error) {
    console.error(
      "eSewa success route error:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/premium?status=verification_failed",
        request.url
      )
    );
  }
}