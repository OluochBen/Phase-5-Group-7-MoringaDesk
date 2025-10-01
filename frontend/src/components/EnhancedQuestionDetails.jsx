// src/components/EnhancedQuestionDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { problemsApi, solutionsApi, votesApi } from "../services/api";
import { Card, CardContent } from "./ui/card";
import { QuestionDetails } from "./QuestionDetails";

const normProblem = (row) => {
  const src = row?.attributes ? { id: row.id, ...row.attributes } : row || {};
  return {
    id: src.id,
    title: src.title ?? "(untitled)",
    body: src.description ?? src.body ?? "",
    tags: (src.tags || []).map((t) => (typeof t === "string" ? t : t?.name)),
    votes: src.votes ?? 0,
    views: src.views ?? 0,
    bounty: src.bounty ?? 0,
    createdAt: src.created_at || src.createdAt,
    authorId: src.author?.id ?? src.user_id ?? 0,
    authorName: src.author?.name ?? src.user_name ?? "Unknown",
  };
};

const normAnswers = (payload, qid) => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.solutions ??
      payload?.items ??
      payload?.data ??
      [];

  return (list || []).map((s, i) => {
    const a = s?.attributes ? { id: s.id, ...s.attributes } : s || {};
    return {
      id: a.id ?? `${qid}-a${i}`,
      authorId: a.author?.id ?? a.user_id ?? 0,
      authorName: a.author?.name ?? a.user_name ?? "Unknown",
      body: a.content ?? a.body ?? "",
      votes: a.votes ?? 0,
      userVote: a.user_vote ?? 0,
      timestamp: new Date(a.created_at || a.createdAt || Date.now()),
    };
  });
};

export default function EnhancedQuestionDetails({ currentUser }) {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        let p = await problemsApi.get(id);
        const problem = normProblem(p?.item ?? p);
        const sols = await solutionsApi.list(id, { page: 1, per_page: 20 });
        const answers = normAnswers(sols, id);

        if (!alive) return;
        setProblem(problem);
        setAnswers(answers);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load question");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <Card><CardContent className="p-6">Loading…</CardContent></Card>;
  if (err || !problem) return <Card><CardContent className="p-6 text-red-600">{err || "Not found"}</CardContent></Card>;

  return (
    <QuestionDetails
      question={{
        ...problem,
        answers,
      }}
      onAnswerVote={() => {}}
      onAddAnswer={async (qid, body) => {
        await solutionsApi.create(id, { content: body });
        const fresh = await solutionsApi.list(id, { page: 1, per_page: 20 });
        setAnswers(normAnswers(fresh, id));
      }}
      currentUser={currentUser}
    />
  );
}
