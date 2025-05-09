// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on your database schema
export type RawMetric = {
  id: string;
  dimension: string;
  metric_name: string;
  value: number;
  unit: string;
  source: string;
  collection_timestamp: string;
};

export type NormalizedScore = {
  id: string;
  dimension: string;
  metric_name: string;
  raw_value: number;
  normalized_score: number;
  calculation_method: string;
  date: string;
};

export type DimensionScore = {
  id: string;
  date: string;
  dimension: string;
  score: number;
};

export type GreenCityIndex = {
  id: string;
  date: string;
  overall_score: number;
  air_score: number;
  water_score: number;
  nature_score: number;
  waste_score: number;
  noise_score: number;
  target_score: number;
};

// Helper functions for fetching data
export async function getLatestIndex(): Promise<GreenCityIndex | null> {
  const { data, error } = await supabase
    .from('green_city_index')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest index:', error);
    return null;
  }

  return data;
}

export async function getHistoricalIndex(days: number = 30): Promise<GreenCityIndex[]> {
  const { data, error } = await supabase
    .from('green_city_index')
    .select('*')
    .order('date', { ascending: true })
    .limit(days);

  if (error) {
    console.error('Error fetching historical index:', error);
    return [];
  }

  return data || [];
}

export async function getDimensionScores(dimension: string, days: number = 30): Promise<DimensionScore[]> {
  const { data, error } = await supabase
    .from('dimension_scores')
    .select('*')
    .eq('dimension', dimension)
    .order('date', { ascending: true })
    .limit(days);

  if (error) {
    console.error(`Error fetching ${dimension} scores:`, error);
    return [];
  }

  return data || [];
}

export async function getNormalizedMetrics(dimension: string, date: string): Promise<NormalizedScore[]> {
  const { data, error } = await supabase
    .from('normalized_scores')
    .select('*')
    .eq('dimension', dimension)
    .eq('date', date);

  if (error) {
    console.error(`Error fetching normalized metrics for ${dimension}:`, error);
    return [];
  }

  return data || [];
}

export async function getRawMetrics(dimension: string, limit: number = 50): Promise<RawMetric[]> {
  const { data, error } = await supabase
    .from('raw_metrics')
    .select('*')
    .eq('dimension', dimension)
    .order('collection_timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching raw metrics for ${dimension}:`, error);
    return [];
  }

  return data || [];
}