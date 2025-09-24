import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm text-slate-600">
        {/* Logo and summary */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
              M
            </div>
            <span className="text-lg font-semibold text-slate-800">MoringaDesk</span>
          </div>
          <p>Your trusted community for technical Q&A and learning.</p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-slate-800 font-semibold mb-2">Product</h4>
          <ul className="space-y-1">
            <li><Link to="/features" className="hover:underline">Features</Link></li>
            <li><Link to="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-800 font-semibold mb-2">Support</h4>
          <ul className="space-y-1">
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/guides" className="hover:underline">Guides</Link></li>
            <li><Link to="/help" className="hover:underline">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-800 font-semibold mb-2">Legal</h4>
          <ul className="space-y-1">
            <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
            <li><Link to="/cookies" className="hover:underline">Cookie Settings</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} MoringaDesk. All rights reserved.
      </div>
    </footer>
  )
}
