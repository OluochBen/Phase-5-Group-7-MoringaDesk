import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Edit, Calendar, Award, MessageSquare, ChevronUp, Settings, MapPin, 
  Globe, Mail, User, TrendingUp, Activity, Bookmark 
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { QuestionCard } from "./QuestionCard";
import { fetchProfile } from "../api/profile";

export function EnhancedUserProfile({ currentUser, onQuestionClick }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProfile(id, token);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  if (loading) return <div className="p-8 text-center">Loading profile…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const isOwnProfile = currentUser?.id === id;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-green-100">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-green-100 text-green-700">
                  {profile.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground text-sm mb-3">
                Joined {formatDate(profile.joinDate)}
              </p>

              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                  {profile.role}
                </Badge>
              </div>

              {isOwnProfile ? (
                <>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    <User className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.questions.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {profile.answers.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Answers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.badges.length > 0 ? (
                <ul className="space-y-2">
                  {profile.badges.map((b) => (
                    <li key={b.id} className="flex items-center space-x-2">
                      <span>{b.icon}</span>
                      <span>{b.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No badges yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">
                Questions ({profile.questions.length})
              </TabsTrigger>
              <TabsTrigger value="answers">
                Answers ({profile.answers.length})
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-6">
              {profile.questions.length > 0 ? (
                profile.questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onClick={() => onQuestionClick(q.id)}
                    currentUser={currentUser}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No questions yet</h3>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="answers" className="mt-6">
              {profile.answers.length > 0 ? (
                profile.answers.map((a) => (
                  <Card key={a.id} className="p-4 mb-4">
                    <p className="text-sm">{a.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(a.timestamp).toLocaleDateString()}
                    </p>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No answers yet</h3>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Activity feed coming soon...
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
