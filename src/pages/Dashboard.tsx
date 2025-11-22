import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Bell, Calendar, Video, Dumbbell, AlertTriangle } from 'lucide-react';
import { alertsApi, routinesApi, monitoringApi } from '@/db/api';
import type { Alert, DailyRoutine } from '@/types/types';

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [todayRoutines, setTodayRoutines] = useState<DailyRoutine[]>([]);
  const [cognitiveScore, setCognitiveScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const demoUserId = 'demo-user-id';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [alertsData, routinesData, avgScore] = await Promise.all([
        alertsApi.getUnread(demoUserId).catch(() => []),
        routinesApi.getTodayRoutines(demoUserId).catch(() => []),
        monitoringApi.getAverageScore(demoUserId, 7).catch(() => 0),
      ]);

      setAlerts(alertsData);
      setTodayRoutines(routinesData);
      setCognitiveScore(Math.round(avgScore));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedRoutines = todayRoutines.filter(r => r.completed_at).length;

  const quickActions = [
    { icon: Activity, label: 'Monitoring', href: '/monitoring', color: 'text-primary' },
    { icon: Bell, label: 'Alerts', href: '/alerts', color: 'text-destructive', badge: alerts.length },
    { icon: Calendar, label: 'Daily Routine', href: '/routines', color: 'text-secondary' },
    { icon: Dumbbell, label: 'Exercises', href: '/exercises', color: 'text-accent' },
    { icon: Video, label: 'Video Call', href: '/video-call', color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
              <Brain className="w-10 h-10 text-primary" />
              Brain Guard
            </h1>
            <p className="text-senior text-muted-foreground mt-2">
              Your cognitive health monitoring companion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Cognitive Score
              </CardTitle>
              <CardDescription className="text-senior">7-day average</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{cognitiveScore}</div>
              <p className="text-senior text-muted-foreground mt-2">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Calendar className="w-6 h-6 text-secondary" />
                Today's Routines
              </CardTitle>
              <CardDescription className="text-senior">Daily activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">
                {completedRoutines}/{todayRoutines.length}
              </div>
              <p className="text-senior text-muted-foreground mt-2">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Bell className="w-6 h-6 text-destructive" />
                Active Alerts
              </CardTitle>
              <CardDescription className="text-senior">Unread notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-destructive">{alerts.length}</div>
              <p className="text-senior text-muted-foreground mt-2">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl">Quick Actions</CardTitle>
            <CardDescription className="text-senior">Access key features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href}>
                  <Button
                    variant="outline"
                    className="w-full btn-senior flex flex-col items-center gap-3 h-auto py-6 relative"
                  >
                    <action.icon className={`w-10 h-10 ${action.color}`} />
                    <span className="text-senior-lg">{action.label}</span>
                    {action.badge !== undefined && action.badge > 0 && (
                      <Badge className="absolute top-2 right-2" variant="destructive">
                        {action.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {alerts.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-senior-xl flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                Recent Alerts
              </CardTitle>
              <CardDescription className="text-senior">
                Important notifications requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg border bg-card flex items-start gap-4"
                  >
                    <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-senior-lg font-semibold">{alert.title}</h3>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-senior text-muted-foreground">{alert.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {alerts.length > 3 && (
                  <Link to="/alerts">
                    <Button variant="outline" className="w-full btn-senior">
                      View All Alerts ({alerts.length})
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {todayRoutines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-senior-xl flex items-center gap-2">
                <Calendar className="w-6 h-6 text-secondary" />
                Today's Schedule
              </CardTitle>
              <CardDescription className="text-senior">Your daily activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayRoutines.slice(0, 5).map((routine) => (
                  <div
                    key={routine.id}
                    className={`p-4 rounded-lg border ${
                      routine.completed_at ? 'bg-muted' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-senior-lg font-semibold">{routine.title}</h3>
                        <p className="text-senior text-muted-foreground">
                          {routine.scheduled_time || 'No time set'}
                        </p>
                      </div>
                      <Badge variant={routine.completed_at ? 'secondary' : 'outline'}>
                        {routine.completed_at ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link to="/routines">
                  <Button variant="outline" className="w-full btn-senior">
                    View All Routines
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
