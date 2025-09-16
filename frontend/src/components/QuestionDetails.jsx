import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ArrowLeft, Heart, Share2, Flag, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { AnswerForm } from './AnswerForm';

export function QuestionDetails({ question, onVote, onAddAnswer, onUserClick, currentUser }) {
  const [isFollowing, setIsFollowing] = useState(question.isFollowing || false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const handleVote = (delta) => {
    if (currentUser) {
      onVote(question.id, delta);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleAnswerSubmit = (answerBody) => {
    onAddAnswer(question.id, answerBody);
    setShowAnswerForm(false);
  };

  const sortedAnswers = [...question.answers].sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Questions
      </Button>

      {/* Question */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start space-x-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-green-100"
                onClick={() => handleVote(1)}
                disabled={!currentUser}
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
              <span className="text-2xl font-bold text-foreground">{question.votes}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-red-100"
                onClick={() => handleVote(-1)}
                disabled={!currentUser}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {question.title}
              </h1>

              <div className="prose max-w-none mb-6">
                <p className="text-foreground">{question.body}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Question Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFollow}
                    disabled={!currentUser}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
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

                {/* Question Author and Date */}
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span>Asked {formatTimeAgo(question.timestamp)}</span>
                    <button
                      className="flex items-center space-x-2 hover:text-green-600 transition-colors"
                      onClick={() => onUserClick(question.authorId)}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {question.authorName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{question.authorName}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>
          {currentUser && (
            <Button 
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              {showAnswerForm ? 'Cancel' : 'Write Answer'}
            </Button>
          )}
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <AnswerForm onSubmit={handleAnswerSubmit} onCancel={() => setShowAnswerForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Answers List */}
        <div className="space-y-6">
          {sortedAnswers.length > 0 ? (
            sortedAnswers.map((answer, index) => (
              <Card key={answer.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Answer Vote Section */}
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-green-100"
                        disabled={!currentUser}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <span className="text-lg font-semibold">{answer.votes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        disabled={!currentUser}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      <div className="prose max-w-none mb-4">
                        <p className="text-foreground">{answer.body}</p>
                      </div>

                      {/* Answer Actions and Author */}
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
                            onClick={() => onUserClick(answer.authorId)}
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {answer.authorName.charAt(0).toUpperCase()}
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
                {currentUser && (
                  <Button 
                    onClick={() => setShowAnswerForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Write an Answer
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Related Questions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Related Questions</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'How to handle authentication in React applications?',
              'Best practices for JWT token storage',
              'Implementing role-based access control'
            ].map((title, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <button className="text-green-600 hover:underline">
                  {title}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
