// Login Behavior Pattern Analysis
// Tracks and analyzes user login patterns to detect anomalies

import { LoginLog, staffMembers } from './hospitalData';

export interface BehaviorPattern {
  staffId: string;
  staffName: string;
  patterns: {
    usualLoginHours: { start: number; end: number };
    averageLoginsPerDay: number;
    preferredLocations: string[];
    preferredDevices: string[];
    loginFrequency: 'regular' | 'sporadic' | 'heavy';
  };
  anomalies: BehaviorAnomaly[];
  riskLevel: 'low' | 'medium' | 'high';
  behaviorScore: number;
  lastActivity: Date;
}

export interface BehaviorAnomaly {
  id: string;
  type: AnomalyType;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  detectedAt: Date;
  details: Record<string, unknown>;
}

export type AnomalyType = 
  | 'UNUSUAL_TIME'
  | 'NEW_LOCATION'
  | 'NEW_DEVICE'
  | 'RAPID_LOGINS'
  | 'LOCATION_HOPPING'
  | 'AFTER_HOURS'
  | 'CONCURRENT_SESSIONS'
  | 'VELOCITY_ANOMALY';

const ANOMALY_DESCRIPTIONS: Record<AnomalyType, string> = {
  UNUSUAL_TIME: 'Login at unusual hours for this user',
  NEW_LOCATION: 'First login from this location',
  NEW_DEVICE: 'Login from unrecognized device',
  RAPID_LOGINS: 'Multiple rapid login attempts',
  LOCATION_HOPPING: 'Frequent location changes',
  AFTER_HOURS: 'Login outside normal working hours',
  CONCURRENT_SESSIONS: 'Multiple simultaneous sessions detected',
  VELOCITY_ANOMALY: 'Unusual travel speed between logins'
};

// Analyze login patterns for a staff member
function analyzeLoginPatterns(logs: LoginLog[], staffId: string): BehaviorPattern['patterns'] {
  const staffLogs = logs.filter(l => l.staffId === staffId);
  
  if (staffLogs.length === 0) {
    return {
      usualLoginHours: { start: 8, end: 18 },
      averageLoginsPerDay: 0,
      preferredLocations: [],
      preferredDevices: [],
      loginFrequency: 'sporadic'
    };
  }
  
  // Calculate usual hours
  const hours = staffLogs.map(l => l.timestamp.getHours());
  const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
  
  // Count locations
  const locationCounts: Record<string, number> = {};
  staffLogs.forEach(l => {
    locationCounts[l.locationName] = (locationCounts[l.locationName] || 0) + 1;
  });
  
  const preferredLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([loc]) => loc);
  
  // Count devices
  const deviceCounts: Record<string, number> = {};
  staffLogs.forEach(l => {
    deviceCounts[l.deviceId] = (deviceCounts[l.deviceId] || 0) + 1;
  });
  
  const preferredDevices = Object.entries(deviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([dev]) => dev);
  
  // Determine frequency
  const frequency = staffLogs.length > 20 ? 'heavy' : staffLogs.length > 5 ? 'regular' : 'sporadic';
  
  return {
    usualLoginHours: { 
      start: Math.max(6, Math.floor(avgHour - 4)), 
      end: Math.min(22, Math.floor(avgHour + 4)) 
    },
    averageLoginsPerDay: staffLogs.length / 1, // Simplified
    preferredLocations,
    preferredDevices,
    loginFrequency: frequency
  };
}

