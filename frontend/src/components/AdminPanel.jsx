import React, { useState } from 'react';
import { Users, MessageSquare, Flag, Activity, TrendingUp, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

export function AdminPanel({ questions, users, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for admin features
  const mockReports = [
    {
      id: '1',
      type: 'question',
      targetId: '1',
      targetTitle: 'How to implement JWT authentication in React?',
      reason: 'Duplicate question',
      reporterId: '3',
      reporterName: 'Mike Johnson',
      timestamp: new Date('2024-01-15T12:00:00'),
      status: 'pending'
    },
    {
      id: '2',
      type: 'answer',
      targetId: '1',
      targetTitle: 'Answer about JWT implementation',
      reason: 'Inappropriate content',
      reporterId: '4',
      reporterName: 'Sarah Wilson',
      timestamp: new Date('2024-01-14T16:30:00'),
      status: 'resolved'
    }
  ];

  const mockAuditLogs = [
    {
      id: '1',
      action: 'Question Deleted',
      target: 'How to hack passwords?',
      adminId: currentUser?.id || '2',
      adminName: currentUser?.name || 'Jane Smith',
      timestamp: new Date('2024-01-15T14:20:00'),
      reason: 'Violates community guidelines'
    },
    {
      id: '2',
      action: 'User Suspended',
      target: 'spammer@example.com',
      adminId: currentUser?.id || '2',
      adminName: currentUser?.name || 'Jane Smith',
      timestamp: new Date('2024-01-14T11:15:00'),
      reason: 'Repeated spam posting'
    }
  ];

  // Calculate stats
  const stats = {
    totalUsers: 156,
    totalQuestions: questions.length,
    totalAnswers: questions.reduce((sum, q) => sum + q.answers.length, 0),
    pendingReports: mockReports.filter(r => r.status === 'pending').length,
    activeUsers: 89,
    resolvedReports: mockReports.filter(r => r.status === 'resolved').length
  };

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReportAction = (reportId, action) => {
    console.log(`${action} report ${reportId}`);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage community content and monitor platform activity</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports ({stats.pendingReports})</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-xs text-green-600">+12 this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-xs text-green-600">+3 today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Flag className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingReports}</p>
                    <p className="text-sm text-muted-foreground">Pending Reports</p>
                    <p className="text-xs text-orange-600">Needs attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Active Users (30d)</p>
                    <p className="text-xs text-green-600">+8% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalAnswers}</p>
                    <p className="text-sm text-muted-foreground">Total Answers</p>
                    <p className="text-xs text-green-600">+7 today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.resolvedReports}</p>
                    <p className="text-sm text-muted-foreground">Resolved Reports</p>
                    <p className="text-xs text-green-600">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">New question posted</p>
                    <p className="text-sm text-muted-foreground">"How to optimize React performance?" by John Doe</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Answer provided</p>
                    <p className="text-sm text-muted-foreground">Jane Smith answered "JWT authentication guide"</p>
                  </div>
                  <span className="text-xs text-muted-foreground">15 min ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">New report submitted</p>
                    <p className="text-sm text-muted-foreground">Content reported for inappropriate language</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
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
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
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
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate font-medium">{report.targetTitle}</p>
                      </TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(report.timestamp)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            report.status === 'pending' ? 'destructive' :
                            report.status === 'resolved' ? 'default' : 'secondary'
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === 'pending' && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReportAction(report.id, 'resolve')}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReportAction(report.id, 'dismiss')}
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

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                <p className="text-muted-foreground">
                  User management features would be implemented here, including user roles, 
                  suspensions, and account management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
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
                  {mockAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{log.target}</p>
                      </TableCell>
                      <TableCell>{log.adminName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(log.timestamp)}</TableCell>
                      <TableCell className="text-sm">{log.reason}</TableCell>
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
