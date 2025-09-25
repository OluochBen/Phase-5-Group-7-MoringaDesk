import { useParams } from "react-router-dom";

export default function QuestionDetailPage() {
  const { id } = useParams();

  const questions = {
    1: "How do I fix a CORS error in React? — Usually it involves adding the proper headers on your server.",
    2: "Best practices for structuring a Flask API — Keep routes modular, use Blueprints, and structure by features.",
    3: "How to set up Redux Toolkit in a React project? — Install @reduxjs/toolkit and create slices.",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Question Detail</h1>
      <p className="text-lg mb-6">{questions[id] || "Question not found."}</p>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  );
}
