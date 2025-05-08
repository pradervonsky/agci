// components/dashboard/dimension-card.tsx
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

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

export function DimensionCard({ 
  dimension, 
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
      <CardContent className="pb-3">
        <div className="space-y-2">
          {metrics.slice(0, 2).map((metric) => (
            <div key={metric.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{metric.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {metric.value} {metric.unit}
                </span>
                <Badge variant="outline" className="text-xs">
                  {metric.score}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link
          href={`/dashboard/${dimension}`}
          className="text-xs text-gray-500 hover:text-gray-900 flex items-center"
        >
          View details
          <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}