// src/components/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  Flag,
  Activity,
  TrendingUp,
  CheckCircle,
  EyeOff,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import api from "../services/api"; // ✅ use Axios instance

export function AdminPanel({ currentUser }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Guard: only admin can access
  if (currentUser?.role !== "admin") {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <p className="text-xl text-red-600 font-semibold">
          Access denied. Admins only.
        </p>
      </div>
    );
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [statsRes, reportsRes, auditRes] = await Promise.all([
          api.get("/admin/stats").then((r) => r.data).catch(() => null),
          api.get("/admin/reports").then((r) => r.data).catch(() => []),
          api.get("/admin/audit").then((r) => r.data).catch(() => []),
        ]);

        setStats(statsRes || {});
        setReports(Array.isArray(reportsRes) ? reportsRes : []);
        setAuditLogs(Array.isArray(auditRes) ? auditRes : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleReportAction(reportId, action) {
    try {
      await api.post(`/admin/reports/${reportId}/${action}`);
      const refreshed = await api
        .get("/admin/reports")
        .then((r) => r.data)
        .catch(() => []);
      setReports(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      console.error("Failed to update report", err);
    }
  }

  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) => {
        const matchesSearch =
          searchTerm === "" ||
          report.targetTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || report.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-600">Loading admin data…</p>
    );
  }

  if (error) {
    return <p className="text-center mt-20 text-red-600">{error}</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">
            Reports ({stats?.pendingReports || 0})
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="bg-blue-100"
              value={stats?.totalUsers}
              label="Total Users"
            />
            <StatCard
              icon={<MessageSquare className="w-6 h-6 text-green-600" />}
              color="bg-green-100"
              value={stats?.totalQuestions}
              label="Total Questions"
            />
            <StatCard
              icon={<Flag className="w-6 h-6 text-orange-600" />}
              color="bg-orange-100"
              value={stats?.pendingReports}
              label="Pending Reports"
            />
            <StatCard
              icon={<Activity className="w-6 h-6 text-purple-600" />}
              color="bg-purple-100"
              value={stats?.activeUsers}
              label="Active Users (30d)"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-100"
              value={stats?.totalAnswers}
              label="Total Answers"
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6 text-red-600" />}
              color="bg-red-100"
              value={stats?.resolvedReports}
              label="Resolved Reports"
            />
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="mt-6">
          <Card className="mb-6">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Badge>{report.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.targetTitle}
                      </TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(report.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === "pending"
                              ? "destructive"
                              : report.status === "resolved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === "pending" && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleReportAction(report.id, "resolve")
                              }
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleReportAction(report.id, "dismiss")
                              }
                            >
                              <EyeOff className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">User management coming soon…</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge>{log.action}</Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-xs">
                        {log.target}
                      </TableCell>
                      <TableCell>{log.adminName}</TableCell>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper stat card
function StatCard({ icon, color, value, label }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value ?? "-"}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
