import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Mail,
  MessageSquare,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { QuestionCard } from "../components/QuestionCard";
import { profileApi } from "../services/api";

const numberFormatter = new Intl.NumberFormat("en-US");

const formatFullDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatRelativeTime = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

const summarize = (text, maxLength = 140) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
};

export function EnhancedUserProfile({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const targetParam = String(id ?? "").toLowerCase();
        const targetId =
          !targetParam || targetParam === "me"
            ? currentUser?.id
            : targetParam;

        if (!targetId) {
          throw new Error("User not found");
        }

        const data = await profileApi.get(targetId);
        if (!alive) return;

        setProfileData({
          user: data?.user ?? {},
          questions: Array.isArray(data?.questions) ? data.questions : [],
          answers: Array.isArray(data?.answers) ? data.answers : [],
        });
      } catch (err) {
        if (alive) {
          console.error("Failed to load profile", err);
          setError(err?.message ?? "Failed to load profile");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [id, currentUser?.id]);

  const fallbackProfile = profileData ?? {
    user: {},
    questions: [],
    answers: [],
  };

  const user = fallbackProfile.user ?? {};
  const questions = Array.isArray(fallbackProfile.questions)
    ? fallbackProfile.questions
    : [];
  const answers = Array.isArray(fallbackProfile.answers)
    ? fallbackProfile.answers
    : [];

  const isOwnProfile = currentUser && String(currentUser.id) === String(user.id);
  const bio =
    user.bio ||
    "This community member hasn’t added a bio yet, but they’re busy learning, collaborating, and sharing knowledge on MoringaDesk.";

  const questionVotes = useMemo(
    () =>
      questions.reduce(
        (total, q) => total + (q.vote_total ?? q.vote_count ?? 0),
        0
      ),
    [questions]
  );

  const answerVotes = useMemo(
    () =>
      answers.reduce(
        (total, a) => total + (a.vote_count ?? a.votes ?? 0),
        0
      ),
    [answers]
  );

  const helpfulAnswers = useMemo(
    () =>
      answers.filter((a) => (a.vote_count ?? a.votes ?? 0) > 0).length,
    [answers]
  );

  const solvedQuestions = useMemo(
    () => questions.filter((q) => q.is_solved).length,
    [questions]
  );

  const followersReached = useMemo(
    () =>
      questions.reduce(
        (total, q) =>
          total + (q.followers_count ?? q.follows_count ?? q.view_count ?? 0),
        0
      ),
    [questions]
  );

  const reputation = useMemo(() => {
    const base = answerVotes * 10 + questionVotes * 4 + solvedQuestions * 15;
    return Math.max(base, helpfulAnswers * 20 || 0);
  }, [answerVotes, questionVotes, solvedQuestions, helpfulAnswers]);

  const quickStats = useMemo(
    () => [
      {
        label: "Questions Asked",
        value: questions.length,
        icon: MessageSquare,
        tone: "bg-white/20 text-white",
      },
      {
        label: "Answers Shared",
        value: answers.length,
        icon: CheckCircle2,
        tone: "bg-white/20 text-white",
      },
      {
        label: "Total Upvotes",
        value: questionVotes + answerVotes,
        icon: TrendingUp,
        tone: "bg-white/20 text-white",
      },
      {
        label: "Reputation",
        value: reputation,
        icon: Award,
        tone: "bg-white/20 text-white",
      },
    ],
    [questions.length, answers.length, questionVotes, answerVotes, reputation]
  );

  const tagBreakdown = useMemo(() => {
    const counts = new Map();
    questions.forEach((q) => {
      (q.tags || []).forEach((tag) => {
        const key = String(tag || "").trim();
        if (!key) return;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [questions]);

  const recentActivity = useMemo(() => {
    const events = [];

    questions.forEach((q) => {
      const stamp = q.created_at ?? q.timestamp;
      const parsed = stamp ? new Date(stamp) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return;
      events.push({
        id: `question-${q.id}`,
        type: "question",
        title: q.title,
        preview: summarize(q.description || q.body, 120),
        timestamp: parsed,
      });
    });

    answers.forEach((a) => {
      const stamp = a.created_at ?? a.timestamp;
      const parsed = stamp ? new Date(stamp) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return;
      events.push({
        id: `answer-${a.id}`,
        type: "answer",
        title: "Shared an answer",
        preview: summarize(a.content || a.body, 120),
        timestamp: parsed,
        questionId: a.question_id,
      });
    });

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 6);
  }, [questions, answers]);

  const uniqueActiveDays = useMemo(() => {
    const dates = new Set();
    [...questions, ...answers].forEach((item) => {
      const stamp = item.created_at ?? item.timestamp;
      if (!stamp) return;
      const dayKey = new Date(stamp).toISOString().slice(0, 10);
      dates.add(dayKey);
    });
    return dates.size;
  }, [questions, answers]);

  const achievements = useMemo(
    () => [
      {
        title: "Helpful Answers",
        value: helpfulAnswers,
        description: "Answers appreciated by the community",
        icon: <ThumbsUp className="h-5 w-5 text-emerald-600" />,
      },
      {
        title: "Questions Solved",
        value: solvedQuestions,
        description: "Threads marked as solved or answered",
        icon: <CheckCircle2 className="h-5 w-5 text-blue-600" />,
      },
      {
        title: "Learners Impacted",
        value: followersReached,
        description: "Times peers followed or viewed their questions",
        icon: <Users className="h-5 w-5 text-purple-600" />,
      },
      {
        title: "Active Days",
        value: uniqueActiveDays,
        description: "Days with questions or answers shared",
        icon: <Activity className="h-5 w-5 text-amber-600" />,
      },
    ],
    [helpfulAnswers, solvedQuestions, followersReached, uniqueActiveDays]
  );

  const lastActive = useMemo(
    () =>
      recentActivity.length > 0
        ? formatRelativeTime(recentActivity[0].timestamp)
        : "Moments ago",
    [recentActivity]
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Card className="border-dashed animate-pulse">
          <CardContent className="p-10 text-center text-muted-foreground">
            Loading profile…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-10 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-2">
              Unable to load profile
            </h2>
            <p className="text-muted-foreground">{error || "Profile not available right now."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero */}
      <Card className="shadow-sm border">
        <CardContent className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-24 w-24 border-4 border-muted shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-3xl bg-muted text-foreground">
                  {user.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {user.name ?? "Community Member"}
                  </h1>
                  {user.role && (
                    <Badge className="bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 max-w-2xl text-muted-foreground text-sm sm:text-base">
                  {bio}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Joined {formatFullDate(user.created_at)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Last active {lastActive}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Target className="h-4 w-4" /> Reputation {numberFormatter.format(reputation)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {isOwnProfile ? (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => navigate(`/profile/${user.id}/edit`)}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => navigate("/dashboard/settings")}
                  >
                    Dashboard Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                  {user.email && (
                    <Button
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => (window.location.href = `mailto:${user.email}`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-3xl font-semibold text-emerald-700">
                        {numberFormatter.format(stat.value)}
                      </span>
                      <span className="text-sm text-emerald-700/80">{stat.label}</span>
                    </div>
                    <div className="rounded-full bg-white p-3 shadow-sm">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start gap-2 bg-white shadow-sm border text-sm">
          <TabsTrigger value="overview" className="px-4 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="questions" className="px-4 py-2">
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="answers" className="px-4 py-2">
            Answers ({answers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>About {user.name?.split(" ")[0] || "this member"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-muted-foreground">
                <p className="text-gray-700 leading-relaxed">{bio}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <span className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
                      Joined
                    </span>
                    <p className="mt-1 text-sm text-gray-700">{formatFullDate(user.created_at)}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4">
                    <span className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                      Last Active
                    </span>
                    <p className="mt-1 text-sm text-gray-700">{lastActive}</p>
                  </div>
                  {user.email && (
                    <div className="rounded-lg bg-purple-50 p-4 sm:col-span-2">
                      <span className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                        Contact
                      </span>
                      <p className="mt-1 text-sm text-gray-700">{user.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.title} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-gray-100 p-2">
                      {achievement.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {achievement.title}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {numberFormatter.format(achievement.value ?? 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {tagBreakdown.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {tagBreakdown.map((tag) => (
                      <Badge
                        key={tag.tag}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm"
                      >
                        {tag.tag}
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
                          {tag.count}
                        </span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No tag activity yet. Start asking or answering questions to build your expertise map.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <ul className="space-y-4 text-sm">
                    {recentActivity.map((item) => (
                      <li key={item.id} className="flex gap-3">
                        <span
                          className={`mt-1 h-2 w-2 flex-none rounded-full ${
                            item.type === "question" ? "bg-emerald-500" : "bg-sky-500"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {item.type === "question" ? item.title : "Shared an answer"}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                          {item.preview && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.preview}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No activity yet. Answers and questions will show up here as soon as they’re shared.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={(questionId) => navigate(`/questions/${questionId}`)}
                onUserClick={(userId) => navigate(`/profile/${userId}`)}
              />
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                No questions yet. Post your first question to kickstart discussions!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          {answers.length > 0 ? (
            answers.map((answer) => (
              <Card key={answer.id} className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Answered Question #{answer.question_id}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {summarize(answer.content || answer.body, 200) || "Answer content not available."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {numberFormatter.format(answer.vote_count ?? answer.votes ?? 0)} upvotes
                        </span>
                        <span>{formatRelativeTime(answer.created_at ?? answer.timestamp)}</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="self-start"
                      onClick={() => navigate(`/questions/${answer.question_id}`)}
                    >
                      View question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                No answers yet. Share your expertise to help fellow learners.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EnhancedUserProfile;
