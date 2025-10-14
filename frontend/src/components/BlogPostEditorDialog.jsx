import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

function toDateTimeLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => `${n}`.padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + "T" + [pad(date.getHours()), pad(date.getMinutes())].join(":");
}

export function BlogPostEditorDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  submitting = false,
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState("");
  const [publishedAt, setPublishedAt] = useState("");

  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (!open) return;
    setTitle(initialData?.title ?? "");
    setSlug(initialData?.slug ?? "");
    setExcerpt(initialData?.excerpt ?? "");
    setCoverImage(initialData?.cover_image ?? "");
    setStatus(initialData?.status ?? "draft");
    setContent(initialData?.content ?? "");
    setPublishedAt(toDateTimeLocalInput(initialData?.published_at));
  }, [initialData, open]);

  const isPublished = useMemo(() => status === "published", [status]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    onSubmit({
      ...initialData,
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      cover_image: coverImage.trim() || undefined,
      status,
      content: content.trim(),
      published_at: publishedAt || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit blog post" : "Create blog post"}</DialogTitle>
          <DialogDescription>
            Draft and publish updates for the community. Published posts appear immediately on the public blog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="eg. How we coach learners through pair programming"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                placeholder="auto-generated if left blank"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishedAt">
                Published at {status === "draft" && "(optional)"}
              </Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
                disabled={!isPublished}
              />
              {!isPublished && (
                <p className="text-xs text-slate-500">
                  Set status to published to schedule or backdate this article.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">
              Cover image URL <span className="text-xs text-slate-500">(optional)</span>
            </Label>
            <Input
              id="cover"
              placeholder="https://example.com/path/to/cover.jpg"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
            />
            {coverImage && (
              <p className="text-xs text-slate-500">
                Preview: <a href={coverImage} className="text-emerald-600 underline" target="_blank" rel="noreferrer">open image</a>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">
              Short summary <span className="text-xs text-slate-500">(max 400 characters)</span>
            </Label>
            <Textarea
              id="excerpt"
              placeholder="One or two sentences that appear in the blog listing…"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              maxLength={400}
              rows={3}
            />
            <div className="text-right text-xs text-slate-500">
              {excerpt?.length ?? 0}/400
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Article content</Label>
              <span className="text-xs text-slate-500">
                Use blank lines to create new paragraphs. Basic markdown is supported.
              </span>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share your story, guide, or announcement…"
              className="min-h-[240px]"
              required
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">
              {isEdit ? "Updating this post will refresh it on the public blog immediately." : "New posts start in draft unless you publish right away."}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : isEdit ? "Save changes" : "Create post"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BlogPostEditorDialog;
