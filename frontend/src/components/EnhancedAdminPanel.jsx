import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  MessageSquare,
  Flag,
  Activity,
  TrendingUp,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  Edit,
  Plus,
  Download,
  Calendar,
} from 'lucide-react';
import api, { problemsApi } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';

const TIME_RANGE_LABELS = {
  '1d': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

function getStatusBadgeClasses(status) {
  switch (status) {
    case 'pending':
      return 'border-amber-200 bg-amber-100 text-amber-700';
    case 'resolved':
      return 'border-emerald-200 bg-emerald-100 text-emerald-700';
    case 'dismissed':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

function getPriorityBadgeClasses(priority) {
  switch (priority) {
    case 'high':
      return 'border-red-200 bg-red-100 text-red-600';
    case 'medium':
      return 'border-amber-200 bg-amber-100 text-amber-700';
    case 'low':
      return 'border-emerald-200 bg-emerald-100 text-emerald-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)}h ago`;
  }
  return `${Math.floor(diffMinutes / 1440)}d ago`;
}

function formatCategoryLabel(value) {
  if (!value) {
    return 'General';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function safeParseDate(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDuration(minutes) {
  if (!minutes || !Number.isFinite(minutes) || minutes <= 0) {
    return '—';
  }
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }
  if (hours) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

function formatActionLabel(value) {
  if (!value) {
    return '';
  }
  return value
    .toString()
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeText(value) {
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toLowerCase();
}

export function EnhancedAdminPanel({ currentUser }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportStatus, setSelectedReportStatus] = useState('all');
  const [showCreateFAQDialog, setShowCreateFAQDialog] = useState(false);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: 'moderation',
  });
  const [trendingTopics, setTrendingTopics] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError('');

        const [statsData, reportsData, auditData, usersData, faqsData] = await Promise.all([
          api.get('/admin/stats').then((res) => res.data),
          api.get('/admin/reports').then((res) => res.data),
          api.get('/admin/audit').then((res) => res.data),
          api
            .get('/admin/users', { params: { page: 1, per_page: 10 } })
            .then((res) => res.data?.users ?? []),
          api.get('/faqs').then((res) => res.data?.faqs ?? []),
        ]);

        if (!active) return;

        setStats(statsData || null);
        const reportsList = Array.isArray(reportsData)
          ? reportsData
          : reportsData?.reports ?? [];
        setReports(reportsList);
        setAuditLogs(Array.isArray(auditData) ? auditData : auditData?.logs ?? []);
        setAdminUsers(Array.isArray(usersData) ? usersData : []);
        setFaqs(Array.isArray(faqsData) ? faqsData : []);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load admin data', err);
        setError(err.response?.data?.error || err.message || 'Failed to load admin data');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await problemsApi.list({ page: 1, per_page: 50 });
        if (!active) {
          return;
        }

        const source = Array.isArray(data?.questions)
          ? data.questions
          : Array.isArray(data?.items)
          ? data.items
          : [];

        const tagCounts = new Map();
        source.forEach((item) => {
          const tagList = Array.isArray(item?.tags) ? item.tags : [];
          tagList.forEach((tag) => {
            const value =
              typeof tag === 'string'
                ? tag.trim().toLowerCase()
                : typeof tag?.name === 'string'
                ? tag.name.trim().toLowerCase()
                : '';
            if (!value) {
              return;
            }
            tagCounts.set(value, (tagCounts.get(value) || 0) + 1);
          });
        });

        const ranked = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag, count]) => ({
            tag,
            count,
          }));

        setTrendingTopics(ranked);
      } catch (err) {
        if (active) {
          console.error('Failed to load trending topics', err);
          setTrendingTopics([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const reloadReports = useCallback(async () => {
    const data = await api.get('/admin/reports').then((res) => res.data);
    const list = Array.isArray(data) ? data : data?.reports ?? [];
    setReports(list);
    return list;
  }, []);

  const reloadAuditLogs = useCallback(async () => {
    const data = await api.get('/admin/audit').then((res) => res.data);
    const list = Array.isArray(data) ? data : data?.logs ?? [];
    setAuditLogs(list);
    return list;
  }, []);

  const reloadFaqs = useCallback(async () => {
    const data = await api.get('/faqs').then((res) => res.data?.faqs ?? []);
    const list = Array.isArray(data) ? data : [];
    setFaqs(list);
    return list;
  }, []);

  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), []);

  const moderationStats = useMemo(() => {
    const totalFromStats = (stats?.pendingReports ?? 0) + (stats?.resolvedReports ?? 0);
    const totalReports = reports.length || totalFromStats;
    const pending =
      reports.filter((report) => normalizeText(report?.status) === 'pending').length ||
      stats?.pendingReports ||
      0;
    const resolved =
      reports.filter((report) => normalizeText(report?.status) === 'resolved').length ||
      stats?.resolvedReports ||
      0;
    const dismissed = reports.filter((report) => normalizeText(report?.status) === 'dismissed').length;
    const highPriority = reports.filter(
      (report) =>
        String(report.priority).toLowerCase() === 'high' && normalizeText(report?.status) === 'pending'
    ).length;
    const resolutionRate = totalReports ? Math.round((resolved / totalReports) * 100) : 0;

    return {
      totalReports,
      pending,
      resolved,
      dismissed,
      highPriority,
      resolutionRate,
      averageResponseTime: pending ? '—' : '—',
    };
  }, [reports, stats]);

  const moderationInsights = useMemo(() => {
    const now = Date.now();
    const pendingList = reports.filter((report) => normalizeText(report?.status) === 'pending');
    const pendingLast24 = pendingList.filter((report) => {
      const date = safeParseDate(report?.timestamp ?? report?.created_at);
      return date ? now - date.getTime() <= 24 * 60 * 60 * 1000 : false;
    }).length;
    const pendingAges = pendingList
      .map((report) => {
        const date = safeParseDate(report?.timestamp ?? report?.created_at);
        return date ? (now - date.getTime()) / 60000 : null;
      })
      .filter((value) => value !== null);
    const avgPendingMinutes = pendingAges.length
      ? pendingAges.reduce((sum, value) => sum + value, 0) / pendingAges.length
      : 0;
    const resolvedLast7 = auditLogs.filter((log) => {
      const action = normalizeText(log?.action);
      if (!action || !action.includes('resolve')) {
        return false;
      }
      const date = safeParseDate(log?.timestamp);
      return date ? now - date.getTime() <= 7 * 24 * 60 * 60 * 1000 : false;
    }).length;
    const dismissedLast7 = auditLogs.filter((log) => {
      const action = normalizeText(log?.action);
      if (!action || !action.includes('dismiss')) {
        return false;
      }
      const date = safeParseDate(log?.timestamp);
      return date ? now - date.getTime() <= 7 * 24 * 60 * 60 * 1000 : false;
    }).length;

    return [
      {
        id: 'mi-queue',
        title: 'Pending queue',
        value: numberFormatter.format(moderationStats.pending),
        change: `${numberFormatter.format(pendingLast24)} new today`,
        tone: moderationStats.pending > 0 ? 'attention' : 'positive',
      },
      {
        id: 'mi-resolution',
        title: 'Resolution rate',
        value: `${moderationStats.resolutionRate}%`,
        change: `${numberFormatter.format(resolvedLast7)} resolved past 7d`,
        tone: moderationStats.resolutionRate >= 80 ? 'positive' : 'attention',
      },
      {
        id: 'mi-age',
        title: 'Average pending age',
        value: formatDuration(avgPendingMinutes),
        change: dismissedLast7
          ? `${numberFormatter.format(dismissedLast7)} dismissed past 7d`
          : 'Monitoring queue',
        tone: avgPendingMinutes > 240 ? 'attention' : 'positive',
      },
    ];
  }, [auditLogs, moderationStats, numberFormatter, reports]);

  const totalQuestions = stats?.totalQuestions ?? 0;
  const totalAnswers = stats?.totalAnswers ?? 0;
  const totalUsersCount = stats?.totalUsers ?? adminUsers.length;
  const answerRate = totalQuestions ? Math.round((totalAnswers / totalQuestions) * 100) : 0;
  const unansweredQuestions = Math.max(totalQuestions - totalAnswers, 0);

  const activeContributors = stats?.activeUsers ?? totalUsersCount;

  const statsCards = useMemo(
    () => [
      {
        id: 'stat-1',
        icon: Users,
        label: 'Active contributors',
        value: numberFormatter.format(activeContributors),
        change: 'Active this month',
        accentClass: 'bg-emerald-500/10 text-emerald-500',
      },
      {
        id: 'stat-2',
        icon: MessageSquare,
        label: 'New questions',
        value: numberFormatter.format(totalQuestions),
        change: `${answerRate}% answered`,
        accentClass: 'bg-sky-500/10 text-sky-600',
      },
      {
        id: 'stat-3',
        icon: Flag,
        label: 'Pending reports',
        value: numberFormatter.format(moderationStats.pending),
        change: `${numberFormatter.format(moderationStats.highPriority)} priority`,
        accentClass: 'bg-amber-500/10 text-amber-600',
      },
      {
        id: 'stat-4',
        icon: TrendingUp,
        label: 'Resolution rate',
        value: `${moderationStats.resolutionRate}%`,
        change: 'Target ≥ 90%',
        accentClass: 'bg-indigo-500/10 text-indigo-600',
      },
    ],
    [
      answerRate,
      moderationStats.highPriority,
      moderationStats.pending,
      moderationStats.resolutionRate,
      numberFormatter,
      totalQuestions,
      activeContributors,
    ]
  );

  const recentReports = useMemo(() => {
    return reports.slice(0, 5).map((report) => {
      const status = normalizeText(report?.status) || 'unknown';
      const timestamp = report?.timestamp ?? report?.created_at;
      const titleRaw =
        report?.targetTitle ??
        report?.target ??
        `${formatCategoryLabel(normalizeText(report?.type) || 'content')} #${report?.target_id ?? ''}`;
      const title = typeof titleRaw === 'string' ? titleRaw.trim() : String(titleRaw);
      return {
        id: report?.id ?? `${title}-${timestamp ?? status}`,
        title: title || 'Untitled content',
        status,
        timestamp,
      };
    });
  }, [reports]);

  const complianceChecks = useMemo(() => {
    const nowISO = new Date().toISOString();
    const queueStatus = moderationStats.pending > 5 ? 'attention' : 'pass';
    const answerRateStatus = answerRate >= 65 ? 'pass' : 'attention';
    const highPriorityStatus = moderationStats.highPriority > 0 ? 'attention' : 'pass';

    return [
      {
        id: 'check-queue',
        label: 'Moderation queue load',
        status: queueStatus,
        updatedAt: nowISO,
        detail: `${numberFormatter.format(moderationStats.pending)} pending`,
      },
      {
        id: 'check-answers',
        label: 'Community answer rate',
        status: answerRateStatus,
        updatedAt: nowISO,
        detail: `${answerRate}% answered`,
      },
      {
        id: 'check-priority',
        label: 'High priority flags',
        status: highPriorityStatus,
        updatedAt: nowISO,
        detail: `${numberFormatter.format(moderationStats.highPriority)} escalated`,
      },
    ];
  }, [answerRate, moderationStats, numberFormatter]);

  const automationSignals = useMemo(() => {
    if (!auditLogs.length) {
      return [];
    }

    const seen = new Set();
    const entries = [];
    auditLogs.forEach((log) => {
      const action = log?.action;
      if (!action || seen.has(action)) {
        return;
      }
      seen.add(action);
      entries.push({
        id: log?.id ?? action,
        label: formatActionLabel(action),
        status: normalizeText(action).includes('dismiss') ? 'paused' : 'active',
        timestamp: log?.timestamp,
      });
    });

    return entries.slice(0, 4);
  }, [auditLogs]);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return reports.filter((report) => {
      const haystack = [
        report?.targetTitle,
        report?.reason,
        report?.description,
        report?.reporterName,
        report?.reporterEmail,
        report?.type,
      ].map(normalizeText);
      const matchesSearch = !search || haystack.some((value) => value.includes(search));
      const status = normalizeText(report?.status);
      const matchesStatus = selectedReportStatus === 'all' || status === selectedReportStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, selectedReportStatus]);

  const timeRangeLabel = TIME_RANGE_LABELS[selectedTimeRange] ?? 'Last 7 days';
  const flaggedUsers = useMemo(() => {
    const grouped = new Map();
    reports.forEach((report) => {
      const displayName = report.targetTitle || `${report.type ?? report.target_type} #${report.target_id}`;
      if (!grouped.has(displayName)) {
        grouped.set(displayName, {
          id: displayName,
          name: displayName,
          reason: report.reason,
          reports: 0,
          lastSeen: report.timestamp || report.created_at,
        });
      }
      const entry = grouped.get(displayName);
      entry.reports += 1;
      entry.reason = report.reason;
      entry.lastSeen = report.timestamp || report.created_at || entry.lastSeen;
    });
    return Array.from(grouped.values()).slice(0, 5);
  }, [reports]);

  const teamMembers = useMemo(() => {
    if (!Array.isArray(adminUsers) || !adminUsers.length) {
      return [];
    }
    const now = Date.now();
    return adminUsers.map((user) => {
      const joinedAt = safeParseDate(user?.created_at);
      const updatedAt = safeParseDate(user?.updated_at);
      const isActive = updatedAt ? now - updatedAt.getTime() <= 12 * 60 * 60 * 1000 : false;
      return {
        id: user.id ?? user.email ?? `user-${Math.random().toString(36).slice(2)}`,
        name: user.name || user.email || 'Team member',
        roleLabel: formatCategoryLabel(normalizeText(user?.role) || 'member'),
        email: user.email,
        joinedAt,
        lastActive: updatedAt,
        status: isActive ? 'Active' : 'Away',
      };
    });
  }, [adminUsers]);

  const topReporters = useMemo(() => {
    const counts = new Map();
    reports.forEach((report) => {
      const reporterId = report.reporterId ?? report.user_id ?? report.userId ?? report.userID;
      const key = reporterId ?? report.reporterEmail ?? report.reporterName ?? report.user_id ?? report.id;
      const name = report.reporterName || report.reporterEmail || (reporterId ? `User #${reporterId}` : 'Community member');
      if (!counts.has(key)) {
        counts.set(key, {
          id: key,
          name,
          reports: 0,
        });
      }
      const entry = counts.get(key);
      entry.reports += 1;
    });
    return Array.from(counts.values())
      .sort((a, b) => b.reports - a.reports)
      .slice(0, 3);
  }, [reports]);

  const navigation = [
    { label: 'Overview', value: 'overview', icon: Activity },
    { label: 'Moderation Hub', value: 'moderation', icon: Flag },
    { label: 'Community', value: 'users', icon: Users },
  ];

  const handleReportAction = async (reportId, action) => {
    try {
      const endpoint =
        action === 'resolve' ? 'resolve' : action === 'dismiss' || action === 'remove' ? 'dismiss' : null;
      if (!endpoint) return;

      await api.post(`/admin/reports/${reportId}/${endpoint}`);
      await Promise.all([reloadReports(), reloadAuditLogs()]);
    } catch (err) {
      console.error('Failed to update report', err);
    }
  };

  const handleUserAction = (userId, action) => {
    console.log(`Admin action: ${action} applied to user ${userId}`);
  };

  const handleCreateFAQ = async (event) => {
    event.preventDefault();
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      return;
    }

    try {
      await api.post('/faqs', {
        question: newFAQ.question.trim(),
        answer: newFAQ.answer.trim(),
      });
      await reloadFaqs();
      setNewFAQ({ question: '', answer: '', category: newFAQ.category });
      setShowCreateFAQDialog(false);
    } catch (err) {
      console.error('Failed to create FAQ', err);
    }
  };

  const greeting = currentUser?.name
    ? `Welcome back, ${currentUser.name}`
    : 'Welcome back, Admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 py-12">
        <div className="mx-auto max-w-3xl text-center text-slate-600">
          Loading admin data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center text-red-600">
              {error}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <aside className="hidden xl:block">
            <Card className="sticky top-8 h-fit border-0 bg-white/80 shadow-xl backdrop-blur">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Control Center
                    </p>
                    <p className="text-lg font-semibold text-slate-900">Gem Admin</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-900"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New announcement
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Navigation
                  </p>
                  <div className="mt-3 space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setActiveSection(item.value)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-lg'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </span>
                          {isActive ? (
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Live
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Open escalations
                      </span>
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-100 text-amber-700"
                      >
                        {moderationStats.highPriority}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      High priority items waiting for lead review.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Download className="h-4 w-4 text-slate-500" />
                        Recent reports
                      </span>
                      <Badge className="bg-slate-900 text-white">
                        {recentReports.length}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-slate-500">
                      {recentReports.length ? (
                        recentReports.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-2">
                            <span className="truncate">{item.title}</span>
                            <span className="text-right">
                              {formatCategoryLabel(item.status)}
                              <span className="ml-1 text-[11px] text-slate-400">
                                {formatTimeAgo(item.timestamp) || '-'}
                              </span>
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400">No reports yet</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Shortcuts
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <button
                        type="button"
                        onClick={() => setActiveSection('moderation')}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100"
                      >
                        <span className="flex items-center gap-2">
                          <Flag className="h-4 w-4 text-amber-500" /> Moderation queue
                        </span>
                        <Badge variant="outline" className="border-transparent bg-slate-200">
                          {moderationStats.pending}
                        </Badge>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('users')}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-500" /> Community health
                        </span>
                        <Badge variant="outline" className="border-transparent bg-slate-200">
                          {`${answerRate}%`}
                        </Badge>
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" /> Reports archive
                        </span>
                        <Badge variant="outline" className="border-transparent bg-slate-200">
                          {recentReports.length}
                        </Badge>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-6">
            <Card className="border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                        Admin Control
                      </p>
                      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{greeting}</h1>
                      <p className="mt-3 max-w-2xl text-sm text-white/70">
                        Monitor community health, triage urgent reports, and coordinate the moderation team from a single view.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {timeRangeLabel}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-slate-900 hover:bg-slate-100"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export snapshot
                      </Button>
                      <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-400">
                        <Plus className="mr-2 h-4 w-4" />
                        Create automation
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/70">Pending queue</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {numberFormatter.format(moderationStats.pending)}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        {moderationStats.highPriority} high priority items
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/70">Resolution pace</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {moderationStats.resolutionRate}%
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        Target ≥ 90%
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/70">Response time</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {moderationStats.averageResponseTime}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        From first flag to human review
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.id} className="border-0 bg-white shadow-sm">
                    <CardContent className="flex items-start justify-between p-5">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          {card.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-slate-900">
                          {card.value}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">{card.change}</p>
                      </div>
                      <span
                        className={`flex size-10 items-center justify-center rounded-full ${card.accentClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <TabsList className="grid w-full grid-cols-3 bg-slate-200/60 lg:w-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="moderation">Moderation</TabsTrigger>
                  <TabsTrigger value="users">Community</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="1d">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-6">
                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle>Moderation snapshot</CardTitle>
                        <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-600">
                          {timeRangeLabel}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">Items awaiting review</p>
                            <p className="text-2xl font-semibold text-slate-900">
                              {numberFormatter.format(moderationStats.pending)}
                            </p>
                          </div>
                          <Badge className="bg-amber-500/15 text-amber-600">
                            {moderationStats.highPriority} high priority
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm">
                              <p className="text-slate-600">Resolution rate</p>
                              <p className="font-medium text-slate-900">
                                {moderationStats.resolutionRate}%
                              </p>
                            </div>
                            <Progress value={moderationStats.resolutionRate} className="mt-2 h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm">
                              <p className="text-slate-600">Pending workload</p>
                              <p className="font-medium text-slate-900">
                                {moderationStats.totalReports
                                  ? `${Math.round((moderationStats.pending / moderationStats.totalReports) * 100)}%`
                                  : '0%'}
                              </p>
                            </div>
                            <Progress
                              value={
                                moderationStats.totalReports
                                  ? (moderationStats.pending / moderationStats.totalReports) * 100
                                  : 0
                              }
                              className="mt-2 h-2"
                            />
                          </div>
                        </div>
                        <Separator />
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs uppercase text-slate-500">Resolved</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              {numberFormatter.format(moderationStats.resolved)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs uppercase text-slate-500">Dismissed</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              {numberFormatter.format(moderationStats.dismissed)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs uppercase text-slate-500">Avg response</p>
                            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                              <Clock className="h-4 w-4 text-slate-500" />
                              {moderationStats.averageResponseTime}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle>Admin activity</CardTitle>
                        <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-600">
                          Live feed
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {auditLogs.map((activity) => (
                          <div key={activity.id} className="rounded-lg border border-slate-200 p-3">
                            <div className="flex items-baseline justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {activity.admin_name || 'Admin'}
                                </p>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  {activity.action}
                                </p>
                              </div>
                              <span className="text-xs text-slate-400">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              {activity.reason || activity.target}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle>Trending topics</CardTitle>
                        <Badge className="bg-indigo-500/10 text-indigo-600">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Momentum
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {trendingTopics.length ? (
                          trendingTopics.map((item) => (
                            <div key={item.tag} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700">#{item.tag}</span>
                              <span className="text-xs font-semibold text-emerald-600">
                                {numberFormatter.format(item.count)} questions
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No topic insights available yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle>Team availability</CardTitle>
                        <p className="text-sm text-slate-500">Coverage across the moderation roster</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {teamMembers.length ? (
                          teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-9 bg-slate-100">
                                  <AvatarFallback className="text-sm font-medium text-slate-600">
                                    {member.name
                                      .split(' ')
                                      .map((part) => part?.[0])
                                      .filter(Boolean)
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                                  <p className="text-xs text-slate-500">{member.roleLabel}</p>
                                  <p className="text-xs text-slate-400">{member.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="mr-2 bg-emerald-500/10 text-emerald-600">
                                  <UserCheck className="mr-1 h-3 w-3" />
                                  {member.status}
                                </Badge>
                                <p className="text-xs text-slate-500">
                                  Last active {formatTimeAgo(member.lastActive) || '—'}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Joined{' '}
                                  {member.joinedAt
                                    ? member.joinedAt.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : '—'}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            No admin teammates found yet.
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle>Compliance checks</CardTitle>
                        <p className="text-sm text-slate-500">Policy coverage and automation audits</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {complianceChecks.length ? (
                          complianceChecks.map((check) => (
                            <div key={check.id} className="flex items-start justify-between rounded-lg border border-slate-200 p-3">
                              <div>
                                <p className="text-sm font-medium text-slate-800">{check.label}</p>
                                <p className="text-xs text-slate-500">{check.detail}</p>
                                <p className="text-xs text-slate-400">
                                  Updated {formatTimeAgo(check.updatedAt) || 'recently'}
                                </p>
                              </div>
                              {check.status === 'pass' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  On track
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-600">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Attention
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No compliance signals yet.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle>Moderation actions</CardTitle>
                        <p className="text-sm text-slate-500">Latest admin interventions</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {automationSignals.length ? (
                          automationSignals.map((signal) => (
                            <div key={signal.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-600">{signal.label}</p>
                                <p className="text-xs text-slate-400">
                                  {formatTimeAgo(signal.timestamp) || 'recently'}
                                </p>
                              </div>
                              {signal.status === 'active' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
                              ) : (
                                <Badge className="bg-slate-200 text-slate-600">Paused</Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No admin activity recorded yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="moderation" className="space-y-6">
                <Card className="border-0 bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle>Moderation queue</CardTitle>
                      <p className="text-sm text-slate-500">Prioritise reports with the most impact</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search reports by keyword, reason, or content"
                            className="pl-9"
                          />
                        </div>
                        <Select value={selectedReportStatus} onValueChange={setSelectedReportStatus}>
                          <SelectTrigger className="w-full md:w-[160px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon">
                          <Filter className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-500 text-white hover:bg-emerald-400"
                          onClick={() => console.log('Bulk resolve action triggered')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Bulk resolve
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Content</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReports.map((report) => {
                            const status = normalizeText(report?.status) || 'unknown';
                            const priority = normalizeText(report?.priority) || 'medium';
                            const targetTitleRaw = report?.targetTitle ?? '';
                            const targetTitle = String(targetTitleRaw).trim() || 'Untitled content';
                            const reasonRaw = report?.reason ?? report?.description ?? '';
                            const reason = String(reasonRaw).trim() || 'No reason provided';
                            const reporterLabel =
                              report?.reporterName || report?.reporterEmail || 'Community member';
                            const timestamp = report?.timestamp ?? report?.created_at;
                            const typeLabel = formatCategoryLabel(normalizeText(report?.type) || 'content');
                            const reportId = report?.id;
                            const rowKey = reportId ?? `${targetTitle}-${timestamp ?? 'pending'}`;

                            return (
                              <TableRow key={rowKey}>
                                <TableCell className="max-w-[220px]">
                                  <p className="truncate text-sm font-medium text-slate-900">
                                    {targetTitle}
                                  </p>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {typeLabel}
                                  </p>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {reason}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {reporterLabel}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getPriorityBadgeClasses(priority)}
                                  >
                                    {formatCategoryLabel(priority)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getStatusBadgeClasses(status)}
                                  >
                                    {formatCategoryLabel(status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500">
                                  {formatDateTime(timestamp)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {status === 'pending' && reportId ? (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-emerald-600 hover:text-emerald-700"
                                          onClick={() => handleReportAction(reportId, 'resolve')}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-slate-600 hover:text-slate-800"
                                          onClick={() => handleReportAction(reportId, 'dismiss')}
                                        >
                                          <EyeOff className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:text-red-600"
                                          onClick={() => handleReportAction(reportId, 'remove')}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="border-slate-200 bg-slate-100">
                                        {status === 'unknown' ? '—' : formatTimeAgo(timestamp)}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <Card className="border-0 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle>Moderation insights</CardTitle>
                      <p className="text-sm text-slate-500">Operational performance signals</p>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                      {moderationInsights.map((insight) => (
                        <div key={insight.id} className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs uppercase text-slate-500">{insight.title}</p>
                          <p className="mt-3 text-2xl font-semibold text-slate-900">
                            {insight.value}
                          </p>
                          <p
                            className={`mt-2 text-xs font-medium ${
                              insight.tone === 'positive' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {insight.change}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle>Flagged users</CardTitle>
                      <p className="text-sm text-slate-500">Accounts needing moderation follow up</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {flaggedUsers.map((user) => (
                        <div key={user.id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                <span>{user.reason}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                                <span>{user.reports} reports</span>
                                <span>Last seen {formatTimeAgo(user.lastSeen)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUserAction(user.id, 'review')}
                              >
                                <Eye className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUserAction(user.id, 'mute')}
                              >
                                <EyeOff className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUserAction(user.id, 'remove')}
                              >
                                <UserX className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-6">
                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle>Community engagement</CardTitle>
                        <p className="text-sm text-slate-500">Answer quality and participation metrics</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-slate-600">Answer rate</p>
                            <p className="font-semibold text-slate-900">{answerRate}%</p>
                          </div>
                          <Progress value={answerRate} className="mt-2 h-2" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs uppercase text-slate-500">Total questions</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              {numberFormatter.format(totalQuestions)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs uppercase text-slate-500">Total answers</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              {numberFormatter.format(totalAnswers)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs uppercase text-slate-500">Unanswered</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              {numberFormatter.format(unansweredQuestions)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle>Top reporters</CardTitle>
                        <p className="text-sm text-slate-500">Community members flagging content the most</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {topReporters.length ? (
                          topReporters.map((leader, index) => (
                            <div key={leader.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-slate-400">#{index + 1}</span>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{leader.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {numberFormatter.format(leader.reports)} reports
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-indigo-500/10 text-indigo-600">
                                {numberFormatter.format(leader.reports)}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No reports submitted yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Dialog
                      open={showCreateFAQDialog}
                      onOpenChange={setShowCreateFAQDialog}
                    >
                      <Card className="border-0 bg-white shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                          <div>
                            <CardTitle>Knowledge base</CardTitle>
                            <p className="text-sm text-slate-500">FAQs used by moderators</p>
                          </div>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Plus className="mr-2 h-4 w-4" />
                              New FAQ
                            </Button>
                          </DialogTrigger>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {faqs.map((faq) => (
                            <div key={faq.id} className="rounded-lg border border-slate-200 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                                  <p className="mt-1 text-xs text-slate-500">{faq.answer}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-600">
                                    {formatCategoryLabel(faq.category)}
                                  </Badge>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4 text-slate-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Create FAQ entry</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={handleCreateFAQ}>
                          <div className="space-y-2">
                            <Label htmlFor="faq-question">Question</Label>
                            <Input
                              id="faq-question"
                              value={newFAQ.question}
                              onChange={(event) =>
                                setNewFAQ((prev) => ({ ...prev, question: event.target.value }))
                              }
                              placeholder="When should we escalate to the on-call lead?"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="faq-answer">Answer</Label>
                            <Textarea
                              id="faq-answer"
                              value={newFAQ.answer}
                              onChange={(event) =>
                                setNewFAQ((prev) => ({ ...prev, answer: event.target.value }))
                              }
                              rows={4}
                              placeholder="Outline the steps moderators should follow."
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={newFAQ.category}
                              onValueChange={(value) =>
                                setNewFAQ((prev) => ({ ...prev, category: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="moderation">Moderation</SelectItem>
                                <SelectItem value="policy">Policy</SelectItem>
                                <SelectItem value="operations">Operations</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCreateFAQDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                              Save FAQ
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Card className="border-0 bg-white shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle>Community alerts</CardTitle>
                        <p className="text-sm text-slate-500">Signals that may need messaging</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800">Visibility dips</p>
                            <p className="text-xs text-slate-500">4 posts hidden in the last 12 hours</p>
                          </div>
                          <Badge className="bg-amber-500/10 text-amber-600">Review</Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800">Mentor availability</p>
                            <p className="text-xs text-slate-500">Coverage holding steady at 92%</p>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-600">Healthy</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
