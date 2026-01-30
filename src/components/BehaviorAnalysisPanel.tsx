import { useMemo } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  User,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { LoginLog } from '@/lib/hospitalData';
import { analyzeAllBehavior, getBehaviorSummary, BehaviorPattern } from '@/lib/behaviorAnalysis';

interface BehaviorAnalysisPanelProps {
  logs: LoginLog[];
}

export function BehaviorAnalysisPanel({ logs }: BehaviorAnalysisPanelProps) {
  const behaviorPatterns = useMemo(() => analyzeAllBehavior(logs), [logs]);
  const summary = useMemo(() => getBehaviorSummary(behaviorPatterns), [behaviorPatterns]);

  const getRiskColor = (level: string) => {
    if (level === 'high') return 'text-destructive';
    if (level === 'medium') return 'text-warning';
    return 'text-success';
  };

  const getRiskBadge = (level: string) => {
    const variants = {
      high: 'bg-destructive/20 text-destructive border-destructive/30',
      medium: 'bg-warning/20 text-warning border-warning/30',
      low: 'bg-success/20 text-success border-success/30',
    };
    return variants[level as keyof typeof variants] || variants.low;
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="w-3 h-3 text-destructive" />;
    if (severity === 'warning') return <AlertTriangle className="w-3 h-3 text-warning" />;
    return <Activity className="w-3 h-3 text-muted-foreground" />;
  };

  // Get users with anomalies
  const usersWithAnomalies = behaviorPatterns
    .filter(p => p.anomalies.length > 0)
    .sort((a, b) => b.anomalies.length - a.anomalies.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Summary Card */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-primary" />
            Behavior Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Total Anomalies</p>
              <p className="text-2xl font-mono font-bold">{summary.totalAnomalies}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Avg Behavior Score</p>
              <p className={cn(
                'text-2xl font-mono font-bold',
                summary.avgScore >= 80 ? 'text-success' : 
                summary.avgScore >= 50 ? 'text-warning' : 'text-destructive'
              )}>
                {summary.avgScore.toFixed(0)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-xs text-destructive/80 mb-1">Critical Alerts</p>
              <p className="text-2xl font-mono font-bold text-destructive">{summary.criticalCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-xs text-warning/80 mb-1">Warnings</p>
              <p className="text-2xl font-mono font-bold text-warning">{summary.warningCount}</p>
            </div>
          </div>

          {/* Anomaly Types */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Detected Anomaly Types</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.anomalyTypes).map(([type, count]) => (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className="text-xs font-mono bg-secondary/50"
                >
                  {type.replace(/_/g, ' ')}: {count}
                </Badge>
              ))}
              {Object.keys(summary.anomalyTypes).length === 0 && (
                <span className="text-xs text-muted-foreground">No anomalies detected</span>
              )}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">User Risk Distribution</p>
            <div className="flex gap-2">
              <div className="flex-1 p-2 rounded bg-success/10 border border-success/30 text-center">
                <p className="text-lg font-mono font-bold text-success">
                  {behaviorPatterns.filter(p => p.riskLevel === 'low').length}
                </p>
                <p className="text-xs text-success/80">Low Risk</p>
              </div>
              <div className="flex-1 p-2 rounded bg-warning/10 border border-warning/30 text-center">
                <p className="text-lg font-mono font-bold text-warning">{summary.mediumRiskUsers}</p>
                <p className="text-xs text-warning/80">Medium</p>
              </div>
              <div className="flex-1 p-2 rounded bg-destructive/10 border border-destructive/30 text-center">
                <p className="text-lg font-mono font-bold text-destructive">{summary.highRiskUsers}</p>
                <p className="text-xs text-destructive/80">High Risk</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users with Anomalies */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              User Behavior Profiles
            </span>
            <Badge variant="outline" className="font-mono text-xs">
              {usersWithAnomalies.length} flagged
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {behaviorPatterns.slice(0, 6).map((pattern) => (
                <div 
                  key={pattern.staffId}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    pattern.riskLevel === 'high' ? 'bg-destructive/5 border-destructive/30' :
                    pattern.riskLevel === 'medium' ? 'bg-warning/5 border-warning/30' :
                    'bg-secondary/30 border-border/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{pattern.staffName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {pattern.staffId}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', getRiskBadge(pattern.riskLevel))}>
                      {pattern.riskLevel.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Behavior Score */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Behavior Score</span>
                      <span className={getRiskColor(pattern.riskLevel)}>
                        {pattern.behaviorScore}%
                      </span>
                    </div>
                    <Progress 
                      value={pattern.behaviorScore} 
                      className={cn(
                        'h-1.5',
                        pattern.riskLevel === 'high' ? '[&>div]:bg-destructive' :
                        pattern.riskLevel === 'medium' ? '[&>div]:bg-warning' :
                        '[&>div]:bg-success'
                      )} 
                    />
                  </div>

                  {/* Pattern Info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pattern.patterns.usualLoginHours.start}:00 - {pattern.patterns.usualLoginHours.end}:00
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pattern.patterns.preferredLocations.length} locations
                    </span>
                  </div>

                  {/* Anomalies */}
                  {pattern.anomalies.length > 0 && (
                    <div className="space-y-1">
                      {pattern.anomalies.slice(0, 2).map((anomaly) => (
                        <div 
                          key={anomaly.id}
                          className="flex items-center gap-2 text-xs p-1.5 rounded bg-background/50"
                        >
                          {getSeverityIcon(anomaly.severity)}
                          <span className="truncate">{anomaly.description}</span>
                        </div>
                      ))}
                      {pattern.anomalies.length > 2 && (
                        <p className="text-xs text-muted-foreground pl-5">
                          +{pattern.anomalies.length - 2} more anomalies
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
