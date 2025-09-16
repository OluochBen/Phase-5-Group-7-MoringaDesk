import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter, MessageSquare, ThumbsUp, AtSign, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function NotificationsPanel({ notifications, onMarkAsRead }) {
  const [filterType, setFilterType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'answer': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'vote': return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'mention': return <AtSign className="w-4 h-4 text-orange-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'answer': return 'border-l-blue-500';
      case 'vote': return 'border-l-green-500';
      case 'mention': return 'border-l-orange-500';
      case 'admin': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredNotifications = notifications
    .filter(n => (filterType === 'all' || n.type === filterType) && (!showUnreadOnly || !n.read))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffH = diffMs / (1000 * 60 * 60);
    const diffD = diffH / 24;

    if (diffH < 1) return `${Math.floor(diffMs / (1000 * 60))}m ago`;
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    if (diffD < 7) return `${Math.floor(diffD)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const markAllAsRead = () => {
    notifications.forEach(n => { if (!n.read) onMarkAsRead(n.id); });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your activity and community interactions
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter(n => n.type === 'answer').length}
            </div>
            <div className="text-sm text-muted-foreground">New Answers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.type === 'vote').length}
            </div>
            <div className="text-sm text-muted-foreground">Votes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter(n => n.type === 'mention').length}
            </div>
            <div className="text-sm text-muted-foreground">Mentions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="answer">New Answers</SelectItem>
                <SelectItem value="vote">Votes</SelectItem>
                <SelectItem value="mention">Mentions</SelectItem>
                <SelectItem value="admin">Admin Messages</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showUnreadOnly ? 'default' : 'outline'}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showUnreadOnly ? 'Show All' : 'Unread Only'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(n => (
            <Card
              key={n.id}
              className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${getNotificationColor(n.type)} ${!n.read ? 'bg-muted/30' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>{n.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{n.type}</Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(n.timestamp)}</span>
                      </div>
                      {!n.read && <Badge variant="default" className="bg-green-600">New</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onMarkAsRead(n.id); }}>
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {showUnreadOnly || filterType !== 'all'
                  ? "No notifications match your current filters."
                  : "You're all caught up! Check back later for new notifications."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notification Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['New Answers', 'Votes', 'Mentions', 'Admin Messages'].map(pref => (
            <div key={pref} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{pref}</p>
                <p className="text-sm text-muted-foreground">
                  {pref === 'New Answers' && "Get notified when someone answers your questions"}
                  {pref === 'Votes' && "Get notified when your content receives votes"}
                  {pref === 'Mentions' && "Get notified when someone mentions you"}
                  {pref === 'Admin Messages' && "Important updates from administrators"}
                </p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
