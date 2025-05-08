import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

// Define the types for our data
interface DimensionScore {
  dimension: string;
  fullMark: number;
  value: number;
}

interface TooltipPayloadItem {
  payload: DimensionScore;
  value: number;
  name: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

// Label mapping for dimensions
const dimensionLabels: Record<string, string> = {
  air: 'Air Quality',
  water: 'Water Management',
  nature: 'Nature & Biodiversity',
  waste: 'Waste & Circular Economy',
  noise: 'Noise Pollution'
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 shadow rounded border border-gray-200 text-sm">
        <p className="font-semibold">{dimensionLabels[data.dimension]}</p>
        <p>Score: <span className="font-medium">{data.value.toFixed(1)}</span></p>
      </div>
    );
  }
  return null;
};

// Dimension colors
const dimensionColors: Record<string, string> = {
  current: '#10b981',   // Green
  lastMonth: '#6366f1', // Indigo
  lastYear: '#9ca3af'   // Gray
};

const DimensionRadarChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('current');
  const [data, setData] = useState<Record<string, DimensionScore[]>>({
    current: [],
    lastMonth: [],
    lastYear: []
  });

  useEffect(() => {
    // Function to fetch dimension scores from Supabase
    async function fetchDimensionScores() {
      try {
        setLoading(true);
        
        // Get dates for the different time ranges
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);
        
        // Fetch the most recent scores
        const { data: currentData, error: currentError } = await supabase
          .from('green_city_index')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .single();
        
        if (currentError) throw currentError;
        
        // For demo purposes, we're generating simulated historical data
        // In a real app, you would fetch this from your database
        
        // Current data
        const currentScores: DimensionScore[] = [
          { dimension: 'air', fullMark: 100, value: currentData.air_score },
          { dimension: 'water', fullMark: 100, value: currentData.water_score },
          { dimension: 'nature', fullMark: 100, value: currentData.nature_score },
          { dimension: 'waste', fullMark: 100, value: currentData.waste_score },
          { dimension: 'noise', fullMark: 100, value: currentData.noise_score }
        ];
        
        // Simulated last month scores
        const lastMonthScores: DimensionScore[] = currentScores.map(score => ({
          ...score,
          value: Math.max(0, score.value - (Math.random() * 10))
        }));
        
        // Simulated last year scores
        const lastYearScores: DimensionScore[] = currentScores.map(score => ({
          ...score,
          value: Math.max(0, score.value - (Math.random() * 20))
        }));
        
        setData({
          current: currentScores,
          lastMonth: lastMonthScores,
          lastYear: lastYearScores
        });
        
      } catch (err) {
        console.error('Error fetching dimension scores:', err);
        setError('Failed to load dimension data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDimensionScores();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
          <CardDescription>Loading dimension data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dimension Scores</CardTitle>
            <CardDescription>Sustainability performance by category</CardDescription>
          </div>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="lastYear">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data[timeRange]}>
              <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                tickFormatter={(value) => dimensionLabels[value]}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Radar 
                name="Score" 
                dataKey="value" 
                stroke={dimensionColors[timeRange]} 
                fill={dimensionColors[timeRange]} 
                fillOpacity={0.5} 
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 gap-4 flex-wrap">
          {Object.keys(dimensionLabels).map(dim => (
            <div key={dim} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: 
                    dim === 'air' ? '#3B82F6' : 
                    dim === 'water' ? '#06B6D4' : 
                    dim === 'nature' ? '#10B981' : 
                    dim === 'waste' ? '#F59E0B' : 
                    '#8B5CF6'
                }}
              ></div>
              <span className="text-xs text-gray-600">{dimensionLabels[dim]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DimensionRadarChart;