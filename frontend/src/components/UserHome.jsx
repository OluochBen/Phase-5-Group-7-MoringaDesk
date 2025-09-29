import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Eye, Gift, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { QuestionCard } from "./QuestionCard";
import { useQuestions } from "../context/QuestionsContext";
import { mockUsers } from "../data/mockData";

export function UserHome({ currentUser }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [tag, setTag] = useState("");

  const { questions } = useQuestions();

  const stats = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter((q) => q.answers.length > 0).length;
    const views = questions.reduce((s, q) => s + (q.views || 0), 0);
    const bounty = questions.reduce((s, q) => s + (q.bounty || 0), 0);
    const rate = total ? Math.round((answered / total) * 100) : 0;
    return { total, answeredRate: rate, views, bounty };
  }, [questions]);

  const allTags = useMemo(() => {
    const set = new Set();
    questions.forEach((q) => q.tags?.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 12);
  }, [questions]);

  const filtered = useMemo(() => {
    return questions
      .filter((q) =>
        [q.title, q.body, ...(q.tags || [])].some((t) =>
          String(t).toLowerCase().includes(query.toLowerCase())
        )
      )
      .filter((q) => (tag ? q.tags?.includes(tag) : true))
      .filter((q) =>
        tab === "all"
          ? true
          : tab === "unanswered"
          ? q.answers.length === 0
          : tab === "bounty"
          ? Boolean(q.bounty)
          : tab === "following"
          ? q.isFollowing
          : true
      )
      .sort((a, b) => {
        switch (sort) {
          case "votes":
            return (b.votes || 0) - (a.votes || 0);
          case "views":
            return (b.views || 0) - (a.views || 0);
          case "newest":
          default:
            return b.timestamp - a.timestamp;
        }
      });
  }, [questions, query, tag, tab, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {currentUser?.name || "there"}! 👋</h1>
        <p className="text-muted-foreground">Discover answers, share knowledge, and grow with the community</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg"><Search className="w-5 h-5 text-green-700" /></div>
              <div>
                <div className="text-2xl font-semibold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-700" /></div>
              <div>
                <div className="text-2xl font-semibold">{stats.answeredRate}%</div>
                <div className="text-xs text-muted-foreground">Answer Rate</div>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${stats.answeredRate}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg"><Eye className="w-5 h-5 text-purple-700" /></div>
              <div>
                <div className="text-2xl font-semibold">{stats.views}</div>
                <div className="text-xs text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-lg"><Gift className="w-5 h-5 text-amber-700" /></div>
              <div>
                <div className="text-2xl font-semibold">{stats.bounty}</div>
                <div className="text-xs text-muted-foreground">Total Bounty</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input className="pl-9" placeholder="Search questions, tags, users…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all">All ( {questions.length} )</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="bounty">Bounty</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
              <TabsContent value={tab} />
            </Tabs>
          </div>

          {/* Questions list */}
          <div className="space-y-4">
            {filtered.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onClick={() => navigate(`/questions/${q.id}`)}
                onUserClick={(uid) => navigate(`/profile/${uid}`)}
                onVote={() => {}}
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <Badge
                  key={t}
                  variant={tag === t ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setTag(tag === t ? "" : t)}
                >
                  {t}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockUsers
                .slice()
                .sort((a, b) => b.reputation - a.reputation)
                .slice(0, 5)
                .map((u, i) => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-muted-foreground">{i + 1}</span>
                      <span className="font-medium">{u.name}</span>
                    </div>
                    <span className="text-muted-foreground">{u.reputation}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
