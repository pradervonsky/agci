// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Wind, Droplets, Leaf, Recycle, Volume2, AlertTriangle, BarChart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Based on current environmental data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  Air Quality
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Encourage cycling and public transport to maintain air quality levels, which are currently good but could be improved further.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Nature & Biodiversity
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Increase tree canopy coverage in urban areas to improve biodiversity scores and enhance urban cooling effects.
                </p>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h3 className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Recycle className="h-4 w-4" />
                  Waste Management
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Current recycling rate is below target. Consider expanding community recycling programs and adding more recycling stations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
            <CardDescription>Key insights and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="highlights">
              <TabsList className="mb-4">
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
                <TabsTrigger value="areas-for-improvement">Areas for Improvement</TabsTrigger>
              </TabsList>
              
              <TabsContent value="highlights">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Air Quality Improvements</h4>
                      <p className="text-sm text-gray-600">
                        PM2.5 and NO2 levels have improved by 15% since last year, achieving WHO guideline values.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Water Management Success</h4>
                      <p className="text-sm text-gray-600">
                        Reduced water consumption per capita by 7% and infrastructure leakage by 12%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Overall Progress</h4>
                      <p className="text-sm text-gray-600">
                        The Green City Index has improved consistently over the past 12 months, with a 5.2% increase.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="areas-for-improvement">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-600 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Nature & Biodiversity</h4>
                      <p className="text-sm text-gray-600">
                        Tree canopy coverage is still below target levels at 19.3% versus a target of 25%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-600 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Waste Management</h4>
                      <p className="text-sm text-gray-600">
                        Recycling rate of 47.2% remains below the 60% target. More community education needed.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-600 p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Noise Pollution</h4>
                      <p className="text-sm text-gray-600">
                        26.2% of population still exposed to high daytime noise levels. Need better traffic management.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-center">
        <Button variant="outline" size="lg" className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Full Green City Index Report
        </Button>
      </div>
    </div>
  );
}