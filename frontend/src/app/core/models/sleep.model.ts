/**
 * Sleep Models
 * Represents sleep tracking data
 */

export interface SleepRecord {
  date: Date;
  hours: number;
  minutes?: number;
}

export interface SleepRequest {
  userId: string;
  date: Date;
  hours: number;
  minutes?: number;
}

export interface SleepResponse {
  userId: string;
  todaySleep?: SleepRecord;
  last7Days: SleepRecord[];
  averageSleep?: number;
  createdAt: Date;
}

