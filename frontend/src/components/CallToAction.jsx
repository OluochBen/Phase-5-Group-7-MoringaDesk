import React from 'react'
import { Link } from 'react-router-dom'

export default function CommunityCTASection() {
  return (
    <section className="bg-green-600 py-20 px-4 text-white text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">Ready to join our community?</h2>
        <p className="text-lg mb-8">
          Become part of an active, supportive, and skilled network of developers, designers, and tech learners.
        </p>
        <Link
          to="/login"
          className="inline-block bg-white text-green-700 font-semibold px-6 py-3 rounded-full hover:bg-slate-100 transition"
        >
          Join Now
        </Link>
      </div>
    </section>
  )
}
