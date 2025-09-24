import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 border-b border-slate-700 pb-10">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 text-white font-bold rounded-md px-2 py-1">M</div>
              <span className="text-lg font-semibold text-white">MoringaDesk</span>
            </div>
            <p className="text-slate-400">
              Empowering developers and tech enthusiasts to learn, share, and grow together through community-driven Q&A.
            </p>
            {/* Social icons (can be updated with actual icons later) */}
            <div className="flex space-x-4 pt-2">
              <span>🐦</span>
              <span>💬</span>
              <span>🔗</span>
              <span>✉️</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-white">Features</Link></li>
              <li><Link to="/topics" className="hover:text-white">Topics</Link></li>
              <li><Link to="/community" className="hover:text-white">Community</Link></li>
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Bug Reports</a></li>
              <li><a href="#" className="hover:text-white">Feature Requests</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Code of Conduct</a></li>
              <li><a href="#" className="hover:text-white">Guidelines</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter + Bottom Section */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 mb-4 md:mb-0">
            <h4 className="text-white font-semibold">Stay updated</h4>
            <p className="text-slate-400 text-sm">Get the latest updates and community highlights delivered to your inbox.</p>
          </div>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-md px-4 py-2 bg-slate-800 text-white placeholder-slate-400 focus:outline-none"
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Subscribe
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-slate-700 pt-6 text-slate-500 flex flex-col md:flex-row items-center justify-between text-xs">
          <div>
            © 2025 <strong className="text-white">MoringaDesk</strong>. Made with ❤️ for the developer community.
          </div>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <span>Version 1.0.0</span>
            <span>System Status</span>
            <span>API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
