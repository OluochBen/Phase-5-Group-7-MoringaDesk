import React, { useEffect, useState } from 'react'

export default function FeaturesGrid() {
  const [features, setFeatures] = useState([])

  useEffect(() => {
    fetch('/api/features')
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch(() => {
        // fallback data in case API is unavailable
        setFeatures([
          {
            id: 1,
            title: 'Ask & Answer',
            body: 'Get help from the community and share your knowledge with others.'
          },
          {
            id: 2,
            title: 'Smart Search',
            body: 'Find answers quickly with powerful search and filtering.'
          },
          {
            id: 3,
            title: 'Reputation System',
            body: 'Build reputation by providing helpful answers.'
          },
          {
            id: 4,
            title: 'Community Driven',
            body: 'Join a vibrant community of developers and designers.'
          },
          {
            id: 5,
            title: 'Moderated Content',
            body: 'Quality content ensured through moderation.'
          },
          {
            id: 6,
            title: 'Real-time Updates',
            body: 'Get instant notifications when your questions receive answers.'
          }
        ])
      })
  }, [])

  return (
    <section id="features" className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Everything you need to learn and grow</h2>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          MoringaDesk provides all the tools and features you need to ask questions, get answers, and contribute to the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition"
          >
            <div className="mb-3 w-10 h-10 rounded-md bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">
              {feature.title.charAt(0)}
            </div>
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-slate-600 mt-2">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
