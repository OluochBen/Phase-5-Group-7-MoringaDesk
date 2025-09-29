// src/components/QuestionDetails.jsx
import React, { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ArrowLeft, Heart, Share2, Flag, User } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { AnswerForm } from "./AnswerForm";
import { votesApi } from "../services/api"; // expects voteSolution(id, 'up'|'down') & removeVote(id)

/**
 * Normalize a single answer for local vote state.
 * Accepts either `myVote`, `my_vote`, or `user_vote` coming from backend.
 */
function normalizeAnswer(a) {
  const myVote =
    typeof a.myVote === "number"
      ? a.myVote
      : typeof a.my_vote === "number"
      ? a.my_vote
      : typeof a.user_vote === "number"
      ? a.user_vote
      : 0; // -1, 0, 1

  return {
    ...a,
    myVote,
    votes: Math.max(0, a.votes ?? 0), // keep UI non-negative
    timestamp: a.timestamp || a.created_at || a.createdAt || new Date().toISOString(),
  };
}

export function QuestionDetails({ question, onVote, onAddAnswer, onUserClick, currentUser }) {
  // hydrate answers with a local myVote flag so toggling works nicely
  const [answers, setAnswers] = useState(
    (question.answers || []).map((a) => normalizeAnswer(a))
  );
  const [isFollowing, setIsFollowing] = useState(Boolean(question.isFollowing));
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const isAuthed = Boolean(currentUser);

  const formatTimeAgo = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Optional question-level vote hook-through
  const handleQuestionVote = (delta) => {
    if (!isAuthed) return;
    onVote?.(question.id, delta);
  };

  const handleFollow = () => setIsFollowing((f) => !f);

  const handleAnswerSubmit = (answerBody) => {
    onAddAnswer?.(question.id, answerBody);
    setShowAnswerForm(false);
  };

  // --- Answer voting (non-negative policy) ----------------------------------
  const handleAnswerVote = async (answerId, direction /* 1 for up, -1 for down */) => {
    if (!isAuthed) return;

    // Snapshot to enable rollback on API error
    const before = answers;

    // Optimistic update
    const after = answers.map((a) => {
      if (a.id !== answerId) return a;

      const cur = a.myVote ?? 0;            // -1, 0, 1
      const next = cur === direction ? 0 : direction;
      const rawNextScore = (a.votes ?? 0) + (next - cur);
      const nextScore = Math.max(0, rawNextScore); // clamp to non-negative

      return { ...a, myVote: next, votes: nextScore };
    });
    setAnswers(after);

    // Call API
    try {
      const prev = before.find((x) => x.id === answerId)?.myVote ?? 0;
      // If clicking up:
      if (direction === 1) {
        if (prev === 1) {
          // was up, clicking up again -> remove
          await votesApi.removeVote(answerId);
        } else {
          await votesApi.voteSolution(answerId, "up");
        }
      } else {
        // Downvote: we keep UI non-negative; allow toggling down only if
        //  - switching from up to down (allowed), or
        //  - current score > 0 (so the down doesn't go negative)
        const beforeA = before.find((x) => x.id === answerId);
        const curScore = beforeA?.votes ?? 0;
        const curMy = beforeA?.myVote ?? 0;
        if (curScore <= 0 && curMy !== 1) {
          // not allowed by policy -> revert and bail
          setAnswers(before);
          return;
        }

        if (curMy === -1) {
          // was down, clicking down -> remove
          await votesApi.removeVote(answerId);
        } else {
          await votesApi.voteSolution(answerId, "down");
        }
      }
    } catch (e) {
      // Revert on error
      console.error("answer vote failed", e);
      setAnswers(before);
    }
  };

  // sort answers by (non-negative) votes desc then newest
  const sortedAnswers = useMemo(() => {
    return [...answers].sort((a, b) => {
      const av = Math.max(0, a.votes ?? 0);
      const bv = Math.max(0, b.votes ?? 0);
      if (bv !== av) return bv - av;
      const at = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bt = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bt - at;
    });
  }, [answers]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Questions
      </Button>

      {/* Question */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start space-x-4">
            {/* Question votes (optional) */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-green-100"
                onClick={() => handleQuestionVote(1)}
                disabled={!isAuthed}
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
              <span className="text-2xl font-bold text-foreground">
                {Math.max(0, question.votes || 0)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-red-100"
                onClick={() => handleQuestionVote(-1)}
                disabled={!isAuthed || Math.max(0, question.votes || 0) === 0}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
            </div>

            {/* Question content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-4">{question.title}</h1>

              <div className="prose max-w-none mb-6">
                <p className="text-foreground">{question.body}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(question.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions & meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleFollow} disabled={!isAuthed}>
                    <Heart className={`w-4 h-4 mr-1 ${isFollowing ? "fill-current text-red-500" : ""}`} />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span>Asked {formatTimeAgo(question.timestamp)}</span>
                    <button
                      className="flex items-center space-x-2 hover:text-green-600 transition-colors"
                      onClick={() => onUserClick?.(question.authorId)}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {(question.authorName || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{question.authorName || "Unknown"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {sortedAnswers.length} {sortedAnswers.length === 1 ? "Answer" : "Answers"}
          </h2>
        </div>

        {isAuthed && (
          <>
            {showAnswerForm ? (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <AnswerForm onSubmit={handleAnswerSubmit} onCancel={() => setShowAnswerForm(false)} />
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setShowAnswerForm(true)} className="mb-6 bg-green-600 hover:bg-green-700">
                Write Answer
              </Button>
            )}
          </>
        )}

        <div className="space-y-6">
          {sortedAnswers.length > 0 ? (
            sortedAnswers.map((answer, index) => (
              <Card key={answer.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Answer votes */}
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 hover:bg-green-100 ${
                          answer.myVote === 1 ? "text-green-600" : ""
                        }`}
                        disabled={!isAuthed}
                        onClick={() => handleAnswerVote(answer.id, 1)}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>

                      <span className="text-lg font-semibold">{Math.max(0, answer.votes ?? 0)}</span>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 hover:bg-red-100 ${
                          answer.myVote === -1 ? "text-red-600" : ""
                        }`}
                        disabled={!isAuthed || Math.max(0, answer.votes ?? 0) === 0}
                        onClick={() => handleAnswerVote(answer.id, -1)}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Answer content */}
                    <div className="flex-1">
                      <div className="prose max-w-none mb-4">
                        <p className="text-foreground">{answer.body}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm">
                            <Flag className="w-3 h-3 mr-1" />
                            Report
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <span>Answered {formatTimeAgo(answer.timestamp)}</span>
                          <button
                            className="flex items-center space-x-2 hover:text-green-600 transition-colors"
                            onClick={() => onUserClick?.(answer.authorId)}
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {(answer.authorName || "?").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{answer.authorName}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                {index < sortedAnswers.length - 1 && <Separator />}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No answers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to answer this question and help the community!
                </p>
                {isAuthed && (
                  <Button onClick={() => setShowAnswerForm(true)} className="bg-green-600 hover:bg-green-700">
                    Write an Answer
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Related */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Related Questions</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "How to handle authentication in React applications?",
              "Best practices for JWT token storage",
              "Implementing role-based access control",
            ].map((title, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <button className="text-green-600 hover:underline">{title}</button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
