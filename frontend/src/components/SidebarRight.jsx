import React from 'react'

export default function SidebarRight() {
  const tags = ['react', 'python', 'tailwind', 'docker', 'postgres']
  const contributors = ['Alice', 'Omar', 'Grace', 'Devon']
  const activity = [
    'Jane answered a question',
    'Omar earned a badge',
    'Alice created a new topic'
  ]

  return (
    <aside className="w-full lg:w-72 space-y-8">
      <div>
        <h4 className="text-sm font-semibold mb-2">Popular Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Top Contributors</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          {contributors.map((name, i) => (
            <li key={i}>• {name}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Recent Activity</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          {activity.map((item, i) => (
            <li key={i}>→ {item}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
