export interface TeamRadioMessage {
  timestamp: string;
  driver_number: string;
  message: string;
  recording_url: string;
}

export interface TeamRadioData {
  data: TeamRadioMessage[];
}

export interface RaceControlMessage {
  timestamp: string;
  message: string;
  category: string;
  flag?: string;
  scope?: string;
  sector?: number;
}

export interface RaceControlData {
  data: RaceControlMessage[];
}

export interface TireData {
  compound: string;
  age: number;
  wear: number;
}

export interface TelemetryDetail {
  lap_times: number[];
  sector_times: number[][];
  speed_trap: number[];
  tire_data: TireData;
}

export interface TelemetryData {
  driver1_telemetry: TelemetryDetail;
  driver2_telemetry: TelemetryDetail;
  gap_history: number[];
  drs_detection: boolean;
}

export interface QualifyingData {
  session_type: string;
  track_evolution: number;
  sector_improvements: {
    sector: number;
    time_delta: number;
    driver_number: string;
  }[];
  track_position_impact: number;
}

export interface SprintResult {
  position: string;
  Driver: {
    driverId: string;
    code: string;
  };
  Time?: {
    millis: string;
    time: string;
  };
}

export interface SprintData {
  MRData: {
    RaceTable: {
      Races: {
        season: string;
        round: string;
        Sprint: {
          SprintResults: SprintResult[];
        };
      }[];
    };
  };
}