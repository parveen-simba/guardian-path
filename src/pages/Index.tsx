import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Activity,
  Zap,
  Fingerprint,
  Brain
} from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { AlertPanel } from '@/components/AlertPanel';
import { ActivityTable } from '@/components/ActivityTable';
import { SecurityCharts } from '@/components/SecurityCharts';
import { LocationMap } from '@/components/LocationMap';
import { DeviceFingerprintPanel } from '@/components/DeviceFingerprintPanel';
import { BehaviorAnalysisPanel } from '@/components/BehaviorAnalysisPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  generateLoginLogs, 
  analyzeAllLogs, 
  LoginLog, 
  TravelAnalysis 
} from '@/lib/hospitalData';

const Index = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [analyses, setAnalyses] = useState<TravelAnalysis[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      const newLogs = generateLoginLogs(60);
      const newAnalyses = analyzeAllLogs(newLogs);
      setLogs(newLogs);
      setAnalyses(newAnalyses);
      setIsRefreshing(false);
    }, 500);
  }, []);

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const stats = {
    totalLogins: logs.length,
    normalAccess: analyses.filter(a => a.status === 'safe').length,
    suspicious: analyses.filter(a => a.status === 'suspicious').length,
    fraudAlerts: analyses.filter(a => a.status === 'impossible').length,
  };

  const alertCount = stats.suspicious + stats.fraudAlerts;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onRefresh={refreshData} 
        isRefreshing={isRefreshing}
        alertCount={alertCount}
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Real-time Monitoring
            </span>
          </div>
          <h2 className="text-3xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Impossible journey detection & credential misuse prevention
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Logins"
            value={stats.totalLogins}
            subtitle="Last 12 hours"
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Normal Access"
            value={stats.normalAccess}
            subtitle="Verified patterns"
            icon={<CheckCircle className="w-6 h-6" />}
            variant="success"
          />
          <StatCard
            title="Suspicious"
            value={stats.suspicious}
            subtitle="Under review"
            icon={<Activity className="w-6 h-6" />}
            variant="warning"
            trend={stats.suspicious > 0 ? { value: 12, isUp: true } : undefined}
          />
          <StatCard
            title="Fraud Alerts"
            value={stats.fraudAlerts}
            subtitle="Immediate action required"
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="danger"
            trend={stats.fraudAlerts > 0 ? { value: 25, isUp: true } : undefined}
          />
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="behavior" className="gap-2">
              <Brain className="w-4 h-4" />
              Behavior Analysis
            </TabsTrigger>
            <TabsTrigger value="fingerprint" className="gap-2">
              <Fingerprint className="w-4 h-4" />
              Device Fingerprint
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Activity Table - Takes 2 columns */}
              <div className="lg:col-span-2">
                <ActivityTable data={analyses} />
              </div>
              
              {/* Alerts Panel */}
              <div className="lg:col-span-1">
                <AlertPanel alerts={analyses.filter(a => a.status !== 'safe')} />
              </div>
            </div>

            {/* Charts Row */}
            <SecurityCharts analyses={analyses} logs={logs} />

            {/* Location Map */}
            <div className="mt-8">
              <LocationMap analyses={analyses} />
            </div>
          </TabsContent>

          <TabsContent value="behavior">
            <BehaviorAnalysisPanel logs={logs} />
          </TabsContent>

          <TabsContent value="fingerprint">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DeviceFingerprintPanel />
              <div className="glass-card rounded-xl border border-border/50 p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  How Device Fingerprinting Works
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Device fingerprinting creates a unique identifier for each device accessing the system 
                    by collecting various browser and hardware characteristics.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Collected Data Points:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Screen resolution & color depth</li>
                      <li>Browser plugins & language settings</li>
                      <li>Timezone & platform information</li>
                      <li>Canvas & WebGL rendering signatures</li>
                      <li>Hardware concurrency (CPU cores)</li>
                      <li>Touch support & input methods</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Risk Detection:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Automated browser detection (bots)</li>
                      <li>Privacy mode/incognito indicators</li>
                      <li>VPN/proxy usage patterns</li>
                      <li>Device spoofing attempts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <footer className="mt-12 pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Hospital Sentinel — Cyber-Physical Security Platform</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <span>Detection Engine v2.1.0</span>
              <span>•</span>
              <span>Last Scan: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span className="text-success">All Systems Operational</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
