// Hospital Location Coordinates (simulated GPS)
export interface Location {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  floor: number;
  building: string;
}

export const hospitalLocations: Location[] = [
  { id: 'icu', name: 'ICU', coordinates: { lat: 28.6139, lng: 77.2090 }, floor: 3, building: 'Main' },
  { id: 'pharmacy', name: 'Pharmacy', coordinates: { lat: 28.6145, lng: 77.2095 }, floor: 1, building: 'Main' },
  { id: 'reception', name: 'Reception', coordinates: { lat: 28.6135, lng: 77.2088 }, floor: 0, building: 'Main' },
  { id: 'emergency', name: 'Emergency Ward', coordinates: { lat: 28.6150, lng: 77.2100 }, floor: 0, building: 'East Wing' },
  { id: 'ot', name: 'Operation Theatre', coordinates: { lat: 28.6142, lng: 77.2082 }, floor: 4, building: 'Main' },
  { id: 'radiology', name: 'Radiology', coordinates: { lat: 28.6148, lng: 77.2078 }, floor: 2, building: 'West Wing' },
  { id: 'lab', name: 'Pathology Lab', coordinates: { lat: 28.6132, lng: 77.2092 }, floor: 1, building: 'Main' },
  { id: 'cardiology', name: 'Cardiology', coordinates: { lat: 28.6155, lng: 77.2085 }, floor: 5, building: 'East Wing' },
];

// Doctor/Staff Data
export interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  badgeId: string;
}

export const staffMembers: Staff[] = [
  { id: '1', name: 'Dr. Rahul Sharma', role: 'Senior Surgeon', department: 'Surgery', badgeId: 'MED-001' },
  { id: '2', name: 'Dr. Priya Patel', role: 'Cardiologist', department: 'Cardiology', badgeId: 'MED-002' },
  { id: '3', name: 'Dr. Aman Singh', role: 'Emergency Physician', department: 'Emergency', badgeId: 'MED-003' },
  { id: '4', name: 'Dr. Neha Gupta', role: 'Anesthesiologist', department: 'Surgery', badgeId: 'MED-004' },
  { id: '5', name: 'Dr. Vikram Rao', role: 'Radiologist', department: 'Radiology', badgeId: 'MED-005' },
  { id: '6', name: 'Nurse Sunita', role: 'Head Nurse', department: 'ICU', badgeId: 'NRS-001' },
  { id: '7', name: 'Dr. Anjali Mehta', role: 'Pathologist', department: 'Laboratory', badgeId: 'MED-006' },
  { id: '8', name: 'Dr. Karan Malhotra', role: 'Neurosurgeon', department: 'Surgery', badgeId: 'MED-007' },
];

// Login Log Entry
export interface LoginLog {
  id: string;
  staffId: string;
  staffName: string;
  location: string;
  locationName: string;
  timestamp: Date;
  deviceId: string;
  ipAddress: string;
}

// Travel Analysis Result
export interface TravelAnalysis {
  id: string;
  staffId: string;
  staffName: string;
  fromLocation: string;
  toLocation: string;
  fromTime: Date;
  toTime: Date;
  timeGapMinutes: number;
  distanceMeters: number;
  requiredTimeMinutes: number;
  speedKmh: number;
  status: 'safe' | 'suspicious' | 'impossible';
  riskScore: number;
  reason: string;
}

// Calculate distance between two GPS coordinates (Haversine formula)
export function calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.lat * Math.PI / 180;
  const φ2 = coord2.lat * Math.PI / 180;
  const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
  const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Calculate floor travel time (30 seconds per floor)
export function calculateFloorTime(floor1: number, floor2: number): number {
  return Math.abs(floor2 - floor1) * 0.5; // minutes
}

// Human walking speed: ~5 km/h = 83.3 m/min
const WALKING_SPEED_M_PER_MIN = 83.3;
const MAX_HUMAN_SPEED_KMH = 25; // Running/sprinting max

// Calculate minimum travel time between locations
export function calculateMinTravelTime(from: Location, to: Location): number {
  const distance = calculateDistance(from.coordinates, to.coordinates);
  const walkingTime = distance / WALKING_SPEED_M_PER_MIN;
  const floorTime = calculateFloorTime(from.floor, to.floor);
  const buildingPenalty = from.building !== to.building ? 2 : 0; // 2 min for building change
  
  return walkingTime + floorTime + buildingPenalty;
}

// Analyze if travel is possible
export function analyzeTravelPossibility(
  fromLocation: Location,
  toLocation: Location,
  timeGapMinutes: number
): { status: 'safe' | 'suspicious' | 'impossible'; riskScore: number; reason: string; speedKmh: number; distanceMeters: number; requiredTime: number } {
  const distance = calculateDistance(fromLocation.coordinates, toLocation.coordinates);
  const requiredTime = calculateMinTravelTime(fromLocation, toLocation);
  const speedKmh = (distance / 1000) / (timeGapMinutes / 60);
  
  // Calculate risk score (0-100)
  let riskScore = 0;
  let status: 'safe' | 'suspicious' | 'impossible' = 'safe';
  let reason = 'Normal access pattern';
  
  if (timeGapMinutes < requiredTime * 0.3) {
    // Impossible - less than 30% of required time
    status = 'impossible';
    riskScore = 95 + Math.min(5, (requiredTime - timeGapMinutes) / requiredTime * 5);
    reason = `Physically impossible travel. Required: ${requiredTime.toFixed(1)} min, Actual: ${timeGapMinutes.toFixed(1)} min`;
  } else if (timeGapMinutes < requiredTime * 0.7) {
    // Suspicious - between 30-70% of required time
    status = 'suspicious';
    riskScore = 60 + ((requiredTime * 0.7 - timeGapMinutes) / (requiredTime * 0.4)) * 35;
    reason = `Unusually fast travel detected. Speed: ${speedKmh.toFixed(1)} km/h`;
  } else if (speedKmh > MAX_HUMAN_SPEED_KMH) {
    status = 'suspicious';
    riskScore = 50 + (speedKmh - MAX_HUMAN_SPEED_KMH) * 2;
    reason = `Speed exceeds human capability: ${speedKmh.toFixed(1)} km/h`;
  } else {
    status = 'safe';
    riskScore = Math.max(0, 30 - (timeGapMinutes - requiredTime) * 2);
    reason = 'Normal access pattern';
  }
  
  return {
    status,
    riskScore: Math.min(100, Math.max(0, riskScore)),
    reason,
    speedKmh,
    distanceMeters: distance,
    requiredTime
  };
}

