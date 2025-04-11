import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// OpenF1 API base URL
const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

// FastF1 API base URL - we'll need to use ergast API as a substitute since FastF1 is Python-only
const FASTF1_BASE_URL = 'http://ergast.com/api/f1';

// Simple in-memory cache with TTL
interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export interface LiveTimingData {
  date: string;
  session_status: string;
  driver_number: string;
  driver_id: string;
  lap_time: number;
  position: number;
  lap_number: number;
  sector_1_time?: number;
  sector_2_time?: number;
  sector_3_time?: number;
}

export interface SessionData {
  session_key: string;
  session_name: string;
  session_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface WeatherData {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  wind_direction: number;
  wind_speed: number;
  rainfall: number;
  date: string;
}

export interface CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  n_gear: number;
  rpm: number;
  speed: number;
  throttle: number;
}

export interface PitData {
  date: string;
  driver_number: number;
  pit_duration: number | null;
  stop_timestamp: string;
  pit_type: string;
}

export interface TeamRadioData {
  date: string;
  driver_number: number;
  recording_url: string;
}

export interface RaceControlData {
  date: string;
  category: string;
  message: string;
  flag: string | null;
  scope: string | null;
  sector: number | null;
  driver_number: number | null;
}

export class F1DataService {
  private static instance: F1DataService;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes in ms
  private liveCacheTTL = 10 * 1000; // 10 seconds for live data

  private constructor() {}

  public static getInstance(): F1DataService {
    if (!F1DataService.instance) {
      F1DataService.instance = new F1DataService();
    }
    return F1DataService.instance;
  }

