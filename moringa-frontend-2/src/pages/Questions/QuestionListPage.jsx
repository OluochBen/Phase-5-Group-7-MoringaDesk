import { Link } from "react-router-dom";

export default function QuestionListPage() {
  const questions = [
    { id: 1, title: "How do I fix a CORS error in React?" },
    { id: 2, title: "Best practices for structuring a Flask API" },
    { id: 3, title: "How to set up Redux Toolkit in a React project?" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Questions</h1>

      <ul className="space-y-4">
        {questions.map((q) => (
          <li
            key={q.id}
            className="p-4 bg-white rounded shadow hover:bg-gray-50"
          >
            <Link to={`/questions/${q.id}`} className="text-blue-600 font-semibold">
              {q.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
