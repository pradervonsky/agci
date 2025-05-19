// components/dashboard/dimension-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { dimensionsConfig } from "@/lib/utils";

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
  description?: string;
  score: number;
  metrics: Metric[];
  icon: React.ReactNode;
  color?: string;
}

export function DimensionCard({ 
  dimension, 
  name, 
  description, 
  score, 
  metrics, 
  icon,
  color = "#3B82F6"
}: DimensionCardProps) {
  console.log("Metrics:", metrics);
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

  // Get dimension config for descriptions
  const dimensionConfig = dimensionsConfig[dimension];
  
  // Helper function to get metric details
  const getMetricDetails = (metricName: string) => {
    const foundMetric = dimensionConfig?.metrics.find(
      m => m.name === metricName || m.id === metricName
    );
    return {
      name: foundMetric?.name || metricName,
      description: foundMetric?.description || "No description available",
      unit: foundMetric?.unit || "",
    };
  };
  
  
  // Helper function to format value
  const formatValue = (value: number): string => {
    if (Number.isInteger(value) || (value.toString().split('.')[1]?.length || 0) <= 1) {
      return value.toString();
    }
    return value.toFixed(1);
  };
  
  return (
    <Card className="h-full overflow-hidden">
      <div
        className="h-2"
        style={{ backgroundColor: color }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-1">
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            {name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={badgeColor}>{category}</Badge>
            <div className={`text-2xl font-bold ${scoreColor}`}>
              {Math.round(score)}
            </div>
          </div>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 text-xs font-medium text-gray-500 mb-1">
            <div>Metric</div>
            <div className="text-right">Value</div>
            <div className="text-right">Score</div>
          </div>
          
          {metrics.map((metric) => {
            const { name: displayName, description } = getMetricDetails(metric.name);
            return (
              <div key={metric.name} className="grid grid-cols-3 items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 truncate mr-1">{displayName}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="text-right text-sm font-medium">
                  {formatValue(metric.value)} <span className="text-xs text-gray-500">{metric.unit}</span>
                </div>
                
                <div className="flex justify-end">
                  <Badge variant="outline" className={
                    metric.score >= 70 ? "bg-green-50 text-green-700 border-green-200" :
                    metric.score >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }>
                    {Math.round(metric.score)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}