// Detect anomalies in login behavior
function detectAnomalies(logs: LoginLog[], staffId: string, patterns: BehaviorPattern['patterns']): BehaviorAnomaly[] {
  const anomalies: BehaviorAnomaly[] = [];
  const staffLogs = logs.filter(l => l.staffId === staffId).sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  if (staffLogs.length === 0) return anomalies;
  
  const recentLog = staffLogs[0];
  const hour = recentLog.timestamp.getHours();
  
  // Check for unusual time
  if (hour < patterns.usualLoginHours.start || hour > patterns.usualLoginHours.end) {
    anomalies.push({
      id: `ANOM-${Date.now()}-1`,
      type: 'UNUSUAL_TIME',
      description: ANOMALY_DESCRIPTIONS.UNUSUAL_TIME,
      severity: hour < 6 || hour > 22 ? 'warning' : 'info',
      detectedAt: new Date(),
      details: { 
        loginHour: hour, 
        usualRange: patterns.usualLoginHours 
      }
    });
  }
  
  // Check for after hours
  if (hour < 6 || hour > 22) {
    anomalies.push({
      id: `ANOM-${Date.now()}-2`,
      type: 'AFTER_HOURS',
      description: ANOMALY_DESCRIPTIONS.AFTER_HOURS,
      severity: 'warning',
      detectedAt: new Date(),
      details: { loginHour: hour }
    });
  }
  
  // Check for new location
  if (!patterns.preferredLocations.includes(recentLog.locationName)) {
    anomalies.push({
      id: `ANOM-${Date.now()}-3`,
      type: 'NEW_LOCATION',
      description: ANOMALY_DESCRIPTIONS.NEW_LOCATION,
      severity: 'info',
      detectedAt: new Date(),
      details: { 
        newLocation: recentLog.locationName,
        usualLocations: patterns.preferredLocations 
      }
    });
  }
  
  // Check for rapid logins
  const recentLogins = staffLogs.filter(l => 
    recentLog.timestamp.getTime() - l.timestamp.getTime() < 5 * 60 * 1000
  );
  if (recentLogins.length > 3) {
    anomalies.push({
      id: `ANOM-${Date.now()}-4`,
      type: 'RAPID_LOGINS',
      description: ANOMALY_DESCRIPTIONS.RAPID_LOGINS,
      severity: 'warning',
      detectedAt: new Date(),
      details: { 
        loginCount: recentLogins.length,
        timeWindow: '5 minutes' 
      }
    });
  }
  
  // Check for location hopping
  const uniqueLocations = new Set(recentLogins.map(l => l.location)).size;
  if (uniqueLocations >= 3) {
    anomalies.push({
      id: `ANOM-${Date.now()}-5`,
      type: 'LOCATION_HOPPING',
      description: ANOMALY_DESCRIPTIONS.LOCATION_HOPPING,
      severity: 'critical',
      detectedAt: new Date(),
      details: { 
        locationCount: uniqueLocations,
        timeWindow: '5 minutes' 
      }
    });
  }
  
  return anomalies;
}

// Calculate behavior risk score
function calculateBehaviorScore(patterns: BehaviorPattern['patterns'], anomalies: BehaviorAnomaly[]): number {
  let score = 100;
  
  // Deduct for anomalies
  anomalies.forEach(a => {
    if (a.severity === 'critical') score -= 25;
    else if (a.severity === 'warning') score -= 10;
    else score -= 5;
  });
  
  // Bonus for consistent behavior
  if (patterns.loginFrequency === 'regular') score += 5;
  if (patterns.preferredLocations.length > 0) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

// Analyze all staff behavior
export function analyzeAllBehavior(logs: LoginLog[]): BehaviorPattern[] {
  return staffMembers.map(staff => {
    const patterns = analyzeLoginPatterns(logs, staff.id);
    const anomalies = detectAnomalies(logs, staff.id, patterns);
    const behaviorScore = calculateBehaviorScore(patterns, anomalies);
    
    const riskLevel: 'low' | 'medium' | 'high' = 
      behaviorScore >= 80 ? 'low' :
      behaviorScore >= 50 ? 'medium' : 'high';
    
    const staffLogs = logs.filter(l => l.staffId === staff.id);
    const lastActivity = staffLogs.length > 0 
      ? staffLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
      : new Date();
    
    return {
      staffId: staff.id,
      staffName: staff.name,
      patterns,
      anomalies,
      riskLevel,
      behaviorScore,
      lastActivity
    };
  });
}

// Get summary statistics
export function getBehaviorSummary(patterns: BehaviorPattern[]) {
  const totalAnomalies = patterns.reduce((sum, p) => sum + p.anomalies.length, 0);
  const criticalCount = patterns.reduce((sum, p) => 
    sum + p.anomalies.filter(a => a.severity === 'critical').length, 0);
  const warningCount = patterns.reduce((sum, p) => 
    sum + p.anomalies.filter(a => a.severity === 'warning').length, 0);
  const avgScore = patterns.reduce((sum, p) => sum + p.behaviorScore, 0) / patterns.length;
  
  const anomalyTypes: Record<string, number> = {};
  patterns.forEach(p => {
    p.anomalies.forEach(a => {
      anomalyTypes[a.type] = (anomalyTypes[a.type] || 0) + 1;
    });
  });
  
  return {
    totalAnomalies,
    criticalCount,
    warningCount,
    avgScore,
    anomalyTypes,
    highRiskUsers: patterns.filter(p => p.riskLevel === 'high').length,
    mediumRiskUsers: patterns.filter(p => p.riskLevel === 'medium').length
  };
}
