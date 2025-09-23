import React from 'react'

export default function Hero() {
  return (
    <section className="py-20" style={{ background: 'linear-gradient(90deg,#f0fdfa 0%, #f3f7fb 100%)' }}>
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Welcome to <span className="text-green-600">MoringaDesk</span>
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto text-slate-600">
          Your go-to platform for asking questions, sharing knowledge, and learning together. Join our community of developers,
          designers, and tech enthusiasts.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#topics" className="px-6 py-3 rounded-md bg-green-600 text-white shadow">Get Started Free</a>
          <button className="px-6 py-3 rounded-md border">Sign In</button>
        </div>
      </div>
    </section>
  )
}
