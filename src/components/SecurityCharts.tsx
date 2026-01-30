import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { TravelAnalysis, LoginLog } from '@/lib/hospitalData';

interface SecurityChartsProps {
  analyses: TravelAnalysis[];
  logs: LoginLog[];
}

export function SecurityCharts({ analyses, logs }: SecurityChartsProps) {
  // Status distribution for pie chart
  const statusCounts = {
    safe: analyses.filter(a => a.status === 'safe').length,
    suspicious: analyses.filter(a => a.status === 'suspicious').length,
    impossible: analyses.filter(a => a.status === 'impossible').length,
  };

  const pieData = [
    { name: 'Safe', value: statusCounts.safe, color: '#00E5A0' },
    { name: 'Suspicious', value: statusCounts.suspicious, color: '#FF9500' },
    { name: 'Fraud Alert', value: statusCounts.impossible, color: '#FF3B5C' },
  ];

  // Location activity for bar chart
  const locationActivity: { [key: string]: number } = {};
  logs.forEach(log => {
    locationActivity[log.locationName] = (locationActivity[log.locationName] || 0) + 1;
  });

  const barData = Object.entries(locationActivity)
    .map(([name, count]) => ({ name: name.length > 10 ? name.slice(0, 10) + '...' : name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Risk score timeline
  const timelineData = analyses
    .slice(0, 12)
    .map((a, i) => ({
      time: `T-${12 - i}`,
      risk: a.riskScore,
      status: a.status,
    }))
    .reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Status Distribution Pie */}
      <div className="glass-card rounded-xl border border-border/50 p-4">
        <h3 className="font-semibold mb-4 text-sm">Access Status Distribution</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(220 40% 8%)', 
                  border: '1px solid hsl(220 30% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(180 100% 95%)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: 'hsl(215 20% 55%)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Activity Bar */}
      <div className="glass-card rounded-xl border border-border/50 p-4">
        <h3 className="font-semibold mb-4 text-sm">Activity by Location</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" stroke="hsl(215 20% 55%)" fontSize={10} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(215 20% 55%)" 
                fontSize={10}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(220 40% 8%)', 
                  border: '1px solid hsl(220 30% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(180 100% 95%)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(160 100% 45%)" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Score Timeline */}
      <div className="glass-card rounded-xl border border-border/50 p-4">
        <h3 className="font-semibold mb-4 text-sm">Risk Score Timeline</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 30% 18%)" />
              <XAxis dataKey="time" stroke="hsl(215 20% 55%)" fontSize={10} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={10} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(220 40% 8%)', 
                  border: '1px solid hsl(220 30% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(180 100% 95%)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="risk" 
                stroke="hsl(160 100% 45%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(160 100% 45%)', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: 'hsl(160 100% 60%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
