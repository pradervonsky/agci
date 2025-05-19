// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import { format, parseISO } from 'date-fns';
import { ScoreCategory, DimensionType } from './types';

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy');
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 70) return 'good';
  if (score >= 40) return 'moderate';
  return 'poor';
}

export function getScoreColor(category: ScoreCategory): string {
  switch (category) {
    case 'good':
      return 'bg-green-500';
    case 'moderate':
      return 'bg-amber-500';
    case 'poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getTextColor(category: ScoreCategory): string {
  switch (category) {
    case 'good':
      return 'text-green-500';
    case 'moderate':
      return 'text-amber-500';
    case 'poor':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

export function getDimensionColor(dimension: DimensionType): string {
  switch (dimension) {
    case 'air':
      return '#3B82F6'; // blue-500
    case 'water':
      return '#06B6D4'; // cyan-500
    case 'nature':
      return '#10B981'; // emerald-500
    case 'waste':
      return '#F59E0B'; // amber-500
    case 'noise':
      return '#8B5CF6'; // violet-500
    default:
      return '#6B7280'; // gray-500
  }
}

export function calculateProgress(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

export const dimensionsConfig = {
  air: {
    id: 'air',
    name: 'Air Quality',
    description: 'Measures particulate matter and pollution levels in the city air',
    color: '#3B82F6',
    icon: 'Wind',
    metrics: [
      {
        id: 'pm2_5',
        name: 'PM2.5',
        description: 'Fine particulate matter 2.5 micrometers or smaller',
        unit: 'μg/m³',
        goodRange: [0, 5],
        moderateRange: [5, 15],
        poorRange: [15, 40]
      },
      {
        id: 'pm10',
        name: 'PM10',
        description: 'Particulate matter 10 micrometers or smaller',
        unit: 'μg/m³',
        goodRange: [0, 15],
        moderateRange: [15, 30],
        poorRange: [30, 50]
      },
      {
        id: 'no2',
        name: 'Nitrogen Dioxide',
        description: 'Toxic gas produced by combustion',
        unit: 'μg/m³',
        goodRange: [0, 10],
        moderateRange: [10, 25],
        poorRange: [25, 40]
      }
    ]
  },
  water: {
    id: 'water',
    name: 'Water Management',
    description: 'Measures water usage, leakage, and treatment quality',
    color: '#06B6D4',
    icon: 'Droplets',
    metrics: [
      {
        id: 'consumption',
        name: 'Water Consumption',
        description: 'Daily household water usage',
        unit: 'L/capita/day',
        goodRange: [0, 100],
        moderateRange: [100, 200],
        poorRange: [200, 300]
      },
      {
        id: 'ili',
        name: 'Infrastructure Leakage Index (ILI)',
        description: 'Measure of water lost through leaks',
        unit: 'ratio',
        goodRange: [0, 1.5],
        moderateRange: [1.5, 4],
        poorRange: [4, 8]
      },
      {
        id: 'treatment_compliance',
        name: 'Treatment Compliance',
        description: 'Wastewater compliance with EU directives',
        unit: '%',
        goodRange: [95, 100],
        moderateRange: [80, 95],
        poorRange: [0, 80]
      }
    ]
  },
  nature: {
    id: 'nature',
    name: 'Nature & Biodiversity',
    description: 'Measures protected areas, tree coverage, and wildlife health',
    color: '#10B981',
    icon: 'Leaf',
    metrics: [
      {
        id: 'protected_area_pct',
        name: 'Protected Areas',
        description: 'Percentage of city land protected or reserved for nature',
        unit: '%',
        goodRange: [8, 100],
        moderateRange: [4, 8],
        poorRange: [0, 4]
      },
      {
        id: 'tree_canopy_pct',
        name: 'Tree Canopy',
        description: 'Percentage of city covered by tree canopy',
        unit: '%',
        goodRange: [25, 100],
        moderateRange: [15, 25],
        poorRange: [0, 15]
      },
      {
        id: 'bird_species_change_pct',
        name: 'Bird Species Change',
        description: 'Percentage change in bird species counts',
        unit: '%',
        goodRange: [0, 100],
        moderateRange: [-10, 0],
        poorRange: [-100, -10]
      }
    ]
  },
  waste: {
    id: 'waste',
    name: 'Waste & Circular Economy',
    description: 'Measures waste generation, recycling, and landfill usage',
    color: '#F59E0B',
    icon: 'Recycle',
    metrics: [
      {
        id: 'waste_per_capita',
        name: 'Waste Generation',
        description: 'Annual waste produced per person',
        unit: 'tonnes/year',
        goodRange: [0, 0.3],
        moderateRange: [0.3, 0.5],
        poorRange: [0.5, 1]
      },
      {
        id: 'recycling_rate',
        name: 'Recycling Rate',
        description: 'Percentage of waste that is recycled',
        unit: '%',
        goodRange: [60, 100],
        moderateRange: [30, 60],
        poorRange: [0, 30]
      },
      {
        id: 'landfill_rate',
        name: 'Landfill Rate',
        description: 'Percentage of waste sent to landfill',
        unit: '%',
        goodRange: [0, 10],
        moderateRange: [10, 30],
        poorRange: [30, 100]
      }
    ]
  },
  noise: {
    id: 'noise',
    name: 'Noise Pollution',
    description: 'Measures noise levels and effects on population',
    color: '#8B5CF6',
    icon: 'Volume2',
    metrics: [
      {
        id: 'lden_exposed_pct',
        name: 'Daytime Noise Exposure',
        description: 'Population exposed to high daytime noise levels',
        unit: '%',
        goodRange: [0, 15],
        moderateRange: [15, 30],
        poorRange: [30, 100]
      },
      {
        id: 'lnight_exposed_pct',
        name: 'Nighttime Noise Exposure',
        description: 'Population exposed to high nighttime noise levels',
        unit: '%',
        goodRange: [0, 10],
        moderateRange: [10, 20],
        poorRange: [20, 100]
      },
      {
        id: 'sleep_disturbed_pct',
        name: 'Sleep Disturbance',
        description: 'Population experiencing sleep issues due to noise',
        unit: '%',
        goodRange: [0, 5],
        moderateRange: [5, 10],
        poorRange: [10, 100]
      }
    ]
  }
} as const;

export type DimensionConfig = typeof dimensionsConfig;