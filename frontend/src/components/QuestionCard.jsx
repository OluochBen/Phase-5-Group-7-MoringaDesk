import React from 'react'

export default function QuestionCard({ title, tags, status }) {
  const getBadge = () => {
    switch (status) {
      case 'solved':
        return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">Solved</span>
      case 'bounty':
        return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Bounty</span>
      case 'open':
      default:
        return <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">Open</span>
    }
  }

  return (
    <div className="p-5 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold">{title}</h3>
        {getBadge()}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
