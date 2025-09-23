import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">M</div>
          <div>
            <div className="font-semibold">MoringaDesk</div>
            <div className="text-sm text-slate-500">Community Q&A platform</div>
          </div>
        </div>

        <div className="text-sm text-slate-500 mt-4 md:mt-0">© {new Date().getFullYear()} MoringaDesk. All rights reserved.</div>
      </div>
    </footer>
  )
}

