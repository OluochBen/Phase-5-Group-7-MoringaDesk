import React from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';

export function QuestionCard({ question, onClick, onUserClick, onVote, currentUser }) {
  const formatTimeAgo = (date) => {
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
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleVote = (e, delta) => {
    e.stopPropagation();
    if (currentUser) {
      onVote(question.id, delta);
    }
  };

  const handleUserClick = (e, userId) => {
    e.stopPropagation();
    onUserClick(userId);
  };

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
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold text-foreground">{question.votes}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100"
              onClick={(e) => handleVote(e, -1)}
              disabled={!currentUser}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-semibold text-foreground mb-2 cursor-pointer hover:text-green-600"
            >
              {question.title}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {question.body}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Question Meta */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{question.answers.length} answers</span>
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
                    {question.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{question.authorName}</span>
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Answer Preview */}
      {question.answers.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t border-border pt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Latest Answer
              </Badge>
              <span className="text-xs text-muted-foreground">
                by {question.answers[question.answers.length - 1].authorName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {question.answers[question.answers.length - 1].body}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
