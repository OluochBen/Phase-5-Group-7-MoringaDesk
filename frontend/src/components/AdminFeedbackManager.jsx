import { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { feedbackApi } from "../services/api";
import { toast } from "sonner";
import { Loader2, RefreshCcw } from "lucide-react";

const STATUS_LABELS = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

const TYPE_LABELS = {
  bug: "Bug",
  feature: "Feature",
};

export function AdminFeedbackManager() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: "all", status: "all", priority: "all" });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadStats = async () => {
    try {
      const data = await feedbackApi.stats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load feedback stats", err);
    }
  };

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackApi.list({
        page,
        per_page: 20,
        type: filters.type === "all" ? undefined : filters.type,
        status: filters.status === "all" ? undefined : filters.status,
        priority: filters.priority === "all" ? undefined : filters.priority,
      });
      const list = data?.items ?? [];
      setItems(Array.isArray(list) ? list : []);
      setMeta(data?.meta ?? { current_page: page, pages: 1, total: list.length });
    } catch (err) {
      console.error("Failed to load feedback", err);
      toast.error("Unable to load feedback right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [page, filters]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleFilterChange = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await feedbackApi.update(id, { status });
      toast.success("Feedback updated");
      await Promise.all([loadFeedback(), loadStats()]);
    } catch (err) {
      console.error("Failed to update feedback", err);
      toast.error("Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const summary = useMemo(() => {
    const total = stats?.total ?? 0;
    const bugs = stats?.by_type?.bug ?? 0;
    const features = stats?.by_type?.feature ?? 0;
    const open = stats?.by_status?.open ?? 0;
    return { total, bugs, features, open };
  }, [stats]);

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.pages;

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl text-slate-900">Community feedback</CardTitle>
            <CardDescription>
              Bugs and feature ideas submitted through the public feedback form.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadFeedback}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
        <div className="grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:grid-cols-3">
          <div>
            <span className="font-semibold text-slate-700">{summary.total}</span> total submissions
          </div>
          <div>
            {summary.bugs} bugs · {summary.features} features
          </div>
          <div>{summary.open} currently open</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Select value={filters.type} onValueChange={handleFilterChange("type")}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
              <SelectItem value="feature">Features</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={handleFilterChange("status")}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={handleFilterChange("priority")}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex min-h-[160px] items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" /> Loading feedback…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No feedback matches the current filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full border-slate-200">
                      {TYPE_LABELS[item.feedback_type] || item.feedback_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="truncate text-xs text-slate-500">{item.description}</p>
                  </TableCell>
                  <TableCell className="hidden text-sm text-slate-500 md:table-cell">
                    {PRIORITY_LABELS[item.priority] || item.priority}
                  </TableCell>
                  <TableCell className="hidden text-xs text-slate-500 md:table-cell">
                    {item.contact_name || "—"}
                    {item.contact_email ? (
                      <p>{item.contact_email}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {STATUS_LABELS[item.status] || item.status}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={item.status}
                      onValueChange={(value) => handleStatusUpdate(item.id, value)}
                      disabled={updatingId === item.id}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>
          Page {meta.current_page} of {meta.pages} · {meta.total} submissions
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => canPrev && setPage((prev) => Math.max(prev - 1, 1))}
            disabled={!canPrev}
            className="rounded-full px-4"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => canNext && setPage((prev) => Math.min(prev + 1, meta.pages))}
            disabled={!canNext}
            className="rounded-full px-4"
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AdminFeedbackManager;
