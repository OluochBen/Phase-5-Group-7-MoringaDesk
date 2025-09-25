/*import { useState } from "react";

const AskQuestionPage = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState("");

  const availableTags = ["React", "JavaScript", "Python", "SQL", "CSS","Other"];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, tags, description });
    // Later: send this data to your backend
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Ask a Question</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        // {/* This is a comment *///}

        /*<div>
          <label className="block text-gray-700 mb-1">Question Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I use React hooks?"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Tags dropdown (multi-select) *///}
        /*<div>
          <label className="block text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded border ${
                  tags.includes(tag)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Description *///}
       /* <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your question in detail..."
            className="w-full p-2 border rounded h-32"
          />
        </div>

        {/* Submit button *///}
        /*<button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Post Question
        </button>
      </form>
    </div>
  );
};

export default AskQuestionPage;
*/
import { useState } from "react";

const AskQuestionPage = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState("");

  const availableTags = ["React", "JavaScript", "Python", "SQL", "CSS", "Other"];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, tags, description });

    // TODO: send data to backend
    setTitle("");
    setTags([]);
    setDescription("");
    alert("Your question has been posted!");
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Ask a Question</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Question Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I use React hooks?"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded border transition duration-200 ${
                  tags.includes(tag)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your question in detail..."
            className="w-full p-3 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:scale-105 transition transform duration-300"
        >
          Post Question
        </button>
      </form>
    </div>
  );
};

export default AskQuestionPage;
