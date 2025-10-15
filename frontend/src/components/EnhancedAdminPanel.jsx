import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Tag,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

import { adminApi } from "../services/api";
import { AdminBlogManager } from "./AdminBlogManager";
import { AdminFeedbackManager } from "./AdminFeedbackManager";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

function formatShortNumber(value) {
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return formatter.format(value || 0);
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "0%";
  return `${Math.round(value)}%`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = diff / 60000;
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d ago`;
  const weeks = days / 7;
  if (weeks < 4) return `${Math.floor(weeks)}w ago`;
  const months = days / 30;
  if (months < 12) return `${Math.floor(months)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function normalizeQuestion(question) {
  const tags = Array.isArray(question?.tags) ? question.tags : [];
  return {
    id: question.id,
    title: question.title ?? "(untitled)",
    description: question.description ?? question.body ?? "",
    created_at: question.created_at ?? question.timestamp,
    updated_at: question.updated_at ?? question.timestamp,
    tags,
    problem_type: question.problem_type,
    solutions_count: question.solutions_count ?? 0,
    follows_count: question.follows_count ?? question.followers_count ?? 0,
    view_count: question.view_count ?? question.views ?? 0,
    vote_count: question.vote_total ?? question.vote_count ?? 0,
    authorName: question.authorName ?? question.author?.name ?? "Unknown",
    authorId: question.authorId ?? question.user_id,
    is_solved: Boolean(question.is_solved) || (question.solutions_count ?? 0) > 0,
    bounty: question.bounty ?? 0,
    is_featured: Boolean(question.is_featured),
    is_following: Boolean(question.is_following),
  };
}

const METRIC_CARD_CONFIG = [
  {
    key: "total_questions",
    label: "Total Questions",
    icon: Users,
    accent: "text-emerald-600 bg-emerald-100",
  },
  {
    key: "answer_rate",
    label: "Answer Rate",
    icon: TrendingUp,
    accent: "text-rose-600 bg-rose-100",
    isPercent: true,
    showProgress: true,
  },
  {
    key: "total_views",
    label: "Total Views",
    icon: Eye,
    accent: "text-indigo-600 bg-indigo-100",
  },
  {
    key: "total_bounty",
    label: "Total Bounty",
    icon: Sparkles,
    accent: "text-amber-600 bg-amber-100",
  },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "answers", label: "Most Answers" },
  { value: "bounty", label: "Highest Bounty" },
];

export function EnhancedAdminPanel({ currentUser }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.dashboard();
      setDashboard(data);
      const list = Array.isArray(data?.questions) ? data.questions : [];
      setQuestions(list.map(normalizeQuestion));
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
      setError(err?.response?.data?.error || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = dashboard?.metrics ?? {};
  const popularTags = dashboard?.popular_tags ?? [];
  const topContributors = dashboard?.top_contributors ?? [];
  const recentActivity = dashboard?.recent_activity ?? [];

  const counts = useMemo(() => {
    const base = {
      all: questions.length,
      unanswered: questions.filter((q) => q.solutions_count === 0).length,
      bounty: questions.filter((q) => (q.bounty || 0) > 0).length,
      following: questions.filter((q) => q.follows_count > 0).length,
      featured: questions.filter((q) => q.is_featured).length,
    };
    return base;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = [...questions];

    if (term) {
      data = data.filter((q) => {
        const haystack = [
          q.title,
          q.description,
          ...(Array.isArray(q.tags) ? q.tags : []),
          q.authorName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    if (activeTab === "unanswered") {
      data = data.filter((q) => q.solutions_count === 0);
    } else if (activeTab === "bounty") {
      data = data.filter((q) => (q.bounty || 0) > 0);
    } else if (activeTab === "following") {
      data = data.filter((q) => q.follows_count > 0);
    } else if (activeTab === "featured") {
      data = data.filter((q) => q.is_featured);
    }

    data.sort((a, b) => {
      if (sortBy === "popular") {
        const scoreA = (a.view_count || 0) + (a.vote_count || 0) * 2;
        const scoreB = (b.view_count || 0) + (b.vote_count || 0) * 2;
        return scoreB - scoreA;
      }
      if (sortBy === "answers") {
        return (b.solutions_count || 0) - (a.solutions_count || 0);
      }
      if (sortBy === "bounty") {
        return (b.bounty || 0) - (a.bounty || 0);
      }
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return data;
  }, [questions, searchTerm, activeTab, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading admin dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <h2 className="text-lg font-semibold text-red-600">Unable to load dashboard</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <Button onClick={loadDashboard}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="rounded-3xl border bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <Sparkles className="size-4" />
                Admin Dashboard
              </div>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Welcome back, {currentUser?.name ?? "Administrator"}! 👋
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Discover answers, monitor community health, and keep the platform thriving with
                real-time insights.
              </p>
            </div>
            <Button size="lg" onClick={() => navigate("/ask")} className="self-start">
              <Plus className="mr-2 size-4" />
              Ask Question
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METRIC_CARD_CONFIG.map((config) => {
            const rawValue = metrics[config.key] ?? 0;
            const displayValue = config.isPercent
              ? formatPercent(rawValue)
              : formatShortNumber(rawValue);
            return (
              <Card key={config.key} className="border-none shadow-sm ring-1 ring-slate-100">
                <CardContent className="flex flex-col gap-4 pt-6">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center justify-center rounded-full p-2 ${config.accent}`}
                    >
                      <config.icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {config.label}
                      </p>
                      <p className="text-3xl font-semibold text-slate-900">{displayValue}</p>
                    </div>
                  </div>
                  {config.showProgress && (
                    <div className="space-y-1">
                      <Progress value={Math.min(100, rawValue || 0)} />
                      <p className="text-xs text-slate-500">
                        {formatShortNumber(metrics.answered_questions ?? 0)} answered ·{" "}
                        {formatShortNumber(metrics.unanswered_questions ?? 0)} open
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="rounded-2xl border bg-white shadow-sm">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search questions, tags, or users…"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="flex w-full flex-col items-start gap-3 text-sm text-slate-500 lg:w-auto lg:flex-row lg:items-center">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full overflow-x-auto"
            >
              <TabsList className="inline-flex h-auto flex-wrap items-center gap-2 rounded-full bg-slate-100/60 p-2">
                <TabsTrigger value="all" className="rounded-full px-4 py-1 text-sm">
                  All ({counts.all})
                </TabsTrigger>
                <TabsTrigger value="unanswered" className="rounded-full px-4 py-1 text-sm">
                  Unanswered ({counts.unanswered})
                </TabsTrigger>
                <TabsTrigger value="bounty" className="rounded-full px-4 py-1 text-sm">
                  Bounty ({counts.bounty})
                </TabsTrigger>
                <TabsTrigger value="following" className="rounded-full px-4 py-1 text-sm">
                  Following ({counts.following})
                </TabsTrigger>
                <TabsTrigger value="featured" className="rounded-full px-4 py-1 text-sm">
                  Featured ({counts.featured})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 pt-6">
            {filteredQuestions.length === 0 ? (
              <Card className="border border-dashed bg-slate-50 py-12 text-center text-sm text-slate-500">
                <CardContent>No questions match the current filters.</CardContent>
              </Card>
            ) : (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {question.is_solved && (
                        <Badge className="bg-emerald-100 text-emerald-700">Solved</Badge>
                      )}
                      {(question.bounty || 0) > 0 && (
                        <Badge className="bg-amber-100 text-amber-700">
                          {formatShortNumber(question.bounty)} bounty
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatDate(question.created_at)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">{question.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {question.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {question.tags.slice(0, 6).map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <ThumbsUp className="size-3.5" />
                        {formatShortNumber(question.vote_count)} votes
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare className="size-3.5" />
                        {formatShortNumber(question.solutions_count)} answers
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="size-3.5" />
                        {formatShortNumber(question.view_count)} views
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {question.authorName}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
          <CardFooter className="justify-between border-t px-6 py-4 text-sm text-slate-500">
            <span>
              Showing {filteredQuestions.length} of {questions.length} questions
            </span>
            <Button variant="outline" onClick={loadDashboard}>
              Refresh
            </Button>
          </CardFooter>
        </section>

        <AdminBlogManager />

        <AdminFeedbackManager />
      </div>

      <aside className="space-y-6">
        <Card className="border-none bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="size-4 text-emerald-500" />
              Popular Tags
            </CardTitle>
            <CardDescription>Top topics the community engages with.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {popularTags.length === 0 && (
              <p className="text-sm text-slate-500">No tags yet.</p>
            )}
            {popularTags.map((tag) => (
              <div key={tag.name} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{tag.name}</span>
                <span className="text-slate-500">{formatShortNumber(tag.count)} questions</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-4 text-indigo-500" />
              Top Contributors
            </CardTitle>
            <CardDescription>Members driving the most impact.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {topContributors.length === 0 && (
              <p className="text-sm text-slate-500">No contributors yet.</p>
            )}
            {topContributors.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="w-7 justify-center bg-slate-100 text-slate-700">
                      #{user.rank}
                    </Badge>
                    <span className="font-medium text-slate-700">{user.name}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatShortNumber(user.reputation)} reputation ·{" "}
                    {formatShortNumber(user.answers)} answers
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-slate-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest movements in the knowledge base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 && (
              <p className="text-sm text-slate-500">No activity recorded.</p>
            )}
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-sm">
                <ChevronRight className="mt-0.5 size-4 text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatShortNumber(item.answers)} answers · {formatTimeAgo(item.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
