import { useParams } from "react-router-dom";
import Answers from "../../components/Answers"; // ✅ Import the Answers component

export default function QuestionDetailPage() {
  const { id } = useParams();

  // ✅ Mock questions — can be replaced with API call later
  const questions = {
    1: "How do I fix a CORS error in React? — Usually it involves adding the proper headers on your server.",
    2: "Best practices for structuring a Flask API — Keep routes modular, use Blueprints, and structure by features.",
    3: "How to set up Redux Toolkit in a React project? — Install @reduxjs/toolkit and create slices.",
  };

  const questionText = questions[id];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Question Details</h1>

      {questionText ? (
        <>
          <p className="text-lg mb-6 text-gray-800">{questionText}</p>

          {/* ✅ Render Answers component */}
          <Answers questionId={id} />

          <button
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </>
      ) : (
        <p className="text-red-500">Question not found.</p>
      )}
    </div>
  );
}