// Generate random login logs
export function generateLoginLogs(count: number = 50): LoginLog[] {
  const logs: LoginLog[] = [];
  const baseTime = new Date();
  baseTime.setHours(6, 0, 0, 0); // Start from 6 AM
  
  for (let i = 0; i < count; i++) {
    const staff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const location = hospitalLocations[Math.floor(Math.random() * hospitalLocations.length)];
    const timeOffset = Math.floor(Math.random() * 720); // Random time within 12 hours
    
    const timestamp = new Date(baseTime.getTime() + timeOffset * 60000);
    
    logs.push({
      id: `LOG-${String(i + 1).padStart(4, '0')}`,
      staffId: staff.id,
      staffName: staff.name,
      location: location.id,
      locationName: location.name,
      timestamp,
      deviceId: `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    });
  }
  
  // Add some suspicious patterns
  const suspiciousStaff = staffMembers[0];
  const now = new Date();
  
  // Impossible travel scenario
  logs.push({
    id: 'LOG-SUSP-001',
    staffId: suspiciousStaff.id,
    staffName: suspiciousStaff.name,
    location: 'icu',
    locationName: 'ICU',
    timestamp: new Date(now.getTime() - 5 * 60000),
    deviceId: 'DEV-ICU001',
    ipAddress: '192.168.1.50'
  });
  
  logs.push({
    id: 'LOG-SUSP-002',
    staffId: suspiciousStaff.id,
    staffName: suspiciousStaff.name,
    location: 'pharmacy',
    locationName: 'Pharmacy',
    timestamp: new Date(now.getTime() - 4 * 60000),
    deviceId: 'DEV-PHARM01',
    ipAddress: '192.168.2.100'
  });
  
  // Another suspicious pattern
  const suspiciousStaff2 = staffMembers[2];
  logs.push({
    id: 'LOG-SUSP-003',
    staffId: suspiciousStaff2.id,
    staffName: suspiciousStaff2.name,
    location: 'emergency',
    locationName: 'Emergency Ward',
    timestamp: new Date(now.getTime() - 10 * 60000),
    deviceId: 'DEV-EMR001',
    ipAddress: '192.168.3.25'
  });
  
  logs.push({
    id: 'LOG-SUSP-004',
    staffId: suspiciousStaff2.id,
    staffName: suspiciousStaff2.name,
    location: 'cardiology',
    locationName: 'Cardiology',
    timestamp: new Date(now.getTime() - 8 * 60000),
    deviceId: 'DEV-CARD01',
    ipAddress: '192.168.5.80'
  });
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Analyze all logs for impossible travel
export function analyzeAllLogs(logs: LoginLog[]): TravelAnalysis[] {
  const analyses: TravelAnalysis[] = [];
  
  // Group logs by staff
  const staffLogs: { [key: string]: LoginLog[] } = {};
  logs.forEach(log => {
    if (!staffLogs[log.staffId]) {
      staffLogs[log.staffId] = [];
    }
    staffLogs[log.staffId].push(log);
  });
  
  // Analyze consecutive logins for each staff member
  Object.values(staffLogs).forEach(staffLogList => {
    const sorted = staffLogList.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    for (let i = 1; i < sorted.length; i++) {
      const prevLog = sorted[i - 1];
      const currLog = sorted[i];
      
      if (prevLog.location === currLog.location) continue;
      
      const fromLocation = hospitalLocations.find(l => l.id === prevLog.location);
      const toLocation = hospitalLocations.find(l => l.id === currLog.location);
      
      if (!fromLocation || !toLocation) continue;
      
      const timeGapMs = currLog.timestamp.getTime() - prevLog.timestamp.getTime();
      const timeGapMinutes = timeGapMs / 60000;
      
      if (timeGapMinutes <= 0 || timeGapMinutes > 60) continue; // Only analyze within 1 hour
      
      const analysis = analyzeTravelPossibility(fromLocation, toLocation, timeGapMinutes);
      
      analyses.push({
        id: `ANALYSIS-${prevLog.id}-${currLog.id}`,
        staffId: currLog.staffId,
        staffName: currLog.staffName,
        fromLocation: prevLog.locationName,
        toLocation: currLog.locationName,
        fromTime: prevLog.timestamp,
        toTime: currLog.timestamp,
        timeGapMinutes,
        distanceMeters: analysis.distanceMeters,
        requiredTimeMinutes: analysis.requiredTime,
        speedKmh: analysis.speedKmh,
        status: analysis.status,
        riskScore: analysis.riskScore,
        reason: analysis.reason
      });
    }
  });
  
  return analyses.sort((a, b) => b.riskScore - a.riskScore);
}
