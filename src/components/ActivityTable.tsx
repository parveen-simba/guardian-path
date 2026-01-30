import { TravelAnalysis } from '@/lib/hospitalData';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Clock, Gauge, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface ActivityTableProps {
  data: TravelAnalysis[];
}

export function ActivityTable({ data }: ActivityTableProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, 'hospital-sentinel-logs');
      toast.success('CSV exported successfully', {
        description: `${data.length} records exported`
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'Unable to export CSV file'
      });
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(data, 'hospital-sentinel-report');
      toast.success('PDF report generated', {
        description: `${data.length} records included`
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'Unable to generate PDF report'
      });
    }
  };

  const getStatusBadge = (status: string, riskScore: number) => {
    const variants = {
      safe: 'bg-success/20 text-success border-success/30',
      suspicious: 'bg-warning/20 text-warning border-warning/30',
      impossible: 'bg-destructive/20 text-destructive border-destructive/30 animate-pulse',
    };
    
    const labels = {
      safe: 'SAFE',
      suspicious: 'SUSPICIOUS',
      impossible: 'FRAUD ALERT',
    };
    
    return (
      <Badge 
        variant="outline" 
        className={cn('font-mono text-xs', variants[status as keyof typeof variants])}
      >
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 50) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Travel Analysis Log
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2 text-xs"
          >
            <FileText className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Staff</TableHead>
              <TableHead className="text-muted-foreground font-medium">Route</TableHead>
              <TableHead className="text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time Gap
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">Distance</TableHead>
              <TableHead className="text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  <Gauge className="w-4 h-4" />
                  Speed
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">Risk</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((row) => (
              <TableRow 
                key={row.id} 
                className={cn(
                  'border-border/30 transition-colors',
                  row.status === 'impossible' && 'bg-destructive/5',
                  row.status === 'suspicious' && 'bg-warning/5'
                )}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{row.staffName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatTime(row.fromTime)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-secondary px-2 py-1 rounded">
                      {row.fromLocation}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm bg-secondary px-2 py-1 rounded">
                      {row.toLocation}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'font-mono',
                    row.timeGapMinutes < row.requiredTimeMinutes * 0.5 && 'text-destructive'
                  )}>
                    {row.timeGapMinutes.toFixed(1)} min
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    (req: {row.requiredTimeMinutes.toFixed(1)} min)
                  </span>
                </TableCell>
                <TableCell className="font-mono">
                  {row.distanceMeters.toFixed(0)} m
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'font-mono',
                    row.speedKmh > 25 && 'text-destructive font-bold'
                  )}>
                    {row.speedKmh.toFixed(1)} km/h
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all',
                          row.riskScore >= 80 ? 'bg-destructive' :
                          row.riskScore >= 50 ? 'bg-warning' : 'bg-success'
                        )}
                        style={{ width: `${row.riskScore}%` }}
                      />
                    </div>
                    <span className={cn('font-mono text-sm', getRiskColor(row.riskScore))}>
                      {row.riskScore.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(row.status, row.riskScore)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
