// src/components/EnhancedQuestionDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { problemsApi, solutionsApi, votesApi } from "../services/api";
import { Card, CardContent } from "./ui/card";
import { QuestionDetails } from "./QuestionDetails";

// ---- helpers ---------------------------------------------------------------
const normProblem = (row) => {
  if (!row) return null;
  const src = row?.attributes ? { id: row.id, ...row.attributes } : row;
  const tags = (src?.tags || []).map((t) => (typeof t === "string" ? t : t?.name));
  return {
    id: src?.id ?? src?.problem_id ?? src?._id ?? src?.uuid,
    title: src?.title ?? "(untitled)",
    body: src?.description ?? src?.body ?? "",
    tags,
    votes: src?.votes ?? src?.score ?? 0,
    views: src?.views ?? 0,
    bounty: src?.bounty ?? 0,
    createdAt: src?.created_at || src?.createdAt,
    authorId: src?.author?.id ?? src?.user_id ?? 0,
    authorName: src?.author?.name ?? src?.user_name ?? "Unknown",
  };
};

const normAnswers = (payload, qid) => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.solutions ?? payload?.data ?? payload?.items ?? payload?.results ?? [];
  return list.map((s, i) => {
    const a = s?.attributes ? { id: s.id, ...s.attributes } : s || {};
    return {
      id: a.id ?? `${qid}-a${i}`,
      authorId: a.author?.id ?? a.user_id ?? 0,
      authorName: a.author?.name ?? a.user_name ?? "Unknown",
      body: a.content ?? a.body ?? "",
      votes: a.votes ?? a.score ?? 0,
      // if your API returns the current user's vote on this answer, keep it:
      // -1, 0, +1
      userVote: a.user_vote ?? 0,
      timestamp: a.created_at
        ? new Date(a.created_at)
        : a.createdAt
        ? new Date(a.createdAt)
        : new Date(),
    };
  });
};

// ---- component -------------------------------------------------------------
export default function EnhancedQuestionDetails({ currentUser }) {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Fetch problem + solutions
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        let p = await problemsApi.get(id);
        if (Array.isArray(p)) p = p[0];
        p = normProblem(p);

        const sols = await solutionsApi.list(id, { page: 1, per_page: 20 });
        const a = normAnswers(sols, id);

        if (!alive) return;
        setProblem(p);
        setAnswers(a);
      } catch (e) {
        if (!alive) return;
        const msg =
          e?.response?.status
            ? `Server error (${e.response.status}).`
            : e?.message || "Failed to load problem";
        setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // Add answer
  const onAddAnswer = async (_qid, body) => {
    try {
      await solutionsApi.create(id, { content: body });
      const fresh = await solutionsApi.list(id, { page: 1, per_page: 20 });
      setAnswers(normAnswers(fresh, id));
    } catch (e) {
      console.error("add answer failed", e);
      alert("Failed to post answer.");
    }
  };

  // (Optional) question-level voting (not implemented yet)
  const onQuestionVote = (_qid, _delta) => {};

  // ---- ANSWER VOTING: optimistic update + persist via API ------------------
  const onAnswerVote = async (answerId, direction /* +1 or -1 */) => {
    if (!currentUser) {
      alert("Please log in to vote.");
      return;
    }

    // Optimistic state update
    let previousSnapshot = answers;
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.id !== answerId) return a;
        const current = a.userVote ?? 0; // -1, 0, +1
        let votes = a.votes;
        let userVote = current;

        if (current === direction) {
          // same click again -> remove vote
          votes -= direction;
          userVote = 0;
        } else if (current === 0) {
          // no vote -> apply new vote
          votes += direction;
          userVote = direction;
        } else {
          // switching sides: -1 <-> +1
          votes += 2 * direction;
          userVote = direction;
        }

        return { ...a, votes, userVote, _optimistic: true };
      })
    );

    // Persist on backend
    try {
      // Determine call based on prior state (from snapshot)
      const before = previousSnapshot.find((x) => x.id === answerId)?.userVote ?? 0;
      if (before === direction) {
        // remove vote
        await votesApi.removeVote(answerId);
      } else {
        // cast vote
        await votesApi.voteSolution(answerId, direction === 1 ? "up" : "down");
      }
      // success: drop the optimistic marker (optional)
      setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, _optimistic: false } : a)));
    } catch (e) {
      // Revert on failure and hard refresh the answers as truth source
      console.error("vote failed", e);
      try {
        const fresh = await solutionsApi.list(id, { page: 1, per_page: 20 });
        setAnswers(normAnswers(fresh, id));
      } catch {
        // last-resort full revert to snapshot
        setAnswers(previousSnapshot);
      }
      alert("Voting failed. Please try again.");
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

  // Build the shape QuestionDetails expects
  const qForDetails = {
    id: problem.id,
    title: problem.title,
    body: problem.body,
    tags: problem.tags || [],
    votes: problem.votes || 0,
    views: problem.views || 0,
    bounty: problem.bounty || 0,
    timestamp: problem.createdAt ? new Date(problem.createdAt) : new Date(),
    authorId: problem.authorId,
    authorName: problem.authorName,
    answers,
    isFollowing: false,
  };

  return (
    <QuestionDetails
      question={qForDetails}
      onVote={onQuestionVote}              // question-level votes (noop for now)
      onAnswerVote={onAnswerVote}          // <-- wire answer voting here
      onAddAnswer={onAddAnswer}
      onUserClick={(uid) => console.log("goto user", uid)}
      currentUser={currentUser || null}
    />
  );
}
