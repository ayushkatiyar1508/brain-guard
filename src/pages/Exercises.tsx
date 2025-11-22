import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Brain, Puzzle, MessageSquare, Eye, Trophy, Clock, Target } from 'lucide-react';
import { exercisesApi, progressApi } from '@/db/api';
import type { CognitiveExercise, ExerciseType } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function Exercises() {
  const [exercises, setExercises] = useState<CognitiveExercise[]>([]);
  const [filter, setFilter] = useState<ExerciseType | 'all'>('all');
  const [selectedExercise, setSelectedExercise] = useState<CognitiveExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const demoUserId = 'demo-user-id';

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exercisesApi.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = (exercise: CognitiveExercise) => {
    setSelectedExercise(exercise);
    setDialogOpen(true);
  };

  const handleCompleteExercise = async (score: number, timeTaken: number) => {
    if (!selectedExercise) return;

    try {
      await progressApi.create({
        user_id: demoUserId,
        exercise_id: selectedExercise.id,
        score,
        time_taken: timeTaken,
      });

      toast({
        title: 'Exercise Completed!',
        description: `You scored ${score} points. Great job!`,
      });

      setDialogOpen(false);
      setSelectedExercise(null);
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your progress',
        variant: 'destructive',
      });
    }
  };

  const exerciseTypes = [
    { value: 'memory', label: 'Memory', icon: Brain, color: 'text-primary' },
    { value: 'puzzle', label: 'Puzzles', icon: Puzzle, color: 'text-secondary' },
    { value: 'language', label: 'Language', icon: MessageSquare, color: 'text-accent' },
    { value: 'attention', label: 'Attention', icon: Eye, color: 'text-muted-foreground' },
  ];

  const filteredExercises = exercises.filter(exercise => {
    if (filter === 'all') return true;
    return exercise.exercise_type === filter;
  });

  const getExerciseIcon = (type: ExerciseType) => {
    const exerciseType = exerciseTypes.find(t => t.value === type);
    return exerciseType ? exerciseType.icon : Brain;
  };

  const getExerciseColor = (type: ExerciseType) => {
    const exerciseType = exerciseTypes.find(t => t.value === type);
    return exerciseType ? exerciseType.color : 'text-foreground';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'hard':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
              <Dumbbell className="w-10 h-10 text-primary" />
              Cognitive Exercises
            </h1>
            <p className="text-senior text-muted-foreground mt-2">
              Train your brain with fun activities
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="btn-senior">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {exerciseTypes.map((type) => {
            const count = exercises.filter(e => e.exercise_type === type.value).length;
            return (
              <Card key={type.value}>
                <CardHeader>
                  <CardTitle className="text-senior-lg flex items-center gap-2">
                    <type.icon className={`w-6 h-6 ${type.color}`} />
                    {type.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground">{count}</div>
                  <p className="text-senior text-muted-foreground mt-1">Exercises</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-senior-xl">Available Exercises</CardTitle>
            <CardDescription className="text-senior">
              Choose an exercise to start training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="all" className="text-senior">
                  All
                </TabsTrigger>
                {exerciseTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="text-senior">
                    <type.icon className="w-5 h-5 xl:mr-2" />
                    <span className="hidden xl:inline">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={filter} className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-senior-lg text-muted-foreground">Loading exercises...</p>
                  </div>
                ) : filteredExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-senior-lg text-muted-foreground">No exercises found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredExercises.map((exercise) => {
                      const Icon = getExerciseIcon(exercise.exercise_type);
                      return (
                        <Card key={exercise.id} className="hover:border-primary transition-colors">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <Icon className={`w-8 h-8 ${getExerciseColor(exercise.exercise_type)} flex-shrink-0 mt-1`} />
                                <div>
                                  <CardTitle className="text-senior-xl">{exercise.title}</CardTitle>
                                  <CardDescription className="text-senior mt-2">
                                    {exercise.description}
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Badge variant="outline" className="text-senior capitalize">
                                {exercise.exercise_type}
                              </Badge>
                              <Badge variant={getDifficultyColor(exercise.difficulty)} className="text-senior capitalize">
                                {exercise.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {exercise.instructions && (
                              <div className="mb-4 p-4 bg-muted rounded-lg">
                                <p className="text-senior text-muted-foreground">
                                  {exercise.instructions}
                                </p>
                              </div>
                            )}
                            <Button
                              className="w-full btn-senior"
                              onClick={() => handleStartExercise(exercise)}
                            >
                              <Target className="w-5 h-5 mr-2" />
                              Start Exercise
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-senior-xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Benefits of Cognitive Exercises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-senior-lg font-semibold mb-2">Memory Enhancement</h3>
              <p className="text-senior text-muted-foreground">
                Regular practice improves short-term and long-term memory recall abilities.
              </p>
            </div>
            <div>
              <h3 className="text-senior-lg font-semibold mb-2">Problem-Solving Skills</h3>
              <p className="text-senior text-muted-foreground">
                Puzzles and challenges strengthen logical thinking and analytical abilities.
              </p>
            </div>
            <div>
              <h3 className="text-senior-lg font-semibold mb-2">Mental Agility</h3>
              <p className="text-senior text-muted-foreground">
                Consistent training helps maintain cognitive flexibility and processing speed.
              </p>
            </div>
            <div>
              <h3 className="text-senior-lg font-semibold mb-2">Preventive Care</h3>
              <p className="text-senior text-muted-foreground">
                Studies show regular cognitive exercise may help reduce the risk of cognitive decline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-senior-xl">{selectedExercise?.title}</DialogTitle>
            <DialogDescription className="text-senior">
              {selectedExercise?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedExercise && (
            <div className="space-y-6">
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="text-senior-lg font-semibold mb-3">Instructions</h3>
                <p className="text-senior text-muted-foreground">
                  {selectedExercise.instructions}
                </p>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <h3 className="text-senior-lg font-semibold mb-4">Exercise Content</h3>
                <div className="text-senior text-muted-foreground">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedExercise.content, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="btn-senior flex-1"
                  onClick={() => {
                    const randomScore = Math.floor(Math.random() * 30) + 70;
                    const randomTime = Math.floor(Math.random() * 120) + 60;
                    handleCompleteExercise(randomScore, randomTime);
                  }}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Complete Exercise
                </Button>
                <Button
                  variant="outline"
                  className="btn-senior flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                This is a demonstration. In a full implementation, this would be an interactive exercise.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
