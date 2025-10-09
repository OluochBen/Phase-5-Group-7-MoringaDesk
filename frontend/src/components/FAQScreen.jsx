import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
  Search,
  Sparkles,
  ThumbsUp,
} from "lucide-react";

const STATS_CARDS = [
  {
    key: "total_faqs",
    label: "Total FAQs",
    accent: "from-emerald-500/15 to-emerald-500/0 text-emerald-600",
  },
  {
    key: "total_views",
    label: "Total Views",
    accent: "from-blue-500/15 to-blue-500/0 text-blue-600",
  },
  {
    key: "total_helpful",
    label: "Helpful Votes",
    accent: "from-violet-500/10 to-violet-500/0 text-violet-600",
  },
  {
    key: "category_count",
    label: "Categories",
    accent: "from-amber-500/15 to-amber-500/0 text-amber-600",
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

export function FAQScreen() {
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
  const [helpfulBusy, setHelpfulBusy] = useState(0);
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
      setActiveItem(value || null);
      const faqId = Number(value);
      if (!faqId || viewedFaqsRef.current.has(faqId)) return;
      viewedFaqsRef.current.add(faqId);
      try {
        const payload = await faqApi.recordView(faqId);
        setFaqs((prev) =>
          prev.map((faq) =>
            faq.id === faqId
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
      setHelpfulBusy(faqId);
      try {
        const payload = await faqApi.markHelpful(faqId);
        setFaqs((prev) =>
          prev.map((faq) =>
            faq.id === faqId
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
        setHelpfulBusy(0);
      }
    },
    [loadStats]
  );

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.pages;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <section className="rounded-3xl border bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-medium text-emerald-700">
              <Sparkles className="size-4" />
              Frequently Asked Questions
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Find answers to common questions about MoringaDesk
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Browse curated answers from the team. Use the search bar or pick a
              category to quickly locate the guidance you need.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search FAQs…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(value) => setCategory(value)}>
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "all" ? "All categories" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATS_CARDS.map((card) => {
          const value = stats?.[card.key] ?? 0;
          return (
            <Card
              key={card.key}
              className="overflow-hidden border-none bg-white shadow-sm ring-1 ring-slate-100"
            >
              <CardContent className="relative flex flex-col gap-2 pt-6">
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`}
                />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {card.label}
                </span>
                <span className="text-3xl font-semibold text-slate-900">
                  {numberFormatter.format(value)}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Browse questions
          </CardTitle>
          <CardDescription>
            {loadingStats ? (
              <span className="inline-flex items-center gap-2 text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Loading analytics…
              </span>
            ) : (
              <span>
                Showing {faqs.length} of {meta.total} FAQs
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
              {error}
            </div>
          )}
          {loadingFaqs ? (
            <div className="flex items-center justify-center gap-3 px-6 py-12 text-slate-500">
              <Loader2 className="size-5 animate-spin" />
              Loading FAQs…
            </div>
          ) : faqs.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No FAQs match your filters yet.
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={activeItem}
              onValueChange={handleAccordionChange}
              className="divide-y"
            >
              {faqs.map((faq) => {
                const updatedAt = faq.updated_at ?? faq.created_at;
                return (
                  <AccordionItem
                    key={faq.id}
                    value={String(faq.id)}
                    className="border-b"
                  >
                    <AccordionTrigger className="px-6">
                      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-emerald-50 text-emerald-700">
                              {faq.category || "General"}
                            </Badge>
                            <span className="text-left text-base font-medium text-slate-900">
                              {faq.question}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Eye className="size-3.5" />
                              {numberFormatter.format(faq.view_count || 0)} views
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <ThumbsUp className="size-3.5" />
                              {numberFormatter.format(
                                faq.helpful_count || 0
                              )}{" "}
                              helpful
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <CalendarClock className="size-3.5" />
                              Updated{" "}
                              {updatedAt
                                ? dateFormatter.format(new Date(updatedAt))
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-slate-700">
                      <div className="whitespace-pre-line">{faq.answer}</div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleHelpful(faq.id)}
                          disabled={helpfulBusy === faq.id}
                        >
                          {helpfulBusy === faq.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <ThumbsUp className="size-4" />
                          )}
                          Helpful (
                          {numberFormatter.format(faq.helpful_count || 0)})
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
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4 text-xs text-slate-500">
          <span>
            Page {meta.current_page} of {meta.pages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => canPrev && setPage((prev) => Math.max(1, prev - 1))}
              disabled={!canPrev}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                canNext && setPage((prev) => Math.min(meta.pages, prev + 1))
              }
              disabled={!canNext}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </section>

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
