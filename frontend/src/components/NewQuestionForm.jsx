import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { problemsApi, tagsApi } from "../services/api";
import { Badge } from "./ui/badge";

export default function NewQuestionForm() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemType, setProblemType] = useState("technical");
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingTags(true);
    tagsApi
      .list({ page: 1, per_page: 50 })
      .then((data) => {
        if (!active) return;
        const list = data?.items ?? data?.tags ?? [];
        setAvailableTags(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load tags", err);
      })
      .finally(() => {
        if (active) setLoadingTags(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : prev.length >= 5
        ? prev
        : [...prev, tagId]
    );
  };

  async function submit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setPosting(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        problem_type: problemType,
        tag_ids: selectedTagIds,
      };

      const created = await problemsApi.create(payload);

      const newId = created?.id ?? created?.problem?.id;
      if (newId) navigate(`/questions/${newId}`);
      else navigate("/dashboard");

      setTitle("");
      setDescription("");
      setProblemType("technical");
      setSelectedTagIds([]);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
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
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            name="title"
            className="w-full border rounded px-3 py-2"
            placeholder="Brief, descriptive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            className="w-full border rounded px-3 py-2 min-h-[160px]"
            placeholder="Explain your problem, what you tried, and what you expect"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="problemType" className="block text-sm font-medium mb-1">Type</label>
            <select
              id="problemType"
              name="problemType"
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
              Tags (optional)
            </label>
            <div className="max-h-48 overflow-y-auto border rounded px-3 py-2 space-y-2">
              {loadingTags && <p className="text-sm text-muted-foreground">Loading tags…</p>}
              {!loadingTags && availableTags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags available yet.</p>
              )}
              {!loadingTags &&
                availableTags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
            </div>
            {selectedTagIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags
                  .filter((tag) => selectedTagIds.includes(tag.id))
                  .map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="gap-1 text-xs">
                      {tag.name}
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleTag(tag.id)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
              </div>
            )}
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
