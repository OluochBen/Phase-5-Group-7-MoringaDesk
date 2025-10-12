import React from "react";
import { ArrowRight, Users, Lightbulb, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const aboutHighlights = [
  {
    title: "Our Mission",
    description:
      "Empower every Moringa learner and alumni with a supportive space to ask questions, share breakthroughs, and grow together.",
    points: [
      "Bridge knowledge between classrooms, bootcamps, and real-world projects.",
      "Champion peer mentorship so no one feels stuck or left behind.",
    ],
  },
  {
    title: "How We Help",
    description:
      "We curate insights from mentors, instructors, and fellow learners into an always-on help desk tailored to the Moringa journey.",
    points: [
      "Smart tagging and search surface relevant answers in seconds.",
      "Real-time notifications keep you engaged with discussions that matter.",
    ],
  },
  {
    title: "What Drives Us",
    description:
      "We believe communities thrive when collaboration is celebrated and knowledge stays accessible.",
    points: [
      "Data-informed dashboards highlight learning trends for facilitators.",
      "Inclusive moderation keeps conversations respectful and constructive.",
    ],
  },
];

const foundingStory = [
  {
    title: "Born from the classroom",
    description:
      "MoringaDesk started as a student-led project when a cohort noticed valuable answers were being lost in chat threads and isolated group meetings.",
    icon: <Users className="w-5 h-5 text-green-600" />,
  },
  {
    title: "Built for real-world projects",
    description:
      "As alumni tackled client briefs and capstones, the need for a single, searchable repository became obvious. MoringaDesk evolved to capture every solution.",
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
  },
  {
    title: "Growing with the community",
    description:
      "Today we collaborate with facilitators and mentors to keep content verified, accessible, and tailored to the skills Moringa learners use daily.",
    icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
  },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
            About MoringaDesk
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Built for the Moringa community, by the Moringa community
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10">
            MoringaDesk is the collaborative knowledge base that keeps learning alive long after
            class ends. We connect students, alumni, mentors, and facilitators so you can move from
            question to breakthrough faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              onClick={() => navigate("/register")}
            >
              Join the community
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3"
              onClick={() => navigate("/faq")}
            >
              Explore FAQs
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Why MoringaDesk exists
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We set out to answer a simple question: how can learners retain the collective wisdom
              of every cohort and instructor? Traditional Q&A forums felt disconnected from the
              Moringa experience, while chat apps buried answers in endless threads. MoringaDesk
              combines the best of both worlds—structured knowledge with the warmth of a peer
              community.
            </p>

            <div className="mt-10 space-y-6">
              {foundingStory.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-green-100 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Growing impact</CardTitle>
              <CardDescription>
                From alumni success stories to real-time help for current cohorts, MoringaDesk is
                becoming an essential part of the learning toolkit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <p>
                Thousands of questions and solutions are already searchable, helping new students get
                unstuck and letting alumni give back as mentors.
              </p>
              <p>
                Facilitators use insights from MoringaDesk to plan workshops, identify trending gaps,
                and celebrate standout contributors.
              </p>
              <p>
                We continue to invest in moderation, accessibility, and analytics so that the
                platform evolves with every cohort.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-10">
            What keeps us motivated
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aboutHighlights.map((highlight) => (
              <Card key={highlight.title} className="border-green-100 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{highlight.title}</CardTitle>
                  <CardDescription>{highlight.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="space-y-2 text-sm text-gray-600">
                    {highlight.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-2 w-2 flex-none rounded-full bg-green-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
