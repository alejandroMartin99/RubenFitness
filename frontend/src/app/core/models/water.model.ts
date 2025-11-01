/**
 * Water Models
 * Represents water intake tracking data
 */

export interface WaterRecord {
  date: Date;
  water_ml: number;
}

export interface WaterRequest {
  userId: string;
  date: Date;
  water_ml: number;
}

export interface WaterResponse {
  user_id: string;
  today_water?: WaterRecord;
  last_7_days: WaterRecord[];
  total_today: number;
  goal: number;
  created_at: string;
}

