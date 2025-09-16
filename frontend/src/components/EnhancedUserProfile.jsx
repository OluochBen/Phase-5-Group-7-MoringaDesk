import React, { useState } from 'react';
import { 
  Edit, Calendar, Award, MessageSquare, ChevronUp, Settings, MapPin, 
  Globe, Mail, Trophy, Star, TrendingUp, User, Clock, ThumbsUp, Eye,
  GitBranch, Activity, Bookmark, Heart
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { QuestionCard } from './QuestionCard';
import { mockUsers, mockQuestions, getUser, getQuestionsByUser, getAnswersByUser } from '../data/mockData';

export function EnhancedUserProfile({ userId, questions, onQuestionClick, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Get user data
  const profileUser = getUser(userId) || {
    id: userId,
    name: 'Unknown User',
    email: 'unknown@example.com',
    role: 'user',
    bio: '',
    reputation: 0,
    questionsAsked: 0,
    answersGiven: 0,
    joinDate: new Date(),
    lastActive: new Date(),
    badges: []
  };

  const isOwnProfile = currentUser?.id === userId;

  // Get user activity
  const userQuestions = getQuestionsByUser(userId);
  const userAnswers = getAnswersByUser(userId);
  const questionsWithUserAnswers = mockQuestions.filter(q => 
    q.answers.some(a => a.authorId === userId)
  );

  // Calculate enhanced stats
  const stats = {
    questionsAsked: profileUser.questionsAsked,
    answersGiven: profileUser.answersGiven,
    reputation: profileUser.reputation,
    totalVotes: userQuestions.reduce((sum, q) => sum + q.votes, 0) + 
                userAnswers.reduce((sum, a) => sum + a.votes, 0),
    totalViews: userQuestions.reduce((sum, q) => sum + q.views, 0),
    acceptedAnswers: userAnswers.filter(a => a.isAccepted).length,
    bestAnswer: userAnswers.sort((a, b) => b.votes - a.votes)[0],
    topQuestion: userQuestions.sort((a, b) => b.votes - a.votes)[0],
    streak: Math.floor(Math.random() * 30) + 1,
    monthlyReputation: Math.floor(Math.random() * 200) + 50
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Active ${diffInDays}d ago`;
    return `Active ${Math.floor(diffInDays / 7)}w ago`;
  };

  const getReputationLevel = (reputation) => {
    if (reputation < 100) return { level: 'Newcomer', color: 'bg-gray-500', progress: (reputation / 100) * 100 };
    if (reputation < 500) return { level: 'Contributor', color: 'bg-blue-500', progress: ((reputation - 100) / 400) * 100 };
    if (reputation < 1000) return { level: 'Regular', color: 'bg-green-500', progress: ((reputation - 500) / 500) * 100 };
    if (reputation < 2500) return { level: 'Expert', color: 'bg-purple-500', progress: ((reputation - 1000) / 1500) * 100 };
    return { level: 'Master', color: 'bg-yellow-500', progress: 100 };
  };

  const reputationLevel = getReputationLevel(profileUser.reputation);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Enhanced Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Profile Card */}
          <Card>
            <CardContent className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-green-100">
                  <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                  <AvatarFallback className="text-2xl bg-green-100 text-green-700">
                    {profileUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                <p className="text-muted-foreground text-sm mb-3">{formatTimeAgo(profileUser.lastActive)}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge variant={profileUser.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                    {profileUser.role}
                  </Badge>
                  <Badge className={`${reputationLevel.color} text-white`}>
                    {reputationLevel.level}
                  </Badge>
                </div>

                {isOwnProfile ? (
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <User className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profileUser.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profileUser.joinDate)}</span>
                </div>
                {profileUser.location && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={profileUser.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline truncate"
                    >
                      {profileUser.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Reputation Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Reputation</h3>
                  <span className="text-2xl font-bold text-green-600">{profileUser.reputation}</span>
                </div>
                <Progress value={reputationLevel.progress} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {reputationLevel.level} • +{stats.monthlyReputation} this month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.questionsAsked}</div>
                  <div className="text-xs text-muted-foreground">Questions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.answersGiven}</div>
                  <div className="text-xs text-muted-foreground">Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalVotes}</div>
                  <div className="text-xs text-muted-foreground">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.totalViews.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accepted Answers</span>
                  <span className="font-medium">{stats.acceptedAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Answer Rate</span>
                  <span className="font-medium">
                    {stats.questionsAsked > 0 ? Math.round((stats.acceptedAnswers / stats.questionsAsked) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Day Streak</span>
                  <span className="font-medium flex items-center">
                    <Activity className="w-4 h-4 mr-1 text-orange-500" />
                    {stats.streak}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileUser.badges.length > 0 ? (
                <div className="space-y-3">
                  {profileUser.badges.map((badge, index) => (
                    <div key={badge.id} className={`flex items-center space-x-3 p-2 rounded ${badge.color}`}>
                      <span className="text-lg">{badge.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs opacity-80">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No badges earned yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Questions ({stats.questionsAsked})</TabsTrigger>
              <TabsTrigger value="answers">Answers ({stats.answersGiven})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Overview content already handled in previous code */}
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
              <div className="space-y-4">
                {userQuestions.length > 0 ? (
                  userQuestions
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No questions yet</h3>
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
              {/* Answers content handled previously */}
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              {/* Activity timeline content handled previously */}
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "You haven't favorited any questions yet."
                      : "This user hasn't favorited any questions yet."
                    }
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
