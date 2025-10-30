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
  /** Fitness experience level: beginner, intermediate, advanced */
  fitnessLevel?: FitnessLevel;
  /** Role-based access control */
  role?: UserRole; // 'admin' or 'user'
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


