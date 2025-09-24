import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`text-sm font-medium px-4 py-2 rounded-md ${
              activeTab === 'login'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`text-sm font-medium px-4 py-2 rounded-md ${
              activeTab === 'signup'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'login' ? (
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right text-sm">
              <Link to="#" className="text-green-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Create a password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
