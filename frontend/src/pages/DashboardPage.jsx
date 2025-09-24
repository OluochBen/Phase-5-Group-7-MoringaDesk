import React, { useEffect, useState } from 'react'
import QuestionCard from '../components/QuestionCard'
import DashboardTabs from '../components/DashboardTabs'
import SidebarRight from '../components/SidebarRight'

export default function DashboardPage() {
  const [questions, setQuestions] = useState([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetch('/api/questions') // Simulated endpoint
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch(() =>
        setQuestions([
          {
            id: 1,
            title: 'How do I deploy a React app to Vercel?',
            tags: ['react', 'deployment'],
            status: 'solved'
          },
          {
            id: 2,
            title: 'Best practices for PostgreSQL indexing?',
            tags: ['postgresql', 'performance'],
            status: 'bounty'
          },
          {
            id: 3,
            title: 'How to animate components in Tailwind?',
            tags: ['tailwind', 'animation'],
            status: 'open'
          }
        ])
      )
  }, [])

  const filtered = activeTab === 'all' ? questions : questions.filter((q) => q.status === activeTab)

  return (
    <section className="bg-gray-50 py-10 px-4 lg:px-0">
      <div className="container mx-auto flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Welcome back, John</h2>
          <DashboardTabs active={activeTab} setActive={setActiveTab} />
          <div className="mt-6 space-y-4">
            {filtered.map((q) => (
              <QuestionCard key={q.id} {...q} />
            ))}
          </div>
        </div>
        <SidebarRight />
      </div>
    </section>
  )
}
