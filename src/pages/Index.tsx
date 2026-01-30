import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Activity,
  Zap
} from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { AlertPanel } from '@/components/AlertPanel';
import { ActivityTable } from '@/components/ActivityTable';
import { SecurityCharts } from '@/components/SecurityCharts';
import { LocationMap } from '@/components/LocationMap';
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

        {/* Footer Info */}
        <footer className="mt-12 pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Hospital Sentinel — Cyber-Physical Security Platform</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <span>Detection Engine v2.0.1</span>
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
