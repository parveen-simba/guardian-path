import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface DetectionThresholds {
  impossibleTravelRatio: number; // Below this ratio of required time = impossible
  suspiciousTravelRatio: number; // Below this ratio = suspicious
  maxHumanSpeedKmh: number; // Speed above this is flagged
  highRiskScoreThreshold: number; // Score above this = high risk
  mediumRiskScoreThreshold: number; // Score above this = medium risk
}

export interface NotificationSettings {
  enableAlerts: boolean;
  alertOnImpossible: boolean;
  alertOnSuspicious: boolean;
  soundEnabled: boolean;
  autoRefreshInterval: number; // seconds
}

export interface SettingsState {
  thresholds: DetectionThresholds;
  notifications: NotificationSettings;
}

interface SettingsContextType {
  settings: SettingsState;
  updateThresholds: (thresholds: Partial<DetectionThresholds>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: SettingsState = {
  thresholds: {
    impossibleTravelRatio: 0.3,
    suspiciousTravelRatio: 0.7,
    maxHumanSpeedKmh: 25,
    highRiskScoreThreshold: 80,
    mediumRiskScoreThreshold: 50,
  },
  notifications: {
    enableAlerts: true,
    alertOnImpossible: true,
    alertOnSuspicious: true,
    soundEnabled: false,
    autoRefreshInterval: 30,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('hospital-sentinel-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const saveSettings = useCallback((newSettings: SettingsState) => {
    localStorage.setItem('hospital-sentinel-settings', JSON.stringify(newSettings));
  }, []);

  const updateThresholds = useCallback((thresholds: Partial<DetectionThresholds>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        thresholds: { ...prev.thresholds, ...thresholds }
      };
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  const updateNotifications = useCallback((notifications: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        notifications: { ...prev.notifications, ...notifications }
      };
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('hospital-sentinel-settings');
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateThresholds, updateNotifications, resetToDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
