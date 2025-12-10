/**
 * User Model
 * Represents user information in the application
 */

export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's full name */
  fullName?: string;
  /** User's age */
  age?: number;
  /** Body fat percentage */
  bodyFatPercent?: number;
  /** Muscle mass in kg */
  muscleMassKg?: number;
  /** Fitness experience level: beginner, intermediate, advanced */
  fitnessLevel?: FitnessLevel;
  /** Role-based access control */
  role?: UserRole; // 'admin' or 'user'
  /** User fitness goals */
  goals?: string[];
  /** User availability schedule */
  availability?: UserAvailability;
  /** Account creation timestamp */
  createdAt?: Date;
}

/** Available fitness levels */
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

/** User roles */
export type UserRole = 'admin' | 'user';

/** User authentication credentials */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** User registration data */
export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  age?: number;
  fitnessLevel?: FitnessLevel;
}

/** User availability schedule */
export interface UserAvailability {
  /** Days of the week user is available */
  days?: string[]; // e.g., ['monday', 'wednesday', 'friday']
  /** Preferred time slots */
  timeSlots?: {
    morning?: boolean;
    afternoon?: boolean;
    evening?: boolean;
  };
  /** Hours per week available */
  hoursPerWeek?: number;
}

/** Profile setup data */
export interface ProfileSetupData {
  goals: string[];
  fitnessLevel: FitnessLevel;
  availability: UserAvailability;
  age?: number;
  fullName?: string;
}


