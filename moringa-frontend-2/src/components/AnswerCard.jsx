// src/components/AnswerCard.jsx
import { useState } from "react";

export default function AnswerCard({ answer, onVote }) {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (type) => {
    if (hasVoted) return;

    onVote(answer.id, type);
    setHasVoted(true);
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <p className="text-gray-800">{answer.content}</p>
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => handleVote("upvote")}
          className="text-green-500 font-bold hover:text-green-700"
        >
          👍
        </button>
        <button
          onClick={() => handleVote("downvote")}
          className="text-red-500 font-bold hover:text-red-700"
        >
          👎
        </button>
        <span className="text-gray-600 font-semibold">
          Votes: {answer.votes}
        </span>
      </div>
    </div>
  );
}
