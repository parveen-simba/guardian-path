// Device Fingerprint Generator
// Collects browser and device characteristics to create a unique fingerprint

export interface DeviceFingerprint {
  id: string;
  hash: string;
  components: FingerprintComponents;
  riskFactors: RiskFactor[];
  trustScore: number;
  isKnownDevice: boolean;
  firstSeen: Date;
  lastSeen: Date;
}

export interface FingerprintComponents {
  userAgent: string;
  language: string;
  colorDepth: number;
  screenResolution: string;
  timezone: string;
  sessionStorage: boolean;
  localStorage: boolean;
  cookiesEnabled: boolean;
  platform: string;
  plugins: string[];
  canvas: string;
  webgl: string;
  fonts: string[];
  audio: string;
  cpuClass: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  touchSupport: boolean;
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Simple hash function for fingerprint
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Generate canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unavailable';
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Hospital Sentinel', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Fingerprint', 4, 17);
    
    return simpleHash(canvas.toDataURL());
  } catch {
    return 'blocked';
  }
}

// Generate WebGL fingerprint
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'unavailable';
    
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'limited';
    
    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return simpleHash(`${vendor}~${renderer}`);
  } catch {
    return 'blocked';
  }
}

// Collect all fingerprint components
export function collectFingerprintComponents(): FingerprintComponents {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    cpuClass?: string;
  };
  
  return {
    userAgent: nav.userAgent,
    language: nav.language,
    colorDepth: screen.colorDepth,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sessionStorage: !!window.sessionStorage,
    localStorage: !!window.localStorage,
    cookiesEnabled: navigator.cookieEnabled,
    platform: nav.platform,
    plugins: Array.from(nav.plugins || []).map(p => p.name).slice(0, 5),
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    fonts: ['Arial', 'Courier', 'Georgia', 'Times', 'Verdana'], // Simplified
    audio: 'supported', // Simplified
    cpuClass: nav.cpuClass || 'unknown',
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory || 0,
    touchSupport: 'ontouchstart' in window,
  };
}

// Analyze risk factors from fingerprint
function analyzeRiskFactors(components: FingerprintComponents): RiskFactor[] {
  const factors: RiskFactor[] = [];
  
  // Check for privacy mode indicators
  if (components.canvas === 'blocked' || components.webgl === 'blocked') {
    factors.push({
      type: 'PRIVACY_MODE',
      severity: 'medium',
      description: 'Browser privacy features blocking fingerprinting'
    });
  }
  
  // Check for automation indicators
  if (components.userAgent.includes('HeadlessChrome') || 
      components.userAgent.includes('PhantomJS')) {
    factors.push({
      type: 'AUTOMATION_DETECTED',
      severity: 'high',
      description: 'Automated browser detected'
    });
  }
  
  // Check for VPN/Proxy indicators (timezone mismatch simulation)
  const localHour = new Date().getHours();
  if (localHour >= 1 && localHour <= 5) {
    factors.push({
      type: 'UNUSUAL_TIME',
      severity: 'low',
      description: 'Login during unusual hours'
    });
  }
  
  // Check for missing features
  if (components.hardwareConcurrency === 0) {
    factors.push({
      type: 'MISSING_HARDWARE_INFO',
      severity: 'low',
      description: 'Hardware information unavailable'
    });
  }
  
  // Check for touch on desktop
  if (components.touchSupport && !components.userAgent.includes('Mobile')) {
    factors.push({
      type: 'TOUCH_DESKTOP_MISMATCH',
      severity: 'low',
      description: 'Touch capability on non-mobile device'
    });
  }
  
  return factors;
}

// Calculate trust score
function calculateTrustScore(components: FingerprintComponents, riskFactors: RiskFactor[]): number {
  let score = 100;
  
  // Deduct for risk factors
  riskFactors.forEach(factor => {
    if (factor.severity === 'high') score -= 30;
    else if (factor.severity === 'medium') score -= 15;
    else score -= 5;
  });
  
  // Add points for complete fingerprint
  if (components.canvas !== 'blocked') score += 5;
  if (components.webgl !== 'blocked') score += 5;
  if (components.hardwareConcurrency > 0) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

// Generate complete device fingerprint
export function generateDeviceFingerprint(): DeviceFingerprint {
  const components = collectFingerprintComponents();
  const riskFactors = analyzeRiskFactors(components);
  const trustScore = calculateTrustScore(components, riskFactors);
  
  // Create hash from key components
  const hashInput = [
    components.userAgent,
    components.screenResolution,
    components.timezone,
    components.platform,
    components.canvas,
    components.webgl,
    components.hardwareConcurrency.toString()
  ].join('|');
  
  const hash = simpleHash(hashInput);
  const id = `FP-${hash.slice(0, 4)}-${hash.slice(4, 8)}`.toUpperCase();
  
  return {
    id,
    hash,
    components,
    riskFactors,
    trustScore,
    isKnownDevice: Math.random() > 0.3, // Simulated
    firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    lastSeen: new Date()
  };
}

// Simulated known devices database
export function getKnownDevices(): DeviceFingerprint[] {
  const baseDevices = [
    { id: 'FP-A1B2-C3D4', trustScore: 95, platform: 'Win32' },
    { id: 'FP-E5F6-G7H8', trustScore: 88, platform: 'MacIntel' },
    { id: 'FP-I9J0-K1L2', trustScore: 72, platform: 'Linux x86_64' },
    { id: 'FP-M3N4-O5P6', trustScore: 45, platform: 'iPhone' },
  ];
  
  return baseDevices.map(d => ({
    ...generateDeviceFingerprint(),
    id: d.id,
    trustScore: d.trustScore,
    components: {
      ...collectFingerprintComponents(),
      platform: d.platform
    }
  }));
}
