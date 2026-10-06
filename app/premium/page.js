"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PremiumPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    getUser();
  }, []);

  async function handlePayment() {
    setError("");
    setPaymentLoading(true);

    try {
      if (!user) {
        setError("Please login before making a payment.");
        setPaymentLoading(false);
        return;
      }

      const response = await fetch("/api/payment/esewa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          amount: "500",
          productCode: "READORA_PREMIUM",
        }),
      });

      // Read response as text first.
      // This prevents "Unexpected end of JSON input".
      const responseText = await response.text();

      console.log("eSewa API status:", response.status);
      console.log("eSewa API response:", responseText);

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (jsonError) {
        throw new Error(
          `Server returned invalid JSON. Response: ${responseText || "empty response"}`
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error || "Failed to create eSewa payment."
        );
      }

      // Create eSewa payment form
      const form = document.createElement("form");

      form.method = "POST";
      form.action = data.paymentUrl;

      const fields = {
        amount: data.amount,
        tax_amount: data.tax_amount,
        total_amount: data.total_amount,
        transaction_uuid: data.transaction_uuid,
        product_code: data.product_code,
        product_service_charge: data.product_service_charge,
        product_delivery_charge: data.product_delivery_charge,
        success_url: data.success_url,
        failure_url: data.failure_url,
        signed_field_names: data.signed_field_names,
        signature: data.signature,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");

        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";

        form.appendChild(input);
      });

      document.body.appendChild(form);

      form.submit();
    } catch (error) {
      console.error("Payment error:", error);

      setError(
        error?.message || "Something went wrong while starting the payment."
      );

      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "success") {
      return (
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>

            <h1 className="text-3xl font-bold text-green-600 mb-3">
              Payment Successful!
            </h1>

            <p className="text-gray-600 mb-6">
              Your Readora Premium membership has been activated.
            </p>

            <a
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg"
            >
              Go to Home
            </a>
          </div>
        </main>
      );
    }

    if (status === "failed") {
      return (
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">❌</div>

            <h1 className="text-3xl font-bold text-red-600 mb-3">
              Payment Failed
            </h1>

            <p className="text-gray-600 mb-6">
              Your payment was not completed.
            </p>

            <button
              onClick={() => {
                window.history.replaceState({}, "", "/premium");
                window.location.reload();
              }}
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </main>
      );
    }

    if (status === "verification_failed") {
      return (
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>

            <h1 className="text-3xl font-bold text-orange-600 mb-3">
              Payment Verification Failed
            </h1>

            <p className="text-gray-600 mb-6">
              We received the payment response, but could not verify it.
              Please try again.
            </p>

            <button
              onClick={() => {
                window.history.replaceState({}, "", "/premium");
                window.location.reload();
              }}
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </main>
      );
    }

    if (status === "login_required") {
      return (
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔐</div>

            <h1 className="text-3xl font-bold mb-3">
              Login Required
            </h1>

            <p className="text-gray-600 mb-6">
              Please login to purchase Readora Premium.
            </p>

            <a
              href="/login"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg"
            >
              Login
            </a>
          </div>
        </main>
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Readora Premium 👑
          </h1>

          <p className="text-gray-600 text-lg">
            Unlock more books and premium reading features.
          </p>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-semibold">Payment Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👑</div>

            <h2 className="text-2xl font-bold mb-2">
              Readora Premium
            </h2>

            <p className="text-gray-500">
              One premium membership
            </p>
          </div>

          <div className="text-center mb-8">
            <span className="text-5xl font-bold">
              Rs. 500
            </span>

            <span className="text-gray-500">
              {" "}
              / membership
            </span>
          </div>

          <div className="space-y-4 mb-8">

            <div className="flex gap-3">
              <span>✓</span>
              <span>Read more than 5 books</span>
            </div>

            <div className="flex gap-3">
              <span>✓</span>
              <span>Access premium books</span>
            </div>

            <div className="flex gap-3">
              <span>✓</span>
              <span>Unlimited reading</span>
            </div>

            <div className="flex gap-3">
              <span>✓</span>
              <span>Premium Readora features</span>
            </div>

          </div>

          {!user ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Please login to continue.
              </p>

              <a
                href="/login"
                className="block w-full bg-black text-white py-3 rounded-lg font-semibold"
              >
                Login to Continue
              </a>
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
            >
              {paymentLoading
                ? "Connecting to eSewa..."
                : "Pay Rs. 500 with eSewa"}
            </button>
          )}

          <p className="text-xs text-gray-400 text-center mt-5">
            You will be redirected to eSewa's secure payment page.
          </p>

        </div>
      </div>
    </main>
  );
}