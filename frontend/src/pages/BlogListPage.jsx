import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, Loader2, Search, Sparkles } from "lucide-react";

import { blogApi } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const perPage = 6;

function buildPreview(item, limit) {
  const raw = (item?.excerpt && item.excerpt.trim().length > 0
    ? item.excerpt.trim()
    : item?.content?.trim()) || "";
  if (!raw) {
    return { text: "", truncated: false };
  }
  if (raw.length <= limit) {
    return { text: raw, truncated: false };
  }
  return { text: raw.slice(0, limit).trimEnd(), truncated: true };
}

export function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let isMounted = true;
    async function loadPosts() {
      setLoading(true);
      setError("");
      try {
        const data = await blogApi.list({
          page,
          per_page: perPage,
          search: debouncedSearch || undefined,
        });
        if (!isMounted) return;
        setPosts(Array.isArray(data.items) ? data.items : data.posts || []);
        setMeta(data.meta || { current_page: page, pages: 1, total: 0 });
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load blog posts", err);
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "We could not load the blog right now. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, [page, debouncedSearch]);

  const heroHighlight = useMemo(() => posts.slice(0, 1)[0], [posts]);
  const heroPreview = useMemo(
    () => (heroHighlight ? buildPreview(heroHighlight, 220) : null),
    [heroHighlight]
  );
  const remainingPosts = useMemo(() => posts.slice(heroHighlight ? 1 : 0), [posts, heroHighlight]);

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.pages;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-blue-50/30 pt-24 pb-16">
      <section className="px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <Badge className="mb-3 bg-green-100 text-green-700 hover:bg-green-100">
            Community Stories
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Insights, stories, and updates from the MoringaDesk community
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            Deep dives into learning strategies, cohort highlights, facilitator tips, and product updates designed to help you grow.
          </p>
          <div className="mt-6 flex w-full max-w-xl items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search articles by topic or keyword"
              className="border-none p-0 text-sm focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <section className="mt-12 px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          {error && (
            <Card className="border-rose-200 bg-rose-50/60 text-rose-600">
              <CardContent className="py-6 text-sm">{error}</CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="border-dashed border-emerald-200 bg-white/70">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Sparkles className="h-8 w-8 text-emerald-500" />
                <h2 className="text-xl font-semibold text-slate-800">No posts yet</h2>
                <p className="max-w-md text-sm text-slate-500">
                  Check back soon for insights from facilitators and alumni. In the meantime, explore the FAQ or ask a question in the community.
                </p>
                <Button asChild className="rounded-full bg-emerald-600 px-6">
                  <Link to="/faq">Browse FAQs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {heroHighlight && (
                <Link
                  to={`/blog/${heroHighlight.slug}`}
                  className="group grid overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/40 md:grid-cols-[1.5fr_1fr]"
                >
                  <div className="p-8 md:p-10">
                    <Badge className="mb-3 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Featured story
                    </Badge>
                    <h2 className="text-3xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-700 md:text-4xl">
                      {heroHighlight.title}
                    </h2>
                    <p className="mt-4 text-base text-slate-600 md:text-lg">
                      {heroPreview?.text}
                      {heroPreview?.truncated ? "…" : ""}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {heroHighlight.published_at
                          ? dateFormatter.format(new Date(heroHighlight.published_at))
                          : "Unpublished draft"}
                      </span>
                      {heroHighlight.author?.name && (
                        <span>By {heroHighlight.author.name}</span>
                      )}
                    </div>
                    <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      Read article <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="hidden h-full bg-gradient-to-br from-emerald-100 to-emerald-200/60 md:block">
                    {heroHighlight.cover_image ? (
                      <img
                        src={heroHighlight.cover_image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-emerald-500">
                        <Sparkles className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </Link>
              )}

              {remainingPosts.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {remainingPosts.map((post) => {
                    const preview = buildPreview(post, 160);
                    return (
                      <Card key={post.id} className="flex h-full flex-col border-emerald-100/80 bg-white/90">
                        {post.cover_image && (
                          <div className="relative h-40 overflow-hidden rounded-t-2xl">
                            <img
                              src={post.cover_image}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <CardHeader className="flex-1 space-y-3">
                          <CardTitle className="text-lg text-slate-900">{post.title}</CardTitle>
                          <p className="text-sm text-slate-600">
                            {preview.text}
                            {preview.truncated && "…"}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-slate-500">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {post.published_at
                                ? dateFormatter.format(new Date(post.published_at))
                                : "Draft"}
                            </span>
                            {post.author?.name && (
                              <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700">
                                {post.author.name}
                              </Badge>
                            )}
                          </div>
                          <Button asChild variant="ghost" className="justify-start gap-2 px-0 text-emerald-600 hover:text-emerald-700">
                            <Link to={`/blog/${post.slug}`}>
                              Read more <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {posts.length > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3 text-xs text-slate-500 md:text-sm">
              <span>
                Page {meta.current_page} of {meta.pages} · {meta.total} article{meta.total === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-emerald-200 px-4"
                  onClick={() => canPrev && setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!canPrev}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-emerald-200 px-4"
                  onClick={() => canNext && setPage((prev) => Math.min(meta.pages, prev + 1))}
                  disabled={!canNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default BlogListPage;
