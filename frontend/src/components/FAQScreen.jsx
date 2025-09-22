import { useEffect, useState } from "react";
import { faqApi } from "../services/api";

export function FAQScreen() {
  const [faqs, setFaqs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    faqApi
      .list({ page, per_page: 10 })
      .then((data) => {
        // your backend returns { faqs: [...] } (from what we saw in the browser)
        if (alive) setFaqs(data.faqs ?? []);
      })
      .catch((e) => alive && setErr("Failed to load FAQs"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [page]);

  if (loading) return <div className="p-6">Loading FAQs…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">FAQs</h1>
      {faqs.length === 0 && <div>No FAQs yet.</div>}
      {faqs.map((f) => (
        <div key={f.id} className="border rounded p-4">
          <div className="font-medium mb-2">{f.question}</div>
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {f.answer}
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button
          className="border px-3 py-1 rounded"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <button
          className="border px-3 py-1 rounded"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
