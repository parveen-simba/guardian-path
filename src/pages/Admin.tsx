import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Sliders, 
  Bell, 
  RefreshCw,
  Gauge,
  Timer,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

const Admin = () => {
  const { settings, updateThresholds, updateNotifications, resetToDefaults } = useSettings();
  const [localThresholds, setLocalThresholds] = useState(settings.thresholds);
  const [localNotifications, setLocalNotifications] = useState(settings.notifications);

  const handleSave = () => {
    updateThresholds(localThresholds);
    updateNotifications(localNotifications);
    toast.success('Settings saved successfully', {
      description: 'Detection thresholds and notifications updated'
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalThresholds({
      impossibleTravelRatio: 0.3,
      suspiciousTravelRatio: 0.7,
      maxHumanSpeedKmh: 25,
      highRiskScoreThreshold: 80,
      mediumRiskScoreThreshold: 50,
    });
    setLocalNotifications({
      enableAlerts: true,
      alertOnImpossible: true,
      alertOnSuspicious: true,
      soundEnabled: false,
      autoRefreshInterval: 30,
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Admin Control Panel</h1>
                  <p className="text-xs text-muted-foreground font-mono">
                    Detection & Alert Configuration
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset Defaults
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detection Thresholds */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                Detection Thresholds
              </CardTitle>
              <CardDescription>
                Configure sensitivity levels for impossible journey detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Impossible Travel Ratio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-destructive" />
                    Impossible Travel Threshold
                  </Label>
                  <span className="text-sm font-mono text-destructive">
                    {(localThresholds.impossibleTravelRatio * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[localThresholds.impossibleTravelRatio * 100]}
                  onValueChange={([v]) => setLocalThresholds(prev => ({ ...prev, impossibleTravelRatio: v / 100 }))}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Flag as impossible when travel time is less than {(localThresholds.impossibleTravelRatio * 100).toFixed(0)}% of required time
                </p>
              </div>

              <Separator />

              {/* Suspicious Travel Ratio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-warning" />
                    Suspicious Travel Threshold
                  </Label>
                  <span className="text-sm font-mono text-warning">
                    {(localThresholds.suspiciousTravelRatio * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[localThresholds.suspiciousTravelRatio * 100]}
                  onValueChange={([v]) => setLocalThresholds(prev => ({ ...prev, suspiciousTravelRatio: v / 100 }))}
                  min={40}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Flag as suspicious when travel time is less than {(localThresholds.suspiciousTravelRatio * 100).toFixed(0)}% of required time
                </p>
              </div>

              <Separator />

              {/* Max Human Speed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    Max Human Speed
                  </Label>
                  <span className="text-sm font-mono text-primary">
                    {localThresholds.maxHumanSpeedKmh} km/h
                  </span>
                </div>
                <Slider
                  value={[localThresholds.maxHumanSpeedKmh]}
                  onValueChange={([v]) => setLocalThresholds(prev => ({ ...prev, maxHumanSpeedKmh: v }))}
                  min={15}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Speed exceeding {localThresholds.maxHumanSpeedKmh} km/h triggers suspicious flag
                </p>
              </div>

              <Separator />

              {/* Risk Score Thresholds */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>High Risk Score Threshold</Label>
                  <span className="text-sm font-mono text-destructive">
                    {localThresholds.highRiskScoreThreshold}%
                  </span>
                </div>
                <Slider
                  value={[localThresholds.highRiskScoreThreshold]}
                  onValueChange={([v]) => setLocalThresholds(prev => ({ ...prev, highRiskScoreThreshold: v }))}
                  min={60}
                  max={95}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Medium Risk Score Threshold</Label>
                  <span className="text-sm font-mono text-warning">
                    {localThresholds.mediumRiskScoreThreshold}%
                  </span>
                </div>
                <Slider
                  value={[localThresholds.mediumRiskScoreThreshold]}
                  onValueChange={([v]) => setLocalThresholds(prev => ({ ...prev, mediumRiskScoreThreshold: v }))}
                  min={30}
                  max={70}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Alert Notifications
              </CardTitle>
              <CardDescription>
                Configure how and when you receive security alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable Alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Master toggle for all alert notifications
                  </p>
                </div>
                <Switch
                  checked={localNotifications.enableAlerts}
                  onCheckedChange={(v) => setLocalNotifications(prev => ({ ...prev, enableAlerts: v }))}
                />
              </div>

              <Separator />

              {/* Alert Types */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Alert Types</Label>
                
                <div className="flex items-center justify-between pl-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-destructive" />
                      Impossible Travel (Fraud)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Alert when physically impossible travel detected
                    </p>
                  </div>
                  <Switch
                    checked={localNotifications.alertOnImpossible}
                    onCheckedChange={(v) => setLocalNotifications(prev => ({ ...prev, alertOnImpossible: v }))}
                    disabled={!localNotifications.enableAlerts}
                  />
                </div>

                <div className="flex items-center justify-between pl-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      Suspicious Activity
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Alert when unusually fast travel detected
                    </p>
                  </div>
                  <Switch
                    checked={localNotifications.alertOnSuspicious}
                    onCheckedChange={(v) => setLocalNotifications(prev => ({ ...prev, alertOnSuspicious: v }))}
                    disabled={!localNotifications.enableAlerts}
                  />
                </div>
              </div>

              <Separator />

              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    {localNotifications.soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                    Sound Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Play audio when new alerts arrive
                  </p>
                </div>
                <Switch
                  checked={localNotifications.soundEnabled}
                  onCheckedChange={(v) => setLocalNotifications(prev => ({ ...prev, soundEnabled: v }))}
                  disabled={!localNotifications.enableAlerts}
                />
              </div>

              <Separator />

              {/* Auto Refresh */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Auto-Refresh Interval
                  </Label>
                  <span className="text-sm font-mono">
                    {localNotifications.autoRefreshInterval}s
                  </span>
                </div>
                <Slider
                  value={[localNotifications.autoRefreshInterval]}
                  onValueChange={([v]) => setLocalNotifications(prev => ({ ...prev, autoRefreshInterval: v }))}
                  min={10}
                  max={120}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Dashboard will refresh every {localNotifications.autoRefreshInterval} seconds
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Configuration Summary */}
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Current Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Impossible Threshold</p>
                  <p className="text-2xl font-mono font-bold text-destructive">
                    &lt;{(localThresholds.impossibleTravelRatio * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">of required time</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Suspicious Threshold</p>
                  <p className="text-2xl font-mono font-bold text-warning">
                    &lt;{(localThresholds.suspiciousTravelRatio * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">of required time</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Speed Limit</p>
                  <p className="text-2xl font-mono font-bold text-primary">
                    {localThresholds.maxHumanSpeedKmh}
                  </p>
                  <p className="text-xs text-muted-foreground">km/h max</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Refresh Rate</p>
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {localNotifications.autoRefreshInterval}s
                  </p>
                  <p className="text-xs text-muted-foreground">interval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
