"use client";

import { useState } from "react";
import Link from "next/link";

const initialUsers = [
  {
    id: 1,
    name: "Emma Davis",
    email: "emma@example.com",
    role: "User",
    plan: "Free",
    status: "Active",
  },
  {
    id: 2,
    name: "Daniel Smith",
    email: "daniel@example.com",
    role: "User",
    plan: "Premium",
    status: "Active",
  },
  {
    id: 3,
    name: "Sophia Brown",
    email: "sophia@example.com",
    role: "User",
    plan: "Free",
    status: "Active",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james@example.com",
    role: "Admin",
    plan: "Premium",
    status: "Active",
  },
  {
    id: 5,
    name: "Olivia Taylor",
    email: "olivia@example.com",
    role: "User",
    plan: "Premium",
    status: "Blocked",
  },
  {
    id: 6,
    name: "Noah Anderson",
    email: "noah@example.com",
    role: "User",
    plan: "Free",
    status: "Active",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUserStatus = (id) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Blocked" : "Active",
            }
          : user
      )
    );
  };

  const deleteUser = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (confirmed) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-sm text-purple-600 font-semibold">
                READORA ADMIN
              </p>

              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                Manage Users
              </h1>

              <p className="text-gray-500 mt-1">
                View and manage Readora users.
              </p>
            </div>

            <Link
              href="/admin"
              className="text-purple-600 font-medium hover:underline"
            >
              ← Back to Dashboard
            </Link>

          </div>

        </div>
      </header>

      {/* Navigation */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">

          <nav className="flex flex-wrap gap-2 py-3">

            <Link
              href="/admin"
              className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/books"
              className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              📚 Books
            </Link>

            <Link
              href="/admin/stories"
              className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              ✍️ Stories
            </Link>

            <Link
              href="/admin/users"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              👥 Users
            </Link>

          </nav>

        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">

        {/* Summary */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {users.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Premium Users
            </p>

            <p className="text-3xl font-bold text-purple-600 mt-2">
              {users.filter((user) => user.plan === "Premium").length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Active Users
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {users.filter((user) => user.status === "Active").length}
            </p>
          </div>

        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">

          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    User
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Role
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Plan
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="hover:bg-gray-50"
                  >

                    {/* User */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>

                        <div>

                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {user.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">

                      {user.role === "Admin" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          User
                        </span>
                      )}

                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4">

                      {user.plan === "Premium" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          ⭐ Premium
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Free
                        </span>
                      )}

                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            user.status === "Active"
                              ? "text-orange-600 bg-orange-50 hover:bg-orange-100"
                              : "text-green-600 bg-green-50 hover:bg-green-100"
                          }`}
                        >
                          {user.status === "Active"
                            ? "Block"
                            : "Unblock"}
                        </button>

                        <button
                          onClick={() =>
                            alert(
                              `Viewing ${user.name}'s profile will be connected later.`
                            )
                          }
                          className="px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* No Results */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">

              <div className="text-4xl mb-3">
                👥
              </div>

              <h3 className="font-semibold text-gray-900">
                No users found
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Try searching with a different name, email or role.
              </p>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}