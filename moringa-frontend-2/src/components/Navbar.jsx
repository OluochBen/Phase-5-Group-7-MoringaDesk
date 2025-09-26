import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-green-600 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          MoringaDesk
        </Link>

        {/* Links */}
        <div className="space-x-6">
          <Link to="/" className="hover:text-gray-200">
            Home
          </Link>
          <Link to="/questions" className="hover:text-gray-200">
            Questions
          </Link>
          <Link to="/ask" className="hover:text-gray-200">
            Ask
          </Link>
          <Link to="/faqs" className="hover:text-gray-200">
            FAQs
          </Link>
          <Link to="/dashboard" className="hover:text-gray-200">
            Dashboard
          </Link>
          <Link to="/profile" className="hover:text-gray-200">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
