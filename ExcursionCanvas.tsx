import React from 'react';
import {
  BASE_ROVER_BATTERY,
  getRoverMaxBattery,
  getRoverExtraBattery,
  getRoverMaxPayload,
  getRoverExtraStorage,
} from './gameState';
import { MATURITY_SPEEDS, MATURITY_ZONE_COUNTS } from './types';

export {
  BASE_ROVER_BATTERY,
  getRoverMaxBattery,
  getRoverExtraBattery,
  getRoverMaxPayload,
  getRoverExtraStorage,
  MATURITY_SPEEDS,
  MATURITY_ZONE_COUNTS,
};

/**
 * Calculates digging area arc length for a given finding odds percentage.
 * Base odds = 25% for crystal artifacts.
 */
export function calculateArcForOdds(odds = 25, broadSpadeLevel = 0): number {
  const baseNormalArc = 0.16 * 2 * Math.PI; // ~57.6 deg
  const clampedOdds = Math.max(1, Math.min(33, odds));
  const oddsSizeMult = 1.0 - (33 - clampedOdds) * 0.01;
  const broadSpadeBonus = broadSpadeLevel * 0.05;
  return baseNormalArc * oddsSizeMult * (1 + broadSpadeBonus);
}

/**
 * Returns speed, zones, and target arc width for crystal artifacts:
 * - +0.5 Points Crystal Artifact: Mapped to Maturity Rating 2: 3 digging areas & 3.6 rad/s (factor 1.0)
 * - +1.0 Points Crystal Artifact: Mapped to Maturity Rating 4: 5 digging areas & 5.0 rad/s (-10% size, factor 0.90)
 */
export function getCrystalArtifactDigConfig(
  strengthOrValue: number = 0.5,
  broadSpadeLevel = 0,
) {
  const isTier2 = strengthOrValue >= 1.0;
  const rating = isTier2 ? 4 : 2;
  const speed = MATURITY_SPEEDS[rating] ?? (isTier2 ? 5.0 : 3.6);
  const numZones = MATURITY_ZONE_COUNTS[rating] ?? (isTier2 ? 5 : 3);
  const baseArc = calculateArcForOdds(25, broadSpadeLevel);
  const shrinkFactor = isTier2 ? 0.90 : 1.0;
  const targetArc = baseArc * shrinkFactor;
  const arcDeg = (targetArc * 180) / Math.PI;

  return {
    rating,
    speed,
    angularVelocity: speed,
    numZones,
    requiredHits: numZones,
    targetArc,
    arcWidth: targetArc,
    arcDeg,
    shrinkFactor,
    effectiveOdds: 25 * shrinkFactor,
  };
}

/**
 * Initializes or configures digging minigame state for a crystal artifact node.
 */
export function startDigMinigame(
  artifactOrNode: any,
  broadSpadeLevel = 0,
  maxStrikes = 2,
) {
  const val =
    artifactOrNode?.value ??
    artifactOrNode?.strength ??
    artifactOrNode?.crystalStrength ??
    0.5;
  const config = getCrystalArtifactDigConfig(val, broadSpadeLevel);

  const sectors: Array<{
    startAngle: number;
    arcLength: number;
    hit: boolean;
    precision?: number;
  }> = [];
  const slice = (Math.PI * 2) / config.numZones;
  const effectiveArc = Math.min(config.targetArc, slice - 0.06);

  for (let i = 0; i < config.numZones; i++) {
    const maxOffset = Math.max(0, slice - effectiveArc - 0.04);
    const start = i * slice + 0.02 + Math.random() * maxOffset;
    sectors.push({
      startAngle: start,
      arcLength: effectiveArc,
      hit: false,
    });
  }

  return {
    active: true,
    speed: config.speed,
    angularVelocity: config.speed,
    numZones: config.numZones,
    requiredHits: config.numZones,
    targetArc: config.targetArc,
    arcWidth: config.targetArc,
    arcDeg: config.arcDeg,
    sectors,
    needleAngle: 0,
    currentHits: 0,
    strikesUsed: 0,
    maxStrikes,
    isGated: maxStrikes < config.numZones,
    status: 'DIGGING' as const,
    isCrystal: true,
  };
}

export interface ExcursionCanvasProps {
  currentWeight?: number;
  maxWeight?: number;
  batteryKwh?: number;
  maxBatteryKwh?: number;
  className?: string;
  [key: string]: any;
}

/**
 * Excursion Canvas & Cargo HUD Component
 * Displays cargo payload capacity: strictly 0.0 / 3.0 kg at the start of an expedition.
 */
export const ExcursionCanvas: React.FC<ExcursionCanvasProps> = ({
  currentWeight = 0.0,
  maxWeight = 3.0,
  batteryKwh = 50,
  maxBatteryKwh = 50,
  className = '',
}) => {
  return (
    <div className={`p-2 bg-slate-900 text-slate-100 rounded-xl text-xs flex items-center gap-2 ${className}`}>
      <span>🎒 Cargo:</span>
      <strong className="font-mono">{currentWeight.toFixed(1)} / {maxWeight.toFixed(1)} kg</strong>
      <span>⚡ Battery:</span>
      <strong className="font-mono">{batteryKwh} / {maxBatteryKwh} kWh</strong>
    </div>
  );
};

export default ExcursionCanvas;
