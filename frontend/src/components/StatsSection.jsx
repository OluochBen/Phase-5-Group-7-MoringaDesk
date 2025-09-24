import React from 'react'

const stats = [
  { value: '10,000+', label: 'Questions Asked', color: 'text-green-600' },
  { value: '5,000+', label: 'Active Users', color: 'text-blue-600' },
  { value: '25,000+', label: 'Answers Provided', color: 'text-purple-600' },
  { value: '50+', label: 'Topic Communities', color: 'text-orange-500' },
]

export default function StatsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className={`text-3xl md:text-4xl font-extrabold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
