// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Wind, Droplets, Leaf, Recycle, Volume2, AlertTriangle, BarChart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScoreCard } from '@/components/dashboard/score-card';
import { DimensionCard } from '@/components/dashboard/dimension-card';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { supabase } from '@/lib/supabase';
// Fix the import by using a relative path if needed
import DimensionRadarChart from '@/components/dashboard/radar-chart';

interface DimensionData {
  score: number;
  metrics: {
    name: string;
    value: number;
    unit: string;
    score: number;
  }[];
}

interface IndexData {
  date: string;
  overall_score: number;
  air_score: number;
  water_score: number;
  nature_score: number;
  waste_score: number;
  noise_score: number;
  target_score: number;
}

interface HistoricalDataPoint {
  date: string;
  value: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  
  const [dimensionData, setDimensionData] = useState<Record<string, DimensionData>>({
    air: { score: 0, metrics: [] },
    water: { score: 0, metrics: [] },
    nature: { score: 0, metrics: [] },
    waste: { score: 0, metrics: [] },
    noise: { score: 0, metrics: [] }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch the latest index data
        const { data: latestIndex, error: indexError } = await supabase
          .from('green_city_index')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .single();
          
        if (indexError) throw indexError;
        setIndexData(latestIndex);
        
        // Fetch historical index data (last 30 days)
        const { data: historicalIndex, error: historyError } = await supabase
          .from('green_city_index')
          .select('date, overall_score')
          .order('date', { ascending: true })
          .limit(30);
          
        if (historyError) throw historyError;
        setHistoricalData(historicalIndex.map(item => ({
          date: item.date,
          value: item.overall_score
        })));
        
        // Fetch normalized metrics for each dimension
        const dimensions = ['air', 'water', 'nature', 'waste', 'noise'];
        const tempDimensionData: Record<string, DimensionData> = {};
        
        for (const dimension of dimensions) {
          // Set the dimension score from the index data
          const dimensionScore = latestIndex[`${dimension}_score` as keyof IndexData] as number;
          
          // Fetch normalized metrics for this dimension
          const { data: metrics, error: metricsError } = await supabase
            .from('normalized_scores')
            .select('*')
            .eq('dimension', dimension)
            .eq('date', latestIndex.date)
            .limit(5);
            
          if (metricsError) throw metricsError;
          
          tempDimensionData[dimension] = {
            score: dimensionScore,
            metrics: metrics.map(metric => ({
              name: metric.metric_name,
              value: metric.raw_value,
              unit: '', // This would normally be determined by metric type
              score: metric.normalized_score
            }))
          };
        }
        
        setDimensionData(tempDimensionData);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!indexData) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No index data available. Please ensure the database has been populated.</AlertDescription>
      </Alert>
    );
  }

  // Calculate trend (this would normally come from comparing with previous period)
  const trend = 0.5;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScoreCard
          title="Overall Score"
          score={indexData.overall_score}
          target={indexData.target_score}
          trend={trend}
          icon={<BarChart className="h-4 w-4" />}
        />
        
        <ScoreCard
          title="Air Quality"
          score={indexData.air_score}
          target={indexData.target_score}
          trend={1.2}
          icon={<Wind className="h-4 w-4" />}
          color="blue"
        />
        
        <ScoreCard
          title="Water"
          score={indexData.water_score}
          target={indexData.target_score}
          trend={0.8}
          icon={<Droplets className="h-4 w-4" />}
          color="cyan"
        />
        
        <ScoreCard
          title="Nature"
          score={indexData.nature_score}
          target={indexData.target_score}
          trend={-0.3}
          icon={<Leaf className="h-4 w-4" />}
          color="emerald"
        />
        
        <ScoreCard
          title="Waste"
          score={indexData.waste_score}
          target={indexData.target_score}
          trend={0.6}
          icon={<Recycle className="h-4 w-4" />}
          color="amber"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendChart 
            title="Green City Index Trend"
            description={`Overall sustainability score (last updated: ${indexData.date})`}
            data={historicalData}
            targetLine={indexData.target_score}
          />
        </div>
        
        <div>
          <DimensionRadarChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DimensionCard 
          dimension="air"
          name="Air Quality"
          score={indexData.air_score}
          metrics={dimensionData.air.metrics}
          icon={<Wind className="h-4 w-4" />}
          color="#3B82F6"
        />
        
        <DimensionCard 
          dimension="water"
          name="Water Management"
          score={indexData.water_score}
          metrics={dimensionData.water.metrics}
          icon={<Droplets className="h-4 w-4" />}
          color="#06B6D4"
        />
        
        <DimensionCard 
          dimension="nature"
          name="Nature & Biodiversity"
          score={indexData.nature_score}
          metrics={dimensionData.nature.metrics}
          icon={<Leaf className="h-4 w-4" />}
          color="#10B981"
        />
        
        <DimensionCard 
          dimension="waste"
          name="Waste & Circular Economy"
          score={indexData.waste_score}
          metrics={dimensionData.waste.metrics}
          icon={<Recycle className="h-4 w-4" />}
          color="#F59E0B"
        />
        
        <DimensionCard 
          dimension="noise"
          name="Noise Pollution"
          score={indexData.noise_score}
          metrics={dimensionData.noise.metrics}
          icon={<Volume2 className="h-4 w-4" />}
          color="#8B5CF6"
        />
        </div>
      </div>
    );
  }
   