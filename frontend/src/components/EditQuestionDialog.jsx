import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function EditQuestionDialog({ question, open, onOpenChange, onSave }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && question) {
      setTitle(question.title || "");
      setBody(question.body || "");
      setTags(Array.isArray(question.tags) ? question.tags : []);
      setTagInput("");
    }
  }, [open, question]);

  const addTag = (val) => {
    const t = String(val || tagInput).trim().toLowerCase();
    if (!t) return;
    setTags((prev) => (prev.includes(t) || prev.length >= 5 ? prev : [...prev, t]));
    setTagInput("");
  };
  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave?.({ title: title.trim(), body: body.trim(), tags });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle>Edit question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={(e)=>setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={body} onChange={(e)=>setBody(e.target.value)} required className="min-h-32" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Tags</label>
              <span className="text-xs text-muted-foreground">Up to 5</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 border rounded-md px-2 py-2">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button type="button" className="ml-1 text-muted-foreground hover:text-foreground" onClick={() => removeTag(t)}>×</button>
                </Badge>
              ))}
              <input
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                placeholder="e.g. react, css"
                value={tagInput}
                onChange={(e)=>setTagInput(e.target.value)}
                onKeyDown={(e)=>{ if (e.key==="Enter" || e.key==="," || e.key===" ") { e.preventDefault(); addTag(); } }}
              />
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
