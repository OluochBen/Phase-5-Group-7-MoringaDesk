// src/components/EnhancedQuestionDetails.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { problemsApi, solutionsApi } from "../services/api";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { QuestionDetails } from "./QuestionDetails";
import { SimilarQuestions } from "./SimilarQuestions";
import { ArrowLeft, AlertCircle } from "lucide-react";

function mapSolutionForView(solution, currentUser) {
  if (!solution) return null;
  const author = solution.author || currentUser || {};
  const createdAt = solution.timestamp || solution.created_at || solution.createdAt;
  const baseVotes = solution.votes ?? solution.vote_count ?? 0;

  return {
    id: solution.id,
    questionId: solution.question_id,
    authorId: solution.authorId || solution.user_id || author.id,
    authorName: solution.authorName || author.name || "Anonymous",
    author,
    body: solution.body || solution.content || "",
    content: solution.content || solution.body || "",
    votes: baseVotes,
    myVote: solution.my_vote ?? solution.user_vote ?? 0,
    userVote: solution.user_vote ?? solution.my_vote ?? 0,
    timestamp: createdAt || new Date().toISOString(),
    created_at: solution.created_at,
    updated_at: solution.updated_at,
  };
}

function mapRelatedQuestionForView(raw) {
  if (!raw) return null;
  const author = raw.author || {};
  const createdAt = raw.created_at || raw.createdAt || new Date().toISOString();
  return {
    id: raw.id,
    title: raw.title || "(untitled)",
    description: raw.description || raw.body || "",
    body: raw.description || raw.body || "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    votes: raw.votes ?? raw.follows_count ?? 0,
    views: raw.views ?? 0,
    answers: Array.isArray(raw.answers) ? raw.answers : [],
    solutions_count: raw.solutions_count ?? (Array.isArray(raw.answers) ? raw.answers.length : 0),
    follows_count: raw.follows_count ?? 0,
    createdAt,
    updatedAt: raw.updated_at || raw.updatedAt,
    timestamp: createdAt,
    authorId: author.id || raw.user_id || raw.authorId || 0,
    authorName: author.name || raw.authorName || raw.user_name || "Unknown",
    author: {
      id: author.id || raw.user_id || raw.authorId || 0,
      name: author.name || raw.authorName || raw.user_name || "Unknown",
      email: author.email || "",
      role: author.role || "user",
    },
    problem_type: raw.problem_type,
    isFollowing: Boolean(raw.isFollowing),
    isDirectRelated: Boolean(raw.is_direct_related || raw.isDirectRelated),
  };
}

function mapQuestionForView(raw) {
  const author = raw.author || {};
  const createdAt = raw.created_at || raw.createdAt || new Date().toISOString();

  const base = {
    id: raw.id,
    title: raw.title || "(untitled)",
    description: raw.description || raw.body || "",
    body: raw.description || raw.body || "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    votes: raw.votes || raw.follows_count || 0,
    views: raw.views || 0,
    bounty: raw.bounty || 0,
    createdAt,
    updatedAt: raw.updated_at || raw.updatedAt,
    timestamp: createdAt,
    authorId: author.id || raw.user_id || raw.authorId || 0,
    authorName: author.name || raw.authorName || raw.user_name || "Unknown",
    author: {
      id: author.id || raw.user_id || raw.authorId || 0,
      name: author.name || raw.authorName || raw.user_name || "Unknown",
      email: author.email || "",
      role: author.role || "user",
    },
    user_id: author.id || raw.user_id || raw.authorId || 0,
    solutions_count: raw.solutions_count || 0,
    follows_count: raw.follows_count || 0,
    isFollowing: Boolean(raw.isFollowing),
    answers: Array.isArray(raw.answers) ? raw.answers : [],
  };

  const relatedRaw = raw.related_questions || raw.relatedQuestions;
  if (Array.isArray(relatedRaw) && relatedRaw.length) {
    const mappedRelated = relatedRaw
      .map((item) => {
        const sanitized = { ...item };
        delete sanitized.related_questions;
        delete sanitized.relatedQuestions;
        return mapRelatedQuestionForView(sanitized);
      })
      .filter(Boolean);
    base.relatedQuestions = mappedRelated;
  }

  return base;
}

export default function EnhancedQuestionDetails({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  const refreshQuestion = useCallback(async (signal, { showSpinner = false } = {}) => {
      try {
        if (showSpinner || !hasLoadedRef.current) {
          setLoading(true);
        }
        setError(null);

        const payload = await problemsApi.get(id);
        if (signal?.aborted) return;

        const raw = payload.item || payload;
        const question = mapQuestionForView(raw);
        const mappedAnswers = Array.isArray(question.answers)
          ? question.answers
              .map((solution) => mapSolutionForView(solution, currentUser))
              .filter(Boolean)
          : [];

       const relatedFromPayload = Array.isArray(question.relatedQuestions)
          ? question.relatedQuestions
          : [];

       setProblem({ ...question, answers: mappedAnswers, relatedQuestions: relatedFromPayload });
       setAnswers(mappedAnswers);
        setRelatedQuestions(relatedFromPayload);
        hasLoadedRef.current = true;
      } catch (err) {
        if (signal?.aborted) return;
        hasLoadedRef.current = false;
        setError(err.response?.data?.error || err.message || "Failed to load question");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
  }, [currentUser, id]);

  useEffect(() => {
    const controller = new AbortController();
    refreshQuestion(controller.signal, { showSpinner: true });
    return () => controller.abort();
  }, [refreshQuestion]);

  useEffect(() => {
    if (!problem?.id) return;

    if (Array.isArray(problem.relatedQuestions) && problem.relatedQuestions.length) {
      setRelatedQuestions(problem.relatedQuestions);
      return;
    }

    let active = true;
    problemsApi
      .list({ page: 1, per_page: 25 })
      .then((data) => {
        if (!active) return;
        const list = data.questions ?? data.problems ?? data.items ?? [];
        const mapped = list
          .map((raw) => mapQuestionForView(raw))
          .filter((q) => q.id !== problem.id);
        setRelatedQuestions(mapped);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load related questions", err);
      });

    return () => {
      active = false;
    };
  }, [problem?.id, problem?.relatedQuestions]);

  const handleAddAnswer = async (_questionId, answerBody) => {
    const response = await solutionsApi.create(id, { content: answerBody });
    const created = response?.item || response;
    const mapped = mapSolutionForView(created, currentUser) || {
      id: Date.now(),
      authorId: currentUser?.id || 0,
      authorName: currentUser?.name || "You",
      author: currentUser,
      body: answerBody,
      content: answerBody,
      votes: 0,
      myVote: 0,
      userVote: 0,
      timestamp: new Date().toISOString(),
    };

    setAnswers((prev) => [...prev, mapped]);
    setProblem((prev) =>
      prev
        ? {
            ...prev,
            solutions_count: (prev.solutions_count || 0) + 1,
            answers: [...(prev.answers || []), mapped],
          }
        : prev
    );
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">Loading question...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <h3 className="font-semibold">Unable to load question</h3>
                <p className="text-sm">{error || "Question not found"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <QuestionDetails
          question={{ ...problem, answers }}
          answers={answers}
          onVote={() => {}}
          onAddAnswer={handleAddAnswer}
          onUserClick={handleUserClick}
          currentUser={currentUser}
        />
        <SimilarQuestions
          currentQuestion={problem}
          allQuestions={relatedQuestions}
          onQuestionClick={(questionId) => navigate(`/questions/${questionId}`)}
        />
      </div>
    </div>
  );
}
