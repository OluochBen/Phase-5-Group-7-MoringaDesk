import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function PublicNavbar({ onLogin, onSignUp }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-foreground">MoringaDesk</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">
              Features
            </a>
            <a href="#topics" className="text-gray-600 hover:text-green-600 transition-colors">
              Topics
            </a>
            <a href="#community" className="text-gray-600 hover:text-green-600 transition-colors">
              Community
            </a>
            <a href="#about" className="text-gray-600 hover:text-green-600 transition-colors">
              About
            </a>
            {/* ✅ Contact Us as a route */}
            <Link
              to="/contact"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onLogin}
              className="text-gray-600 hover:text-green-600"
            >
              Sign In
            </Button>
            <Button
              onClick={onSignUp}
              className="bg-green-600 hover:bg-green-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
