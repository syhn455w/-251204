export enum TrainType {
  EXPRESS = 'EXPRESS', // 直達車 (Purple)
  COMMUTER = 'COMMUTER', // 普通車 (Blue)
}

export interface TrainInfo {
  id: string;
  type: TrainType;
  departureTime: string; // HH:MM format
  arrivalTimeA8: string; // Estimated
  arrivalTimeA9: string; // Estimated or "Transfer"
  stopsAtA9: boolean;
  notes?: string;
}

export interface ScheduleResponse {
  trains: TrainInfo[];
  lastUpdated: string;
}
