/*
# Brain Guard Database Schema

## Overview
This migration creates the complete database structure for the Brain Guard cognitive monitoring application.

## Tables

### 1. profiles
Stores user information for seniors, caregivers, and healthcare professionals.
- `id` (uuid, primary key, references auth.users)
- `full_name` (text)
- `email` (text, unique)
- `phone` (text)
- `role` (user_role enum: 'senior', 'caregiver', 'healthcare')
- `date_of_birth` (date, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. monitoring_data
Stores cognitive monitoring metrics for seniors.
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `data_type` (text: 'speech_pattern', 'typing_speed', 'activity_level')
- `value` (jsonb: flexible storage for different metric types)
- `score` (numeric: normalized score 0-100)
- `recorded_at` (timestamptz)
- `created_at` (timestamptz)

### 3. alerts
Stores alerts generated when abnormal patterns are detected.
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles - the senior being monitored)
- `alert_type` (text: 'cognitive_decline', 'activity_change', 'urgent')
- `severity` (text: 'low', 'medium', 'high', 'critical')
- `title` (text)
- `description` (text)
- `is_read` (boolean)
- `is_resolved` (boolean)
- `created_at` (timestamptz)
- `resolved_at` (timestamptz, nullable)

### 4. daily_routines
Stores daily routine records for seniors.
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `routine_type` (text: 'medication', 'meal', 'exercise', 'sleep', 'social')
- `title` (text)
- `description` (text, nullable)
- `scheduled_time` (time, nullable)
- `completed_at` (timestamptz, nullable)
- `notes` (text, nullable)
- `created_at` (timestamptz)

### 5. cognitive_exercises
Stores available cognitive exercises.
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `exercise_type` (text: 'memory', 'puzzle', 'language', 'attention')
- `difficulty` (text: 'easy', 'medium', 'hard')
- `instructions` (text)
- `content` (jsonb: exercise-specific data)
- `created_at` (timestamptz)

### 6. exercise_progress
Tracks user progress on cognitive exercises.
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `exercise_id` (uuid, references cognitive_exercises)
- `score` (numeric)
- `time_taken` (integer: seconds)
- `completed_at` (timestamptz)

### 7. caregiver_assignments
Links caregivers and healthcare professionals to seniors.
- `id` (uuid, primary key)
- `senior_id` (uuid, references profiles)
- `caregiver_id` (uuid, references profiles)
- `relationship` (text: 'family', 'professional', 'healthcare')
- `created_at` (timestamptz)

## Security
- Public access for reading profiles (view-only)
- Users can read their own monitoring data
- Alerts are readable by the senior and their assigned caregivers
- Daily routines are private to the user
- Exercise progress is private to the user
- Caregiver assignments are readable by both parties

## Notes
- All timestamps use timestamptz for timezone awareness
- JSONB fields allow flexible storage for varying data structures
- UUIDs are used for all primary keys
- Indexes are created on foreign keys for performance
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('senior', 'caregiver', 'healthcare');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE,
  phone text,
  role user_role NOT NULL DEFAULT 'senior'::user_role,
  date_of_birth date,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create monitoring_data table
CREATE TABLE IF NOT EXISTS monitoring_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  value jsonb NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_monitoring_data_user_id ON monitoring_data(user_id);
CREATE INDEX idx_monitoring_data_recorded_at ON monitoring_data(recorded_at DESC);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  is_read boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Create daily_routines table
CREATE TABLE IF NOT EXISTS daily_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  routine_type text NOT NULL CHECK (routine_type IN ('medication', 'meal', 'exercise', 'sleep', 'social')),
  title text NOT NULL,
  description text,
  scheduled_time time,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_daily_routines_user_id ON daily_routines(user_id);
CREATE INDEX idx_daily_routines_created_at ON daily_routines(created_at DESC);

-- Create cognitive_exercises table
CREATE TABLE IF NOT EXISTS cognitive_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  exercise_type text NOT NULL CHECK (exercise_type IN ('memory', 'puzzle', 'language', 'attention')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  instructions text,
  content jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create exercise_progress table
CREATE TABLE IF NOT EXISTS exercise_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES cognitive_exercises(id) ON DELETE CASCADE,
  score numeric CHECK (score >= 0 AND score <= 100),
  time_taken integer,
  completed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_exercise_progress_user_id ON exercise_progress(user_id);
CREATE INDEX idx_exercise_progress_completed_at ON exercise_progress(completed_at DESC);

-- Create caregiver_assignments table
CREATE TABLE IF NOT EXISTS caregiver_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('family', 'professional', 'healthcare')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(senior_id, caregiver_id)
);

CREATE INDEX idx_caregiver_assignments_senior_id ON caregiver_assignments(senior_id);
CREATE INDEX idx_caregiver_assignments_caregiver_id ON caregiver_assignments(caregiver_id);

-- Insert sample cognitive exercises
INSERT INTO cognitive_exercises (title, description, exercise_type, difficulty, instructions, content) VALUES
('Memory Match', 'Match pairs of cards to improve short-term memory', 'memory', 'easy', 'Click on cards to reveal them. Find matching pairs.', '{"pairs": 6, "theme": "animals"}'),
('Word Recall', 'Remember and recall a list of words', 'memory', 'medium', 'Study the list of words for 30 seconds, then recall as many as you can.', '{"words": ["apple", "chair", "ocean", "guitar", "mountain", "book", "flower", "clock"]}'),
('Number Sequence', 'Complete the number pattern', 'puzzle', 'easy', 'Identify the pattern and fill in the missing numbers.', '{"sequences": [[2, 4, 6, 8, "?"], [5, 10, 15, 20, "?"], [1, 3, 5, 7, "?"]]}'),
('Crossword Puzzle', 'Solve word clues to complete the puzzle', 'language', 'medium', 'Read the clues and fill in the correct words.', '{"size": "small", "clues": 10}'),
('Spot the Difference', 'Find differences between two images', 'attention', 'easy', 'Compare two images and identify all the differences.', '{"differences": 5, "time_limit": 120}'),
('Sudoku', 'Fill the grid with numbers 1-9', 'puzzle', 'hard', 'Each row, column, and 3x3 box must contain digits 1-9 without repetition.', '{"difficulty": "hard", "grid_size": 9}'),
('Vocabulary Builder', 'Learn and practice new words', 'language', 'medium', 'Match words with their definitions.', '{"word_count": 10, "category": "general"}'),
('Pattern Recognition', 'Identify and continue visual patterns', 'attention', 'medium', 'Study the pattern and select the next item in the sequence.', '{"patterns": 5, "complexity": "medium"}')