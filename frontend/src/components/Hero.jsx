import React from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#f0fdfa] to-[#f3f7fb]">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
          Welcome to <span className="text-green-600">MoringaDesk</span>
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto text-slate-600">
          Your go-to platform for asking questions, sharing knowledge, and learning together. Join our community of developers, designers, and tech enthusiasts.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link
            to="/login"
            className="px-6 py-3 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-md border border-slate-300 text-sm font-medium hover:bg-slate-100 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}
