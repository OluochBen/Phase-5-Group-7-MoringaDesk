import React from 'react'
import Hero from '../components/Hero'
import StatsSection from '../components/StatsSection'
import TopicsGrid from '../components/TopicsGrid'
import FeaturesGrid from '../components/FeaturesGrid'
import Testimonials from '../components/Testimonials'
import CallToAction from '../components/CallToAction'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <TopicsGrid />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <FeaturesGrid />
        </div>
      </section>

      <Testimonials />
      <CallToAction />
    </>
  )
}
