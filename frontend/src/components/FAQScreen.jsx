import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { faqApi } from "../services/api";
import {
  CalendarClock,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  ThumbsUp,
  Trash2,
} from "lucide-react";

const STATS_CARDS = [
  {
    key: "total_faqs",
    label: "Total FAQs",
    tone: {
      container: "bg-blue-50",
      value: "text-blue-700",
      label: "text-blue-600",
    },
  },
  {
    key: "total_views",
    label: "Total Views",
    tone: {
      container: "bg-emerald-50",
      value: "text-emerald-700",
      label: "text-emerald-600",
    },
  },
  {
    key: "total_helpful",
    label: "Helpful Votes",
    tone: {
      container: "bg-violet-50",
      value: "text-violet-700",
      label: "text-violet-600",
    },
  },
  {
    key: "category_count",
    label: "Categories",
    tone: {
      container: "bg-orange-50",
      value: "text-orange-700",
      label: "text-orange-600",
    },
  },
];

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function FAQScreen({ currentUser }) {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [helpfulBusy, setHelpfulBusy] = useState(null);
  const viewedFaqsRef = useRef(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await faqApi.stats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load FAQ stats", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadFaqs = useCallback(async () => {
    setLoadingFaqs(true);
    setError("");
    try {
      const data = await faqApi.list({
        page,
        per_page: 8,
        search: debouncedSearch || undefined,
        category: category === "all" ? undefined : category,
      });
      const list = data?.faqs ?? data?.items ?? [];
      setFaqs(Array.isArray(list) ? list : []);
      setMeta({
        current_page: data?.current_page ?? page,
        pages: data?.pages ?? 1,
        total: data?.total ?? list.length,
      });
    } catch (err) {
      console.error("Failed to load FAQs", err);
      setError("Failed to load FAQs");
    } finally {
      setLoadingFaqs(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (faqs.length === 0) {
      setActiveItem(null);
    }
  }, [faqs.length]);

  useEffect(() => {
    if (!activeItem && faqs.length > 0) {
      setActiveItem(String(faqs[0].id));
    }
  }, [faqs, activeItem]);

  const categories = useMemo(() => {
    const names = new Set(["General"]);
    faqs.forEach((faq) => {
      if (faq?.category) names.add(faq.category);
    });
    (stats?.categories ?? []).forEach((entry) => {
      if (entry?.name) names.add(entry.name);
    });
    return ["all", ...Array.from(names).filter(Boolean).sort()];
  }, [faqs, stats]);

  const handleAccordionChange = useCallback(
    async (value) => {
      const faqId = value ? String(value) : null;
      setActiveItem(faqId);
      if (!faqId || viewedFaqsRef.current.has(faqId)) return;
      viewedFaqsRef.current.add(faqId);
      try {
        const payload = await faqApi.recordView(faqId);
        setFaqs((prev) =>
          prev.map((faq) =>
            String(faq.id) === faqId
              ? { ...faq, view_count: payload?.view_count ?? faq.view_count }
              : faq
          )
        );
        loadStats();
      } catch (err) {
        console.error("Failed to record FAQ view", err);
      }
    },
    [loadStats]
  );

  const handleHelpful = useCallback(
    async (faqId) => {
      if (!faqId) {
        return;
      }
      const id = String(faqId);
      setHelpfulBusy(id);
      try {
        const payload = await faqApi.markHelpful(id);
        setFaqs((prev) =>
          prev.map((faq) =>
            String(faq.id) === id
              ? {
                  ...faq,
                  helpful_count:
                    payload?.helpful_count ?? (faq.helpful_count || 0) + 1,
                }
              : faq
          )
        );
        await loadStats();
      } catch (err) {
        console.error("Failed to mark FAQ helpful", err);
      } finally {
        setHelpfulBusy(null);
      }
    },
    [loadStats]
  );

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.pages;
  const showManageControls = currentUser?.role === "admin";

  const handleAddFaq = () => {
    navigate("/admin");
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <header className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="size-3.5" />
              Frequently Asked Questions
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Find answers to common questions about MoringaDesk
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Search curated guidance from the MoringaDesk team and community.
              Use filters to jump straight to the help you need.
            </p>
          </div>
          {showManageControls && (
            <Button
              onClick={handleAddFaq}
              className="self-start rounded-full bg-rose-500 px-5 text-sm font-semibold text-white hover:bg-rose-600"
            >
              <Plus className="mr-2 size-4" />
              Add FAQ
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2">
            <Search className="size-4 text-emerald-500" />
            <Input
              placeholder="Search FAQs…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 border-none bg-transparent p-0 text-sm focus-visible:ring-0"
            />
          </div>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value)}
          >
            <SelectTrigger className="h-10 rounded-2xl border border-slate-200 bg-white text-sm hover:border-emerald-300 md:w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "all" ? "All Categories" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS_CARDS.map((card) => {
          const value = stats?.[card.key] ?? 0;
          const tone = card.tone;
          return (
            <Card
              key={card.key}
              className={`h-full overflow-hidden border-none shadow-sm ${tone.container} rounded-2xl px-5 py-4`}
            >
              <CardContent className="p-0">
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${tone.label}`}
                >
                  {card.label}
                </span>
                <span
                  className={`mt-2 block text-3xl font-semibold ${tone.value}`}
                >
                  {numberFormatter.format(value)}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-4">
        {loadingStats ? (
          <span className="inline-flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Loading analytics…
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            Showing {faqs.length} of {meta.total} FAQs
          </span>
        )}

        {error && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        {loadingFaqs ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-12 text-slate-500 shadow-sm">
            <Loader2 className="size-5 animate-spin" />
            Loading FAQs…
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
            No FAQs match your filters yet.
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={activeItem}
            onValueChange={handleAccordionChange}
            className="flex flex-col gap-4"
          >
            {faqs.map((faq) => {
              const updatedAt = faq.updated_at ?? faq.created_at;
              const faqId = String(faq.id);
              const tags = Array.isArray(faq.tags) ? faq.tags : [];
              const helpful = faq.helpful_count || 0;
              const views = faq.view_count || 0;
              return (
                <AccordionItem
                  key={faqId}
                  value={faqId}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <AccordionTrigger className="gap-4 px-6 py-5 text-left hover:bg-slate-50 data-[state=open]:border-b data-[state=open]:border-slate-200">
                    <div className="flex w-full flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {faq.category || "General"}
                            </Badge>
                            <span className="text-left text-lg font-semibold text-slate-900">
                              {faq.question}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Eye className="size-3.5" />
                              {numberFormatter.format(views)} views
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <ThumbsUp className="size-3.5" />
                              {numberFormatter.format(helpful)} helpful
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <CalendarClock className="size-3.5" />
                              Updated {" "}
                              {updatedAt
                                ? dateFormatter.format(new Date(updatedAt))
                                : "—"}
                            </span>
                          </div>
                        </div>
                        {showManageControls && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate("/admin");
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate("/admin");
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge
                              key={`${faqId}-${tag}`}
                              variant="outline"
                              className="rounded-full border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-slate-700">
                    <div className="whitespace-pre-line">{faq.answer}</div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleHelpful(faqId)}
                        disabled={helpfulBusy === faqId}
                        className="gap-2 rounded-full border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        {helpfulBusy === faqId ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <span className="text-base leading-none">👍</span>
                        )}
                        Helpful ({numberFormatter.format(helpful)})
                      </Button>
                      <span className="text-xs text-slate-500">
                        Appreciated by the community
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </section>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Page {meta.current_page} of {meta.pages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 px-4"
            onClick={() => canPrev && setPage((prev) => Math.max(1, prev - 1))}
            disabled={!canPrev}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 px-4"
            onClick={() =>
              canNext && setPage((prev) => Math.min(meta.pages, prev + 1))
            }
            disabled={!canNext}
          >
            Next
          </Button>
        </div>
      </div>
      {!!(stats?.categories?.length) && (
        <section className="rounded-2xl border bg-slate-50/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Popular categories
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.categories.map((item) => (
              <Badge
                key={item.name}
                className="rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm"
              >
                {item.name} · {item.count}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
