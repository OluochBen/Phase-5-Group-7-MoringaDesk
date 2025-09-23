import React from 'react'

export default function TopicCard({ title, count }) {
  return (
    <div className="card p-6 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{count} questions</p>
      </div>
      <div className="ml-4">
        <span className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-full">Popular</span>
      </div>
    </div>
  )
}
