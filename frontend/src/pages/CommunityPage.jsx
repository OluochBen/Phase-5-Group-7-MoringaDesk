import React from 'react'

const testimonials = [
  {
    quote:
      "MoringaDesk has been invaluable for my learning journey. The community is incredibly helpful and supportive.",
    name: 'Sarah Chen',
    title: 'Frontend Developer',
    initials: 'SC',
  },
  {
    quote:
      'I love how easy it is to find answers and help others. The reputation system motivates quality contributions.',
    name: 'Marcus Johnson',
    title: 'Full Stack Engineer',
    initials: 'MJ',
  },
  {
    quote:
      'Great platform for both technical and design questions. The interface is clean and intuitive.',
    name: 'Lisa Rodriguez',
    title: 'UI/UX Designer',
    initials: 'LR',
  },
]

export default function CommunityPage() {
  return (
    <section className="bg-gray-50 py-20 px-4 text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">What our community says</h2>
      <p className="text-slate-600 mb-12">
        Hear from developers who have grown with MoringaDesk
      </p>
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-left"
          >
            <p className="text-slate-700 italic mb-6">"{item.quote}"</p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-4">
                {item.initials}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-600">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
