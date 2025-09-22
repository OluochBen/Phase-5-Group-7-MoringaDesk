import { useEffect, useState } from "react";
import { problemsApi } from "../services/api";

export function EnhancedDashboard({ questions, onVote, currentUser }) {
  const [items, setItems] = useState(questions ?? []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!questions);
  const [error, setError] = useState("");

  useEffect(() => {
    if (questions) return; // parent provided data (mocks), do nothing
    let alive = true;
    setLoading(true);
    problemsApi
      .list({ page, per_page: 10 })
      .then((data) => {
        // API might return { questions: [...] } or { problems: [...] }
        const list = data.questions ?? data.problems ?? data.items ?? [];
        if (alive) setItems(list);
      })
      .catch(() => alive && setError("Failed to load problems"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page, questions]);

  if (loading) return <div className="p-6">Loading problems…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Latest Problems</h1>
        {/* Optional: button to open a modal/form to create a problem */}
      </div>

      {items.length === 0 && <div>No problems yet.</div>}

      <div className="space-y-3">
        {items.map((q) => (
          <div key={q.id} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <a className="font-medium text-lg hover:underline" href={`/questions/${q.id}`}>
                {q.title}
              </a>
              <div className="text-sm text-muted-foreground">
                {q.problem_type ?? q.type ?? "technical"}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {q.description}
            </p>
            {/* If you have tags, render them here */}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4">
        <button className="border px-3 py-1 rounded" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <button className="border px-3 py-1 rounded" onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
