import { TrainInfo, TrainType } from "../types";

// Static schedule service based on official Taoyuan Metro timetable (A1 Departure)
// Reference: User provided screenshot matching official website data.

export const fetchTrainSchedule = async (date: Date): Promise<TrainInfo[]> => {
  const trains: TrainInfo[] = [];

  // Helper function to create train objects with calculated arrival times
  const addTrain = (hour: number, minute: number, type: TrainType) => {
    // Format departure
    const depHH = hour.toString().padStart(2, '0');
    const depMM = minute.toString().padStart(2, '0');
    
    // Calculate Arrival based on user-specified offsets:
    // EXPRESS (Purple):
    // - A1 -> A8: 21 mins
    // - A1 -> A9: 26 mins (Transfer at A8 + 5 mins ride)
    
    // COMMUTER (Blue):
    // - A1 -> A8: 26 mins
    // - A1 -> A9: 33 mins
    
    const offsetA8 = type === TrainType.EXPRESS ? 21 : 26;
    const offsetA9 = type === TrainType.EXPRESS ? 26 : 33;

    // Calculate A8 Arrival
    let a8Min = minute + offsetA8;
    let a8Hour = hour;
    while (a8Min >= 60) {
        a8Min -= 60;
        a8Hour += 1;
    }
    if (a8Hour >= 24) a8Hour -= 24;

    // Calculate A9 Arrival
    let a9Min = minute + offsetA9;
    let a9Hour = hour;
    while (a9Min >= 60) {
        a9Min -= 60;
        a9Hour += 1;
    }
    if (a9Hour >= 24) a9Hour -= 24;

    trains.push({
        id: `${depHH}${depMM}`,
        type,
        departureTime: `${depHH}:${depMM}`,
        arrivalTimeA8: `${a8Hour.toString().padStart(2, '0')}:${a8Min.toString().padStart(2, '0')}`,
        arrivalTimeA9: `${a9Hour.toString().padStart(2, '0')}:${a9Min.toString().padStart(2, '0')}`,
        stopsAtA9: type === TrainType.COMMUTER,
        notes: type === TrainType.EXPRESS ? '需在 A8 轉乘' : undefined
    });
  };

  // --- HARDCODED SCHEDULE IMPLEMENTATION (MATCHING SCREENSHOT) ---
  
  // Hour 05: 30(P)
  addTrain(5, 30, TrainType.EXPRESS);

  // Hours 06-17: Standard Pattern (8 trains/hr)
  // 00(P), 08(C), 15(P), 23(C), 30(P), 38(C), 45(P), 53(C)
  for (let h = 6; h <= 17; h++) {
      addTrain(h, 0, TrainType.EXPRESS);
      addTrain(h, 8, TrainType.COMMUTER);
      addTrain(h, 15, TrainType.EXPRESS);
      addTrain(h, 23, TrainType.COMMUTER);
      addTrain(h, 30, TrainType.EXPRESS);
      addTrain(h, 38, TrainType.COMMUTER);
      addTrain(h, 45, TrainType.EXPRESS);
      addTrain(h, 53, TrainType.COMMUTER);
  }

  // Hour 18: Peak/Mixed Pattern (10 trains)
  // 00(P*), 08(C), 15(P), 19(C▼), 23(C), 30(P), 34(C▼), 38(C), 45(P*), 53(C)
  addTrain(18, 0, TrainType.EXPRESS);
  addTrain(18, 8, TrainType.COMMUTER);
  addTrain(18, 15, TrainType.EXPRESS);
  addTrain(18, 19, TrainType.COMMUTER); // Extra Service
  addTrain(18, 23, TrainType.COMMUTER);
  addTrain(18, 30, TrainType.EXPRESS);
  addTrain(18, 34, TrainType.COMMUTER); // Extra Service
  addTrain(18, 38, TrainType.COMMUTER);
  addTrain(18, 45, TrainType.EXPRESS);
  addTrain(18, 53, TrainType.COMMUTER);

  // Hours 19-22: Standard Pattern (8 trains/hr)
  for (let h = 19; h <= 22; h++) {
      addTrain(h, 0, TrainType.EXPRESS);
      addTrain(h, 8, TrainType.COMMUTER);
      addTrain(h, 15, TrainType.EXPRESS);
      addTrain(h, 23, TrainType.COMMUTER);
      addTrain(h, 30, TrainType.EXPRESS);
      addTrain(h, 38, TrainType.COMMUTER);
      addTrain(h, 45, TrainType.EXPRESS);
      addTrain(h, 53, TrainType.COMMUTER);
  }

  // Hour 23: Late Night Pattern (4 trains)
  // 00(P), 08(C), 23(C▼), 38(C▼)
  addTrain(23, 0, TrainType.EXPRESS);
  addTrain(23, 8, TrainType.COMMUTER);
  addTrain(23, 23, TrainType.COMMUTER);
  addTrain(23, 38, TrainType.COMMUTER);

  return trains;
};