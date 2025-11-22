import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Minus, MessageSquare, Keyboard, BarChart3 } from 'lucide-react';
import { monitoringApi } from '@/db/api';
import type { MonitoringData, MonitoringDataType } from '@/types/types';
import { Link } from 'react-router-dom';

export default function Monitoring() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [selectedType, setSelectedType] = useState<MonitoringDataType>('speech_pattern');
  const [loading, setLoading] = useState(true);

  const demoUserId = 'demo-user-id';

  useEffect(() => {
    loadMonitoringData();
  }, [selectedType]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const data = await monitoringApi.getByType(demoUserId, selectedType);
      setMonitoringData(data);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (data: MonitoringData[]) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(0, 5);
    const older = data.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.score, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, d) => sum + d.score, 0) / older.length : recentAvg;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  };

  const trend = calculateTrend(monitoringData);
  const averageScore = monitoringData.length > 0
    ? Math.round(monitoringData.reduce((sum, d) => sum + d.score, 0) / monitoringData.length)
    : 0;

  const monitoringTypes = [
    { value: 'speech_pattern', label: 'Speech Patterns', icon: MessageSquare },
    { value: 'typing_speed', label: 'Typing Speed', icon: Keyboard },
    { value: 'activity_level', label: 'Activity Level', icon: BarChart3 },
  ];

  const getTrendIcon = () => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-secondary" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-destructive" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (trend === 'improving') return 'text-secondary';
    if (trend === 'declining') return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-10 h-10 text-primary" />
              Cognitive Monitoring
            </h1>
            <p className="text-senior text-muted-foreground mt-2">
              Track your cognitive health metrics
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
              <CardTitle className="text-senior-lg">Average Score</CardTitle>
              <CardDescription className="text-senior">Current period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{averageScore}</div>
              <p className="text-senior text-muted-foreground mt-2">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Trend</CardTitle>
              <CardDescription className="text-senior">Recent changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor()} flex items-center gap-2`}>
                {getTrendIcon()}
                <span className="capitalize">{trend}</span>
              </div>
              <p className="text-senior text-muted-foreground mt-2">Based on recent data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Data Points</CardTitle>
              <CardDescription className="text-senior">Total records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{monitoringData.length}</div>
              <p className="text-senior text-muted-foreground mt-2">Collected</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl">Monitoring Data</CardTitle>
            <CardDescription className="text-senior">
              View detailed cognitive monitoring metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as MonitoringDataType)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {monitoringTypes.map((type) => (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="text-senior flex items-center gap-2"
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="hidden xl:inline">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {monitoringTypes.map((type) => (
                <TabsContent key={type.value} value={type.value} className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-senior-lg text-muted-foreground">Loading data...</p>
                    </div>
                  ) : monitoringData.length === 0 ? (
                    <div className="text-center py-12">
                      <type.icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-senior-lg text-muted-foreground">
                        No {type.label.toLowerCase()} data available yet
                      </p>
                      <p className="text-senior text-muted-foreground mt-2">
                        Data will appear here as it's collected
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {monitoringData.map((data) => (
                        <div key={data.id} className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <type.icon className="w-6 h-6 text-primary" />
                              <div>
                                <h3 className="text-senior-lg font-semibold capitalize">
                                  {data.data_type.replace('_', ' ')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(data.recorded_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                data.score >= 80
                                  ? 'secondary'
                                  : data.score >= 60
                                    ? 'default'
                                    : 'destructive'
                              }
                              className="text-senior"
                            >
                              Score: {data.score}
                            </Badge>
                          </div>
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-senior text-muted-foreground">
                              {JSON.stringify(data.value, null, 2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-senior-xl">About Cognitive Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-senior-lg font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Speech Patterns
              </h3>
              <p className="text-senior text-muted-foreground">
                Analyzes speech clarity, word recall, and conversation flow to detect early signs of cognitive changes.
              </p>
            </div>
            <div>
              <h3 className="text-senior-lg font-semibold mb-2 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                Typing Speed
              </h3>
              <p className="text-senior text-muted-foreground">
                Monitors typing speed and accuracy as indicators of motor skills and cognitive processing.
              </p>
            </div>
            <div>
              <h3 className="text-senior-lg font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Activity Level
              </h3>
              <p className="text-senior text-muted-foreground">
                Tracks daily digital interactions and activity patterns to identify behavioral changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
