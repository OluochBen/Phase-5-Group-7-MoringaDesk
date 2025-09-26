import { useState } from "react";

export default function Answers({ answer }) {
  const [votes, setVotes] = useState(answer.votes || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (type) => {
    if (hasVoted) return; // prevent double voting

    if (type === "upvote") setVotes(votes + 1);
    else if (type === "downvote") setVotes(votes - 1);

    setHasVoted(true);

    // TODO: Connect to backend to persist vote
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
        <span className="text-gray-600 font-semibold">Votes: {votes}</span>
      </div>
    </div>
  );
}
