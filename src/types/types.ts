export type UserRole = 'senior' | 'caregiver' | 'healthcare';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  date_of_birth: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type MonitoringDataType = 'speech_pattern' | 'typing_speed' | 'activity_level';

export interface MonitoringData {
  id: string;
  user_id: string;
  data_type: MonitoringDataType;
  value: Record<string, unknown>;
  score: number;
  recorded_at: string;
  created_at: string;
}

export type AlertType = 'cognitive_decline' | 'activity_change' | 'urgent';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  user_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export type RoutineType = 'medication' | 'meal' | 'exercise' | 'sleep' | 'social';

export interface DailyRoutine {
  id: string;
  user_id: string;
  routine_type: RoutineType;
  title: string;
  description: string | null;
  scheduled_time: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export type ExerciseType = 'memory' | 'puzzle' | 'language' | 'attention';
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

export interface CognitiveExercise {
  id: string;
  title: string;
  description: string | null;
  exercise_type: ExerciseType;
  difficulty: ExerciseDifficulty;
  instructions: string | null;
  content: Record<string, unknown> | null;
  created_at: string;
}

export interface ExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  score: number;
  time_taken: number;
  completed_at: string;
}

export type RelationshipType = 'family' | 'professional' | 'healthcare';

export interface CaregiverAssignment {
  id: string;
  senior_id: string;
  caregiver_id: string;
  relationship: RelationshipType;
  created_at: string;
}

export interface MonitoringStats {
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining';
  recentData: MonitoringData[];
}

export interface DashboardStats {
  totalAlerts: number;
  unreadAlerts: number;
  todayRoutines: number;
  completedRoutines: number;
  averageCognitiveScore: number;
  recentActivity: string;
}
