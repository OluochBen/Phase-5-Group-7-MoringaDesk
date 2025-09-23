import React, { useEffect, useState } from 'react'
import TopicCard from './TopicCard'

export default function TopicsGrid() {
  const [topics, setTopics] = useState([])

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((data) => setTopics(data))
      .catch(() => {
        // fallback sample data
        setTopics([
          { id: 1, title: 'React', count: '2,341' },
          { id: 2, title: 'JavaScript', count: '3,567' },
          { id: 3, title: 'Python', count: '1,892' },
          { id: 4, title: 'CSS', count: '1,234' },
          { id: 5, title: 'Node.js', count: '987' },
          { id: 6, title: 'TypeScript', count: '1,456' }
        ])
      })
  }, [])

  return (
    <section id="topics" className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Explore Popular Topics</h2>
        <p className="text-slate-500 mt-2">Discover what the community is talking about</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((t) => (
          <TopicCard key={t.id} title={t.title} count={t.count} />
        ))}
      </div>
    </section>
  )
}
