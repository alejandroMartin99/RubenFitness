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
  userId: string;
  todayWater?: WaterRecord;
  last7Days: WaterRecord[];
  totalToday: number;
  goal: number;
  createdAt: Date;
}

