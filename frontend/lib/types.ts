// lib/types.ts
export type DimensionType = 'air' | 'water' | 'nature' | 'waste' | 'noise';

export type ScoreCategory = 'good' | 'moderate' | 'poor';

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  goodRange: [number, number];
  moderateRange: [number, number];
  poorRange: [number, number];
}

export interface DimensionDefinition {
  id: DimensionType;
  name: string;
  description: string;
  color: string;
  icon: string;
  metrics: MetricDefinition[];
}

export interface IndexData {
  score: number;
  category: ScoreCategory;
  date: string;
  target: number;
  progress: number;
}

export interface DimensionData extends IndexData {
  dimension: DimensionType;
  metrics: MetricData[];
}

export interface MetricData {
  id: string;
  name: string;
  score: number;
  rawValue: number;
  unit: string;
  category: ScoreCategory;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}
