import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-bold text-purple-600"
          >
            Readora
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mt-6">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2">
            Login to continue reading
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">

          <form className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Login */}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700"
            >
              Login
            </button>

          </form>

          {/* Register */}
          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-purple-600 font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}