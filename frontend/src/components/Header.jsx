import React from 'react'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">M</div>
          <span className="font-semibold text-lg">MoringaDesk</span>
        </div>

        <nav className="hidden md:flex gap-8 text-sm text-slate-600">
          <a href="#features" className="hover:text-slate-800">Features</a>
          <a href="#topics" className="hover:text-slate-800">Topics</a>
          <a href="#community" className="hover:text-slate-800">Community</a>
          <a href="#about" className="hover:text-slate-800">About</a>
        </nav>

        <div className="flex items-center gap-3">
          <a className="text-sm text-slate-600 hidden sm:inline">Sign In</a>
          <button className="text-sm px-4 py-2 rounded-md bg-green-600 text-white">Get Started</button>
        </div>
      </div>
    </header>
  )
}
