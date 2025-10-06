import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Search,
  Filter,
  ArrowRight,
  ThumbsUp,
  Eye,
  Clock,
  Crown,
} from "lucide-react";
import { problemsApi, tagsApi } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { AskQuestionDialog } from "./AskQuestionDialog";

const PER_PAGE = 10;

function normalizeQuestion(raw) {
  if (!raw) return null;
  const author = raw.author || {};
  const timestamp = raw.created_at ? new Date(raw.created_at) : new Date();
  const normalizedTags = (raw.tags || [])
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (tag && typeof tag.name === "string") return tag.name;
      return "";
    })
    .filter(Boolean)
    .map((tag) => tag.toLowerCase());
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? "(untitled)",
    description: raw.description ?? raw.body ?? "",
    tags: normalizedTags,
    votes: raw.votes ?? raw.score ?? 0,
    views: raw.views ?? raw.view_count ?? 0,
    bounty: raw.bounty ?? 0,
    answers: Array.isArray(raw.answers) ? raw.answers : [],
    isFollowing: Boolean(raw.isFollowing),
    authorName: author.name ?? raw.authorName ?? raw.user_name ?? "Unknown",
    authorAvatar: author.avatar,
    timestamp,
  };
}

export default function EnhancedDashboard({ currentUser }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [popularTags, setPopularTags] = useState([]);

  const navigate = useNavigate();

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await problemsApi.list({ page, per_page: PER_PAGE });
      const list = data.questions ?? data.problems ?? data.items ?? [];
      const normalized = list
        .map((item) => normalizeQuestion(item))
        .filter(Boolean);
      setItems(normalized);
      setHasMore(normalized.length === PER_PAGE);
    } catch (err) {
      console.error("Failed to load dashboard questions", err);
      setError(err.message || "Failed to load questions");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    let active = true;
    tagsApi
      .list({ page: 1, per_page: 50 })
      .then((data) => {
        if (!active) return;
        const tagCounts = new Map();
        const tagList = data?.items ?? data?.tags ?? [];
        if (Array.isArray(tagList) && tagList.length) {
          tagList.forEach((tag) => {
            const name = (tag.name || tag).toLowerCase();
            tagCounts.set(name, (tagCounts.get(name) || 0) + 1);
          });
        }
        items.forEach((question) => {
          question.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        });
        const sorted = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({ name, count }));
        if (active) setPopularTags(sorted);
      })
      .catch((err) => {
        console.error("Failed to load tags", err);
      });
    return () => {
      active = false;
    };
  }, [items]);

  const stats = useMemo(() => {
    const totalQuestions = items.length;
    const answeredQuestions = items.filter((q) => q.answers.length > 0).length;
    const totalViews = items.reduce((sum, q) => sum + q.views, 0);
    const totalBounty = items.reduce((sum, q) => sum + (q.bounty || 0), 0);
    const answerRate = totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    return {
      totalQuestions,
      answeredQuestions,
      totalViews,
      totalBounty,
      answerRate,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return items
      .filter((question) => {
        const matchesSearch =
          !search ||
          question.title.toLowerCase().includes(search) ||
          question.description.toLowerCase().includes(search) ||
          question.tags.some((tag) => tag.includes(search)) ||
          question.authorName.toLowerCase().includes(search);

        const matchesTab = (() => {
          switch (activeTab) {
            case "unanswered":
              return question.answers.length === 0;
            case "bounty":
              return question.bounty > 0;
            case "following":
              return Boolean(question.isFollowing);
            case "featured":
              return question.votes >= 5 || question.views >= 200;
            case "all":
            default:
              return true;
          }
        })();

        return matchesSearch && matchesTab;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "votes":
            return b.votes - a.votes;
          case "views":
            return b.views - a.views;
          case "bounty":
            return (b.bounty || 0) - (a.bounty || 0);
          case "newest":
          default:
            return b.timestamp.getTime() - a.timestamp.getTime();
        }
      });
  }, [items, searchTerm, activeTab, sortBy]);

  const topContributors = useMemo(() => {
    const map = new Map();
    items.forEach((question) => {
      const key = question.authorName || "Unknown";
      if (!map.has(key)) {
        map.set(key, { name: key, avatar: question.authorAvatar, contributions: 0 });
      }
      map.get(key).contributions += 1;
    });
    return Array.from(map.values())
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 3);
  }, [items]);

  const recentActivity = useMemo(() => {
    return [...items]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 4)
      .map((question) => ({
        id: question.id,
        title: question.title,
        answers: question.answers.length,
        timestamp: question.timestamp,
      }));
  }, [items]);

  if (loading && !items.length) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <header className="bg-white rounded-2xl border border-slate-200 px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Welcome back, {currentUser?.name || "there"}! 👋</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Discover answers, share knowledge, and grow with the community
              </h1>
              <p className="mt-3 text-sm text-slate-500">
                Explore the latest questions or ask for help on anything you're working on right now.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <AskQuestionDialog currentUser={currentUser} />
              <Button variant="outline" onClick={loadQuestions}>
                Refresh feed
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Questions</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.totalQuestions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-full bg-indigo-100 p-3 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Answer Rate</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.answerRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Eye className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Views</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.totalViews}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Bounty</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.totalBounty}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[2.2fr_1fr]">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search questions, tags, users..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="newest">Newest</option>
                      <option value="votes">Most Votes</option>
                      <option value="views">Most Views</option>
                      <option value="bounty">Highest Bounty</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: `All (${stats.totalQuestions})` },
                    { id: "unanswered", label: `Unanswered (${stats.totalQuestions - stats.answeredQuestions})` },
                    { id: "bounty", label: "Bounty" },
                    { id: "following", label: "Following" },
                    { id: "featured", label: "Featured" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        activeTab === tab.id
                          ? "bg-emerald-600 text-white shadow"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {filteredItems.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="p-10 text-center text-slate-500">
                  No questions match your current filters.
                </CardContent>
              </Card>
            )}

            {filteredItems.map((question) => {
              const isSolved = question.answers.length > 0;
              const lastUpdated = question.timestamp.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <Card key={question.id} className="shadow-sm border border-slate-100 hover:border-emerald-200 transition">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        {isSolved && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            ✓ Solved
                          </Badge>
                        )}
                        {question.bounty ? (
                          <Badge className="bg-amber-100 text-amber-700">
                            {question.bounty} bounty
                          </Badge>
                        ) : null}
                      </div>
                      <span className="text-xs text-slate-400">{lastUpdated}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/questions/${question.id}`)}
                      className="text-left text-lg font-semibold text-slate-900 hover:text-emerald-600"
                    >
                      {question.title}
                    </button>
                    <p className="text-sm text-slate-600 line-clamp-2">{question.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <Badge key={`${question.id}-${tag}`} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {question.votes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {question.answers.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {question.views}
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {question.timestamp.toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/questions/${question.id}`)}
                        className="ml-auto text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700 focus:outline-none"
                      >
                        View details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading || !hasMore}
              >
                Next
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-slate-500">
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularTags.map((tag) => (
                  <div key={tag.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs uppercase">
                        {tag.name}
                      </Badge>
                      <span className="text-slate-500">{tag.count} questions</span>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-medium text-emerald-600 hover:underline"
                      onClick={() => setSearchTerm(tag.name)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-slate-500">
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{contributor.name}</p>
                        <p className="text-xs text-slate-500">{contributor.contributions} questions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide text-slate-500">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    className="flex w-full flex-col items-start rounded-lg border border-transparent px-3 py-2 text-left hover:border-emerald-200"
                    onClick={() => navigate(`/questions/${activity.id}`)}
                  >
                    <span className="text-sm font-medium text-slate-900 line-clamp-1">
                      {activity.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {activity.answers} answers • {activity.timestamp.toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </div>
  );
}
