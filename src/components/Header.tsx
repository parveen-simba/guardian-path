import { useState } from 'react';
import { Shield, Activity, Settings, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/NotificationCenter';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  alertCount: number;
}

export function Header({ onRefresh, isRefreshing, alertCount }: HeaderProps) {
  const [wsAlertCount, setWsAlertCount] = useState(0);
  
  // Combine static alert count with WebSocket alert count
  const totalAlerts = alertCount + wsAlertCount;

  return (
    <header className="border-b border-border/50 glass-card sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center cyber-glow">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-gradient-cyber">HOSPITAL</span>
                  <span className="text-foreground"> SENTINEL</span>
                </h1>
                <p className="text-xs text-muted-foreground font-mono">
                  Cyber-Physical Security Platform v2.1
                </p>
              </div>
            </Link>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">System Active</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="text-sm font-mono text-muted-foreground">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className={cn(
                'relative',
                isRefreshing && 'animate-spin'
              )}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            
            <NotificationCenter onAlertCountChange={setWsAlertCount} />
            
            <Link to="/staff">
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
