import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { TravelAnalysis } from '@/lib/hospitalData';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertPanelProps {
  alerts: TravelAnalysis[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const criticalAlerts = alerts.filter(a => a.status === 'impossible');
  const warningAlerts = alerts.filter(a => a.status === 'suspicious');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="glass-card rounded-xl border border-border/50 h-full flex flex-col">
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
        <h3 className="font-semibold">Live Security Alerts</h3>
        <span className="ml-auto bg-destructive/20 text-destructive text-xs px-2 py-1 rounded-full font-mono">
          {criticalAlerts.length + warningAlerts.length} Active
        </span>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {criticalAlerts.length === 0 && warningAlerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mb-3 text-success" />
              <p className="text-sm">All systems secure</p>
            </div>
          )}
          
          {criticalAlerts.map((alert) => (
            <div 
              key={alert.id}
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 animate-pulse-glow"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-destructive bg-destructive/20 px-1.5 py-0.5 rounded">
                      CRITICAL
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Risk: {alert.riskScore.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{alert.staffName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.fromLocation} → {alert.toLocation}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(alert.fromTime)} - {formatTime(alert.toTime)}</span>
                    <span className="text-destructive font-mono">
                      ({alert.timeGapMinutes.toFixed(1)} min)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {warningAlerts.map((alert) => (
            <div 
              key={alert.id}
              className="p-3 rounded-lg bg-warning/10 border border-warning/30"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-warning/20">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-warning bg-warning/20 px-1.5 py-0.5 rounded">
                      WARNING
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Risk: {alert.riskScore.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{alert.staffName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.fromLocation} → {alert.toLocation}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(alert.fromTime)} - {formatTime(alert.toTime)}</span>
                    <span className="text-warning font-mono">
                      ({alert.timeGapMinutes.toFixed(1)} min)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
