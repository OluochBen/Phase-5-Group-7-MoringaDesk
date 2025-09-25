import { useState } from "react";

function DashboardPage() {
  // Dummy static state
  const [recentQuestions] = useState([
    { id: 1, title: "How do I fix a CORS error in React?" },
    { id: 2, title: "Best practices for structuring a Flask API" },
    { id: 3, title: "How to set up Redux Toolkit in a React project?" },
  ]);

  const [notifications] = useState([
    { id: 1, message: "Your question got a new answer ✅" },
    { id: 2, message: "Your solution was upvoted ⬆️" },
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">MoringaDesk</h1>
        <nav>
          <ul className="space-y-4">
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Dashboard
            </li>
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Ask Question
            </li>
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              All Questions
            </li>
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              FAQs
            </li>
            <li className="text-gray-700 hover:text-blue-600 cursor-pointer">
              Profile
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <button className="bg-red-500 text-white px-4 py-2 rounded-md">
            Logout
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Welcome, Student 👋</h2>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="bg-blue-500 text-white p-4 rounded-md shadow hover:bg-blue-600">
              Ask Question
            </button>
            <button className="bg-green-500 text-white p-4 rounded-md shadow hover:bg-green-600">
              View All Questions
            </button>
            <button className="bg-yellow-500 text-white p-4 rounded-md shadow hover:bg-yellow-600">
              FAQs
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Questions</h3>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Answers</h3>
              <p className="text-2xl font-bold">34</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Votes</h3>
              <p className="text-2xl font-bold">58</p>
            </div>
          </div>

          {/* Recent Questions & Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Questions</h3>
              <ul className="space-y-2">
                {recentQuestions.map((q) => (
                  <li key={q.id} className="border-b pb-2">
                    {q.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li key={n.id} className="border-b pb-2">
                    {n.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
