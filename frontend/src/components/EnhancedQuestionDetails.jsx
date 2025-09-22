import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { problemsApi, solutionsApi, votesApi } from "../services/api";

export function EnhancedQuestionDetails({ currentUser }) {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [answer, setAnswer] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setErr("");
        const p = await problemsApi.get(id);
        // backend might return { problem: {...} } or the object directly
        setProblem(p.problem ?? p);
        const s = await solutionsApi.list(id, { page: 1, per_page: 20 });
        setSolutions(s.solutions ?? s.items ?? s ?? []);
      } catch (e) {
        if (alive) setErr("Failed to load problem");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [id]);

  async function submitAnswer(e) {
    e.preventDefault();
    if (!answer.trim()) return;
    setPosting(true);
    try {
      await solutionsApi.create(id, { content: answer.trim() });
      setAnswer("");
      // refresh solutions
      const s = await solutionsApi.list(id, { page: 1, per_page: 20 });
      setSolutions(s.solutions ?? s.items ?? s ?? []);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to post solution");
    } finally {
      setPosting(false);
    }
  }

  async function vote(solutionId, type) {
    try {
      await votesApi.voteSolution(solutionId, type); // "up" | "down"
      const s = await solutionsApi.list(id, { page: 1, per_page: 20 });
      setSolutions(s.solutions ?? s.items ?? s ?? []);
    } catch (e) {
      alert("Failed to vote");
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!problem) return <div className="p-6">Not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="border rounded p-4">
        <h1 className="text-2xl font-semibold mb-2">{problem.title}</h1>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {problem.description}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Solutions</h2>
        {solutions.length === 0 && <div>No solutions yet.</div>}
        {solutions.map((s) => (
          <div key={s.id} className="border rounded p-4">
            <div className="text-sm text-muted-foreground mb-2">
              by {s.author?.name ?? s.author_name ?? "Someone"}
            </div>
            <div className="whitespace-pre-line">{s.content}</div>
            <div className="flex gap-2 mt-3">
              <button className="border px-3 py-1 rounded" onClick={() => vote(s.id, "up")}>Upvote</button>
              <button className="border px-3 py-1 rounded" onClick={() => vote(s.id, "down")}>Downvote</button>
            </div>
          </div>
        ))}
      </section>

      {/* Add answer (auth required) */}
      {currentUser ? (
        <form onSubmit={submitAnswer} className="space-y-2">
          <textarea
            className="w-full border p-2 rounded min-h-[120px]"
            placeholder="Write your answer…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" disabled={posting}>
            {posting ? "Posting…" : "Post answer"}
          </button>
        </form>
      ) : (
        <div className="text-sm text-muted-foreground">Sign in to answer</div>
      )}
    </div>
  );
}
