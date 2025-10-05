import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { problemsApi, tagsApi } from "../services/api";
import { useNavigate } from "react-router-dom";

export function AskQuestionDialog({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("technical");
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setType("technical");
      setSelectedTagIds([]);
      setError("");
    }
  }, [open]);

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : prev.length >= 5
        ? prev
        : [...prev, tagId]
    );
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setPosting(true);
    setError("");
    try {
      const created = await problemsApi.create({
        title: title.trim(),
        description: description.trim(),
        problem_type: type,
        tag_ids: selectedTagIds,
      });
      const id = created?.id ?? created?.problem?.id;
      setOpen(false);
      setSelectedTagIds([]);
      if (id) navigate(`/questions/${id}`);
      else navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create question");
    } finally {
      setPosting(false);
    }
  }

  if (!currentUser) {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="/login">Ask Question</a>
      </Button>
    );
  }

  const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Ask Question</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle>Ask a new question</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && <div className="rounded border border-red-300 bg-red-50 p-2 text-red-700 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input placeholder="Brief, descriptive title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              placeholder="Explain your problem, what you tried, and what you expect"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">technical</SelectItem>
                <SelectItem value="language">language</SelectItem>
                <SelectItem value="stage">stage</SelectItem>
                <SelectItem value="logical">logical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Tags</label>
              <span className="text-xs text-muted-foreground">Add up to 5</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 border rounded-md px-2 py-2">
              {selectedTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="gap-1">
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
              {selectedTags.length === 0 && (
                <span className="text-xs text-muted-foreground">No tags selected</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {loadingTags && <span className="text-xs text-muted-foreground">Loading tags…</span>}
              {!loadingTags &&
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs rounded-full px-2 py-1 border ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white hover:bg-muted"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={posting} className="w-full bg-green-600 hover:bg-green-700">
              {posting ? "Posting…" : "Post question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
