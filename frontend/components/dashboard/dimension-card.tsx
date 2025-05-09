// components/dashboard/dimension-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DimensionType = 'air' | 'water' | 'nature' | 'waste' | 'noise';

interface Metric {
  name: string;
  value: number;
  unit: string;
  score: number;
}

interface DimensionCardProps {
  dimension: DimensionType;
  name: string;
  score: number;
  metrics: Metric[];
  icon: React.ReactNode;
  color?: string;
}

// Expanded mapping for all metric names shown in the UI
const metricLabels: Record<string, string> = {
  // Air metrics
  'pm25_concentration': 'PM2.5 Level',
  'pm2_5': 'PM2.5 Level',
  'pm10_concentration': 'PM10 Level',
  'pm10': 'PM10 Level',
  'no2_concentration': 'NO₂ Level',
  'no2': 'NO₂ Level',
  'o3_concentration': 'Ozone Level',
  'aqi_value': 'Air Quality Index',
  
  // Water metrics
  'water_consumption': 'Water Usage',
  'consumption': 'Water Usage',
  'water_quality_index': 'Quality Index',
  'iii': 'Quality Index',
  'water_treatment_rate': 'Treatment Rate',
  'treatment_compliance': 'Treatment Compliance',
  'drinking_water_compliance': 'Safe Drinking',
  
  // Nature metrics
  'green_area_percentage': 'Green Space',
  'biodiversity_index': 'Biodiversity',
  'tree_canopy_cover': 'Tree Coverage',
  'tree_canopy_pct': 'Tree Cover %',
  'protected_areas': 'Protected Areas',
  'protected_area_pct': 'Protected Area %',
  'bird_species_change_pct': 'Bird Species Change',
  
  // Waste metrics
  'waste_per_capita': 'Waste per Person',
  'recycling_rate': 'Recycling Rate',
  'landfill_diversion': 'Landfill Diversion',
  'landfill_rate': 'Landfill Rate',
  'organic_waste_recovery': 'Organic Recovery',
  
  // Noise metrics
  'noise_level_day': 'Daytime Noise',
  'lden_exposed_pct': 'Day Noise Exposure',
  'noise_level_night': 'Nighttime Noise',
  'lnight_exposed_pct': 'Night Noise Exposure',
  'noise_complaints': 'Complaints',
  'sleep_disturbed_pct': 'Sleep Disturbance'
};

export function DimensionCard({ 
  name, 
  score, 
  metrics, 
  icon,
  color = "#3B82F6"
}: DimensionCardProps) {
  // Determine score category
  let scoreColor = "text-gray-500";
  let badgeColor = "bg-gray-100 text-gray-800";
  let category = "Neutral";
  
  if (score >= 70) {
    scoreColor = "text-green-600";
    badgeColor = "bg-green-100 text-green-800";
    category = "Good";
  } else if (score >= 40) {
    scoreColor = "text-amber-600";
    badgeColor = "bg-amber-100 text-amber-800";
    category = "Moderate";
  } else {
    scoreColor = "text-red-600";
    badgeColor = "bg-red-100 text-red-800";
    category = "Poor";
  }
  
  // Helper function to format metric values
  const formatValue = (value: number): string => {
    // If value is already an integer or has at most 1 decimal place
    if (Number.isInteger(value) || (value.toString().split('.')[1]?.length || 0) <= 1) {
      return value.toString();
    }
    // Otherwise round to 1 decimal place
    return value.toFixed(1);
  };
  
  return (
    <Card className="overflow-hidden">
      <div
        className="h-2"
        style={{ backgroundColor: color }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={badgeColor}>{category}</Badge>
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {Math.round(score)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="space-y-2">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {metricLabels[metric.name] || metric.name.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {formatValue(metric.value)} {metric.unit}
                </span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(metric.score)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}