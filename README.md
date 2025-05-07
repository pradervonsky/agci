## Changelog

### [v1.0] – 2025-05-06
- Created backend login with api connectors and data simulations
- Implemented metrics and index calculations based on WHO and EU targets (aligned with Green City Accord Indicators Guidebook (2024))
- Implemented Database Infrastrucure in Supabase


### [v0.2] – 2025-04-30
- New concept using a video to project animal faces
- Those faces can change color (red/orange/green) based on the index of Aarhus Green City Index (WIP, not yet implemented)
- Put the 3D concept in the legacy folder

### [v0.1] – 2025-04-17
- A website concept with a 3D object of a low-poly tree
- Featuring window tracking with phone



# Aarhus Green City Index (AGCI)

## Project Overview

The Aarhus Green City Index (AGCI) is a comprehensive environmental monitoring system that collects, processes, and visualizes sustainability metrics for the city of Aarhus, Denmark. The system generates an environmental health score across five key dimensions:

- Air Quality
- Water Management
- Nature & Biodiversity
- Waste & Circular Economy
- Noise Pollution

The results are visualized through an interactive installation featuring animal faces that change colors (red/orange/green) based on the environmental scores.

## Repository Structure

```
agci/
├── backend/
│   ├── collectors/              # Data collectors for each environmental dimension
│   ├── pipeline/                # Data processing and index calculation
│   ├── storage/                 # Database interaction (Supabase)
│   ├── installation/            # Physical installation controllers
│   └── tests/                   # Test scripts
├── data/processed/              # Storage for processed index data
├── legacy/                      # Previous version of the frontend (3D tree)
└── [frontend files]             # Current frontend (HTML, CSS, JavaScript)
```

## Database Structure (Supabase)

The system uses Supabase as its backend database with the following tables:

1. **`raw_metrics`**:
   - `id` (uuid): Primary key
   - `dimension` (text): Environmental dimension (air, water, nature, waste, noise)
   - `metric_name` (text): Metric identifier
   - `value` (float): Raw measured value
   - `unit` (text): Measurement unit
   - `source` (text): Data source (API or Simulated)
   - `collection_timestamp` (datetime): Collection time

2. **`normalized_scores`**:
   - `id` (uuid): Primary key
   - `dimension` (text): Environmental dimension
   - `metric_name` (text): Metric identifier
   - `raw_value` (float): Original raw value
   - `normalized_score` (float): Score from 0-100
   - `calculation_method` (text): Method used for normalization
   - `date` (date): Calculation date

3. **`dimension_scores`**:
   - `id` (uuid): Primary key
   - `date` (date): Calculation date
   - `dimension` (text): Environmental dimension
   - `score` (float): Normalized dimension score

4. **`green_city_index`**:
   - `id` (uuid): Primary key
   - `date` (date): Calculation date
   - `overall_score` (float): Overall index score
   - `air_score` (float): Air quality score
   - `water_score` (float): Water management score
   - `nature_score` (float): Nature & biodiversity score
   - `waste_score` (float): Waste & circular economy score
   - `noise_score` (float): Noise pollution score
   - `target_score` (float): Target score for comparison

## Environmental Metrics Collection

The system collects data for each environmental dimension using specialized collector classes:

### Air Quality

**Class**: `AirQualityCollector` 

**Data Source**: Real-time air quality data from Open-Meteo API (`https://air-quality-api.open-meteo.com/v1/air-quality`)

**Metrics**:
- PM2.5 particulate matter concentration (μg/m³)
- PM10 particulate matter concentration (μg/m³)
- NO2 nitrogen dioxide concentration (μg/m³)

**Normalization**:
- PM2.5: 100 points at 5μg/m³ (WHO guideline), 0 points at 25μg/m³ (EU limit)
- PM10: 100 points at 15μg/m³ (WHO guideline), 0 points at 40μg/m³ (EU limit)
- NO2: 100 points at 10μg/m³ (WHO guideline), 0 points at 40μg/m³ (EU limit)

### Water Management

**Class**: `WaterManagementSimulator`

**Data Source**: Simulated data based on Danish water consumption patterns

