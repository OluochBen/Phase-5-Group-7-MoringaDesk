import React from 'react'
import { Link } from 'react-router-dom'

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-green-50 to-white py-16 mt-10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to join the community?
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto mb-8">
          Sign up and start asking, answering, and learning from tech enthusiasts around the world.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
        >
          Get Started Now
        </Link>
      </div>
    </section>
  )
}
