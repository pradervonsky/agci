// components/dashboard/score-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ScoreCardProps {
  title: string;
  description?: string;
  score: number;
  target?: number;
  trend?: number; // Positive means improving, negative means worsening
  icon?: React.ReactNode;
  color?: string;
}

export function ScoreCard({ 
  title, 
  description, 
  score, 
  target = 70, 
  trend, 
  icon,
  color 
}: ScoreCardProps) {
  // Calculate progress percentage
  const progress = Math.min(100, Math.round((score / target) * 100));
  
  // Determine score category
  let scoreColor = "text-gray-500";
  let progressColor = "bg-gray-500";
  
  if (score >= 70) {
    scoreColor = "text-green-600";
    progressColor = "bg-green-500";
  } else if (score >= 40) {
    scoreColor = "text-amber-600";
    progressColor = "bg-amber-500";
  } else {
    scoreColor = "text-red-600";
    progressColor = "bg-red-500";
  }
  
  // Use custom color if provided
  if (color) {
    scoreColor = `text-${color}-600`;
    progressColor = `bg-${color}-500`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
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
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          <span className={scoreColor}>{Math.round(score)}</span>
          <span className="text-gray-400 text-xs font-normal ml-1">/ 100</span>
        </div>
        <Progress value={progress} className={progressColor} />
        <p className="text-xs text-gray-500 mt-2">
          {progress}% to target ({target})
        </p>
      </CardContent>
    </Card>
  );
}