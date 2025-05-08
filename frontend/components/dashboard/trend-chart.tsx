// components/dashboard/trend-chart.tsx
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface DataPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  color?: string;
  targetLine?: number;
  unit?: string;
  minY?: number; // Added to support dynamic Y-axis minimum
}

export function TrendChart({ 
  title, 
  description, 
  data, 
  color = "#3B82F6", 
  targetLine, 
  unit = '',
  minY
}: TrendChartProps) {
  
  // Format date for tooltip
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PP');
    } catch {
      // Ignoring any parsing errors
      return dateString;
    }
  };

  // Calculate the minimum Y value dynamically if not provided
  const dynamicMinY = minY !== undefined 
    ? minY 
    : (data.length > 0 
      ? Math.max(0, Math.min(...data.map(d => d.value)) - 5) 
      : 0);
  
  // Calculate maximum Y value (with some padding)
  const maxY = data.length > 0 
    ? Math.max(...data.map(d => d.value), targetLine || 0) + 5 
    : 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  try {
                    return format(parseISO(value), 'MMM d');
                  } catch {
                    return value;
                  }
                }}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                domain={[dynamicMinY, maxY]} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}${unit}`, 'Score']}
                labelFormatter={formatDate}
                contentStyle={{ 
                  borderRadius: '6px', 
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
              {targetLine && (
                <ReferenceLine 
                  y={targetLine} 
                  stroke="#9CA3AF" 
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{ 
                    value: `Target: ${targetLine}${unit}`, 
                    position: 'insideBottomRight',
                    fill: '#6B7280',
                    fontSize: 12 
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}