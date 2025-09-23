import React from 'react'

export default function FeatureCard({ title, body }) {
  return (
    <div className="card p-6 flex gap-4 items-start">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        {/* If you have icon SVGs, replace this with <img src={...} /> */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-70">
          <circle cx="12" cy="12" r="10" stroke="#ddd" strokeWidth="1.5" />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-slate-500 mt-2">{body}</p>
      </div>
    </div>
  )
}
