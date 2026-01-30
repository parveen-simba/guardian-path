import { useEffect, useState } from 'react';
import { 
  Fingerprint, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Monitor,
  Cpu,
  Globe,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { generateDeviceFingerprint, DeviceFingerprint } from '@/lib/deviceFingerprint';

export function DeviceFingerprintPanel() {
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);

  useEffect(() => {
    setFingerprint(generateDeviceFingerprint());
  }, []);

  if (!fingerprint) return null;

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getTrustBg = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <Fingerprint className="w-5 h-5 text-primary" />
            Device Fingerprint
          </span>
          <Badge 
            variant="outline" 
            className={cn(
              'font-mono text-xs',
              fingerprint.isKnownDevice 
                ? 'bg-success/20 text-success border-success/30' 
                : 'bg-warning/20 text-warning border-warning/30'
            )}
          >
            {fingerprint.isKnownDevice ? 'KNOWN DEVICE' : 'NEW DEVICE'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fingerprint ID */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Fingerprint ID</p>
            <p className="font-mono font-bold">{fingerprint.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Trust Score</p>
            <p className={cn('text-2xl font-mono font-bold', getTrustColor(fingerprint.trustScore))}>
              {fingerprint.trustScore}%
            </p>
          </div>
        </div>

        {/* Trust Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Device Trust Level</span>
            <span className={getTrustColor(fingerprint.trustScore)}>
              {fingerprint.trustScore >= 80 ? 'Trusted' : fingerprint.trustScore >= 50 ? 'Moderate' : 'Suspicious'}
            </span>
          </div>
          <Progress value={fingerprint.trustScore} className={cn('h-2', getTrustBg(fingerprint.trustScore))} />
        </div>

        {/* Device Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Screen</span>
            </div>
            <p className="text-sm font-mono">{fingerprint.components.screenResolution}</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">CPU Cores</span>
            </div>
            <p className="text-sm font-mono">{fingerprint.components.hardwareConcurrency || 'N/A'}</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Timezone</span>
            </div>
            <p className="text-sm font-mono truncate">{fingerprint.components.timezone.split('/')[1] || fingerprint.components.timezone}</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">First Seen</span>
            </div>
            <p className="text-sm font-mono">{fingerprint.firstSeen.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Risk Factors */}
        {fingerprint.riskFactors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Risk Factors</p>
            <div className="space-y-1">
              {fingerprint.riskFactors.map((factor, i) => (
                <div 
                  key={i}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded text-xs',
                    factor.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    factor.severity === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-muted/50 text-muted-foreground'
                  )}
                >
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{factor.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {fingerprint.riskFactors.length === 0 && (
          <div className="flex items-center gap-2 p-2 rounded bg-success/10 text-success text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>No risk factors detected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
