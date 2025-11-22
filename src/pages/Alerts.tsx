import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bell, CheckCircle, XCircle } from 'lucide-react';
import { alertsApi } from '@/db/api';
import type { Alert } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const demoUserId = 'demo-user-id';

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsApi.getByUserId(demoUserId);
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertsApi.markAsRead(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
      toast({
        title: 'Success',
        description: 'Alert marked as read',
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsResolved = async (id: string) => {
    try {
      await alertsApi.markAsResolved(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_resolved: true, resolved_at: new Date().toISOString() } : a));
      toast({
        title: 'Success',
        description: 'Alert marked as resolved',
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve alert',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertsApi.delete(id);
      setAlerts(alerts.filter(a => a.id !== id));
      toast({
        title: 'Success',
        description: 'Alert deleted',
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete alert',
        variant: 'destructive',
      });
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.is_read;
    if (filter === 'resolved') return alert.is_resolved;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const resolvedCount = alerts.filter(a => a.is_resolved).length;

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
              <Bell className="w-10 h-10 text-primary" />
              Alerts & Notifications
            </h1>
            <p className="text-senior text-muted-foreground mt-2">
              Monitor and manage health alerts
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="btn-senior">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                Total Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{alerts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-destructive">{unreadCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-secondary" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">{resolvedCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl">Alert History</CardTitle>
            <CardDescription className="text-senior">
              View and manage your health alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all" className="text-senior">
                  All ({alerts.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-senior">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="text-senior">
                  Resolved ({resolvedCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-senior-lg text-muted-foreground">Loading alerts...</p>
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-senior-lg text-muted-foreground">No alerts to display</p>
                    <p className="text-senior text-muted-foreground mt-2">
                      {filter === 'unread' && 'All alerts have been read'}
                      {filter === 'resolved' && 'No resolved alerts yet'}
                      {filter === 'all' && 'You have no alerts at this time'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-6 rounded-lg border ${
                          !alert.is_read ? 'bg-card border-primary' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-senior-xl font-semibold">{alert.title}</h3>
                                <Badge variant={getSeverityColor(alert.severity)} className="text-senior">
                                  {alert.severity}
                                </Badge>
                                {!alert.is_read && (
                                  <Badge variant="default" className="text-senior">New</Badge>
                                )}
                                {alert.is_resolved && (
                                  <Badge variant="secondary" className="text-senior">Resolved</Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-senior text-foreground">{alert.description}</p>
                            
                            <div className="flex flex-col xl:flex-row gap-2 text-sm text-muted-foreground">
                              <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                              {alert.resolved_at && (
                                <span>• Resolved: {new Date(alert.resolved_at).toLocaleString()}</span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3 pt-3">
                              {!alert.is_read && (
                                <Button
                                  variant="outline"
                                  className="btn-senior"
                                  onClick={() => handleMarkAsRead(alert.id)}
                                >
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  Mark as Read
                                </Button>
                              )}
                              {!alert.is_resolved && (
                                <Button
                                  variant="default"
                                  className="btn-senior"
                                  onClick={() => handleMarkAsResolved(alert.id)}
                                >
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  Mark as Resolved
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                className="btn-senior"
                                onClick={() => handleDelete(alert.id)}
                              >
                                <XCircle className="w-5 h-5 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
