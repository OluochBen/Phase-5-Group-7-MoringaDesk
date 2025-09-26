import { Link } from "react-router-dom";

export default function HomePage() {
  const features = [
    {
      title: "Ask Questions",
      desc: "Post your questions and get answers from peers and mentors.",
    },
    {
      title: "Vote Answers",
      desc: "Upvote the most helpful answers to highlight quality content.",
    },
    {
      title: "Engage Community",
      desc: "Join discussions and collaborate with other students.",
    },
  ];

  return (
    <div className="font-sans text-gray-900">
      {/* Navbar */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded font-bold">
              M
            </div>
            <span className="font-bold text-lg">MoringaDesk</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-green-600">
              Features
            </a>
            <a href="#community" className="hover:text-green-600">
              Community
            </a>
            <a href="#about" className="hover:text-green-600">
              About
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-green-600">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Welcome to <span className="text-green-600">MoringaDesk</span>
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
          Your go-to platform for asking questions, sharing knowledge, and
          learning together. Join our community of developers, designers, and
          tech enthusiasts.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Get Started Free →
          </Link>
          <Link
            to="/login"
            className="bg-gray-100 px-6 py-3 rounded-lg text-gray-800 hover:bg-gray-200"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">
            Why Use MoringaDesk?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-3 text-green-600">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section
        id="community"
        className="py-20 bg-gradient-to-b from-white to-green-50 text-center"
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Join the Community
          </h2>
          <p className="text-gray-700 mb-8">
            Connect with other learners, share your knowledge, and grow together
            in a supportive environment.
          </p>
          <Link
            to="/register"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Join Now
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">About Us</h2>
          <p className="text-gray-700">
            MoringaDesk is built to help students collaborate and learn faster.
            By asking and answering questions, voting on helpful responses, and
            engaging in discussions, we create a shared knowledge base that
            benefits everyone.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p>© {new Date().getFullYear()} MoringaDesk — All Rights Reserved.</p>
      </footer>
    </div>
  );
}
