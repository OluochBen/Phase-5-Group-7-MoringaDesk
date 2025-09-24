import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-green-600 text-white font-bold rounded-md px-2 py-1">M</div>
          <span className="text-lg font-semibold text-slate-800">MoringaDesk</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-700 font-medium">
          <Link to="/features" className="hover:text-green-600 transition">Features</Link>
          <Link to="/topics" className="hover:text-green-600 transition">Topics</Link>
          <Link to="/community" className="hover:text-green-600 transition">Community</Link>
          <Link to="/about" className="hover:text-green-600 transition">About</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-slate-700 font-medium hover:text-green-600 transition">
            Sign In
          </Link>
          <Link
            to="/login"
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
