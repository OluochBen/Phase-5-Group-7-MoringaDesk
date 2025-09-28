// src/components/QuestionCard.jsx
import React from "react";
import { ChevronUp, ChevronDown, MessageSquare, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";

/**
 * @typedef {Object} Question
 * @property {string|number} id
 * @property {string} title
 * @property {string} [body]
 * @property {string[]} [tags]
 * @property {number} [votes]
 * @property {number} [views]
 * @property {number} [bounty]
 * @property {Date|string|number} [timestamp]
 * @property {{id:string, authorName:string, body:string}[]} [answers]
 * @property {string|number} [authorId]
 * @property {string} [authorName]
 */

/**
 * @param {{
 *  question: Question,
 *  onClick?: () => void,
 *  onUserClick?: (userId: string|number) => void,
 *  onVote?: (id: string|number, delta: 1|-1) => void,
 *  currentUser?: any
 * }} props
 */
export function QuestionCard({
  question,
  onClick = () => {},
  onUserClick = () => {},
  onVote = () => {},
  currentUser = null,
}) {
  // tolerant time parsing (supports Date, ISO string, or epoch)
  const toDate = (v) =>
    v instanceof Date ? v : new Date(typeof v === "number" ? v : String(v || Date.now()));

  const formatTimeAgo = (value) => {
    const date = toDate(value);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    }
    return date.toLocaleDateString();
  };

  const handleVote = (e, delta) => {
    e.stopPropagation();
    if (currentUser) onVote(question.id, delta);
  };

  const handleUserClick = (e, userId) => {
    e.stopPropagation();
    onUserClick(userId);
  };

  const answers = question.answers ?? [];
  const latestAnswer = answers.length > 0 ? answers[answers.length - 1] : null;
  const tags = question.tags ?? [];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-1 min-w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-green-100"
              onClick={(e) => handleVote(e, 1)}
              disabled={!currentUser}
              aria-label="Upvote"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>

            <span className="text-lg font-semibold text-foreground">
              {question.votes ?? 0}
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100"
              onClick={(e) => handleVote(e, -1)}
              disabled={!currentUser}
              aria-label="Downvote"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-green-600">
              {question.title}
            </h3>

            {question.body && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {question.body}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{answers.length} answers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(question.timestamp)}</span>
                </div>
              </div>

              {/* Author */}
              <button
                className="flex items-center space-x-2 hover:text-green-600"
                onClick={(e) => handleUserClick(e, question.authorId)}
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {(question.authorName?.[0] || "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{question.authorName || "Unknown"}</span>
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Latest Answer Preview */}
      {latestAnswer && (
        <CardContent className="pt-0">
          <div className="border-t border-border pt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Latest Answer
              </Badge>
              <span className="text-xs text-muted-foreground">
                by {latestAnswer.authorName || "—"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {latestAnswer.body || ""}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
