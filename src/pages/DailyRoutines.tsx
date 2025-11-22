import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Pill, Utensils, Dumbbell, Moon, Users, Plus, CheckCircle, Clock } from 'lucide-react';
import { routinesApi } from '@/db/api';
import type { DailyRoutine, RoutineType } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

export default function DailyRoutines() {
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [filter, setFilter] = useState<RoutineType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const demoUserId = 'demo-user-id';

  const form = useForm({
    defaultValues: {
      routine_type: 'medication' as RoutineType,
      title: '',
      description: '',
      scheduled_time: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const data = await routinesApi.getByUserId(demoUserId);
      setRoutines(data);
    } catch (error) {
      console.error('Error loading routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    routine_type: RoutineType;
    title: string;
    description: string;
    scheduled_time: string;
    notes: string;
  }) => {
    try {
      await routinesApi.create({
        user_id: demoUserId,
        routine_type: values.routine_type,
        title: values.title,
        description: values.description || null,
        scheduled_time: values.scheduled_time || null,
        notes: values.notes || null,
        completed_at: null,
      });
      
      toast({
        title: 'Success',
        description: 'Routine added successfully',
      });
      
      form.reset();
      setDialogOpen(false);
      loadRoutines();
    } catch (error) {
      console.error('Error creating routine:', error);
      toast({
        title: 'Error',
        description: 'Failed to add routine',
        variant: 'destructive',
      });
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      await routinesApi.markAsCompleted(id);
      setRoutines(routines.map(r => r.id === id ? { ...r, completed_at: new Date().toISOString() } : r));
      toast({
        title: 'Success',
        description: 'Routine marked as completed',
      });
    } catch (error) {
      console.error('Error completing routine:', error);
      toast({
        title: 'Error',
        description: 'Failed to update routine',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await routinesApi.delete(id);
      setRoutines(routines.filter(r => r.id !== id));
      toast({
        title: 'Success',
        description: 'Routine deleted',
      });
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete routine',
        variant: 'destructive',
      });
    }
  };

  const routineTypes = [
    { value: 'medication', label: 'Medication', icon: Pill, color: 'text-primary' },
    { value: 'meal', label: 'Meals', icon: Utensils, color: 'text-secondary' },
    { value: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-accent' },
    { value: 'sleep', label: 'Sleep', icon: Moon, color: 'text-muted-foreground' },
    { value: 'social', label: 'Social', icon: Users, color: 'text-primary' },
  ];

  const filteredRoutines = routines.filter(routine => {
    if (filter === 'all') return true;
    return routine.routine_type === filter;
  });

  const todayRoutines = routines.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.created_at.startsWith(today);
  });

  const completedToday = todayRoutines.filter(r => r.completed_at).length;

  const getRoutineIcon = (type: RoutineType) => {
    const routineType = routineTypes.find(t => t.value === type);
    return routineType ? routineType.icon : Calendar;
  };

  const getRoutineColor = (type: RoutineType) => {
    const routineType = routineTypes.find(t => t.value === type);
    return routineType ? routineType.color : 'text-foreground';
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
              <Calendar className="w-10 h-10 text-primary" />
              Daily Routines
            </h1>
            <p className="text-senior text-muted-foreground mt-2">
              Track your daily activities and habits
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-senior">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Routine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-senior-xl">Add New Routine</DialogTitle>
                  <DialogDescription className="text-senior">
                    Create a new daily routine entry
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="routine_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-senior-lg">Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-senior">
                                <SelectValue placeholder="Select routine type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {routineTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value} className="text-senior">
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      rules={{ required: 'Title is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-senior-lg">Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Morning medication" className="text-senior" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduled_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-senior-lg">Scheduled Time (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" className="text-senior" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-senior-lg">Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Add details..." className="text-senior" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-senior-lg">Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Additional notes..." className="text-senior" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button type="submit" className="btn-senior flex-1">
                        Add Routine
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="btn-senior flex-1"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Link to="/">
              <Button variant="outline" className="btn-senior">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Today's Routines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{todayRoutines.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">{completedToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-senior-lg">Total Routines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{routines.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl">Routine History</CardTitle>
            <CardDescription className="text-senior">
              View and manage your daily routines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="all" className="text-senior">
                  All
                </TabsTrigger>
                {routineTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="text-senior">
                    <type.icon className="w-5 h-5 xl:mr-2" />
                    <span className="hidden xl:inline">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={filter} className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-senior-lg text-muted-foreground">Loading routines...</p>
                  </div>
                ) : filteredRoutines.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-senior-lg text-muted-foreground">No routines found</p>
                    <p className="text-senior text-muted-foreground mt-2">
                      Add your first routine to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRoutines.map((routine) => {
                      const Icon = getRoutineIcon(routine.routine_type);
                      return (
                        <div
                          key={routine.id}
                          className={`p-6 rounded-lg border ${
                            routine.completed_at ? 'bg-muted' : 'bg-card'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <Icon className={`w-8 h-8 ${getRoutineColor(routine.routine_type)} flex-shrink-0 mt-1`} />
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                                <div>
                                  <h3 className="text-senior-xl font-semibold">{routine.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-senior capitalize">
                                      {routine.routine_type}
                                    </Badge>
                                    {routine.completed_at && (
                                      <Badge variant="secondary" className="text-senior">
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {routine.description && (
                                <p className="text-senior text-muted-foreground">{routine.description}</p>
                              )}

                              <div className="flex flex-wrap gap-4 text-senior text-muted-foreground">
                                {routine.scheduled_time && (
                                  <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {routine.scheduled_time}
                                  </span>
                                )}
                                <span>Created: {new Date(routine.created_at).toLocaleString()}</span>
                                {routine.completed_at && (
                                  <span>Completed: {new Date(routine.completed_at).toLocaleString()}</span>
                                )}
                              </div>

                              {routine.notes && (
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-senior text-muted-foreground">{routine.notes}</p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-3 pt-3">
                                {!routine.completed_at && (
                                  <Button
                                    variant="default"
                                    className="btn-senior"
                                    onClick={() => handleMarkComplete(routine.id)}
                                  >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Mark Complete
                                  </Button>
                                )}
                                <Button
                                  variant="destructive"
                                  className="btn-senior"
                                  onClick={() => handleDelete(routine.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
