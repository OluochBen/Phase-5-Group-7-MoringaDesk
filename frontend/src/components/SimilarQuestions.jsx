import React from 'react';
import { ChevronRight, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function SimilarQuestions({ currentQuestion, allQuestions, onQuestionClick, maxResults = 5 }) {
  const questionPool = Array.isArray(allQuestions) ? allQuestions : [];
  // Find similar questions based on shared tags
  const getSimilarQuestions = () => {
    const currentTags = Array.isArray(currentQuestion?.tags) ? currentQuestion.tags : [];
    const candidates = questionPool.filter((q) => q && q.id !== currentQuestion.id);

    if (!candidates.length) return [];

    const hasDirectRelations = candidates.some((q) => q?.isDirectRelated);

    if (hasDirectRelations) {
      return candidates
        .map((question) => ({
          question,
          sharedTags: Array.isArray(question.tags)
            ? question.tags.filter((tag) => currentTags.includes(tag))
            : [],
          similarityScore: 1,
        }))
        .slice(0, maxResults);
    }

    return candidates
      .map((question) => {
        const questionTags = Array.isArray(question.tags) ? question.tags : [];
        const sharedTags = questionTags.filter((tag) => currentTags.includes(tag));
        const denominator = Math.max(questionTags.length || 1, currentTags.length || 1);
        const similarityScore = denominator ? sharedTags.length / denominator : 0;

        return {
          question,
          sharedTags,
          similarityScore,
        };
      })
      .filter((item) => item.similarityScore > 0)
      .sort((a, b) => {
        if (b.similarityScore !== a.similarityScore) {
          return b.similarityScore - a.similarityScore;
        }
        const aVotes = a.question?.votes ?? a.question?.follows_count ?? 0;
        const bVotes = b.question?.votes ?? b.question?.follows_count ?? 0;
        return bVotes - aVotes;
      })
      .slice(0, maxResults);
  };

  const similarQuestions = getSimilarQuestions();

  if (similarQuestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          Related Questions
          <Badge variant="secondary" className="ml-2">
            {similarQuestions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {similarQuestions.map(({ question, sharedTags }) => (
          <div
            key={question.id}
            className="group cursor-pointer p-3 rounded-lg border hover:border-blue-200 hover:bg-blue-50/50 transition-all"
            onClick={() => onQuestionClick(question.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-5">
                {question.title}
              </h4>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
            </div>
            
            {/* Shared tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {sharedTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Question stats */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{question.votes ?? question.follows_count ?? 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>{Array.isArray(question.answers) ? question.answers.length : (question.solutions_count ?? 0)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{question.views ?? 0}</span>
              </div>
              {question.acceptedAnswerId && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  Solved
                </Badge>
              )}
            </div>
          </div>
        ))}

        {allQuestions.length > maxResults && (
          <div className="pt-2 border-t">
            <button 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => {
                // Navigate to search page with current question's tags
                console.log('Show more similar questions for tags:', currentQuestion.tags);
              }}
            >
              View more similar questions →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
