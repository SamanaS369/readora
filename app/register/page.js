"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 1. Create user in Supabase Authentication
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        throw signUpError;
      }

      const user = data.user;

      if (!user) {
        throw new Error("User registration failed.");
      }

      // 2. Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: name,
          email: email,
          role: "user",
          plan: "free",
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);

        setMessage(
          "Account created, but the profile could not be created."
        );

        setLoading(false);
        return;
      }

      // 3. Show result
      if (!data.session) {
        setMessage(
          "Account created! Please check your email to confirm your account."
        );
      } else {
        setMessage("Account created successfully!");

        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Join Readora today
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-5">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 border border-green-200 rounded-lg p-3 mb-5">
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              minLength={6}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}