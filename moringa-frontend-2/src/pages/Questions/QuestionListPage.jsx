import { Link } from "react-router-dom";

const dummyQuestions = [
  {
    id: 1,
    title: "How do I center a div in Tailwind CSS?",
    tags: ["CSS", "Tailwind"],
  },
  {
    id: 2,
    title: "What is useEffect in React?",
    tags: ["React", "Hooks"],
  },
];

export default function QuestionListPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
          All Questions
        </h2>

        <ul className="space-y-4">
          {dummyQuestions.map((q) => (
            <li
              key={q.id}
              className="border rounded-lg p-4 hover:shadow transition"
            >
              <Link to={`/questions/${q.id}`} className="text-lg font-semibold text-green-700 hover:underline">
                {q.title}
              </Link>
              <div className="flex flex-wrap gap-2 mt-2">
                {q.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