  // Cache helper methods
  private getCachedData<T>(key: string): T | null {
    if (!this.cache.has(key)) {
      return null;
    }

    const cachedItem = this.cache.get(key)!;
    if (Date.now() > cachedItem.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cachedItem.data;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = this.defaultCacheTTL): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    });
  }

  private async fetchWithErrorHandling<T>(
    url: string, 
    errorMessage: string, 
    useCache: boolean = true,
    cacheTTL?: number
  ): Promise<T> {
    const cacheKey = url;
    
    if (useCache) {
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const response = await axios.get(url);
      
      if (useCache) {
        this.setCachedData(cacheKey, response.data, cacheTTL);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error: ${errorMessage}:`, error);
      throw new McpError(ErrorCode.InternalError, errorMessage);
    }
  }

  // OpenF1 API Methods (Live/Recent Data)
  async getLiveTimingData(): Promise<LiveTimingData[]> {
    return this.fetchWithErrorHandling<LiveTimingData[]>(
      `${OPENF1_BASE_URL}/live_timing`, 
      'Failed to fetch live timing data',
      true,
      this.liveCacheTTL
    );
  }

  async getCurrentSessionStatus(): Promise<SessionData> {
    return this.fetchWithErrorHandling<SessionData>(
      `${OPENF1_BASE_URL}/session_status`, 
      'Failed to fetch session status',
      true,
      this.liveCacheTTL
    );
  }

  // Historic Data Methods (using Ergast API as FastF1 alternative)
  async getHistoricRaceResults(year: number, round: number): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/${year}/${round}/results.json`,
      'Failed to fetch historic race results'
    );
    return data.MRData.RaceTable.Races[0];
  }

  async getDriverStandings(year: number): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/${year}/driverStandings.json`,
      'Failed to fetch driver standings'
    );
    return data.MRData.StandingsTable.StandingsLists[0];
  }

  async getConstructorStandings(year: number): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/${year}/constructorStandings.json`,
      'Failed to fetch constructor standings'
    );
    return data.MRData.StandingsTable.StandingsLists[0];
  }

  // Additional methods for specific data needs
  async getDriverInfo(driverId: string): Promise<any> {
    return this.fetchWithErrorHandling<any>(
      `${OPENF1_BASE_URL}/drivers?driver_number=${driverId}`,
      'Failed to fetch driver info'
    );
  }

  async getLapTimes(year: number, round: number, driverId: string): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/${year}/${round}/drivers/${driverId}/laps.json`,
      'Failed to fetch lap times'
    );
    return data.MRData.RaceTable.Races[0];
  }

  // New OpenF1 API methods

  async getWeatherData(sessionKey?: string): Promise<WeatherData[]> {
    const url = sessionKey 
      ? `${OPENF1_BASE_URL}/weather?session_key=${sessionKey}`
      : `${OPENF1_BASE_URL}/weather`;
    
    return this.fetchWithErrorHandling<WeatherData[]>(
      url,
      'Failed to fetch weather data',
      true,
      this.liveCacheTTL
    );
  }

  async getCarData(driverNumber: string, sessionKey?: string, filters?: string): Promise<CarData[]> {
    let url = `${OPENF1_BASE_URL}/car_data?driver_number=${driverNumber}`;
    
    if (sessionKey) {
      url += `&session_key=${sessionKey}`;
    }
    
    if (filters) {
      url += `&${filters}`;
    }
    
    return this.fetchWithErrorHandling<CarData[]>(
      url,
      'Failed to fetch car telemetry data',
      true,
      this.liveCacheTTL
    );
  }

  async getPitStopData(sessionKey?: string, driverNumber?: string): Promise<PitData[]> {
    let url = `${OPENF1_BASE_URL}/pit`;
    
    if (sessionKey) {
      url += `?session_key=${sessionKey}`;
      
      if (driverNumber) {
        url += `&driver_number=${driverNumber}`;
      }
    } else if (driverNumber) {
      url += `?driver_number=${driverNumber}`;
    }
    
    return this.fetchWithErrorHandling<PitData[]>(
      url,
      'Failed to fetch pit stop data'
    );
  }

  async getTeamRadio(sessionKey?: string, driverNumber?: string): Promise<TeamRadioData[]> {
    let url = `${OPENF1_BASE_URL}/team_radio`;
    
    if (sessionKey) {
      url += `?session_key=${sessionKey}`;
      
      if (driverNumber) {
        url += `&driver_number=${driverNumber}`;
      }
    } else if (driverNumber) {
      url += `?driver_number=${driverNumber}`;
    }
    
    return this.fetchWithErrorHandling<TeamRadioData[]>(
      url,
      'Failed to fetch team radio data'
    );
  }

  async getRaceControlMessages(sessionKey?: string): Promise<RaceControlData[]> {
    let url = `${OPENF1_BASE_URL}/race_control`;
    
    if (sessionKey) {
      url += `?session_key=${sessionKey}`;
    }
    
    return this.fetchWithErrorHandling<RaceControlData[]>(
      url,
      'Failed to fetch race control messages',
      true,
      this.liveCacheTTL
    );
  }

  // New Ergast API methods

  async getRaceCalendar(year: number): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/${year}.json`,
      'Failed to fetch race calendar'
    );
    return data.MRData.RaceTable.Races;
  }

  async getCircuitInfo(circuitId: string): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/circuits/${circuitId}.json`,
      'Failed to fetch circuit information'
    );
    return data.MRData.CircuitTable.Circuits[0];
  }

  async getSeasonList(limit: number = 100): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/seasons.json?limit=${limit}`,
      'Failed to fetch season list'
    );
    return data.MRData.SeasonTable.Seasons;
  }

  async getQualifyingResults(year: number, round: number): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/${year}/${round}/qualifying.json`,
      'Failed to fetch qualifying results'
    );
    return data.MRData.RaceTable.Races[0];
  }

  async getDriverInformation(driverId: string): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/drivers/${driverId}.json`,
      'Failed to fetch driver information'
    );
    return data.MRData.DriverTable.Drivers[0];
  }

  async getConstructorInformation(constructorId: string): Promise<any> {
    const data = await this.fetchWithErrorHandling<any>(
      `${FASTF1_BASE_URL}/constructors/${constructorId}.json`,
      'Failed to fetch constructor information'
    );
    return data.MRData.ConstructorTable.Constructors[0];
  }

  // Method to clear cache
  clearCache(): void {
    this.cache.clear();
  }
} 