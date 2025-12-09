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

/** Achievement/Achievement model */
export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon?: string;
  unlockedAt: Date;
  progress?: number;
  target?: number;
}

export type AchievementType = 
  | 'first_workout'
  | 'week_streak'
  | 'month_streak'
  | 'total_workouts'
  | 'perfect_week'
  | 'early_bird'
  | 'night_owl'
  | 'consistency_king'
  | 'weight_loss'
  | 'muscle_gain';

/** Streak information */
export interface Streak {
  current: number;
  longest: number;
  lastWorkoutDate?: Date;
  weeklyStreak: number;
  monthlyStreak: number;
}

/** Progress photo for before/after comparison */
export interface ProgressPhoto {
  id: string;
  userId: string;
  photoType: 'before' | 'after';
  photoUrl: string;
  thumbnailUrl?: string;
  takenAt: Date;
  notes?: string;
  measurements?: {
    weight?: number;
    bodyFat?: number;
    measurements?: {
      chest?: number;
      waist?: number;
      hips?: number;
      arms?: number;
      thighs?: number;
    };
  };
}

/** Performance metrics over time */
export interface PerformanceMetric {
  date: Date;
  workouts: number;
  totalDuration: number;
  caloriesBurned?: number;
  averageRating?: number;
}

/** Chart data for visualization */
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}


