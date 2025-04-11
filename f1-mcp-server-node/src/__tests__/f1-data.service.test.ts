import axios from 'axios';
import { F1DataService, LiveTimingData, SessionData } from '../services/f1-data.service.js';
import { McpError } from '@modelcontextprotocol/sdk';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('F1DataService', () => {
  let f1Service: F1DataService;

  beforeEach(() => {
    f1Service = F1DataService.getInstance();
    jest.clearAllMocks();
    f1Service.clearCache(); // Clear cache before each test
  });

  describe('getLiveTimingData', () => {
    const mockLiveTimingData: LiveTimingData[] = [
      {
        date: '2024-03-15T12:00:00Z',
        session_status: 'Active',
        driver_number: '44',
        driver_id: 'HAM',
        lap_time: 80500,
        position: 1,
        lap_number: 25,
        sector_1_time: 26500,
        sector_2_time: 27000,
        sector_3_time: 27000
      }
    ];

    it('should return live timing data successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLiveTimingData });
      const result = await f1Service.getLiveTimingData();
      expect(result).toEqual(mockLiveTimingData);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/live_timing');
    });

    it('should handle errors when fetching live timing data', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getLiveTimingData()).rejects.toThrow('Failed to fetch live timing data');
    });

    it('should use cached data for subsequent calls', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLiveTimingData });
      
      // First call - should hit the API
      await f1Service.getLiveTimingData();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      
      // Second call - should use cache
      await f1Service.getLiveTimingData();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentSessionStatus', () => {
    const mockSessionData: SessionData = {
      session_key: '2024_1_FP1',
      session_name: 'First Practice Session',
      session_type: 'Practice 1',
      start_date: '2024-03-15T10:30:00Z',
      end_date: '2024-03-15T11:30:00Z',
      status: 'Completed'
    };

    it('should return session status successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockSessionData });
      const result = await f1Service.getCurrentSessionStatus();
      expect(result).toEqual(mockSessionData);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/session_status');
    });

    it('should handle errors when fetching session status', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getCurrentSessionStatus()).rejects.toThrow('Failed to fetch session status');
    });
  });

  describe('getHistoricRaceResults', () => {
    const mockRaceResults = {
      MRData: {
        RaceTable: {
          Races: [{
            season: '2023',
            round: '1',
            raceName: 'Bahrain Grand Prix',
            Results: [
              { position: '1', Driver: { driverId: 'max_verstappen', code: 'VER' } }
            ]
          }]
        }
      }
    };

    it('should return historic race results successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRaceResults });
      const result = await f1Service.getHistoricRaceResults(2023, 1);
      expect(result).toEqual(mockRaceResults.MRData.RaceTable.Races[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/2023/1/results.json');
    });

    it('should handle errors when fetching historic race results', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getHistoricRaceResults(2023, 1)).rejects.toThrow('Failed to fetch historic race results');
    });
  });

  describe('getDriverStandings', () => {
    const mockDriverStandings = {
      MRData: {
        StandingsTable: {
          StandingsLists: [{
            season: '2023',
            DriverStandings: [
              { position: '1', Driver: { driverId: 'max_verstappen', code: 'VER' }, points: '454' }
            ]
          }]
        }
      }
    };

    it('should return driver standings successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDriverStandings });
      const result = await f1Service.getDriverStandings(2023);
      expect(result).toEqual(mockDriverStandings.MRData.StandingsTable.StandingsLists[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/2023/driverStandings.json');
    });

    it('should handle errors when fetching driver standings', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getDriverStandings(2023)).rejects.toThrow('Failed to fetch driver standings');
    });
  });

  describe('getConstructorStandings', () => {
    const mockConstructorStandings = {
      MRData: {
        StandingsTable: {
          StandingsLists: [{
            season: '2023',
            ConstructorStandings: [
              { position: '1', Constructor: { constructorId: 'red_bull', name: 'Red Bull' }, points: '860' }
            ]
          }]
        }
      }
    };

    it('should return constructor standings successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockConstructorStandings });
      const result = await f1Service.getConstructorStandings(2023);
      expect(result).toEqual(mockConstructorStandings.MRData.StandingsTable.StandingsLists[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/2023/constructorStandings.json');
    });

    it('should handle errors when fetching constructor standings', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getConstructorStandings(2023)).rejects.toThrow('Failed to fetch constructor standings');
    });
  });

  describe('getDriverInfo', () => {
    const mockDriverInfo = [
      {
        driver_number: '44',
        broadcast_name: 'HAM',
        full_name: 'Lewis Hamilton',
        team_name: 'Mercedes',
        team_color: '#00D2BE'
      }
    ];

    it('should return driver info successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDriverInfo });
      const result = await f1Service.getDriverInfo('44');
      expect(result).toEqual(mockDriverInfo);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/drivers?driver_number=44');
    });

    it('should handle errors when fetching driver info', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getDriverInfo('44')).rejects.toThrow('Failed to fetch driver info');
    });
  });

  describe('getLapTimes', () => {
    const mockLapTimes = {
      MRData: {
        RaceTable: {
          Races: [{
            season: '2023',
            round: '1',
            Laps: [
              { number: '1', Timings: [{ driverId: 'max_verstappen', time: '1:32.777' }] }
            ]
          }]
        }
      }
    };

    it('should return lap times successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLapTimes });
      const result = await f1Service.getLapTimes(2023, 1, 'max_verstappen');
      expect(result).toEqual(mockLapTimes.MRData.RaceTable.Races[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/2023/1/drivers/max_verstappen/laps.json');
    });

    it('should handle errors when fetching lap times', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getLapTimes(2023, 1, 'max_verstappen')).rejects.toThrow('Failed to fetch lap times');
    });
  });

  // Tests for new OpenF1 API methods
  describe('getWeatherData', () => {
    const mockWeatherData = [{
      air_temperature: 32.5,
      track_temperature: 45.2,
      humidity: 35,
      pressure: 1013.2,
      wind_direction: 120,
      wind_speed: 3.5,
      rainfall: 0,
      date: '2023-07-23T14:32:10Z'
    }];

    it('should return weather data successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockWeatherData });
      const result = await f1Service.getWeatherData();
      expect(result).toEqual(mockWeatherData);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/weather');
    });

    it('should use session_key parameter when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockWeatherData });
      await f1Service.getWeatherData('1234');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/weather?session_key=1234');
    });

    it('should handle errors when fetching weather data', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getWeatherData()).rejects.toThrow('Failed to fetch weather data');
    });
  });

  describe('getCarData', () => {
    const mockCarData = [{
      brake: 50,
      date: '2023-07-23T14:32:10Z',
      driver_number: 44,
      drs: 0,
      n_gear: 7,
      rpm: 10500,
      speed: 280,
      throttle: 75
    }];

    it('should return car data successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockCarData });
      const result = await f1Service.getCarData('44');
      expect(result).toEqual(mockCarData);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/car_data?driver_number=44');
    });

    it('should handle optional parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockCarData });
      await f1Service.getCarData('44', '1234', 'speed>=300');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/car_data?driver_number=44&session_key=1234&speed>=300');
    });

    it('should handle errors when fetching car data', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getCarData('44')).rejects.toThrow('Failed to fetch car telemetry data');
    });
  });

  describe('getPitStopData', () => {
    const mockPitData = [{
      date: '2023-07-23T14:32:10Z',
      driver_number: 44,
      pit_duration: 22.5,
      stop_timestamp: '2023-07-23T14:32:00Z',
      pit_type: 'Regular'
    }];

    it('should return pit stop data successfully with no parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPitData });
      const result = await f1Service.getPitStopData();
      expect(result).toEqual(mockPitData);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/pit');
    });

    it('should handle session key parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPitData });
      await f1Service.getPitStopData('1234');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/pit?session_key=1234');
    });

    it('should handle driver number parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPitData });
      await f1Service.getPitStopData(undefined, '44');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/pit?driver_number=44');
    });

    it('should handle both parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPitData });
      await f1Service.getPitStopData('1234', '44');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/pit?session_key=1234&driver_number=44');
    });

    it('should handle errors when fetching pit stop data', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getPitStopData()).rejects.toThrow('Failed to fetch pit stop data');
    });
  });

  describe('getTeamRadio', () => {
    const mockTeamRadioData = [{
      date: '2023-07-23T14:32:10Z',
      driver_number: 44,
      recording_url: 'https://example.com/radio/1234.mp3'
    }];

    it('should return team radio data successfully with no parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTeamRadioData });
      const result = await f1Service.getTeamRadio();
      expect(result).toEqual(mockTeamRadioData);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/team_radio');
    });

    it('should handle session key parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTeamRadioData });
      await f1Service.getTeamRadio('1234');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/team_radio?session_key=1234');
    });

    it('should handle driver number parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTeamRadioData });
      await f1Service.getTeamRadio(undefined, '44');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/team_radio?driver_number=44');
    });

    it('should handle both parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTeamRadioData });
      await f1Service.getTeamRadio('1234', '44');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/team_radio?session_key=1234&driver_number=44');
    });

    it('should handle errors when fetching team radio data', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getTeamRadio()).rejects.toThrow('Failed to fetch team radio data');
    });
  });

  describe('getRaceControlMessages', () => {
    const mockRaceControlData = [{
      date: '2023-07-23T14:32:10Z',
      category: 'Flag',
      message: 'Yellow flag in sector 2',
      flag: 'yellow',
      scope: 'sector',
      sector: 2,
      driver_number: null
    }];

    it('should return race control messages successfully with no parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRaceControlData });
      const result = await f1Service.getRaceControlMessages();
      expect(result).toEqual(mockRaceControlData);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/race_control');
    });

    it('should handle session key parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRaceControlData });
      await f1Service.getRaceControlMessages('1234');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/race_control?session_key=1234');
    });

    it('should handle errors when fetching race control messages', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getRaceControlMessages()).rejects.toThrow('Failed to fetch race control messages');
    });
  });

  // Tests for new Ergast API methods
  describe('getRaceCalendar', () => {
    const mockRaceCalendar = {
      MRData: {
        RaceTable: {
          Races: [
            { season: '2023', round: '1', raceName: 'Bahrain Grand Prix' },
            { season: '2023', round: '2', raceName: 'Saudi Arabian Grand Prix' }
          ]
        }
      }
    };

    it('should return race calendar successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRaceCalendar });
      const result = await f1Service.getRaceCalendar(2023);
      expect(result).toEqual(mockRaceCalendar.MRData.RaceTable.Races);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/2023.json');
    });

    it('should handle errors when fetching race calendar', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getRaceCalendar(2023)).rejects.toThrow('Failed to fetch race calendar');
    });
  });

  describe('getCircuitInfo', () => {
    const mockCircuitInfo = {
      MRData: {
        CircuitTable: {
          Circuits: [{
            circuitId: 'monza',
            circuitName: 'Autodromo Nazionale di Monza',
            Location: {
              lat: '45.6156',
              long: '9.2812',
              locality: 'Monza',
              country: 'Italy'
            }
          }]
        }
      }
    };

    it('should return circuit info successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockCircuitInfo });
      const result = await f1Service.getCircuitInfo('monza');
      expect(result).toEqual(mockCircuitInfo.MRData.CircuitTable.Circuits[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/circuits/monza.json');
    });

    it('should handle errors when fetching circuit info', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getCircuitInfo('monza')).rejects.toThrow('Failed to fetch circuit information');
    });
  });

  describe('getSeasonList', () => {
    const mockSeasonList = {
      MRData: {
        SeasonTable: {
          Seasons: [
            { season: '2023', url: 'https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship' },
            { season: '2022', url: 'https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship' }
          ]
        }
      }
    };

    it('should return season list successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockSeasonList });
      const result = await f1Service.getSeasonList();
      expect(result).toEqual(mockSeasonList.MRData.SeasonTable.Seasons);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/seasons.json?limit=100');
    });

    it('should handle custom limit', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockSeasonList });
      await f1Service.getSeasonList(10);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/seasons.json?limit=10');
    });

    it('should handle errors when fetching season list', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getSeasonList()).rejects.toThrow('Failed to fetch season list');
    });
  });

  describe('getQualifyingResults', () => {
    const mockQualifyingResults = {
      MRData: {
        RaceTable: {
          Races: [{
            season: '2023',
            round: '7',
            raceName: 'Monaco Grand Prix',
            QualifyingResults: [
              { position: '1', Driver: { driverId: 'max_verstappen', code: 'VER' }, Q1: '1:12.345', Q2: '1:11.234', Q3: '1:10.123' }
            ]
          }]
        }
      }
    };

    it('should return qualifying results successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockQualifyingResults });
      const result = await f1Service.getQualifyingResults(2023, 7);
      expect(result).toEqual(mockQualifyingResults.MRData.RaceTable.Races[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/2023/7/qualifying.json');
    });

    it('should handle errors when fetching qualifying results', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getQualifyingResults(2023, 7)).rejects.toThrow('Failed to fetch qualifying results');
    });
  });

  describe('getDriverInformation', () => {
    const mockDriverInfo = {
      MRData: {
        DriverTable: {
          Drivers: [{
            driverId: 'hamilton',
            permanentNumber: '44',
            code: 'HAM',
            url: 'http://en.wikipedia.org/wiki/Lewis_Hamilton',
            givenName: 'Lewis',
            familyName: 'Hamilton',
            dateOfBirth: '1985-01-07',
            nationality: 'British'
          }]
        }
      }
    };

    it('should return driver information successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDriverInfo });
      const result = await f1Service.getDriverInformation('hamilton');
      expect(result).toEqual(mockDriverInfo.MRData.DriverTable.Drivers[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/drivers/hamilton.json');
    });

    it('should handle errors when fetching driver information', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getDriverInformation('hamilton')).rejects.toThrow('Failed to fetch driver information');
    });
  });

  describe('getConstructorInformation', () => {
    const mockConstructorInfo = {
      MRData: {
        ConstructorTable: {
          Constructors: [{
            constructorId: 'ferrari',
            url: 'http://en.wikipedia.org/wiki/Scuderia_Ferrari',
            name: 'Ferrari',
            nationality: 'Italian'
          }]
        }
      }
    };

    it('should return constructor information successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockConstructorInfo });
      const result = await f1Service.getConstructorInformation('ferrari');
      expect(result).toEqual(mockConstructorInfo.MRData.ConstructorTable.Constructors[0]);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://ergast.com/api/f1/constructors/ferrari.json');
    });

    it('should handle errors when fetching constructor information', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getConstructorInformation('ferrari')).rejects.toThrow('Failed to fetch constructor information');
    });
  });

  describe('Cache functionality', () => {
    it('should clear the cache when clearCache is called', async () => {
      const mockData = { test: 'data' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });
      
      // First call - hits the API
      await f1Service.getDriverInfo('44');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      
      // Second call - should use cache
      await f1Service.getDriverInfo('44');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      
      // Clear cache
      f1Service.clearCache();
      
      // Third call - should hit API again
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });
      await f1Service.getDriverInfo('44');
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = F1DataService.getInstance();
      const instance2 = F1DataService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
}); 