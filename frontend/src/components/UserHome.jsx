// src/components/UserHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { problemsApi } from "../services/api";
import { Search as SearchIcon, TrendingUp, Eye, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { QuestionCard } from "./QuestionCard";

const PER_PAGE = 10;

/** Extract the array of problems/questions + total from many API shapes. */
function extractListAndTotal(payload) {
  let list = [];
  let total =
    payload?.total ??
    payload?.count ??
    payload?.meta?.total ??
    payload?.data?.total ??
    payload?.data?.meta?.total ??
    null;

  // If response itself is an array
  if (Array.isArray(payload)) list = payload;

  // Common container keys
  const keys = ["items", "results", "rows", "records", "problems", "questions", "data"];

  for (const k of keys) {
    const v = payload?.[k];
    if (Array.isArray(v)) {
      list = v;
      break;
    }
  }

  // One level deeper: { data: { items: [...] } }
  if (!list.length && payload?.data && typeof payload.data === "object") {
    for (const k of keys) {
      const v = payload.data[k];
      if (Array.isArray(v)) {
        list = v;
        break;
      }
    }
  }

  // JSON:API paginator: { data: [ ... ], meta: { total } }
  if (!list.length && Array.isArray(payload?.data)) {
    list = payload.data;
  }

  return { list, total };
}

/** Map backend row → UI model consumed by QuestionCard (tolerant to shapes). */
function toQuestion(row) {
  // JSON:API support: move attributes onto a flat object but keep id
  const src = row?.attributes ? { id: row.id, ...row.attributes } : row;

  const id = src.id ?? src.problem_id ?? src._id ?? src.uuid;
  const tagsArr = (src.tags || []).map((t) => (typeof t === "string" ? t : t.name));
  const answersCount =
    src.answers_count ??
    src.solutions_count ??
    (Array.isArray(src.answers) ? src.answers.length : 0);

  return {
    id,
    title: src.title,
    body: src.description ?? src.body ?? "",
    tags: tagsArr,
    votes: src.votes ?? src.score ?? 0,
    views: src.views ?? 0,
    bounty: src.bounty ?? 0,
    timestamp: new Date(src.created_at || src.createdAt || Date.now()),
    answers: Array.from({ length: answersCount }).map((_, i) => ({
      id: `${id}-a${i}`,
      authorName: src.last_answer_by?.name ?? "—",
      body: src.last_answer_excerpt ?? "",
    })),
    authorId: src.author?.id ?? src.user_id ?? 0,
    authorName: src.author?.name ?? src.user_name ?? "Unknown",
    isFollowing: Boolean(src.is_following),
  };
}

export default function UserHome({ currentUser }) {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // URL state
  const page = Number(sp.get("page") || 1);
  const q = sp.get("q") || "";
  const sort = sp.get("sort") || "newest"; // newest | votes | views
  const tab = sp.get("tab") || "all"; // all | unanswered | bounty | following

  // Data state
  const [raw, setRaw] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [total, setTotal] = useState(null);

  // Fetch from API (server handles paging + search)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const payload = await problemsApi.list({ page, per_page: PER_PAGE, search: q });
        const { list, total } = extractListAndTotal(payload);

        if (total && (!list || list.length === 0)) {
          // Helpful one-time console to inspect unexpected payload shapes
          // eslint-disable-next-line no-console
          console.warn("Problems payload (total>0 but empty list):", payload);
        }

        if (!alive) return;
        setRaw(list);
        setRows(list.map(toQuestion));
        setTotal(total);
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, q]);

  // Derived stats
  const stats = useMemo(() => {
    const totalQ = total ?? rows.length;
    const answered = rows.filter((q) => (q.answers?.length || 0) > 0).length;
    const views = rows.reduce((s, q) => s + (q.views || 0), 0);
    const bounty = rows.reduce((s, q) => s + (q.bounty || 0), 0);
    const answeredRate = totalQ ? Math.round((answered / totalQ) * 100) : 0;
    return { total: totalQ, answeredRate, views, bounty };
  }, [rows, total]);

  // Popular tags (from current page)
  const allTags = useMemo(() => {
    const s = new Set();
    raw.forEach((p) => (p.tags || []).forEach((t) => s.add(typeof t === "string" ? t : t.name)));
    return Array.from(s).slice(0, 12);
  }, [raw]);

  // Make Following safe: if user has none, treat as All
  const hasFollowing = rows.some((q) => q.isFollowing);
  const effectiveTab = tab === "following" && !hasFollowing ? "all" : tab;

  // Client filters/sorting (for tabs)
  const filtered = useMemo(() => {
    const byTab = rows.filter((q) => {
      if (effectiveTab === "unanswered") return (q.answers?.length ?? 0) === 0;
      if (effectiveTab === "bounty") return Boolean(q.bounty);
      if (effectiveTab === "following") return q.isFollowing;
      return true;
    });
    return byTab.sort((a, b) => {
      if (sort === "votes") return (b.votes || 0) - (a.votes || 0);
      if (sort === "views") return (b.views || 0) - (a.views || 0);
      return (b.timestamp?.getTime?.() || 0) - (a.timestamp?.getTime?.() || 0);
    });
  }, [rows, effectiveTab, sort]);

  // Tab counts (nice UX hints)
  const counts = useMemo(
    () => ({
      all: stats.total,
      unanswered: rows.filter((q) => (q.answers?.length ?? 0) === 0).length,
      bounty: rows.filter((q) => Boolean(q.bounty)).length,
      following: rows.filter((q) => q.isFollowing).length,
    }),
    [rows, stats.total]
  );

  // Update URL state
  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, String(v));
    });
    setSp(next, { replace: false });
  };

  const totalPages = total ? Math.max(1, Math.ceil(total / PER_PAGE)) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, {currentUser?.name || "there"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Discover answers, share knowledge, and grow with the community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <SearchIcon className="w-5 h-5 text-green-700" />
              </div>
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
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-700" />
              </div>
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
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-700" />
              </div>
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
              <div className="p-2.5 bg-amber-100 rounded-lg">
                <Gift className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{stats.bounty}</div>
                <div className="text-xs text-muted-foreground">Total Bounty</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main column */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  className="pl-9"
                  placeholder="Search questions, tags, users…"
                  value={q}
                  onChange={(e) => update({ q: e.target.value, page: 1 })}
                />
              </div>
              <Select value={sort} onValueChange={(v) => update({ sort: v })}>
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
            <Tabs value={effectiveTab} onValueChange={(v) => update({ tab: v, page: 1 })}>
              <TabsList>
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered ({counts.unanswered})</TabsTrigger>
                <TabsTrigger value="bounty">Bounty ({counts.bounty})</TabsTrigger>
                <TabsTrigger value="following">Following ({counts.following})</TabsTrigger>
                <TabsTrigger value="featured" disabled>
                  Featured
                </TabsTrigger>
              </TabsList>
              <TabsContent value={effectiveTab} />
            </Tabs>
          </div>

          {/* States + list */}
          {loading && (
            <Card>
              <CardContent className="p-6">Loading…</CardContent>
            </Card>
          )}
          {err && (
            <Card>
              <CardContent className="p-6 text-red-600">Error: {err}</CardContent>
            </Card>
          )}
          {!loading && !err && filtered.length === 0 && (
            <Card>
              <CardContent className="p-6">No questions found.</CardContent>
            </Card>
          )}

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

          {/* Pagination */}
          <div className="mt-6 flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => update({ page: Math.max(1, page - 1) })}
              disabled={page <= 1 || loading}
            >
              Prev
            </Button>
            <span className="px-2 text-sm">
              Page {page}
              {totalPages ? ` of ${totalPages}` : ""}
            </span>
            <Button
              variant="outline"
              onClick={() => update({ page: page + 1 })}
              disabled={loading || (totalPages ? page >= totalPages : false)}
            >
              Next
            </Button>
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
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
