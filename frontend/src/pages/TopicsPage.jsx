import React from 'react'
import {
  Code,
  Server,
  Database,
  PenTool,
  Brain,
  Settings2,
} from 'lucide-react'

const topics = [
  {
    title: 'Web Development',
    description: 'HTML, CSS, JavaScript, React, and frontend frameworks.',
    icon: <Code className="w-7 h-7 text-blue-600" />,
  },
  {
    title: 'Backend Engineering',
    description: 'Node.js, Python, APIs, authentication and architecture.',
    icon: <Server className="w-7 h-7 text-green-600" />,
  },
  {
    title: 'Databases',
    description: 'PostgreSQL, MongoDB, data modeling, and optimization.',
    icon: <Database className="w-7 h-7 text-amber-600" />,
  },
  {
    title: 'UI/UX Design',
    description: 'Wireframes, usability, Figma, and design systems.',
    icon: <PenTool className="w-7 h-7 text-purple-600" />,
  },
  {
    title: 'Machine Learning',
    description: 'Neural networks, data science, and model evaluation.',
    icon: <Brain className="w-7 h-7 text-pink-600" />,
  },
  {
    title: 'DevOps',
    description: 'Docker, CI/CD, Kubernetes, and cloud infrastructure.',
    icon: <Settings2 className="w-7 h-7 text-red-600" />,
  },
]

export default function TopicsPage() {
  return (
    <section className="bg-white py-20 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Explore Topics</h1>
      <p className="text-slate-600 max-w-2xl mx-auto mb-12">
        Choose your area of interest and dive into curated discussions, tutorials, and community Q&A.
      </p>

      <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow transition"
          >
            <div className="mb-4">{topic.icon}</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{topic.title}</h3>
            <p className="text-slate-600 text-sm">{topic.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
