/**
 * Progress Models
 * Represents workout progress and statistics
 */

export interface Workout {
  /** Unique workout identifier */
  id: string;
  /** Workout name */
  name: string;
  /** Workout description */
  description?: string;
  /** Estimated duration in minutes */
  duration?: number;
  /** List of exercises in the workout */
  exercises?: Exercise[];
  /** Difficulty level */
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Exercise {
  /** Unique exercise identifier */
  id: string;
  /** Exercise name */
  name: string;
  /** Exercise description or instructions */
  description?: string;
  /** Number of sets */
  sets?: number;
  /** Number of repetitions */
  repetitions?: number;
  /** Rest time between sets in seconds */
  restTime?: number;
  /** Weight in kg (optional) */
  weight?: number;
}

export interface WorkoutRecord {
  /** Workout identifier */
  workoutId: string;
  /** Workout name */
  name: string;
  /** Whether the workout was completed */
  completed: boolean;
  /** Duration in minutes */
  durationMinutes?: number;
  /** Date of the workout */
  date: Date;
  /** Optional notes about the workout */
  notes?: string;
}

export interface ProgressRequest {
  userId: string;
  workoutId: string;
  date: Date;
  notes?: string;
}

export interface ProgressSummary {
  userId: string;
  totalWorkouts: number;
  currentStreak: number;
  recentWorkouts: WorkoutRecord[];
  createdAt?: Date;
}

export interface ProgressStats {
  totalWorkouts: number;
  currentStreak: number;
  weeklyGoal: number;
  currentWeek: number;
}


