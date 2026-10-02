"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Readora
        </Link>

        {/* Navigation */}
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

          {/* Login */}
          <Link
            href="/login"
            className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
          >
            Login
          </Link>
        </div>

      </div>
    </nav>
  );
}