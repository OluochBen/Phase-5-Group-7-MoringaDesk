import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThumbsUp, MessageCircle, Eye, Users } from "lucide-react";

/**
 * QuestionCard
 * Renders a single question preview card in the feed.
 *
 * Props:
 * - question: { id, title, body, tags[], votes, views, answers[], authorName, timestamp }
 * - onClick: function → when user clicks card (go to details)
 * - onUserClick: function(uid) → click on author name
 */
export function QuestionCard({ question, onClick, onUserClick }) {
  const {
    id,
    title,
    body,
    tags = [],
    votes = 0,
    views = 0,
    answers = [],
    answersCount,
    followsCount = 0,
    authorId,
    authorName,
    timestamp,
  } = question;

  const answerTotal =
    typeof answersCount === "number"
      ? answersCount
      : Array.isArray(answers)
      ? answers.length
      : 0;

  const safeTags = Array.isArray(tags) ? tags.filter(Boolean) : [];

  return (
    <Card
      className="hover:shadow-md transition cursor-pointer"
      onClick={() => onClick?.(id)}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-2">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{title}</h2>

          {/* Body excerpt */}
          {body && (
            <p className="text-sm text-gray-600 line-clamp-2">{body}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {safeTags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4 text-gray-400" />
                {votes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                {answerTotal}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-400" />
                {views}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                {followsCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUserClick?.(authorId);
                }}
                className="text-xs font-medium hover:underline"
              >
                {authorName}
              </button>
              <span className="text-xs text-gray-400">
                {timestamp ? new Date(timestamp).toLocaleDateString() : ""}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
