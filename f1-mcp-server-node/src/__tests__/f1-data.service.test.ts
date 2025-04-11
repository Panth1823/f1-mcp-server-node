import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import axios, { AxiosStatic } from 'axios';
import { F1DataService, LiveTimingData, SessionData } from '../services/f1-data.service';
import { McpError } from '@modelcontextprotocol/sdk/types';

// Mock axios
jest.mock('axios');

// Create a proper mock for axios with correct typing
const mockedAxios = {
  get: jest.fn()
} as unknown as jest.Mocked<AxiosStatic>;

// Assign the mock to axios
(axios as any).get = mockedAxios.get;

describe('F1DataService', () => {
  let f1Service: F1DataService;

  beforeEach(() => {
    f1Service = F1DataService.getInstance();
    jest.clearAllMocks();
    f1Service.clearCache(); // Clear cache before each test
  });

  // Mock tests
  describe('API Methods', () => {
    describe('getLiveTimingData', () => {
      const mockLiveTimingData = [{
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
      }];

      it('should return live timing data successfully', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockLiveTimingData });
        const result = await f1Service.getLiveTimingData();
        expect(result).toEqual(mockLiveTimingData);
      });

      it('should handle errors when fetching live timing data', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
        await expect(f1Service.getLiveTimingData()).rejects.toThrow('Failed to fetch live timing data');
      });
    });

    describe('getCurrentSessionStatus', () => {
      const mockSessionData = {
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
      });
    });

    describe('getQualifyingResults', () => {
      const mockQualifyingData = {
        MRData: {
          RaceTable: {
            Races: [{
              raceName: 'Monaco Grand Prix',
              QualifyingResults: [
                { position: '1', Driver: { driverId: 'max_verstappen', code: 'VER' } }
              ]
            }]
          }
        }
      };

      it('should return qualifying results successfully', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockQualifyingData });
        const result = await f1Service.getQualifyingResults(2023, 7);
        expect(result).toBeDefined();
        expect(result.raceName).toBe('Monaco Grand Prix');
      });
    });
  });

  // Integration tests that use real API calls
  describe('Integration Tests', () => {
    const mockLiveTimingData = [{
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
    }];

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

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch live timing data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLiveTimingData });
      const data = await f1Service.getLiveTimingData();
      expect(data).toBeDefined();
      expect(data).toEqual(mockLiveTimingData);
    });

    it('should fetch 2023 driver standings', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDriverStandings });
      const standings = await f1Service.getDriverStandings(2023);
      expect(standings).toBeDefined();
      expect(standings).toEqual(mockDriverStandings.MRData.StandingsTable.StandingsLists[0]);
    });

    it('should fetch 2023 constructor standings', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockConstructorStandings });
      const standings = await f1Service.getConstructorStandings(2023);
      expect(standings).toBeDefined();
      expect(standings).toEqual(mockConstructorStandings.MRData.StandingsTable.StandingsLists[0]);
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
    const SESSION_KEY = 'latest';
    const mockCarData = [{
      date: '2024-03-15T12:00:00Z',
      driver_number: 33,
      type: 'car_data',
      speed: 280,
      rpm: 10500,
      drs: 0,
      brake: 50,
      throttle: 75,
      gear: 7
    }];

    it('should return car data successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockCarData });
      const result = await f1Service.getCarData('33', SESSION_KEY);
      expect(result).toBeDefined();
      expect(result[0].driver_number).toBe(33);
    });

    it('should handle optional parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockCarData });
      await f1Service.getCarData('33', SESSION_KEY, 'speed>=300');
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.openf1.org/v1/car_data?driver_number=33&session_key=latest&speed>=300');
    });

    it('should handle errors when fetching car data', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(f1Service.getCarData('33', SESSION_KEY)).rejects.toThrow('Failed to fetch car telemetry data');
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

  describe('Communications', () => {
    const SESSION_KEY = 'latest';

    it('should fetch team radio messages', async () => {
      const mockTeamRadioData = [
        {
          timestamp: '2024-03-15T12:00:00Z',
          driver_number: '33',
          message: 'Box box this lap',
          recording_url: 'https://example.com/radio/123.mp3'
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockTeamRadioData });
      const data = await f1Service.getTeamRadio(SESSION_KEY, '33');
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].driver_number).toBe('33');
    });

    it('should fetch race control messages', async () => {
      const mockRaceControlData = [
        {
          timestamp: '2024-03-15T12:00:00Z',
          message: 'Yellow flag in sector 2',
          category: 'Flag',
          flag: 'yellow',
          scope: 'sector',
          sector: 2
        }
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockRaceControlData });
      const data = await f1Service.getRaceControlMessages(SESSION_KEY);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].category).toBe('Flag');
    });

    it('should compare Verstappen vs Hamilton', async () => {
      const mockTelemetryData = {
        driver1_telemetry: {
          lap_times: [80500, 80600, 80400],
          sector_times: [[26500, 27000, 27000]],
          speed_trap: [325, 328, 330],
          tire_data: {
            compound: 'SOFT',
            age: 5,
            wear: 15
          }
        },
        driver2_telemetry: {
          lap_times: [80700, 80800, 80500],
          sector_times: [[26700, 27100, 27100]],
          speed_trap: [322, 325, 328],
          tire_data: {
            compound: 'MEDIUM',
            age: 8,
            wear: 12
          }
        },
        gap_history: [1.2, 1.3, 1.1],
        drs_detection: true
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockTelemetryData });
      const data = await f1Service.getDriverComparison(SESSION_KEY, '33', '44', 1);
      expect(data).toBeDefined();
      expect(data.driver1_telemetry).toBeDefined();
      expect(data.driver2_telemetry).toBeDefined();
      expect(data.gap_history).toBeDefined();
    });

    it('should fetch qualifying analysis', async () => {
      const mockQualifyingAnalysis = {
        session_type: 'qualifying',
        track_evolution: 0.3,
        sector_improvements: [
          {
            sector: 1,
            time_delta: -0.2,
            driver_number: '33'
          }
        ],
        track_position_impact: 0.15
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockQualifyingAnalysis });
      const data = await f1Service.getQualifyingAnalysis('latest');
      expect(data).toBeDefined();
      expect(data.session_type).toBe('qualifying');
    });

    it('should fetch sprint session data', async () => {
      const mockSprintData = {
        MRData: {
          RaceTable: {
            Races: [{
              season: '2023',
              round: '4',
              Sprint: {
                SprintResults: [
                  {
                    position: '1',
                    Driver: {
                      driverId: 'max_verstappen',
                      code: 'VER'
                    },
                    Time: {
                      millis: '1234567',
                      time: '30:15.123'
                    }
                  }
                ]
              }
            }]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockSprintData });
      const data = await f1Service.getSprintResults(2023, 4);
      expect(data).toBeDefined();
      expect(data.MRData.RaceTable.Races[0].Sprint.SprintResults[0].position).toBe('1');
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

  // Test live timing and session data
  describe('Live Session Data', () => {
    const mockLiveTimingData = [{
      date: '2024-03-15T12:00:00Z',
      session_status: 'Active',
      driver_number: '44',
      driver_id: 'HAM',
      lap_time: 80500,
      position: 1,
      lap_number: 25
    }];

    const mockSessionStatus = {
      session_key: '2024_1_FP1',
      session_name: 'First Practice Session',
      session_type: 'Practice 1',
      start_date: '2024-03-15T10:30:00Z',
      end_date: '2024-03-15T11:30:00Z',
      status: 'Active'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch live timing data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLiveTimingData });
      const data = await f1Service.getLiveTimingData();
      expect(data).toBeDefined();
      expect(data).toEqual(mockLiveTimingData);
    });

    it('should fetch current session status', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockSessionStatus });
      const status = await f1Service.getCurrentSessionStatus();
      expect(status).toBeDefined();
      expect(status).toEqual(mockSessionStatus);
    });
  });

  // Test historical race data
  describe('Historical Race Data', () => {
    const mockRaceResults = {
      MRData: {
        RaceTable: {
          Races: [{
            season: '2023',
            round: '22',
            raceName: 'Abu Dhabi Grand Prix',
            Results: [
              { position: '1', Driver: { driverId: 'max_verstappen', code: 'VER' } }
            ]
          }]
        }
      }
    };

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

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch 2023 Abu Dhabi GP results', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockRaceResults });
      const results = await f1Service.getHistoricRaceResults(2023, 22);
      expect(results).toBeDefined();
      expect(results).toEqual(mockRaceResults.MRData.RaceTable.Races[0]);
    });

    it('should fetch 2023 driver standings', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDriverStandings });
      const standings = await f1Service.getDriverStandings(2023);
      expect(standings).toBeDefined();
      expect(standings).toEqual(mockDriverStandings.MRData.StandingsTable.StandingsLists[0]);
    });

    it('should fetch 2023 constructor standings', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockConstructorStandings });
      const standings = await f1Service.getConstructorStandings(2023);
      expect(standings).toBeDefined();
      expect(standings).toEqual(mockConstructorStandings.MRData.StandingsTable.StandingsLists[0]);
    });
  });

  // Test driver and circuit information
  describe('Driver and Circuit Information', () => {
    const mockDriverInfo = [{
      driver_number: '33',
      broadcast_name: 'VER',
      full_name: 'Max Verstappen',
      team_name: 'Red Bull Racing',
      team_color: '#0600EF'
    }];

    const mockCircuitInfo = {
      MRData: {
        CircuitTable: {
          Circuits: [{
            circuitId: 'monaco',
            circuitName: 'Circuit de Monaco',
            Location: {
              lat: '43.7347',
              long: '7.4206',
              locality: 'Monte-Carlo',
              country: 'Monaco'
            }
          }]
        }
      }
    };

    const mockDriverRaceResults = {
      MRData: {
        RaceTable: {
          Races: [
            {
              season: '2023',
              round: '1',
              Results: [{ position: '1', Driver: { driverId: 'hamilton' } }]
            }
          ]
        }
      }
    };

    const mockDriverStatus = {
      MRData: {
        StatusTable: {
          Status: [
            { status: 'Finished', count: '200' },
            { status: 'DNF', count: '10' }
          ]
        }
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch Verstappen driver info', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDriverInfo });
      const info = await f1Service.getDriverInfo('33');
      expect(info).toBeDefined();
      expect(info).toEqual(mockDriverInfo);
    });

    it('should fetch Monaco circuit info', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockCircuitInfo });
      const info = await f1Service.getCircuitInfo('monaco');
      expect(info).toBeDefined();
      expect(info).toEqual(mockCircuitInfo.MRData.CircuitTable.Circuits[0]);
    });

    it('should fetch driver career stats for Hamilton', async () => {
      // Mock all required API responses
      const mockDriverRaceResults = {
        MRData: {
          RaceTable: {
            Races: [
              {
                season: '2023',
                round: '1',
                Results: [{ position: '1', Driver: { driverId: 'hamilton' } }]
              }
            ]
          }
        }
      };

      const mockDriverStatus = {
        MRData: {
          StatusTable: {
            Status: [
              { status: 'Finished', count: '200' },
              { status: 'DNF', count: '10' }
            ]
          }
        }
      };

      const mockDriverDetails = {
        MRData: {
          DriverTable: {
            Drivers: [{
              driverId: 'hamilton',
              givenName: 'Lewis',
              familyName: 'Hamilton',
              dateOfBirth: '1985-01-07',
              nationality: 'British'
            }]
          }
        }
      };

      // Mock all API calls
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockDriverRaceResults })
        .mockResolvedValueOnce({ data: mockDriverStatus })
        .mockResolvedValueOnce({ data: mockDriverDetails });

      const stats = await f1Service.getDriverCareerStats('hamilton');
      expect(stats).toBeDefined();
      expect(stats.driver_id).toBe('hamilton');
      expect(stats.total_races).toBeDefined();
      expect(stats.wins).toBeDefined();
    });
  });

  // Test telemetry and car data
  describe('Telemetry and Car Data', () => {
    const SESSION_KEY = 'latest';

    const mockCarData = [{
      date: '2024-03-15T12:00:00Z',
      driver_number: 33,
      type: 'car_data',
      speed: 280,
      rpm: 10500,
      drs: 0,
      brake: 50,
      throttle: 75,
      gear: 7
    }];

    const mockDetailedTelemetry = {
      lap_number: 1,
      driver_number: '33',
      telemetry: {
        speed: [280, 285, 290],
        throttle: [100, 100, 95],
        brake: [0, 0, 20],
        gear: [7, 7, 6],
        rpm: [10500, 10600, 10400]
      }
    };

    const mockERSData = {
      driver_number: '33',
      lap_number: 1,
      ers_deployed: 120,
      ers_harvested: 100,
      ers_store: 3800
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch car telemetry for Verstappen', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockCarData });
      const data = await f1Service.getCarData('33', SESSION_KEY);
      expect(data).toBeDefined();
      expect(data).toEqual(mockCarData);
    });

    it('should fetch detailed telemetry for specific lap', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDetailedTelemetry });
      const data = await f1Service.getDetailedTelemetry('33', 1, SESSION_KEY);
      expect(data).toBeDefined();
      expect(data).toEqual(mockDetailedTelemetry);
    });

    it('should fetch ERS deployment data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockERSData });
      const data = await f1Service.getERSDeployment(SESSION_KEY, '33', 1);
      expect(data).toBeDefined();
      expect(data).toEqual(mockERSData);
    });
  });

  // Test race analysis
  describe('Race Analysis', () => {
    const SESSION_KEY = 'latest';

    const mockSectorAnalysis = [{
      sector_number: 1,
      driver_number: '33',
      sector_time: 28500,
      personal_best: true,
      session_best: true,
      lap_number: 15
    }];

    const mockTyreStrategy = [{
      driver_number: '33',
      compound: 'SOFT',
      lap_number: 1,
      stint_length: 20,
      average_time: 80500
    }];

    const mockTrackPositions = [{
      driver_number: '33',
      position: 1,
      gap_to_leader: 0,
      lap_number: 25
    }];

    const mockCornerAnalysis = {
      corner_number: 3,
      driver_number: '16',
      entry_speed: 180.5,
      min_speed: 95.2,
      exit_speed: 165.8,
      lap_number: 1
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch sector analysis', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockSectorAnalysis });
      const data = await f1Service.getSectorAnalysis(SESSION_KEY, 1);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].sector_number).toBe(1);
    });

    it('should fetch tyre strategy', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTyreStrategy });
      const data = await f1Service.getTyreStrategy(SESSION_KEY, '33');
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].compound).toBe('SOFT');
    });

    it('should fetch track positions', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTrackPositions });
      const data = await f1Service.getTrackPositions(SESSION_KEY, 1);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].position).toBe(1);
    });

    it('should analyze corner performance', async () => {
      const mockCornerData = {
        corner_number: 3,
        entry_speed: 180.5,
        apex_speed: 95.2,
        exit_speed: 165.8,
        entry_throttle: 0,
        apex_throttle: 20,
        exit_throttle: 80,
        brake_pressure: 80,
        steering_angle: 45,
        gear: 3,
        ideal_line: [{ x: 0, y: 0 }],
        driver_line: [{ x: 0, y: 0 }],
        time_loss: 0.2,
        suggestions: ['Brake later into corner']
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockCornerData });
      const data = await f1Service.getCornerAnalysis(SESSION_KEY, '16', 3, 1);
      expect(data).toBeDefined();
      expect(data.corner_number).toBe(3);
      expect(data.entry_speed).toBe(180.5);
    });
  });

  // Test battle and predictions
  describe('Battle Analysis and Predictions', () => {
    const SESSION_KEY = 'latest';

    it('should predict battle outcome', async () => {
      const mockPredictionData = {
        driver1: '33',
        driver2: '44',
        current_gap: 1.2,
        predicted_gap_next_lap: 1.5,
        overtake_probability_next_lap: 0.35,
        key_factors: [
          { factor: 'DRS', impact: 0.6 }
        ],
        drs_opportunity: true,
        tire_advantage: 0.2
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPredictionData });
      const data = await f1Service.getBattlePrediction(SESSION_KEY, '33', '44');
      expect(data).toBeDefined();
      expect(data.overtake_probability_next_lap).toBeDefined();
      expect(data.driver1).toBe('33');
      expect(data.driver2).toBe('44');
    });
  });

  // Test DRS and track features
  describe('DRS and Track Features', () => {
    const SESSION_KEY = 'latest';

    const mockDRSZones = [{
      zone_number: 1,
      detection_point: 2100,
      activation_point: 2300,
      deactivation_point: 2800,
      max_speed: 330
    }];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch DRS zones', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDRSZones });
      const data = await f1Service.getDRSZones(SESSION_KEY);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].zone_number).toBe(1);
    });
  });

  // Test season and circuit records
  describe('Historical Records', () => {
    it('should fetch Monaco circuit records', async () => {
      const data = await f1Service.getCircuitRecords('monaco');
      expect(data).toBeDefined();
      expect(data.circuit_id).toBe('monaco');
    });

    it('should compare 2022 vs 2023 seasons', async () => {
      const data = await f1Service.getSeasonComparison(2022, 2023, 'verstappen');
      expect(data).toBeDefined();
      expect(data.year1).toBeDefined();
      expect(data.year2).toBeDefined();
    });
  });

  // Test race start analysis
  describe('Race Start Analysis', () => {
    it('should analyze race start performance', async () => {
      const data = await f1Service.getRaceStartAnalysis('latest', '33');
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  // Test tire performance
  describe('Tire Performance', () => {
    it('should analyze tire performance', async () => {
      const data = await f1Service.getTyrePerformance('latest', '33', 'SOFT');
      expect(data).toBeDefined();
      expect(data.compound).toBe('SOFT');
    });
  });
}); 