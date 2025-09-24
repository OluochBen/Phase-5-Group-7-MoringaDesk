import React from 'react'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Unanswered' },
  { key: 'bounty', label: 'Bounty' },
  { key: 'solved', label: 'Solved' }
]

export default function DashboardTabs({ active, setActive }) {
  return (
    <div className="flex gap-3 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActive(tab.key)}
          className={`text-sm pb-2 border-b-2 transition ${
            active === tab.key
              ? 'border-green-600 text-green-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
