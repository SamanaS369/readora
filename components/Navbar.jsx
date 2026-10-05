"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-purple-600"
        >
          Readora
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-700 hover:text-purple-600"
          >
            Home
          </Link>

          <Link
            href="/books"
            className="text-gray-700 hover:text-purple-600"
          >
            Books
          </Link>

          <Link
            href="/write"
            className="text-gray-700 hover:text-purple-600"
          >
            Write
          </Link>

          <Link
            href="/library"
            className="text-gray-700 hover:text-purple-600"
          >
            My Library
          </Link>

          <Link
            href="/premium"
            className="text-gray-700 hover:text-purple-600"
          >
            Premium
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}