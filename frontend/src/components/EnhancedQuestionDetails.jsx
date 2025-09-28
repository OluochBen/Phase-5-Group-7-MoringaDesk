import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { problemsApi, solutionsApi } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

// --- helper: normalize problem shape coming from API ---
function normalizeProblem(row) {
  if (!row) return null;
  const src = row.attributes ? { id: row.id, ...row.attributes } : row;
  const tags = (src.tags || []).map((t) => (typeof t === "string" ? t : t.name));
  return {
    id: src.id ?? src.problem_id ?? src._id ?? src.uuid,
    title: src.title ?? "(untitled)",
    body: src.description ?? src.body ?? "",
    tags,
    votes: src.votes ?? src.score ?? 0,
    views: src.views ?? 0,
    bounty: src.bounty ?? 0,
    createdAt: src.created_at || src.createdAt,
    authorName: src.author?.name ?? src.user_name ?? "Unknown",
  };
}

export default function EnhancedQuestionDetails({ currentUser }) {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [posting, setPosting] = useState(false);

  // load problem + solutions
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // Problem
        let p = await problemsApi.get(id);
        if (Array.isArray(p)) p = p[0];
        const normalized = normalizeProblem(p);
        if (!alive) return;
        setProblem(normalized);

        // Solutions
        const solsPayload = await solutionsApi.list(id, { page: 1, per_page: 20 });
        const list = Array.isArray(solsPayload)
          ? solsPayload
          : solsPayload?.data || solsPayload?.items || solsPayload?.results || [];

        const normalizedAnswers = list.map((s, i) => {
          const a = s?.attributes ? { id: s.id, ...s.attributes } : s || {};
          return {
            id: a.id ?? `${id}-a${i}`,
            authorName: a.author?.name ?? a.user_name ?? "Unknown",
            body: a.content ?? a.body ?? "",
            votes: a.votes ?? a.score ?? 0,
            createdAt: a.created_at || a.createdAt,
          };
        });
        if (!alive) return;
        setAnswers(normalizedAnswers);
      } catch (e) {
        if (!alive) return;
        const status = e?.response?.status ?? null;
        const message =
          status === 404
            ? "Problem not found."
            : status
            ? `Server error (${status}).`
            : e?.message || "Request failed.";
        setErr(message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const submitAnswer = async () => {
    if (!newAnswer.trim()) return;
    try {
      setPosting(true);
      await solutionsApi.create(id, { content: newAnswer.trim() });
      setNewAnswer("");
      // refresh answers
      const solsPayload = await solutionsApi.list(id, { page: 1, per_page: 20 });
      const list = Array.isArray(solsPayload)
        ? solsPayload
        : solsPayload?.data || solsPayload?.items || solsPayload?.results || [];
      setAnswers(
        list.map((s, i) => {
          const a = s?.attributes ? { id: s.id, ...s.attributes } : s || {};
          return {
            id: a.id ?? `${id}-a${i}`,
            authorName: a.author?.name ?? a.user_name ?? "Unknown",
            body: a.content ?? a.body ?? "",
            votes: a.votes ?? a.score ?? 0,
            createdAt: a.created_at || a.createdAt,
          };
        })
      );
    } catch (e) {
      const status = e?.response?.status ?? null;
      const message =
        status ? `Failed to post answer (${status}).` : e?.message || "Failed to post answer.";
      alert(message); // replace with a toast in your UI lib if you prefer
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading…</CardContent>
      </Card>
    );
  }

  if (err || !problem) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">
          Failed to load problem{err ? `: ${err}` : ""}.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Problem */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{problem.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {problem.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          <div className="prose max-w-none whitespace-pre-wrap">{problem.body}</div>
          <div className="text-sm text-muted-foreground">
            Asked by {problem.authorName}
            {problem.createdAt ? ` • ${new Date(problem.createdAt).toLocaleString()}` : ""}
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Answers ({answers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {answers.length === 0 ? (
            <div className="text-muted-foreground">No answers yet.</div>
          ) : (
            answers.map((a) => (
              <div key={a.id} className="border-b last:border-0 pb-4">
                <div className="text-sm text-muted-foreground mb-1">
                  {a.authorName}
                  {a.createdAt ? ` • ${new Date(a.createdAt).toLocaleString()}` : ""}
                </div>
                <div className="whitespace-pre-wrap">{a.body}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Answer */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer…"
              rows={6}
            />
            <Button onClick={submitAnswer} disabled={posting}>
              {posting ? "Posting…" : "Post Answer"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
