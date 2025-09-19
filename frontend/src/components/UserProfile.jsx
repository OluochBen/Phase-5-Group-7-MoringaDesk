import React, { useState } from 'react';
import { Edit, Calendar, Award, MessageSquare, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { QuestionCard } from './QuestionCard';

export function UserProfile({ userId, questions, onQuestionClick, currentUser }) {
  const [activeTab, setActiveTab] = useState('questions');

  // Mock user data (in real app, this would come from API)
  const profileUser = {
    id: userId,
    name: userId === currentUser?.id ? currentUser.name : 'John Doe',
    email: userId === currentUser?.id ? currentUser.email : 'john@example.com',
    role: userId === currentUser?.id ? currentUser.role : 'user',
    bio: 'Full-stack developer passionate about React, Node.js, and clean code. Love helping others learn to code!',
    joinDate: new Date('2023-06-15'),
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    reputation: 1247,
    badges: ['Top Contributor', 'Helpful Answer', 'Good Question']
  };

  const isOwnProfile = currentUser?.id === userId;

  // Filter questions by user
  const userQuestions = questions.filter(q => q.authorId === userId);
  const userAnswers = questions.filter(q => 
    q.answers.some(a => a.authorId === userId)
  ).map(q => ({
    ...q,
    userAnswer: q.answers.find(a => a.authorId === userId)
  }));

  // Calculate stats
  const stats = {
    questionsAsked: userQuestions.length,
    answersGiven: userAnswers.length,
    totalVotes: userQuestions.reduce((sum, q) => sum + q.votes, 0) +
                userAnswers.reduce((sum, q) => sum + q.userAnswer.votes, 0),
    reputation: profileUser.reputation
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                  <AvatarFallback className="text-2xl">
                    {profileUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                <p className="text-muted-foreground mb-2">{profileUser.email}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge variant={profileUser.role === 'admin' ? 'default' : 'secondary'}>
                    {profileUser.role}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profileUser.joinDate)}</span>
                  </div>
                </div>

                {isOwnProfile && (
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{profileUser.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.reputation}</div>
                  <div className="text-xs text-muted-foreground">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalVotes}</div>
                  <div className="text-xs text-muted-foreground">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.questionsAsked}</div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.answersGiven}</div>
                  <div className="text-xs text-muted-foreground">Answers</div>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Badges</h3>
                <div className="space-y-2">
                  {profileUser.badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-sm">
                {profileUser.location && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span>📍</span>
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.website && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span>🔗</span>
                    <a 
                      href={profileUser.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-green-600"
                    >
                      {profileUser.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Questions ({stats.questionsAsked})</TabsTrigger>
              <TabsTrigger value="answers">Answers ({stats.answersGiven})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-6">
              <div className="space-y-4">
                {userQuestions.length > 0 ? (
                  userQuestions
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        onClick={() => onQuestionClick(question.id)}
                        onUserClick={() => {}}
                        onVote={() => {}}
                        currentUser={currentUser}
                      />
                    ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                      <p className="text-muted-foreground">
                        {isOwnProfile 
                          ? "You haven't asked any questions yet. Start by asking your first question!"
                          : "This user hasn't asked any questions yet."
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="answers" className="mt-6">
              <div className="space-y-4">
                {userAnswers.length > 0 ? (
                  userAnswers
                    .sort((a, b) => b.userAnswer.timestamp.getTime() - a.userAnswer.timestamp.getTime())
                    .map((questionWithAnswer) => (
                      <Card 
                        key={questionWithAnswer.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onQuestionClick(questionWithAnswer.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold hover:text-green-600 mb-2">
                                {questionWithAnswer.title}
                              </h3>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {questionWithAnswer.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <ChevronUp className="w-4 h-4" />
                              <span>{questionWithAnswer.userAnswer.votes}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="border-t border-border pt-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {questionWithAnswer.userAnswer.body}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Answered {new Date(questionWithAnswer.userAnswer.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No answers yet</h3>
                      <p className="text-muted-foreground">
                        {isOwnProfile 
                          ? "You haven't provided any answers yet. Help others by answering their questions!"
                          : "This user hasn't provided any answers yet."
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock activity items */}
                    <div className="flex items-start space-x-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p>Asked a question about "React State Management"</p>
                        <p className="text-muted-foreground text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p>Answered "How to implement JWT authentication"</p>
                        <p className="text-muted-foreground text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p>Received 5 upvotes on answer</p>
                        <p className="text-muted-foreground text-xs">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
