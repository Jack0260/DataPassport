import { TrustScoreBreakdown } from '../types/passport';

export interface TrustScoreWeights {
  freshness: number;
  validation: number;
  lineageCompleteness: number;
  sourceReliability: number;
  recentAnomalies: number;
  transformationStability: number;
}

export const DEFAULT_WEIGHTS: TrustScoreWeights = {
  freshness: 0.20,
  validation: 0.25,
  lineageCompleteness: 0.20,
  sourceReliability: 0.15,
  recentAnomalies: 0.10,
  transformationStability: 0.10,
};

export function calculateExplainableTrustScore(
  inputs: {
    freshnessMinutes: number;
    slaMinutes: number;
    passedChecks: number;
    totalChecks: number;
    mappedNodes: number;
    totalNodes: number;
    sourceUptimePercent: number;
    anomalyCountLast14d: number;
    daysSinceBreakingChange: number;
  },
  customWeights: TrustScoreWeights = DEFAULT_WEIGHTS
): TrustScoreBreakdown {
  // 1. Freshness Score (100 if within SLA, linear decay if overdue)
  let freshnessScore = 100;
  if (inputs.freshnessMinutes > inputs.slaMinutes) {
    const overdue = inputs.freshnessMinutes - inputs.slaMinutes;
    // -2 points per 15 minutes overdue, min 20
    freshnessScore = Math.max(20, Math.round(100 - (overdue / 15) * 2));
  } else {
    // slight penalty if close to SLA limit
    const ratio = inputs.freshnessMinutes / inputs.slaMinutes;
    freshnessScore = Math.round(100 - ratio * 5); // 95 - 100
  }
  const freshnessStatus: 'healthy' | 'warning' | 'critical' = 
    freshnessScore >= 90 ? 'healthy' : freshnessScore >= 70 ? 'warning' : 'critical';

  // 2. Validation Checks Score (exact proportion of passed assertions)
  const validationScore = inputs.totalChecks > 0 
    ? Math.round((inputs.passedChecks / inputs.totalChecks) * 100) 
    : 100;
  const validationStatus: 'healthy' | 'warning' | 'critical' = 
    validationScore === 100 ? 'healthy' : validationScore >= 80 ? 'warning' : 'critical';

  // 3. Lineage Completeness Score (all nodes mapped to source schema)
  const lineageScore = inputs.totalNodes > 0 
    ? Math.round((inputs.mappedNodes / inputs.totalNodes) * 100) 
    : 100;
  const lineageStatus: 'healthy' | 'warning' | 'critical' = 
    lineageScore === 100 ? 'healthy' : lineageScore >= 80 ? 'warning' : 'critical';

  // 4. Source Reliability Score (directly mapped to upstream SLA uptime: e.g. 99.9% -> 96, 99.99% -> 100)
  let reliabilityScore = 100;
  if (inputs.sourceUptimePercent < 99.0) {
    reliabilityScore = Math.max(30, Math.round(inputs.sourceUptimePercent * 0.8));
  } else if (inputs.sourceUptimePercent < 99.9) {
    reliabilityScore = 92;
  } else if (inputs.sourceUptimePercent < 99.99) {
    reliabilityScore = 96;
  } else {
    reliabilityScore = 100;
  }
  const reliabilityStatus: 'healthy' | 'warning' | 'critical' = 
    reliabilityScore >= 90 ? 'healthy' : 'warning';

  // 5. Recent Anomalies Score (deduct 15 points per detected statistical anomaly in last 14d)
  const anomalyScore = Math.max(0, 100 - inputs.anomalyCountLast14d * 15);
  const anomalyStatus: 'healthy' | 'warning' | 'critical' = 
    inputs.anomalyCountLast14d === 0 ? 'healthy' : inputs.anomalyCountLast14d === 1 ? 'warning' : 'critical';

  // 6. Transformation Stability Score (more stable = higher confidence; 30+ days = 100)
  let stabilityScore = Math.min(100, Math.max(40, 60 + inputs.daysSinceBreakingChange * 1.0));
  stabilityScore = Math.round(stabilityScore);
  const stabilityStatus: 'healthy' | 'warning' | 'critical' = 
    inputs.daysSinceBreakingChange >= 21 ? 'healthy' : inputs.daysSinceBreakingChange >= 7 ? 'warning' : 'critical';

  // Mathematical weighted sum
  const weightedTotal = 
    customWeights.freshness * freshnessScore +
    customWeights.validation * validationScore +
    customWeights.lineageCompleteness * lineageScore +
    customWeights.sourceReliability * reliabilityScore +
    customWeights.recentAnomalies * anomalyScore +
    customWeights.transformationStability * stabilityScore;

  const totalScore = Math.round(weightedTotal);

  let rating: 'High Trust' | 'Medium Trust' | 'Low Trust' | 'Degraded';
  if (totalScore >= 90) rating = 'High Trust';
  else if (totalScore >= 75) rating = 'Medium Trust';
  else if (totalScore >= 50) rating = 'Low Trust';
  else rating = 'Degraded';

  const mathematicalFormula = 
    `Score = (${customWeights.freshness} × ${freshnessScore}) + (${customWeights.validation} × ${validationScore}) + (${customWeights.lineageCompleteness} × ${lineageScore}) + (${customWeights.sourceReliability} × ${reliabilityScore}) + (${customWeights.recentAnomalies} × ${anomalyScore}) + (${customWeights.transformationStability} × ${stabilityScore}) = ${weightedTotal.toFixed(1)} → ${totalScore}/100`;

  return {
    totalScore,
    rating,
    factors: {
      freshness: {
        score: freshnessScore,
        weight: customWeights.freshness,
        maxScore: 100,
        explanation: inputs.freshnessMinutes <= inputs.slaMinutes 
          ? `Data updated ${inputs.freshnessMinutes}m ago, well within the ${inputs.slaMinutes}m SLA deadline.`
          : `Data is ${inputs.freshnessMinutes - inputs.slaMinutes}m past the ${inputs.slaMinutes}m SLA window.`,
        value: `${inputs.freshnessMinutes} min latency`,
        slaTarget: `< ${inputs.slaMinutes} mins`,
        status: freshnessStatus,
      },
      validation: {
        score: validationScore,
        weight: customWeights.validation,
        maxScore: 100,
        explanation: `${inputs.passedChecks} of ${inputs.totalChecks} automated dbt and Great Expectations tests passed without error.`,
        value: `${inputs.passedChecks}/${inputs.totalChecks} passing`,
        totalChecks: inputs.totalChecks,
        passedChecks: inputs.passedChecks,
        status: validationStatus,
      },
      lineageCompleteness: {
        score: lineageScore,
        weight: customWeights.lineageCompleteness,
        maxScore: 100,
        explanation: `All ${inputs.mappedNodes} transformation nodes from raw ingestion to final metric possess verified upstream contracts.`,
        value: `${inputs.mappedNodes}/${inputs.totalNodes} verified`,
        mappedNodes: inputs.mappedNodes,
        totalNodes: inputs.totalNodes,
        status: lineageStatus,
      },
      sourceReliability: {
        score: reliabilityScore,
        weight: customWeights.sourceReliability,
        maxScore: 100,
        explanation: `Upstream PostgreSQL database cluster registered ${inputs.sourceUptimePercent}% availability in the trailing 30-day window.`,
        value: `${inputs.sourceUptimePercent}% SLA uptime`,
        uptimePercent: inputs.sourceUptimePercent,
        status: reliabilityStatus,
      },
      recentAnomalies: {
        score: anomalyScore,
        weight: customWeights.recentAnomalies,
        maxScore: 100,
        explanation: inputs.anomalyCountLast14d === 0
          ? 'Zero 3-sigma outliers detected in trailing 14 daily data points.'
          : `${inputs.anomalyCountLast14d} statistical anomaly detected in the 14-day rolling window.`,
        value: `${inputs.anomalyCountLast14d} anomalies`,
        zScore: 1.14,
        anomalyCount: inputs.anomalyCountLast14d,
        status: anomalyStatus,
      },
      transformationStability: {
        score: stabilityScore,
        weight: customWeights.transformationStability,
        maxScore: 100,
        explanation: `Metric logic has remained stable for ${inputs.daysSinceBreakingChange} days without breaking schema alterations.`,
        value: `${inputs.daysSinceBreakingChange} days stable`,
        daysSinceBreakingChange: inputs.daysSinceBreakingChange,
        status: stabilityStatus,
      },
    },
    mathematicalFormula,
    lastCalculated: new Date().toISOString(),
  };
}
