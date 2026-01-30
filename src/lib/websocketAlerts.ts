import { useEffect, useRef, useState, useCallback } from 'react';
import { TravelAnalysis, staffMembers, hospitalLocations } from './hospitalData';

export interface WebSocketAlert {
  id: string;
  type: 'fraud' | 'suspicious' | 'info';
  title: string;
  message: string;
  staffName: string;
  fromLocation: string;
  toLocation: string;
  riskScore: number;
  timestamp: Date;
  read: boolean;
}

type AlertCallback = (alert: WebSocketAlert) => void;

// Simulated WebSocket connection for real-time alerts
class MockWebSocket {
  private callbacks: Set<AlertCallback> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isConnected: boolean = false;

  connect() {
    if (this.isConnected) return;
    this.isConnected = true;
    
    // Simulate receiving alerts at random intervals (15-45 seconds)
    this.scheduleNextAlert();
  }

  private scheduleNextAlert() {
    const delay = 15000 + Math.random() * 30000; // 15-45 seconds
    this.intervalId = setTimeout(() => {
      if (this.isConnected) {
        this.generateAlert();
        this.scheduleNextAlert();
      }
    }, delay);
  }

  private generateAlert() {
    const staff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const fromLoc = hospitalLocations[Math.floor(Math.random() * hospitalLocations.length)];
    let toLoc = hospitalLocations[Math.floor(Math.random() * hospitalLocations.length)];
    while (toLoc.id === fromLoc.id) {
      toLoc = hospitalLocations[Math.floor(Math.random() * hospitalLocations.length)];
    }

    const alertTypes: Array<'fraud' | 'suspicious' | 'info'> = ['fraud', 'suspicious', 'info'];
    const weights = [0.2, 0.4, 0.4]; // 20% fraud, 40% suspicious, 40% info
    const random = Math.random();
    let type: 'fraud' | 'suspicious' | 'info' = 'info';
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        type = alertTypes[i];
        break;
      }
    }

    const riskScore = type === 'fraud' ? 85 + Math.random() * 15 :
                      type === 'suspicious' ? 50 + Math.random() * 35 :
                      10 + Math.random() * 30;

    const titles = {
      fraud: '🚨 FRAUD ALERT: Impossible Journey Detected',
      suspicious: '⚠️ Suspicious Activity Detected',
      info: 'ℹ️ Login Activity Recorded'
    };

    const messages = {
      fraud: `${staff.name} logged in at ${fromLoc.name} and ${toLoc.name} within impossible time frame. Immediate investigation required.`,
      suspicious: `${staff.name} showed unusual travel pattern between ${fromLoc.name} and ${toLoc.name}. Review recommended.`,
      info: `${staff.name} logged in at ${toLoc.name} from ${fromLoc.name}.`
    };

    const alert: WebSocketAlert = {
      id: `WS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title: titles[type],
      message: messages[type],
      staffName: staff.name,
      fromLocation: fromLoc.name,
      toLocation: toLoc.name,
      riskScore,
      timestamp: new Date(),
      read: false
    };

    this.callbacks.forEach(cb => cb(alert));
  }

  subscribe(callback: AlertCallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  disconnect() {
    this.isConnected = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  getStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  // Manually trigger an alert (for testing)
  triggerTestAlert(type: 'fraud' | 'suspicious' | 'info' = 'fraud') {
    const staff = staffMembers[0];
    const alert: WebSocketAlert = {
      id: `WS-TEST-${Date.now()}`,
      type,
      title: type === 'fraud' ? '🚨 FRAUD ALERT: Impossible Journey Detected' :
             type === 'suspicious' ? '⚠️ Suspicious Activity Detected' :
             'ℹ️ Login Activity Recorded',
      message: `Test alert for ${staff.name}`,
      staffName: staff.name,
      fromLocation: 'ICU',
      toLocation: 'Pharmacy',
      riskScore: type === 'fraud' ? 95 : type === 'suspicious' ? 70 : 20,
      timestamp: new Date(),
      read: false
    };
    this.callbacks.forEach(cb => cb(alert));
  }
}

// Singleton instance
const mockWebSocket = new MockWebSocket();

export function useWebSocketAlerts() {
  const [alerts, setAlerts] = useState<WebSocketAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setConnectionStatus('connecting');
    
    // Simulate connection delay
    const connectTimeout = setTimeout(() => {
      mockWebSocket.connect();
      setConnectionStatus('connected');
    }, 1000);

    const unsubscribe = mockWebSocket.subscribe((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      clearTimeout(connectTimeout);
      unsubscribe();
    };
  }, []);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  const triggerTestAlert = useCallback((type: 'fraud' | 'suspicious' | 'info' = 'fraud') => {
    mockWebSocket.triggerTestAlert(type);
  }, []);

  return {
    alerts,
    connectionStatus,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAlerts,
    triggerTestAlert
  };
}
