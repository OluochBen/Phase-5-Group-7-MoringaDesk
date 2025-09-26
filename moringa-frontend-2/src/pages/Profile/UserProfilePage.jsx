// src/pages/Profile/ProfilePage.jsx
import React, { useState } from "react";

export default function UserProfilePage() {
  const [user, setUser] = useState({
    name: "Jane Doe",
    email: "jane.doe@example.com",
    reputation: 120,
    joined: "Jan 2024",
    avatar:
      "https://ui-avatars.com/api/?name=Jane+Doe&background=16a34a&color=fff",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });

  const recentQuestions = [
    { id: 1, title: "How do I fix a CORS error in React?", date: "2 days ago" },
    { id: 2, title: "Best practices for state management?", date: "5 days ago" },
  ];

  const recentAnswers = [
    {
      id: 1,
      content: "You can use Redux Toolkit for simpler state logic.",
      date: "1 day ago",
    },
    {
      id: 2,
      content: "Check your backend headers when handling CORS.",
      date: "4 days ago",
    },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      avatar: `https://ui-avatars.com/api/?name=${formData.name
        .split(" ")
        .join("+")}&background=16a34a&color=fff`,
    }));
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-6">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-full border-4 border-green-600"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="mt-2 text-sm text-gray-500">Joined {user.joined}</p>
        </div>
        <div className="ml-auto text-center">
          <p className="text-3xl font-bold text-green-600">{user.reputation}</p>
          <p className="text-gray-500 text-sm">Reputation</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-3 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          Recent Questions
        </h3>
        <div className="bg-white shadow rounded-lg p-4 space-y-3">
          {recentQuestions.map((q) => (
            <div key={q.id} className="border-b pb-2 last:border-none">
              <p className="text-green-600 font-medium hover:underline cursor-pointer">
                {q.title}
              </p>
              <p className="text-gray-500 text-sm">{q.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Answers */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          Recent Answers
        </h3>
        <div className="bg-white shadow rounded-lg p-4 space-y-3">
          {recentAnswers.map((a, index) => (
            <div key={index} className="border-b pb-2 last:border-none">
              <p className="text-gray-700 italic">"{a.content}"</p>
              <p className="text-gray-500 text-sm">{a.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Edit Profile
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


