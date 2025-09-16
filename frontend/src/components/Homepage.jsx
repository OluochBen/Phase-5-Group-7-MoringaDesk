import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  TrendingUp,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Homepage() {
  const navigate = useNavigate();

  const stats = {
    questions: "10,000+",
    users: "5,000+",
    answers: "25,000+",
    communities: "50+",
  };

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-green-600" />,
      title: "Ask & Answer",
      description:
        "Get help from the community and share your knowledge with others",
    },
    {
      icon: <Search className="w-6 h-6 text-blue-600" />,
      title: "Smart Search",
      description:
        "Find answers quickly with our powerful search and filtering system",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: "Reputation System",
      description:
        "Build your reputation by providing helpful answers and asking good questions",
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "Community Driven",
      description:
        "Join a vibrant community of developers, designers, and tech enthusiasts",
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "Moderated Content",
      description:
        "Quality content ensured through community moderation and admin oversight",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Real-time Updates",
      description:
        "Get instant notifications when your questions receive answers",
    },
  ];

  const popularTopics = [
    { name: "React", count: "2,341 questions" },
    { name: "JavaScript", count: "3,567 questions" },
    { name: "Python", count: "1,892 questions" },
    { name: "CSS", count: "1,234 questions" },
    { name: "Node.js", count: "987 questions" },
    { name: "TypeScript", count: "1,456 questions" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Frontend Developer",
      content:
        "MoringaDesk has been invaluable for my learning journey. The community is incredibly helpful and supportive.",
      avatar: "SC",
    },
    {
      name: "Marcus Johnson",
      role: "Full Stack Engineer",
      content:
        "I love how easy it is to find answers and help others. The reputation system motivates quality contributions.",
      avatar: "MJ",
    },
    {
      name: "Lisa Rodriguez",
      role: "UI/UX Designer",
      content:
        "Great platform for both technical and design questions. The interface is clean and intuitive.",
      avatar: "LR",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-600">MoringaDesk</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your go-to platform for asking questions, sharing knowledge, and
            learning together. Join our community of developers, designers, and
            tech enthusiasts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              onClick={() => navigate("/register")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.questions}
              </div>
              <div className="text-gray-600">Questions Asked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.users}
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.answers}
              </div>
              <div className="text-gray-600">Answers Provided</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.communities}
              </div>
              <div className="text-gray-600">Topic Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to learn and grow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              MoringaDesk provides all the tools and features you need to ask
              questions, get answers, and contribute to the community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Popular Topics
            </h2>
            <p className="text-xl text-gray-600">
              Discover what the community is talking about
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTopics.map((topic, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-gray-600">{topic.count}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-green-700 bg-green-100"
                    >
                      Popular
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What our community says
            </h2>
            <p className="text-xl text-gray-600">
              Hear from developers who have grown with MoringaDesk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to join the community?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Start asking questions, sharing knowledge, and connecting with
            fellow developers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
              onClick={() => navigate("/register")}
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-3 font-medium"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
