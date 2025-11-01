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
  user_id: string;
  today_sleep?: SleepRecord;
  last_7_days: SleepRecord[];
  average_sleep?: number;
  created_at: string;
}

