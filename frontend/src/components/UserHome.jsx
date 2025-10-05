// src/components/UserHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { problemsApi } from "../services/api";
import { TrendingUp, Users, MessageSquare, Tag as TagIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { QuestionCard } from "./QuestionCard";

const PER_PAGE = 10;

// ---- normalize API payload safely ----
function extractListAndTotal(payload) {
  let list = [];
  let total =
    payload?.meta?.total ??
    payload?.total ??
    payload?.count ??
    (Array.isArray(payload?.items) ? payload.items.length : null);

  if (Array.isArray(payload)) list = payload;
  else if (Array.isArray(payload?.items)) list = payload.items;
  else if (Array.isArray(payload?.questions)) list = payload.questions;
  else if (Array.isArray(payload?.data)) list = payload.data;

  return { list: list || [], total: total ?? (list?.length || 0) };
}

// ---- map raw problem row to UI question ----
function toQuestion(row) {
  const src = row?.attributes ? { id: row.id, ...row.attributes } : row || {};
  const id = src.id ?? src.problem_id ?? src._id ?? src.uuid;

  const rawTags = Array.isArray(src.tags)
    ? src.tags.map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean)
    : [];

  const rawAnswers = Array.isArray(src.answers) ? src.answers : [];
  const answersCount = rawAnswers.length || src.answers_count || src.solutions_count || 0;
  const answers = rawAnswers.length
    ? rawAnswers
    : Array.from({ length: answersCount }, (_, idx) => ({ id: `${id}-answer-${idx}` }));

  return {
    id,
    title: src.title ?? "(untitled)",
    body: src.description ?? src.body ?? "",
    tags: rawTags,
    votes: src.votes ?? src.score ?? 0,
    views: src.views ?? 0,
    bounty: src.bounty ?? 0,
    followsCount: src.follows_count ?? src.followers ?? 0,
    answers,
    answersCount,
    timestamp: new Date(src.created_at || src.createdAt || Date.now()),
    authorId: src.author?.id ?? src.user_id ?? 0,
    authorName: src.author?.name ?? src.user_name ?? "Unknown",
    isFollowing: Boolean(src.is_following),
  };
}

export default function UserHome({ currentUser }) {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get("page") || 1);
  const q = sp.get("q") || "";
  const sort = sp.get("sort") || "newest";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [total, setTotal] = useState(0);

  // fetch problems
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const payload = await problemsApi.list({ page, per_page: PER_PAGE, search: q });
        const { list, total } = extractListAndTotal(payload);

        if (!alive) return;
        setRows(list.map(toQuestion));
        setTotal(total);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load questions");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, q]);

  const filtered = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (sort === "votes") return (b.votes || 0) - (a.votes || 0);
      if (sort === "views") return (b.views || 0) - (a.views || 0);
      return (b.timestamp?.getTime?.() || 0) - (a.timestamp?.getTime?.() || 0);
    });
  }, [rows, sort]);

  const dashboardStats = useMemo(() => {
    if (!rows.length) {
      return { votes: 0, follows: 0, answers: 0, tags: 0 };
    }
    const tagSet = new Set();
    let votes = 0;
    let follows = 0;
    let answersTotal = 0;

    rows.forEach((q) => {
      votes += q.votes || 0;
      follows += q.followsCount || 0;
      answersTotal +=
        typeof q.answersCount === "number"
          ? q.answersCount
          : Array.isArray(q.answers)
          ? q.answers.length
          : 0;
      (q.tags || []).forEach((tag) => {
        if (tag) tagSet.add(tag.toLowerCase());
      });
    });

    return {
      votes,
      follows,
      answers: answersTotal,
      tags: tagSet.size,
    };
  }, [rows]);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Questions</h1>

      {rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-semibold">{dashboardStats.votes.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Followers</p>
                <p className="text-2xl font-semibold">{dashboardStats.follows.toLocaleString()}</p>
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Answers Logged</p>
                <p className="text-2xl font-semibold">{dashboardStats.answers.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Tags</p>
                <p className="text-2xl font-semibold">{dashboardStats.tags.toLocaleString()}</p>
              </div>
              <TagIcon className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      )}

      {loading && <Card><CardContent className="p-6">Loading…</CardContent></Card>}
      {err && <Card><CardContent className="p-6 text-red-600">{err}</CardContent></Card>}
      {!loading && !err && filtered.length === 0 && <Card><CardContent className="p-6">No questions found.</CardContent></Card>}

      <div className="space-y-4">
        {filtered.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            onClick={() => navigate(`/questions/${q.id}`)}
            onUserClick={(uid) => navigate(`/profile/${uid}`)}
            currentUser={currentUser}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => update({ page: Math.max(1, page - 1) })}
          disabled={page <= 1 || loading}
        >
          Prev
        </Button>
        <span className="px-2 text-sm">
          Page {page}{totalPages ? ` of ${totalPages}` : ""}
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
  );
}
