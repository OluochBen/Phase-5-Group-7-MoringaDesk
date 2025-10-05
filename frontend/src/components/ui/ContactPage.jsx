// src/pages/ContactPage.jsx
import React from "react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        {/* Static Contact Info */}
        <div className="mb-12 space-y-4 text-lg text-gray-700">
          <p>
            📧 Email:{" "}
            <a
              href="mailto:Admin@moringadesk.com"
              className="text-green-600 hover:underline"
            >
              Admin@moringadesk.com
            </a>
          </p>
          <p>
            📞 Phone:{" "}
            <a
              href="tel:+2547123456"
              className="text-green-600 hover:underline"
            >
              +254 7123456
            </a>
          </p>
          <p>
            🏢 Address: <span className="text-gray-900">Moringa HQ, Nairobi, Kenya</span>
          </p>
          <p>🕐 Support Hours: Mon – Fri, 9:00 AM – 5:00 PM</p>
        </div>

        {/* Optional Static Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-700">
            Have questions or feedback? Reach out using the details above and our team will get
            back to you as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
}
