import { hospitalLocations, TravelAnalysis } from '@/lib/hospitalData';
import { cn } from '@/lib/utils';

interface LocationMapProps {
  analyses: TravelAnalysis[];
}

export function LocationMap({ analyses }: LocationMapProps) {
  // Get locations with alerts
  const alertLocations = new Set<string>();
  analyses.filter(a => a.status !== 'safe').forEach(a => {
    alertLocations.add(a.fromLocation);
    alertLocations.add(a.toLocation);
  });

  // Map positions for visual representation (simplified 2D grid)
  const locationPositions: { [key: string]: { x: number; y: number } } = {
    'Reception': { x: 50, y: 85 },
    'Pharmacy': { x: 20, y: 60 },
    'ICU': { x: 50, y: 40 },
    'Emergency Ward': { x: 80, y: 60 },
    'Operation Theatre': { x: 35, y: 20 },
    'Radiology': { x: 65, y: 20 },
    'Pathology Lab': { x: 20, y: 85 },
    'Cardiology': { x: 80, y: 30 },
  };

  return (
    <div className="glass-card rounded-xl border border-border/50 p-4 h-full">
      <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        Hospital Floor Map
      </h3>
      
      <div className="relative bg-secondary/30 rounded-lg h-64 overflow-hidden grid-cyber">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {analyses.filter(a => a.status !== 'safe').slice(0, 3).map((analysis, i) => {
            const from = locationPositions[analysis.fromLocation];
            const to = locationPositions[analysis.toLocation];
            if (!from || !to) return null;
            
            return (
              <line
                key={i}
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={analysis.status === 'impossible' ? 'hsl(0 100% 55%)' : 'hsl(35 100% 50%)'}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Location Nodes */}
        {hospitalLocations.map((location) => {
          const pos = locationPositions[location.name];
          if (!pos) return null;
          
          const hasAlert = alertLocations.has(location.name);
          
          return (
            <div
              key={location.id}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
              )}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 transition-all',
                hasAlert 
                  ? 'bg-destructive border-destructive animate-pulse scale-125' 
                  : 'bg-primary/50 border-primary'
              )} />
              <div className={cn(
                'absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded',
                hasAlert ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground'
              )}>
                {location.name}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-muted-foreground">Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
}
