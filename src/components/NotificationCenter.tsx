import { useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Check,
  CheckCheck,
  Trash2,
  Wifi,
  WifiOff,
  Radio
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useWebSocketAlerts, WebSocketAlert } from '@/lib/websocketAlerts';
import { toast } from 'sonner';

interface NotificationCenterProps {
  onAlertCountChange?: (count: number) => void;
}

export function NotificationCenter({ onAlertCountChange }: NotificationCenterProps) {
  const { 
    alerts, 
    connectionStatus, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAlerts,
    triggerTestAlert 
  } = useWebSocketAlerts();

  // Show toast notifications for new fraud/suspicious alerts
  useEffect(() => {
    if (alerts.length === 0) return;
    
    const latestAlert = alerts[0];
    if (latestAlert.read) return;

    if (latestAlert.type === 'fraud') {
      toast.error(latestAlert.title, {
        description: latestAlert.message,
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => markAsRead(latestAlert.id)
        }
      });
    } else if (latestAlert.type === 'suspicious') {
      toast.warning(latestAlert.title, {
        description: latestAlert.message,
        duration: 7000
      });
    }
  }, [alerts, markAsRead]);

  useEffect(() => {
    onAlertCountChange?.(unreadCount);
  }, [unreadCount, onAlertCountChange]);

  const getAlertIcon = (type: WebSocketAlert['type']) => {
    switch (type) {
      case 'fraud':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'suspicious':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getAlertStyles = (type: WebSocketAlert['type'], read: boolean) => {
    const baseStyles = read ? 'opacity-60' : '';
    switch (type) {
      case 'fraud':
        return cn(baseStyles, 'border-l-4 border-l-destructive bg-destructive/5');
      case 'suspicious':
        return cn(baseStyles, 'border-l-4 border-l-warning bg-warning/5');
      default:
        return cn(baseStyles, 'border-l-4 border-l-primary/50 bg-secondary/30');
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-3 h-3 text-success" />;
      case 'connecting':
        return <Radio className="w-3 h-3 text-warning animate-pulse" />;
      default:
        return <WifiOff className="w-3 h-3 text-destructive" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-mono animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] glass-card border-border/50">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs font-mono">
                {getConnectionIcon()}
                {connectionStatus}
              </Badge>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="gap-1 text-xs"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAlerts}
              disabled={alerts.length === 0}
              className="gap-1 text-xs"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => triggerTestAlert('fraud')}
              className="gap-1 text-xs ml-auto"
            >
              Test Alert
            </Button>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 pr-4">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">Real-time alerts will appear here</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/50',
                    getAlertStyles(alert.type, alert.read)
                  )}
                  onClick={() => !alert.read && markAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {alert.type === 'fraud' ? 'FRAUD ALERT' :
                           alert.type === 'suspicious' ? 'Suspicious Activity' :
                           'Login Activity'}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatTime(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {alert.staffName}
                      </p>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2">
                        {alert.fromLocation} → {alert.toLocation}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs font-mono',
                            alert.riskScore >= 80 ? 'text-destructive border-destructive/30' :
                            alert.riskScore >= 50 ? 'text-warning border-warning/30' :
                            'text-success border-success/30'
                          )}
                        >
                          Risk: {alert.riskScore.toFixed(0)}%
                        </Badge>
                        {alert.read && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Check className="w-3 h-3" /> Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
