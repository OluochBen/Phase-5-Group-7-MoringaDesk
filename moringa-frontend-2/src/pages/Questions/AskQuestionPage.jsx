import { useState } from "react";

export default function AskQuestionPage() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate API call
    setTimeout(() => {
      setSuccess(true);

      // Hide message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
          Ask a Question
        </h2>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded text-center">
            ✅ Your question has been posted!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Question Title
            </label>
            <input
              type="text"
              placeholder="e.g. How do I use React hooks?"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {["React", "JavaScript", "Python", "SQL", "CSS", "Other"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 transition text-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              rows="5"
              placeholder="Explain your question in detail..."
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Post Question
          </button>
        </form>
      </div>
    </div>
  );
}
