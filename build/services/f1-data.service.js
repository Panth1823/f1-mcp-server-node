import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
// OpenF1 API base URL
const OPENF1_BASE_URL = 'https://api.openf1.org/v1';
// FastF1 API base URL - we'll need to use ergast API as a substitute since FastF1 is Python-only
const FASTF1_BASE_URL = 'http://ergast.com/api/f1';
export class F1DataService {
    constructor() {
        this.cache = new Map();
        this.defaultCacheTTL = 5 * 60 * 1000; // 5 minutes in ms
        this.liveCacheTTL = 10 * 1000; // 10 seconds for live data
    }
    static getInstance() {
        if (!F1DataService.instance) {
            F1DataService.instance = new F1DataService();
        }
        return F1DataService.instance;
    }
    // Cache helper methods
    getCachedData(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        const cachedItem = this.cache.get(key);
        if (Date.now() > cachedItem.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return cachedItem.data;
    }
    setCachedData(key, data, ttl = this.defaultCacheTTL) {
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + ttl
        });
    }
    async fetchWithErrorHandling(url, errorMessage, useCache = true, cacheTTL) {
        const cacheKey = url;
        if (useCache) {
            const cachedData = this.getCachedData(cacheKey);
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
        }
        catch (error) {
            console.error(`${errorMessage}:`, error);
            throw new McpError(ErrorCode.InternalError, `${errorMessage}: ${error.response?.status || 'Unknown error'}`);
        }
    }
    // Method to get historical session keys
    async getHistoricalSessions(filters) {
        let url = `${OPENF1_BASE_URL}/sessions`;
        const params = new URLSearchParams();
        if (filters) {
            if (filters.year)
                params.append('year', filters.year.toString());
            if (filters.circuit_short_name)
                params.append('circuit_short_name', filters.circuit_short_name);
            if (filters.session_name)
                params.append('session_name', filters.session_name);
            if (filters.country_name)
                params.append('country_name', filters.country_name);
            if (filters.location)
                params.append('location', filters.location);
        }
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        return this.fetchWithErrorHandling(url, 'Failed to fetch historical sessions', true, // Use cache, but maybe with a longer TTL? Default is 5 mins.
        this.defaultCacheTTL);
    }
    // OpenF1 API Methods (Live/Recent Data)
    async getLiveTimingData() {
        return this.fetchWithErrorHandling(`${OPENF1_BASE_URL}/live_timing`, 'Failed to fetch live timing data', true, this.liveCacheTTL);
    }
    async getCurrentSessionStatus() {
        return this.fetchWithErrorHandling(`${OPENF1_BASE_URL}/session_status`, 'Failed to fetch session status', true, this.liveCacheTTL);
    }
    // Historic Data Methods (using Ergast API as FastF1 alternative)
    async getHistoricRaceResults(year, round) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year}/${round}/results.json`, 'Failed to fetch historic race results');
        return data.MRData.RaceTable.Races[0];
    }
    async getDriverStandings(year) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year}/driverStandings.json`, 'Failed to fetch driver standings');
        return data.MRData.StandingsTable.StandingsLists[0];
    }
    async getConstructorStandings(year) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year}/constructorStandings.json`, 'Failed to fetch constructor standings');
        return data.MRData.StandingsTable.StandingsLists[0];
    }
    // Additional methods for specific data needs
    async getDriverInfo(driverId) {
        return this.fetchWithErrorHandling(`${OPENF1_BASE_URL}/drivers?driver_number=${driverId}`, 'Failed to fetch driver info');
    }
    async getLapTimes(year, round, driverId) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year}/${round}/drivers/${driverId}/laps.json`, 'Failed to fetch lap times');
        return data.MRData.RaceTable.Races[0];
    }
    // New OpenF1 API methods
    async getWeatherData(sessionKey) {
        const url = sessionKey
            ? `${OPENF1_BASE_URL}/weather?session_key=${sessionKey}`
            : `${OPENF1_BASE_URL}/weather`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch weather data', true, this.liveCacheTTL);
    }
    async getCarData(driverNumber, sessionKey, filters) {
        let url = `${OPENF1_BASE_URL}/car_data?driver_number=${driverNumber}`;
        if (sessionKey) {
            url += `&session_key=${sessionKey}`;
        }
        if (filters) {
            url += `&${filters}`;
        }
        return this.fetchWithErrorHandling(url, 'Failed to fetch car telemetry data', true, this.liveCacheTTL);
    }
    async getPitStopData(sessionKey, driverNumber) {
        let url = `${OPENF1_BASE_URL}/pit`;
        if (sessionKey) {
            url += `?session_key=${sessionKey}`;
            if (driverNumber) {
                url += `&driver_number=${driverNumber}`;
            }
        }
        else if (driverNumber) {
            url += `?driver_number=${driverNumber}`;
        }
        return this.fetchWithErrorHandling(url, 'Failed to fetch pit stop data');
    }
    async getTeamRadio(sessionKey, driverNumber) {
        try {
            const response = await axios.get(`https://api.openf1.org/v1/team_radio?session_key=${sessionKey}&driver_number=${driverNumber}`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch team radio messages');
        }
    }
    async getRaceControlMessages(sessionKey) {
        try {
            const response = await axios.get(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch race control messages');
        }
    }
    // New Ergast API methods
    async getRaceCalendar(year) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year}.json`, 'Failed to fetch race calendar');
        return data.MRData.RaceTable.Races;
    }
    async getCircuitInfo(circuitId) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/circuits/${circuitId}.json`, 'Failed to fetch circuit information');
        return data.MRData.CircuitTable.Circuits[0];
    }
    async getSeasonList(limit = 100) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/seasons.json?limit=${limit}`, 'Failed to fetch season list');
        return data.MRData.SeasonTable.Seasons;
    }
    async getQualifyingResults(year, round) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year}/${round}/qualifying.json`, 'Failed to fetch qualifying results');
        return data.MRData.RaceTable.Races[0];
    }
    async getDriverInformation(driverId) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/drivers/${driverId}.json`, 'Failed to fetch driver information');
        if (!data?.MRData?.DriverTable?.Drivers?.[0]) {
            throw new McpError(ErrorCode.InternalError, 'Driver information not found');
        }
        return data.MRData.DriverTable.Drivers[0];
    }
    async getConstructorInformation(constructorId) {
        const data = await this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/constructors/${constructorId}.json`, 'Failed to fetch constructor information');
        return data.MRData.ConstructorTable.Constructors[0];
    }
    // Enhanced telemetry methods
    async getDetailedTelemetry(driverNumber, lap, sessionKey) {
        const url = `${OPENF1_BASE_URL}/telemetry?driver_number=${driverNumber}${sessionKey ? `&session_key=${sessionKey}` : ''}${lap ? `&lap=${lap}` : ''}`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch telemetry data', true, this.liveCacheTTL);
    }
    async getSectorAnalysis(sessionKey, sectorNumber) {
        const url = `${OPENF1_BASE_URL}/sector_times?session_key=${sessionKey}${sectorNumber ? `&sector=${sectorNumber}` : ''}`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch sector analysis', true, this.liveCacheTTL);
    }
    async getTyreStrategy(sessionKey, driverNumber) {
        const url = `${OPENF1_BASE_URL}/tyre_stints?session_key=${sessionKey}${driverNumber ? `&driver_number=${driverNumber}` : ''}`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch tyre strategy data', true, this.defaultCacheTTL);
    }
    async getTrackPositions(sessionKey, lap) {
        const url = `${OPENF1_BASE_URL}/track_positions?session_key=${sessionKey}${lap ? `&lap=${lap}` : ''}`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch track position data', true, this.liveCacheTTL);
    }
    async getDriverComparison(sessionKey, driver1, driver2, lap) {
        try {
            const response = await axios.get(`https://api.openf1.org/v1/driver_comparison?session_key=${sessionKey}&driver1=${driver1}&driver2=${driver2}&lap=${lap}`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch driver comparison data');
        }
    }
    // Add new analysis methods
    async getLapAnalysis(sessionKey, driverNumber, lapNumber) {
        const [lapTiming, weather, telemetry] = await Promise.all([
            this.getLiveTimingData(),
            this.getWeatherData(sessionKey),
            this.getDetailedTelemetry(driverNumber, lapNumber, sessionKey)
        ]);
        // Process and combine the data
        // This is a simplified example - in reality, you'd want to do more sophisticated analysis
        const lapData = lapTiming.find(lt => lt.driver_number === driverNumber &&
            lt.lap_number === lapNumber);
        if (!lapData) {
            throw new McpError(ErrorCode.InternalError, 'Lap data not found');
        }
        return {
            driver_number: driverNumber,
            lap_number: lapNumber,
            lap_time: lapData.lap_time,
            sector_times: [
                lapData.sector_1_time || 0,
                lapData.sector_2_time || 0,
                lapData.sector_3_time || 0
            ],
            speed_trap: Math.max(...telemetry.map(t => t.speed)),
            is_personal_best: false, // Would need historical data to determine
            is_session_best: false, // Would need comparison with other drivers
            tyre_compound: telemetry[0]?.tyre_compound || 'unknown',
            weather_conditions: weather[0],
            valid_lap: true // Would need additional validation logic
        };
    }
    async getRaceSimulation(sessionKey, driverNumber) {
        const [telemetry, tyreData] = await Promise.all([
            this.getDetailedTelemetry(driverNumber, 0, sessionKey),
            this.getTyreStrategy(sessionKey, driverNumber)
        ]);
        // This would involve complex calculations in reality
        return {
            driver_number: driverNumber,
            predicted_lap_time: 0, // Would need machine learning model
            fuel_corrected_time: 0, // Would need fuel load data
            tyre_life_impact: 0, // Would need historical tyre degradation data
            optimal_pit_window: {
                start_lap: 0,
                end_lap: 0
            }
        };
    }
    async getDriverPerformance(sessionKey, driverNumber) {
        const [sectorData, tyreData, telemetry] = await Promise.all([
            this.getSectorAnalysis(sessionKey),
            this.getTyreStrategy(sessionKey, driverNumber),
            this.getDetailedTelemetry(driverNumber, 0, sessionKey)
        ]);
        // This would involve statistical analysis in reality
        return {
            driver_number: driverNumber,
            sector_performance: [1, 2, 3].map(sector => ({
                sector,
                average_time: 0, // Would need statistical analysis
                best_time: 0,
                consistency: 0
            })),
            tyre_management: tyreData.map(td => ({
                compound: td.compound,
                degradation_rate: td.degradation,
                average_life: td.laps_on_tyre
            })),
            fuel_efficiency: 0, // Would need detailed fuel consumption data
            ers_usage_efficiency: 0 // Would need detailed ERS deployment/harvest data
        };
    }
    async getBattleAnalysis(sessionKey, driver1, driver2, lapNumber) {
        const [positions, telemetry1, telemetry2] = await Promise.all([
            this.getTrackPositions(sessionKey, lapNumber),
            this.getDetailedTelemetry(driver1, lapNumber, sessionKey),
            this.getDetailedTelemetry(driver2, lapNumber, sessionKey)
        ]);
        // This would involve complex battle analytics in reality
        return {
            driver1,
            driver2,
            lap_number: lapNumber,
            time_delta: 0, // Would need precise timing data
            speed_delta: 0, // Would need speed comparison
            tyre_age_delta: 0, // Would need tyre age comparison
            drs_advantage: false, // Would need DRS detection
            overtake_probability: 0 // Would need machine learning prediction
        };
    }
    async getQualifyingAnalysis(sessionKey) {
        try {
            const response = await axios.get(`https://api.openf1.org/v1/qualifying_analysis?session_key=${sessionKey}`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch qualifying analysis');
        }
    }
    async getSprintSessionData(sessionKey, driverNumber) {
        const url = `${OPENF1_BASE_URL}/sprint${sessionKey ? `?session_key=${sessionKey}` : ''}${driverNumber ? `&driver_number=${driverNumber}` : ''}`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch sprint session data', true, this.liveCacheTTL);
    }
    async getDriverCareerStats(driverId) {
        const [driverInfo, raceResults, championshipResults] = await Promise.all([
            this.getDriverInformation(driverId),
            this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/drivers/${driverId}/results.json?limit=1000`, 'Failed to fetch driver race results'),
            this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/drivers/${driverId}/driverStandings.json`, 'Failed to fetch driver championships')
        ]);
        if (!raceResults?.MRData?.RaceTable?.Races) {
            throw new McpError(ErrorCode.InternalError, 'Race results not found');
        }
        const races = raceResults.MRData.RaceTable.Races;
        const championships = (championshipResults?.MRData?.StandingsTable?.StandingsLists || []);
        // Calculate statistics
        const wins = races.filter(race => race.Results?.[0]?.position === '1').length;
        const podiums = races.filter(race => {
            const position = parseInt(race.Results?.[0]?.position || '0');
            return position >= 1 && position <= 3;
        }).length;
        const poles = races.filter(race => race.Qualifying?.[0]?.position === '1').length;
        const fastestLaps = races.filter(race => race.Results?.[0]?.FastestLap?.rank === '1').length;
        const championshipWins = championships.filter(standing => standing.DriverStandings?.[0]?.position === '1').length;
        // Get unique teams
        const teams = [...new Set(races
                .map(race => race.Results?.[0]?.Constructor?.name)
                .filter((name) => name !== undefined))];
        return {
            driver_id: driverId,
            total_races: parseInt(raceResults.MRData.total) || 0,
            wins,
            podiums,
            poles,
            fastest_laps: fastestLaps,
            championships: championshipWins,
            first_race: races[0]?.date || '',
            last_race: races[races.length - 1]?.date || '',
            teams
        };
    }
    async getCircuitRecords(circuitId) {
        const [circuitInfo, raceResults] = await Promise.all([
            this.getCircuitInfo(circuitId),
            this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/circuits/${circuitId}/results.json?limit=100`, 'Failed to fetch circuit results')
        ]);
        if (!circuitInfo || !raceResults?.MRData?.RaceTable?.Races) {
            throw new McpError(ErrorCode.InternalError, 'Circuit data not found');
        }
        const races = raceResults.MRData.RaceTable.Races;
        // Find lap record
        let lapRecord = {
            time: '',
            driver: '',
            year: 0
        };
        // Find qualifying record
        let qualifyingRecord = {
            time: '',
            driver: '',
            year: 0
        };
        // Find driver with most wins
        const winsByDriver = new Map();
        races.forEach((race) => {
            if (race.Results?.[0]?.Driver) {
                const winner = race.Results[0].Driver.familyName;
                winsByDriver.set(winner, (winsByDriver.get(winner) || 0) + 1);
            }
            // Check for fastest lap
            if (race.Results) {
                race.Results.forEach(result => {
                    if (result.FastestLap?.rank === '1' && result.FastestLap.Time) {
                        const lapTime = result.FastestLap.Time.time;
                        if (!lapRecord.time || lapTime < lapRecord.time) {
                            lapRecord = {
                                time: lapTime,
                                driver: result.Driver.familyName,
                                year: parseInt(race.season)
                            };
                        }
                    }
                });
            }
            // Check for qualifying record
            if (race.QualifyingResults) {
                const poleTime = race.QualifyingResults[0]?.Q3;
                if (poleTime && (!qualifyingRecord.time || poleTime < qualifyingRecord.time)) {
                    qualifyingRecord = {
                        time: poleTime,
                        driver: race.QualifyingResults[0].Driver.familyName,
                        year: parseInt(race.season)
                    };
                }
            }
        });
        let mostWins = {
            driver: '',
            wins: 0
        };
        winsByDriver.forEach((wins, driver) => {
            if (wins > mostWins.wins) {
                mostWins = { driver, wins };
            }
        });
        return {
            circuit_id: circuitId,
            lap_record: lapRecord,
            qualifying_record: qualifyingRecord,
            most_wins: mostWins
        };
    }
    async getRaceStartAnalysis(sessionKey, driverNumber) {
        const url = `${OPENF1_BASE_URL}/race_start${sessionKey ? `?session_key=${sessionKey}` : ''}${driverNumber ? `&driver_number=${driverNumber}` : ''}`;
        const response = await this.fetchWithErrorHandling(url, 'Failed to fetch race start analysis', true, this.liveCacheTTL);
        if (!Array.isArray(response)) {
            throw new McpError(ErrorCode.InternalError, 'Invalid race start data format');
        }
        return response.map(data => ({
            driver_number: data.driver_number || '',
            grid_position: data.grid_position || 0,
            reaction_time: data.reaction_time || 0,
            positions_gained: data.positions_gained || 0,
            first_corner_position: data.first_corner_position || 0
        }));
    }
    async getTyrePerformance(sessionKey, driverNumber, compound) {
        const [tyreData, telemetry] = await Promise.all([
            this.getTyreStrategy(sessionKey, driverNumber),
            this.getDetailedTelemetry(driverNumber, 0, sessionKey)
        ]);
        if (!Array.isArray(tyreData) || tyreData.length === 0) {
            throw new McpError(ErrorCode.InternalError, 'No tyre data available');
        }
        // Find data for the specific compound
        const compoundData = tyreData.find(td => td.compound.toUpperCase() === compound.toUpperCase());
        if (!compoundData) {
            throw new McpError(ErrorCode.InternalError, `No data available for compound ${compound}`);
        }
        // Calculate optimal temperature window based on compound
        const optimalWindow = {
            min_temp: compound.toUpperCase() === 'SOFT' ? 85 : compound.toUpperCase() === 'MEDIUM' ? 90 : 95,
            max_temp: compound.toUpperCase() === 'SOFT' ? 110 : compound.toUpperCase() === 'MEDIUM' ? 115 : 120
        };
        // Calculate current performance metrics
        const currentPerformance = compoundData.average_time ?
            (1 - (compoundData.average_time - Math.min(...tyreData.map(td => td.average_time))) / 5000) * 100 :
            0;
        const wearRate = compoundData.degradation || 0;
        const expectedLife = compoundData.laps_on_tyre || 0;
        const gripLevel = currentPerformance * (1 - wearRate / 100);
        return {
            compound,
            optimal_window: optimalWindow,
            current_performance: currentPerformance,
            wear_rate: wearRate,
            expected_life: expectedLife,
            grip_level: gripLevel
        };
    }
    async getSeasonComparison(year1, year2, driverId) {
        const [season1, season2] = await Promise.all([
            this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year1}/results.json${driverId ? `?driver=${driverId}` : ''}`, `Failed to fetch ${year1} season data`),
            this.fetchWithErrorHandling(`${FASTF1_BASE_URL}/${year2}/results.json${driverId ? `?driver=${driverId}` : ''}`, `Failed to fetch ${year2} season data`)
        ]);
        if (!season1?.MRData?.RaceTable?.Races || !season2?.MRData?.RaceTable?.Races) {
            throw new McpError(ErrorCode.InternalError, 'Season data not found');
        }
        return {
            year1: season1.MRData.RaceTable.Races,
            year2: season2.MRData.RaceTable.Races
        };
    }
    async getDRSZones(sessionKey) {
        const url = `${OPENF1_BASE_URL}/drs_zones?session_key=${sessionKey}`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch DRS zone data');
    }
    async getERSDeployment(sessionKey, driverNumber, lapNumber) {
        let url = `${OPENF1_BASE_URL}/car_data?driver_number=${driverNumber}&type=ers`;
        if (sessionKey) {
            url += `&session_key=${sessionKey}`;
        }
        if (lapNumber) {
            url += `&lap=${lapNumber}`;
        }
        const data = await this.fetchWithErrorHandling(url, 'Failed to fetch ERS deployment data', true, this.liveCacheTTL);
        return {
            ...data,
            driver_number: driverNumber
        };
    }
    async getCornerAnalysis(sessionKey, driverNumber, cornerNumber, lapNumber) {
        let url = `${OPENF1_BASE_URL}/car_data?driver_number=${driverNumber}&corner=${cornerNumber}&lap=${lapNumber}`;
        if (sessionKey) {
            url += `&session_key=${sessionKey}`;
        }
        const data = await this.fetchWithErrorHandling(url, 'Failed to fetch corner analysis data', true, this.liveCacheTTL);
        return {
            ...data,
            corner_number: cornerNumber
        };
    }
    async getTeamRadioAnalysis(sessionKey, driverNumber, startTime, endTime) {
        let url = `${OPENF1_BASE_URL}/team_radio_analysis?session_key=${sessionKey}`;
        if (driverNumber)
            url += `&driver_number=${driverNumber}`;
        if (startTime)
            url += `&start_time=${startTime}`;
        if (endTime)
            url += `&end_time=${endTime}`;
        return this.fetchWithErrorHandling(url, 'Failed to fetch team radio analysis');
    }
    async getBattlePrediction(sessionKey, driver1, driver2) {
        let url = `${OPENF1_BASE_URL}/car_data?driver_number=${driver1},${driver2}`;
        if (sessionKey) {
            url += `&session_key=${sessionKey}`;
        }
        const data = await this.fetchWithErrorHandling(url, 'Failed to fetch battle prediction data', true, this.liveCacheTTL);
        return {
            ...data,
            overtake_probability_next_lap: data.overtake_probability_next_lap || 0
        };
    }
    async getTirePredictions(sessionKey, driverNumber) {
        let url = `${OPENF1_BASE_URL}/car_data?driver_number=${driverNumber}&type=tyres`;
        if (sessionKey) {
            url += `&session_key=${sessionKey}`;
        }
        const data = await this.fetchWithErrorHandling(url, 'Failed to fetch tire prediction data', true, this.liveCacheTTL);
        return {
            ...data,
            predicted_drop_off: data.predicted_drop_off || []
        };
    }
    // Method to clear cache
    clearCache() {
        this.cache.clear();
    }
    async getSprintResults(year, round) {
        try {
            const response = await axios.get(`http://ergast.com/api/f1/${year}/${round}/sprint.json`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch sprint results');
        }
    }
}
