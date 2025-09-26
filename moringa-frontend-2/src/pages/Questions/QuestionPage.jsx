import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Answers from "../../components/Answers";

export default function QuestionPage() {
  const { id } = useParams(); // get question id from URL
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);

  // Simulated database for demo
  const sampleQuestions = {
    101: {
      title: "How to center a div in CSS?",
      description: "I want to center a div horizontally and vertically."
    }
  };

  const sampleAnswers = {
    101: [
      { id: 1, content: "Use flexbox with justify-content and align-items.", votes: 5 },
      { id: 2, content: "Use CSS grid with place-items center.", votes: 3 }
    ]
  };

  useEffect(() => {
    // Load question and answers by id
    setQuestion(sampleQuestions[id] || { title: "Question not found", description: "" });
    setAnswers(sampleAnswers[id] || []);
  }, [id]);

  if (!question) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
      <p className="mb-6 text-gray-700">{question.description}</p>

      <h2 className="text-2xl font-semibold mb-4">Answers</h2>
      {answers.length > 0 ? (
        answers.map((answer) => <Answers key={answer.id} answer={answer} />)
      ) : (
        <p>No answers yet.</p>
      )}
    </div>
  );
}
