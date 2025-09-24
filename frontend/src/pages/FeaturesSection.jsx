import React from 'react'
import {
  Sparkles,
  ShieldCheck,
  Users,
  BookOpen,
  Globe2,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    title: 'Gamified Learning',
    description:
      'Earn reputation points and badges as you contribute and grow within the community.',
    icon: <Sparkles className="w-6 h-6 text-green-600" />,
  },
  {
    title: 'Safe & Supportive',
    description:
      'A moderated space to ensure respectful and inclusive interactions at all times.',
    icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
  },
  {
    title: 'Community Driven',
    description:
      'Built and nurtured by developers, designers, and tech learners around the globe.',
    icon: <Users className="w-6 h-6 text-green-600" />,
  },
  {
    title: 'Resource Library',
    description:
      'Access helpful guides, coding tutorials, and community-curated resources.',
    icon: <BookOpen className="w-6 h-6 text-green-600" />,
  },
  {
    title: 'Global Access',
    description:
      'No matter where you are, MoringaDesk connects learners and experts alike.',
    icon: <Globe2 className="w-6 h-6 text-green-600" />,
  },
  {
    title: 'Career Growth',
    description:
      'Upskill, get recognized, and find new opportunities through community engagement.',
    icon: <TrendingUp className="w-6 h-6 text-green-600" />,
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white text-center px-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose MoringaDesk?</h2>
      <p className="text-slate-600 mb-12 max-w-2xl mx-auto">
        Unlock your potential with a platform built for growth, collaboration, and learning.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto text-left">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 p-6 shadow-sm bg-white"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
