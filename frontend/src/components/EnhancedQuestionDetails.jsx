import React, { useState, useEffect } from 'react';
import { 
  ChevronUp, ChevronDown, ArrowLeft, Heart, Share2, Flag, Clock, User, 
  Award, Eye, MessageSquare, CheckCircle, Edit, Bookmark, Calendar,
  Trophy, ChevronRight, Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { AnswerForm } from './AnswerForm';
import { SimilarQuestions } from './SimilarQuestions';
import { mockQuestions } from '../data/mockData';

export function EnhancedQuestionDetails({ 
  question: propQuestion, 
  onVote, 
  onAddAnswer, 
  onUserClick, 
  onQuestionClick,
  onFollowQuestion,
  onBookmarkQuestion,
  currentUser 
}) {
  const [question, setQuestion] = useState(propQuestion);
  const [isFollowing, setIsFollowing] = useState(question.isFollowing || false);
  const [isBookmarked, setIsBookmarked] = useState(question.isFavorite || false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [selectedAnswerSort, setSelectedAnswerSort] = useState('votes');
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    setQuestion(prev => ({ ...prev, views: prev.views + 1 }));
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
    
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleVote = (delta) => {
    if (!currentUser) return;
    const newVote = delta > 0 ? 'up' : 'down';
    let actualDelta = delta;
    
    if (userVote === newVote) {
      setUserVote(null);
      actualDelta = -delta;
    } else if (userVote) {
      setUserVote(newVote);
      actualDelta = delta * 2;
    } else {
      setUserVote(newVote);
    }
    
    setQuestion(prev => ({ ...prev, votes: prev.votes + actualDelta }));
    onVote(question.id, actualDelta);
  };

  const handleAnswerVote = (answerId, delta) => {
    if (!currentUser) return;
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(answer =>
        answer.id === answerId 
          ? { ...answer, votes: answer.votes + delta }
          : answer
      )
    }));
  };

  const handleAcceptAnswer = (answerId) => {
    if (currentUser?.id !== question.authorId) return;
    setQuestion(prev => ({
      ...prev,
      acceptedAnswerId: prev.acceptedAnswerId === answerId ? undefined : answerId,
      answers: prev.answers.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId ? !answer.isAccepted : false
      }))
    }));
  };

  const handleAddComment = (answerId) => {
    if (!currentUser || !newComment.trim()) return;
    const comment = {
      id: Date.now().toString(),
      body: newComment,
      authorId: currentUser.id,
      authorName: currentUser.name,
      timestamp: new Date(),
      votes: 0
    };
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(answer =>
        answer.id === answerId
          ? { ...answer, comments: [...(answer.comments || []), comment] }
          : answer
      )
    }));
    setNewComment('');
    setShowCommentForm(null);
  };

  const getSortedAnswers = () => {
    const answers = [...question.answers];
    switch (selectedAnswerSort) {
      case 'newest':
        return answers.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'oldest':
        return answers.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      case 'votes':
      default:
        return answers.sort((a, b) => {
          if (a.isAccepted && !b.isAccepted) return -1;
          if (!a.isAccepted && b.isAccepted) return 1;
          return b.votes - a.votes;
        });
    }
  };

  const relatedQuestions = mockQuestions
    .filter(q => q.id !== question.id && q.tags.some(tag => question.tags.includes(tag)))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Questions
          </Button>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {question.bounty && question.bounty > 0 && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        <Trophy className="w-3 h-3 mr-1" />
                        {question.bounty} bounty
                      </Badge>
                    )}
                    {question.acceptedAnswerId && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Solved
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {question.status}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    {question.title}
                  </h1>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Asked {formatTimeAgo(new Date(question.timestamp))}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Modified {formatTimeAgo(new Date(question.lastActivity))}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{question.views} views</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                {/* Vote Section */}
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={userVote === 'up' ? 'bg-green-100 text-green-600' : ''}
                    onMouseEnter={(e) => { if (userVote !== 'up') e.currentTarget.style.backgroundColor = 'rgba(168, 218, 220, 0.2)'; }}
                    onMouseLeave={(e) => { if (userVote !== 'up') e.currentTarget.style.backgroundColor = 'transparent'; }}
                    onClick={() => handleVote(1)}
                    disabled={!currentUser}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </Button>
                  <span className="text-2xl font-bold text-foreground">{question.votes}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={userVote === 'down' ? 'bg-red-100 text-red-600' : ''}
                    onMouseEnter={(e) => { if (userVote !== 'down') e.currentTarget.style.backgroundColor = 'rgba(230, 57, 70, 0.2)'; }}
                    onMouseLeave={(e) => { if (userVote !== 'down') e.currentTarget.style.backgroundColor = 'transparent'; }}
                    onClick={() => handleVote(-1)}
                    disabled={!currentUser}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 w-10 p-0 mt-4 ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-yellow-100'}`}
                    onClick={() => {
                      setIsBookmarked(!isBookmarked);
                      onBookmarkQuestion?.(question.id, !isBookmarked);
                    }}
                    disabled={!currentUser}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <div className="prose max-w-none mb-6">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {question.body}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="hover:bg-green-100 hover:text-green-800 cursor-pointer"
                      >
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
                        onClick={() => {
                          setIsFollowing(!isFollowing);
                          onFollowQuestion?.(question.id, !isFollowing);
                        }}
                        disabled={!currentUser}
                        className={isFollowing ? 'bg-red-50 border-red-200 text-red-700' : ''}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                        {isFollowing ? 'Following' : 'Follow'} ({Math.floor(Math.random() * 20) + 1})
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Flag className="w-4 h-4 mr-1" />
                        Flag
                      </Button>
                      {currentUser?.id === question.authorId && (
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>

                    {/* Question Author */}
                    <div className="text-sm">
                      <div 
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onUserClick(question.authorId)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {question.authorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{question.authorName}</div>
                          <div className="text-muted-foreground text-xs">
                            {question.authorReputation} reputation
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Answers Section */}
          {/* ... Answer rendering logic remains identical, omitted here for brevity ... */}
        </div>

        {/* Sidebar */}
        {/* ... Sidebar rendering logic remains identical, omitted for brevity ... */}
      </div>
    </div>
  );
}
