import React, { useRef, useEffect } from 'react';
import {
  BonsaiLeafType,
  BonsaiStyle,
  SPECIES_BARK_COLORS,
  getSpeciesBarkColors,
  drawBonsaiTrunkAndCanopy,
  drawLeafShape,
  getLeafTypeDef,
} from './bonsaiData';

export {
  SPECIES_BARK_COLORS,
  getSpeciesBarkColors,
  drawBonsaiTrunkAndCanopy,
  drawLeafShape,
};

export const drawBonsai = drawBonsaiTrunkAndCanopy;
export const drawTrunk = drawBonsaiTrunkAndCanopy;

export {
  calculateWateringGrowthRate,
  calculatePruningXP,
  calculateBonsaiLevelUpXP,
  getXPRequirementForLevel,
  getExpRequiredForLevel,
  XP_FOR_LEVEL,
  XP_REQUIREMENTS,
  addPlayerXP,
} from './gameState';

export interface SanctuaryCanvasProps {
  bonsai?: {
    leafType: BonsaiLeafType;
    style: BonsaiStyle;
    level?: number;
    color?: string;
    flowerColor?: string;
  };
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Procedural Sanctuary Bonsai Canvas Vector Renderer Component
 * Supports all 10 Classical Bonsai Styles (Chokan, Moyogi, Shakan, Han-Kengai, Sokan, Kengai, Kabudachi, Hokidachi, Bunjingi, Fukinaashi)
 * with unified canonical trunk bark palettes per species.
 */
export const SanctuaryCanvas: React.FC<SanctuaryCanvasProps> = ({
  bonsai,
  width = 240,
  height = 200,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bonsai) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const bx = width / 2;
    const by = height - 30;
    const stageScale = Math.min(1.0, 0.65 + ((bonsai.level || 1) / 100) * 0.35);
    const trunkHeight = 44 + stageScale * 28;
    const trunkThickness = 5 + stageScale * 4;

    const leafDef = getLeafTypeDef(bonsai.leafType);
    const foliageColor = bonsai.color || leafDef.color;
    const foliageAccent = bonsai.flowerColor || leafDef.accentColor;

    // Ceramic pot base
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx - 36 * stageScale, by - 5, 72 * stageScale, 20 * stageScale, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Soil
    ctx.fillStyle = '#3b1802';
    ctx.beginPath();
    ctx.ellipse(bx, by - 4, 32 * stageScale, 5 * stageScale, 0, 0, Math.PI * 2);
    ctx.fill();

    drawBonsaiTrunkAndCanopy(
      ctx,
      bx,
      by,
      stageScale,
      trunkHeight,
      trunkThickness,
      bonsai.style,
      bonsai.leafType,
      foliageColor,
      foliageAccent,
    );
  }, [bonsai, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className={`rounded-2xl border border-emerald-500/20 bg-slate-950/80 shadow-inner ${className}`}
    />
  );
};

export default SanctuaryCanvas;