**Metrics**:
- Water consumption (liters per capita per day)
- Infrastructure Leakage Index (ILI)
- Treatment compliance with EU directives (%)

**Normalization**:
- Water consumption: 100 points at 100L/capita/day, 0 points at 200L/capita/day
- ILI: 100 points at 1.0 (no leakage), 0 points at 6.0
- Treatment compliance: 100 points at 100% compliance, 0 points below 50% compliance

### Nature & Biodiversity

**Class**: `NatureBiodiversitySimulator`

**Data Source**: Simulated data with seasonal variations

**Metrics**:
- Protected area percentage (%)
- Tree canopy coverage (%)
- Bird species change percentage (%)

**Normalization**:
- Protected area: 100 points at 10%+, 0 points at 0%
- Tree canopy: 100 points at 30%+, 0 points at 5% or below
- Bird species change: 100 points at +20%, 0 points at -20%

### Waste & Circular Economy

**Class**: `WasteSimulator`

**Data Source**: Simulated waste data with seasonal and holiday patterns

**Metrics**:
- Waste generation per capita (tonnes/year)
- Recycling rate (%)
- Landfill rate (%)

**Normalization**:
- Waste per capita: 100 points at 0.2 tonnes/year, 0 points at 0.7 tonnes/year
- Recycling rate: Direct percentage (100% recycling = 100 points)
- Landfill rate: 100 points at 0%, 0 points at 60%+

### Noise Pollution

**Class**: `NoiseSimulator`

**Data Source**: Simulated noise data with daily and seasonal patterns

**Metrics**:
- Population exposed to Lden ≥ 55 dB (%)
- Population exposed to Lnight ≥ 50 dB (%)
- Population with high sleep disturbance (%)

**Normalization**:
- Lden exposure: 100 points at 0%, 0 points at 40%+
- Lnight exposure: 100 points at 0%, 0 points at 40%+
- Sleep disturbance: 100 points at 0%, 0 points at 25%+

## Index Calculation

The Green City Index is calculated in three steps:

1. **Raw Data Collection**: Each collector generates or retrieves metrics for its environmental dimension

2. **Normalization**: Raw metrics are converted to normalized scores (0-100) based on their respective thresholds

3. **Index Calculation**:
   - Each dimension score is the average of its normalized metrics
   - The overall index is a weighted average of the five dimension scores
   - Default weights are 20% per dimension

## Known Issues

1. **Database Type Mismatch**: There's a type mismatch when inserting into the `green_city_index` table. The error occurs because floating-point values are being sent to an integer column:
   ```
   Failed to store index: {'code': '22P02', 'details': None, 'hint': None, 'message': 'invalid input syntax for type integer: "100.0"'}
   ```

2. **Missing Dimension Scores**: The code attempts to store individual dimension scores, but there's no evidence in the logs that the `store_dimension_score()` method is being called correctly.

## Frontend Visualization

The frontend visualizes the Green City Index through:

1. **Animal Faces**: Digital projections that change expressions and colors based on environmental scores
2. **Color System**:
   - Green (70-100): Excellent environmental conditions
   - Orange (40-69): Moderate environmental conditions
   - Red (0-39): Poor environmental conditions
3. **Background Effects**: Dynamic sky effects that change based on time of day and index values

## Installation & Setup

### Prerequisites
- Python 3.8+
- Supabase account with project set up
- Environment variables for Supabase access:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`

  - in the root of the directory create `.env` file with these two environment variables

### Installation Steps
1. Clone the repository
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Configure Supabase credentials as environment variables
4. Run initial setup: `python -m backend.storage.setup_database`
5. Execute data collection: `python -m backend.pipeline.green_city_index`

### Running Tests
- Test Supabase connection: `python -m backend.tests.test_supabase_connection`
- Test simulations: `python -m backend.tests.test_simulation`

## Troubleshooting

### Common Issues:
1. **Database Connection Errors**:
   - Verify Supabase credentials are correctly set
   - Check if Supabase service is running

2. **Missing Data**:
   - Verify that all collectors are running properly

3. **Type Mismatch in Database**:
   - Ensure Supabase table schemas match expected types:
     - Score columns should be `float8` or `numeric` not `integer`
   - Adjust normalization functions if needed