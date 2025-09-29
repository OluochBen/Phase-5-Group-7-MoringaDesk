import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockQuestions } from "../data/mockData";
import { problemsApi } from "../services/api";

const QuestionsContext = createContext({ questions: [], addQuestion: () => {}, updateQuestion: () => {}, deleteQuestion: () => {}, setQuestions: () => {} });

export function QuestionsProvider({ children }) {
  const [questions, setQuestions] = useState(() => mockQuestions.slice().sort((a, b) => b.timestamp - a.timestamp));
  const DEMO_MODE = !import.meta.env.VITE_API_BASE;

  const normalizeProblem = (q) => ({
    id: String(q.id),
    title: q.title,
    body: q.description ?? q.body ?? "",
    tags: q.tags?.map?.((t) => t.name ?? t) ?? [],
    votes: Number(q.votes || 0),
    views: Number(q.views || 0),
    bounty: Number(q.bounty || 0),
    timestamp: q.created_at ? new Date(q.created_at) : q.timestamp instanceof Date ? q.timestamp : new Date(),
    lastActivity: q.updated_at ? new Date(q.updated_at) : q.lastActivity instanceof Date ? q.lastActivity : new Date(),
    status: q.status || "open",
    isFollowing: Boolean(q.isFollowing),
    answers: Array.isArray(q.answers) ? q.answers : [],
    authorId: q.user_id ?? q.authorId,
    authorName: q.author?.name ?? q.authorName,
    authorReputation: Number(q.author?.reputation || q.authorReputation || 0),
  });

  const loadFromApi = async () => {
    const res = await problemsApi.list({ page: 1, per_page: 50 });
    const list = res.questions ?? res.problems ?? res.items ?? res;
    const arr = Array.isArray(list) ? list : [];
    setQuestions(arr.map(normalizeProblem).sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    if (!DEMO_MODE) {
      loadFromApi().catch(() => {});
    }
  }, [DEMO_MODE]);

  const addQuestion = (q) => {
    // Ensure required shape and prepend to keep newest first
    const safe = {
      id: q.id,
      title: q.title,
      body: q.body,
      tags: Array.isArray(q.tags) ? q.tags : [],
      votes: Number(q.votes || 0),
      views: Number(q.views || 0),
      bounty: Number(q.bounty || 0),
      timestamp: q.timestamp instanceof Date ? q.timestamp : new Date(q.timestamp || Date.now()),
      lastActivity: q.lastActivity instanceof Date ? q.lastActivity : new Date(q.lastActivity || Date.now()),
      status: q.status || "open",
      isFollowing: Boolean(q.isFollowing),
      answers: Array.isArray(q.answers) ? q.answers : [],
      authorId: q.authorId,
      authorName: q.authorName,
      authorReputation: Number(q.authorReputation || 0),
    };
    setQuestions((prev) => [safe, ...prev]);
  };

  const updateQuestion = (id, changes) => {
    setQuestions((prev) => prev.map((q) => (String(q.id) === String(id) ? { ...q, ...changes } : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => String(q.id) !== String(id)));
  };

  const value = useMemo(() => ({ questions, setQuestions, addQuestion, updateQuestion, deleteQuestion, loadFromApi }), [questions]);

  return <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>;
}

export function useQuestions() {
  return useContext(QuestionsContext);
}
