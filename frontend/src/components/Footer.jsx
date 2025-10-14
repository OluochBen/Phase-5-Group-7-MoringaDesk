import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { publicApi } from '../services/api';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubscribe = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await publicApi.subscribe(email.trim(), 'footer_newsletter');
      setFeedback({ type: 'success', message: response?.message ?? 'Thanks for subscribing!' });
      setEmail('');
    } catch (error) {
      const message =
        error?.response?.data?.errors?.email?.[0] ||
        error?.response?.data?.message ||
        'We could not process your subscription. Please try again.';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Topics', href: '#topics' },
      { name: 'Community', href: '#community' },
      { name: 'FAQ', href: '/faq' },
      { name: 'System Status', href: '/status' },
      { name: 'API Docs', href: '/api-docs' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Bug Reports', href: '#bugs' },
      { name: 'Feature Requests', href: '#requests' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Code of Conduct', href: '/conduct' },
      { name: 'Community Guidelines', href: '/guidelines' }
    ]
  };

  const socialLinks = [
    { name: 'GitHub', icon: <Github className="w-5 h-5" />, href: 'https://github.com' },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, href: 'https://linkedin.com' },
    { name: 'Email', icon: <Mail className="w-5 h-5" />, href: 'mailto:hello@moringadesk.com' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">M</span>
              </div>
              <span className="text-xl font-bold">MoringaDesk</span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              Empowering developers and tech enthusiasts to learn, share, and grow together 
              through community-driven Q&A.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
                  asChild
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                    {social.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Links Sections */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold mb-2">Stay updated</h3>
              <p className="text-gray-400 text-sm">
                Get the latest updates and community highlights delivered to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full md:w-auto">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex-1 md:w-64"
                  aria-label="Email address"
                  required
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                >
                  {submitting ? 'Subscribing…' : 'Subscribe'}
                </Button>
              </div>
            </form>
          </div>
          {feedback && (
            <p
              className={`mt-3 text-sm ${
                feedback.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {feedback.message}
            </p>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col gap-4 text-center text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-1">
              <span>© {currentYear} MoringaDesk. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for the developer community.</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
              <span>Version 1.0.0</span>
              <a href="#status" className="hover:text-white transition-colors">System Status</a>
              <a href="#api" className="hover:text-white transition-colors">API Docs</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
