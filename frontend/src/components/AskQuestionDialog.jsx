import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { problemsApi } from "../services/api";
import { useNavigate } from "react-router-dom";

export function AskQuestionDialog({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("technical");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const DEMO_MODE = !import.meta.env.VITE_API_BASE;

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setPosting(true);
    setError("");
    try {
      if (DEMO_MODE) {
        setOpen(false);
        navigate("/dashboard");
        return;
      }
      const created = await problemsApi.create({ title: title.trim(), description: description.trim(), problem_type: type, tag_ids: [] });
      const obj = created.problem ?? created;
      const id = obj?.id;
      setOpen(false);
      if (id) navigate(`/questions/${id}`); else navigate("/dashboard");
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

  const commonTags = [
    "react","vite","javascript","typescript","node","express","nextjs","redux","tailwind","css","html","python","flask","django","postgres","mysql"
  ];

  const addTag = (val) => {
    const t = val.trim().toLowerCase();
    if (!t) return;
    setSelectedTags((prev) => (prev.includes(t) || prev.length >= 5 ? prev : [...prev, t]));
    setTagInput("");
  };
  const removeTag = (t) => setSelectedTags((prev) => prev.filter((x) => x !== t));
  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && selectedTags.length) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

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
            <Input placeholder="Brief, descriptive title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea placeholder="Explain your problem, what you tried, and what you expect" value={description} onChange={(e)=>setDescription(e.target.value)} required className="min-h-32" />
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

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Tags</label>
              <span className="text-xs text-muted-foreground">Add up to 5</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 border rounded-md px-2 py-2">
              {selectedTags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button type="button" className="ml-1 text-muted-foreground hover:text-foreground" onClick={() => removeTag(t)}>×</button>
                </Badge>
              ))}
              <input
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                placeholder="e.g. react, vite"
                value={tagInput}
                onChange={(e)=>setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {commonTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className={`text-xs rounded-full px-2 py-1 border ${selectedTags.includes(t) ? "bg-green-600 text-white border-green-600" : "bg-white hover:bg-muted"}`}
                >
                  {t}
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
