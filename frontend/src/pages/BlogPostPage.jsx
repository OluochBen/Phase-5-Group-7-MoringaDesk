import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2, Share2 } from "lucide-react";

import { blogApi } from "../services/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      setLoading(true);
      setError("");
      try {
        const data = await blogApi.get(slug);
        if (!isMounted) return;
        setPost(data);
      } catch (err) {
        if (!isMounted) return;
        const status = err?.response?.status;
        if (status === 404) {
          setError("The article you’re looking for was not found.");
        } else if (status === 403) {
          setError("You do not have access to view this article.");
        } else {
          setError(err?.response?.data?.error || err?.message || "Unable to load this article right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const formattedContent = useMemo(() => {
    if (!post?.content) return [];
    const blocks = post.content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    return blocks;
  }, [post]);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        alert("Article link copied to clipboard!");
      })
      .catch(() => {
        alert("Unable to copy link. Please try manually.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/40 to-blue-50/20 pb-16 pt-24">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2 text-slate-600 hover:text-emerald-700"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="outline"
            className="gap-2 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p>Loading article…</p>
          </div>
        ) : error ? (
          <Card className="border-rose-200 bg-rose-50/70 text-rose-600">
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-lg font-semibold">{error}</p>
              <Button asChild className="rounded-full bg-emerald-600 px-6">
                <Link to="/blog">Return to the blog</Link>
              </Button>
            </CardContent>
          </Card>
        ) : post ? (
          <article className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/40">
            {post.cover_image && (
              <div className="relative h-64 w-full overflow-hidden bg-emerald-50">
                <img
                  src={post.cover_image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="px-6 py-10 md:px-10">
              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-700">
                <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  MoringaDesk Blog
                </Badge>
                {post.published_at ? (
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {dateFormatter.format(new Date(post.published_at))}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-600">
                    Draft
                  </span>
                )}
                {post.author?.name && (
                  <span className="text-slate-500">By {post.author.name}</span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-base text-emerald-800 md:text-lg">
                  {post.excerpt}
                </p>
              )}

              <div className="prose prose-slate mt-8 max-w-none leading-relaxed">
                {formattedContent.length > 0 ? (
                  formattedContent.map((block, index) => (
                    <p key={index} className="mb-5 text-slate-700">
                      {block}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-600 whitespace-pre-line">{post.content}</p>
                )}
              </div>

              <div className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-sm text-emerald-700">
                <p>
                  Have a story, guide, or cohort win to share?{" "}
                  <Link to="/contact" className="font-semibold underline underline-offset-4">
                    Get in touch
                  </Link>{" "}
                  and we’ll help feature it on MoringaDesk.
                </p>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}

export default BlogPostPage;
