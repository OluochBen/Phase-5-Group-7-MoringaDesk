import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Clock, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { QuestionCard } from './QuestionCard';

export function Dashboard({ questions, onQuestionClick, onUserClick, onVote, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  // Get all unique tags
  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)));
  const popularTags = allTags.slice(0, 10);

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = searchQuery === '' || 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag === '' || q.tags.includes(selectedTag);
      
      const matchesTab = 
        activeTab === 'all' ||
        (activeTab === 'unanswered' && q.answers.length === 0) ||
        (activeTab === 'following' && q.isFollowing);
      
      return matchesSearch && matchesTag && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'activity':
          const aLatest = a.answers.length > 0 
            ? Math.max(a.timestamp.getTime(), ...a.answers.map(ans => ans.timestamp.getTime()))
            : a.timestamp.getTime();
          const bLatest = b.answers.length > 0 
            ? Math.max(b.timestamp.getTime(), ...b.answers.map(ans => ans.timestamp.getTime()))
            : b.timestamp.getTime();
          return bLatest - aLatest;
        case 'newest':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  const stats = {
    totalQuestions: questions.length,
    answeredQuestions: questions.filter(q => q.answers.length > 0).length,
    totalVotes: questions.reduce((sum, q) => sum + q.votes + q.answers.reduce((aSum, a) => aSum + a.votes, 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to MoringaDesk</h1>
        <p className="text-muted-foreground">Find answers, share knowledge, and learn together</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.answeredQuestions}</p>
                <p className="text-sm text-muted-foreground">Answered Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVotes}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="activity">Recent Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
              <TabsList>
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onClick={() => onQuestionClick(question.id)}
                  onUserClick={onUserClick}
                  onVote={onVote}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedTag 
                      ? "Try adjusting your search or filters"
                      : "Be the first to ask a question!"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Popular Tags</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'secondary'}
                    className="cursor-pointer hover:bg-green-100 hover:text-green-800"
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {selectedTag && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTag('')}
                  className="w-full mt-2"
                >
                  Clear Filter
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions
                .filter(q => q.answers.length > 0)
                .sort((a, b) => Math.max(...b.answers.map(ans => ans.timestamp.getTime())) - Math.max(...a.answers.map(ans => ans.timestamp.getTime())))
                .slice(0, 5)
                .map((question) => {
                  const latestAnswer = question.answers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
                  return (
                    <div key={question.id} className="text-sm">
                      <p
                        className="font-medium truncate hover:text-green-600 cursor-pointer"
                        onClick={() => onQuestionClick(question.id)}
                      >
                        {question.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Answered by {latestAnswer.authorName}
                      </p>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
