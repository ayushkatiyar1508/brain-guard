import { supabase } from './supabase';
import type {
  Profile,
  MonitoringData,
  Alert,
  DailyRoutine,
  CognitiveExercise,
  ExerciseProgress,
  CaregiverAssignment,
  UserRole,
  MonitoringDataType,
  RoutineType,
  ExerciseType,
} from '@/types/types';

export const profilesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByRole(role: UserRole) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const monitoringApi = {
  async getByUserId(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('monitoring_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByType(userId: string, dataType: MonitoringDataType, limit = 30) {
    const { data, error } = await supabase
      .from('monitoring_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', dataType)
      .order('recorded_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(monitoringData: Omit<MonitoringData, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('monitoring_data')
      .insert(monitoringData)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getAverageScore(userId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('monitoring_data')
      .select('score')
      .eq('user_id', userId)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    const scores = Array.isArray(data) ? data : [];
    if (scores.length === 0) return 0;
    
    const sum = scores.reduce((acc, item) => acc + (item.score || 0), 0);
    return sum / scores.length;
  },
};

export const alertsApi = {
  async getByUserId(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUnread(userId: string) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(alert: Omit<Alert, 'id' | 'created_at' | 'is_read' | 'is_resolved' | 'resolved_at'>) {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alert)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async markAsResolved(id: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const routinesApi = {
  async getByUserId(userId: string, limit = 100) {
    const { data, error } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByType(userId: string, routineType: RoutineType) {
    const { data, error } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('routine_type', routineType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getTodayRoutines(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .order('scheduled_time', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(routine: Omit<DailyRoutine, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('daily_routines')
      .insert(routine)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DailyRoutine>) {
    const { data, error } = await supabase
      .from('daily_routines')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async markAsCompleted(id: string) {
    const { data, error } = await supabase
      .from('daily_routines')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('daily_routines')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const exercisesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('cognitive_exercises')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByType(exerciseType: ExerciseType) {
    const { data, error } = await supabase
      .from('cognitive_exercises')
      .select('*')
      .eq('exercise_type', exerciseType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('cognitive_exercises')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
};

export const progressApi = {
  async getByUserId(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('exercise_progress')
      .select('*, cognitive_exercises(*)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(progress: Omit<ExerciseProgress, 'id' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('exercise_progress')
      .insert(progress)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('exercise_progress')
      .select('score, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export const caregiversApi = {
  async getAssignments(seniorId: string) {
    const { data, error } = await supabase
      .from('caregiver_assignments')
      .select('*, caregiver:profiles!caregiver_id(*)')
      .eq('senior_id', seniorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getSeniors(caregiverId: string) {
    const { data, error } = await supabase
      .from('caregiver_assignments')
      .select('*, senior:profiles!senior_id(*)')
      .eq('caregiver_id', caregiverId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(assignment: Omit<CaregiverAssignment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('caregiver_assignments')
      .insert(assignment)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('caregiver_assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
