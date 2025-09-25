import React from 'react'
import { CheckCircle } from 'lucide-react'

const features = [
'Get expert answers fast from a vetted community',
'Easily search by topic, tag, or technology',
'Upvote and bookmark your favorite answers',
'Follow discussions that matter to your growth',
'Clean interface with zero distractions',
'Mobile-friendly and responsive design'
]

export default function FeaturesPage() {
return (
<section className="bg-white py-20 px-6 text-center">
<div className="max-w-4xl mx-auto">
<h1 className="text-4xl font-bold text-slate-900 mb-6">Why Choose MoringaDesk</h1>
<p className="text-slate-600 mb-12">
We're designed with developers, designers, and tech learners in mind — no fluff, just value.
</p>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
{features.map((feature, index) => (
<div key={index} className="flex items-start gap-4">
<CheckCircle className="text-green-500 w-6 h-6 mt-1" />
<p className="text-slate-700 text-lg">{feature}</p>
</div>
))}
</div>
</div>
</section>
)
}

