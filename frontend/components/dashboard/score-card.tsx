import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";


interface ScoreCardProps {
  title: string;
  description?: string;
  score: number;
  target?: number;
  trend?: number; // Positive means improving, negative means worsening
  trendPeriod?: 'week' | 'month' | 'year'; // Added period indication
  icon?: React.ReactNode;
  color?: string;
}

export function ScoreCard({ 
  title, 
  description, 
  score, 
  target = 70, 
  trend, 
  trendPeriod = 'month', // Default to month
  icon
}: ScoreCardProps) {
  // Calculate progress percentage relative to target
  const progress = Math.min(100, Math.round((score / target) * 100));
  
  // Determine score category and colors
  let scoreColor = "text-gray-500";
  let progressFillColor = "bg-green-500";
  
  if (score >= 70) {
    scoreColor = "text-green-600";
    progressFillColor = "bg-green-500";
  } else if (score >= 40) {
    scoreColor = "text-amber-600";
    progressFillColor = "bg-amber-500";
  } else {
    scoreColor = "text-red-600";
    progressFillColor = "bg-red-500";
  }
  

  // Get trend period display text
  const trendPeriodDisplay = {
    'week': 'WoW',
    'month': 'MoM',
    'year': 'YoY'
  }[trendPeriod];

  // Always show progress bar in color, even if progress is 100%
  const displayWidth = Math.max(5, progress); // Ensure at least 5% width for visibility

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-sm font-medium flex items-center gap-2 h-6">
            {icon && <span>{icon}</span>}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {trend !== undefined && (
          <Badge variant={trend >= 0 ? "outline" : "destructive"} className="flex items-center gap-1">
            {trend >= 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
            <span className="ml-0.5 text-[10px] opacity-75">{trendPeriodDisplay}</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          <span className={scoreColor}>{Math.round(score)}</span>
          <span className="text-gray-400 text-xs font-normal ml-1">/ 100</span>
        </div>
        
        {/* Fixed Progress Bar Implementation */}
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={progressFillColor + " h-full rounded-full"} 
            style={{ width: `${displayWidth}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {progress}% to target ({target})
        </p>
      </CardContent>
    </Card>
  );
}