import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import TopicsGrid from './components/TopicsGrid'
import FeaturesGrid from './components/FeaturesGrid'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
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
      </main>
      <Footer />
    </div>
  )
}
