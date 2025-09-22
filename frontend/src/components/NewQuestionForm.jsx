import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { problemsApi } from "../services/api";

export default function NewQuestionForm() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemType, setProblemType] = useState("technical");
  const [tagIdsCsv, setTagIdsCsv] = useState("");

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setPosting(true);
    setError("");

    try {
      const tag_ids = tagIdsCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Number(s))
        .filter((n) => !Number.isNaN(n));

      const payload = {
        title: title.trim(),
        description: description.trim(),
        problem_type: problemType,
        tag_ids,
      };

      const created = await problemsApi.create(payload);
      // API could return the object directly or wrapped.
      const createdObj = created.problem ?? created;
      const newId = createdObj?.id;

      if (newId) {
        navigate(`/questions/${newId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to create the problem"
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Ask a new question</h1>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Brief, descriptive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[160px]"
            placeholder="Explain your problem, what you tried, and what you expect"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
            >
              <option value="technical">technical</option>
              <option value="language">language</option>
              <option value="stage">stage</option>
              <option value="logical">logical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tag IDs (comma-separated, optional)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 1,2,3"
              value={tagIdsCsv}
              onChange={(e) => setTagIdsCsv(e.target.value)}
            />
          </div>
        </div>

        <button
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          disabled={posting}
          type="submit"
        >
          {posting ? "Posting…" : "Post question"}
        </button>
      </form>
    </div>
  );
}
