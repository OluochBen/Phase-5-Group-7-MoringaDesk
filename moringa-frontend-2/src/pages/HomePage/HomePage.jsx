import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-green-600">MoringaDesk</h1>
        <div className="flex space-x-6 text-gray-700 font-medium">
          <Link to="/features">Features</Link>
          <Link to="/topics">Topics</Link>
          <Link to="/community">Community</Link>
          <Link to="/about">About</Link>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <h2 className="text-4xl font-bold mb-4">
          Welcome to <span className="text-green-600">MoringaDesk</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Your go-to platform for asking questions, sharing knowledge, and
          learning together. Join our community of developers, designers, and
          tech enthusiasts.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Get Started Free →
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
