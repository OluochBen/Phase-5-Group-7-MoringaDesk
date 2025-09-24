import React from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Frontend Developer',
    quote:
      'The best platform for Q&A in tech. The community is super helpful and the UI is clean and easy to navigate.',
    avatar: '/src/assets/avatar-sarah.png'
  },
  {
    id: 2,
    name: 'Marcus Lee',
    role: 'Fullstack Engineer',
    quote:
      'MoringaDesk has helped me level up my skills fast. I always find high-quality answers and helpful feedback.',
    avatar: '/src/assets/avatar-marcus.png'
  },
  {
    id: 3,
    name: 'Amina Yusuf',
    role: 'UX Designer',
    quote:
      'I love how active and positive the community is. I’ve even made professional connections through MoringaDesk.',
    avatar: '/src/assets/avatar-amina.png'
  }
]

export default function Testimonials() {
  return (
    <section className="bg-white py-16 border-t border-b">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">What our community says</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="p-6 bg-gray-50 rounded-xl shadow-sm text-left">
              <p className="text-sm text-slate-600 mb-4">“{t.quote}”</p>
              <div className="flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
