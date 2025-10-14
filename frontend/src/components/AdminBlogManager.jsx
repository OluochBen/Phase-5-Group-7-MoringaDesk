import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { blogApi } from "../services/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import BlogPostEditorDialog from "./BlogPostEditorDialog";

const STATUS_FILTERS = [
  { value: "all", label: "All posts" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

function formatDisplayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizePost(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title ?? "(untitled)",
    excerpt: post.excerpt ?? "",
    status: post.status ?? "draft",
    cover_image: post.cover_image ?? "",
    content: post.content ?? "",
    author: post.author,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
  };
}

export function AdminBlogManager() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorData, setEditorData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await blogApi.list({
        page,
        per_page: 12,
        search: debouncedSearch || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      const items = Array.isArray(data?.items) ? data.items : data?.posts ?? [];
      setPosts(items.map(normalizePost));
      setMeta(
        data?.meta ?? {
          current_page: page,
          pages: data?.pages ?? 1,
          total: items.length,
        }
      );
    } catch (err) {
      console.error("Failed to load blog posts", err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Unable to load blog posts right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, debouncedSearch]);

  const openCreateDialog = () => {
    setEditorData({
      status: "draft",
      content: "",
      excerpt: "",
      cover_image: "",
    });
    setEditorOpen(true);
  };

  const openEditDialog = async (post) => {
    setEditorData(post);
    setEditorOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      const request = {
        title: payload.title,
        slug: payload.slug,
        excerpt: payload.excerpt,
        cover_image: payload.cover_image,
        status: payload.status,
        content: payload.content,
        published_at: payload.published_at
          ? new Date(payload.published_at).toISOString()
          : undefined,
      };

      if (payload.id) {
        await blogApi.update(payload.id, request);
        toast.success("Post updated");
      } else {
        await blogApi.create(request);
        toast.success("Post created");
      }
      setEditorOpen(false);
      await loadPosts();
    } catch (err) {
      console.error("Failed to save blog post", err);
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Unable to save the post. Please review the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}" permanently? This cannot be undone.`)) {
      return;
    }
    setActionId(post.id);
    try {
      await blogApi.remove(post.id);
      toast.success("Post deleted");
      await loadPosts();
    } catch (err) {
      console.error("Failed to delete post", err);
      toast.error(err?.response?.data?.error || err?.message || "Unable to delete the post.");
    } finally {
      setActionId(null);
    }
  };

  const handleTogglePublish = async (post) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    setActionId(post.id);
    try {
      await blogApi.update(post.id, {
        status: nextStatus,
        published_at:
          nextStatus === "published"
            ? post.published_at || new Date().toISOString()
            : null,
      });
      toast.success(
        nextStatus === "published" ? "Post published" : "Post moved back to draft"
      );
      await loadPosts();
    } catch (err) {
      console.error("Failed to toggle publish state", err);
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Unable to update publish status. Please try again."
      );
    } finally {
      setActionId(null);
    }
  };

  const statusCounts = useMemo(() => {
    return {
      all: meta?.total ?? posts.length,
      published: posts.filter((post) => post.status === "published").length,
      draft: posts.filter((post) => post.status === "draft").length,
    };
  }, [meta?.total, posts]);

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.pages;

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <BookOpen className="size-4" />
              Blog Manager
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Share stories and updates with the community
            </CardTitle>
            <CardDescription>
              Draft announcements, publish success stories, and curate learning resources.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadPosts}>
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 size-4" />
              New Post
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Input
              placeholder="Search titles or excerpts"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-3"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                    {filter.value in statusCounts
                      ? ` (${statusCounts[filter.value]})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 pt-6">
        {error && (
          <Card className="border-rose-200 bg-rose-50/70 text-rose-600">
            <CardContent className="py-6 text-sm">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex h-48 items-center justify-center text-slate-400">
            <Loader2 className="size-6 animate-spin text-emerald-600" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="border-dashed bg-slate-50">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-sm text-slate-500">
              <p>No posts found for the current filters.</p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Create the first post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const isDraft = post.status !== "published";
            return (
              <Card key={post.id} className="border-slate-200 shadow-sm">
                <CardContent className="flex flex-col gap-4 pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      className={
                        isDraft
                          ? "bg-slate-100 text-slate-600"
                          : "bg-emerald-100 text-emerald-700"
                      }
                    >
                      {isDraft ? "Draft" : "Published"}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Updated {formatDisplayDate(post.updated_at)}
                    </span>
                    {!isDraft && (
                      <span className="text-xs text-emerald-600">
                        Live since {formatDisplayDate(post.published_at)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {post.excerpt || post.content.slice(0, 160)}…
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        Created {formatDisplayDate(post.created_at)}
                      </span>
                      {post.author?.name && (
                        <span>By {post.author.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(post)}
                        disabled={actionId === post.id}
                        className="gap-1 text-emerald-700 hover:bg-emerald-50"
                      >
                        {post.status === "published" ? (
                          <>
                            <EyeOff className="size-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="size-4" />
                            Publish
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(post)}
                        className="gap-1 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post)}
                        disabled={actionId === post.id}
                        className="gap-1 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>
          Page {meta.current_page} of {meta.pages} · {meta.total} total
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => canPrev && setPage((prev) => Math.max(1, prev - 1))}
            disabled={!canPrev}
            className="rounded-full px-4"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => canNext && setPage((prev) => Math.min(meta.pages, prev + 1))}
            disabled={!canNext}
            className="rounded-full px-4"
          >
            Next
          </Button>
        </div>
      </CardFooter>

      <BlogPostEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialData={editorData}
        onSubmit={handleSubmit}
        submitting={saving}
      />
    </Card>
  );
}

export default AdminBlogManager;
