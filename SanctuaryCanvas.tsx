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

/**
 * Sanctuary Layout Geometry Specification:
 * - Main Grid: 16 rows × 16 cols = 256 plots
 * - Left Wing: 8 rows × 8 cols = 64 plots
 * - Right Wing: 8 rows × 8 cols = 64 plots
 * - Total placeable plots across sanctuary = 384 plots
 * - Flanking lateral pebble paths extending 2 plots higher than top pebble path
 * - Half-circle curved forest border grounding sanctuary
 */
export const SANCTUARY_LAYOUT = {
  cellW: 72,
  cellH: 74,
  mainCols: 16,
  mainRows: 16,
  sideCols: 8,
  sideRows: 8,
  centerX: 1400,

  // Main grid: columns 0..15
  mainStartX: 860,
  mainStartY: 330,

  // Lateral vertical pebble paths (uniform 1-column step between side fields and main grid)
  leftPathX: 788,
  rightPathX: 2012,
  pathTopY: 108,
  pathBottomY: 626,

  // Left field (8x8): columns 0..7 (starts 3 grid plots above main grid: 330 - 3*74 = 108)
  leftStartX: 212,
  leftStartY: 108,

  // Right field (8x8): columns 0..7 (starts 3 grid plots above main grid: 330 - 3*74 = 108)
  rightStartX: 2084,
  rightStartY: 108,

  // Top pebble path aligned cleanly with Main Grid column width and 1 grid step above row 0 (330 - 74 = 256)
  topPathY: 256,

  // World dimensions
  worldWidth: 2900,
  worldHeight: 1950,

  // Forest curved boundary ellipse center and radii
  forestCenterY: 108,
  forestRx: 1360,
  forestRy: 1620,
};

export const SANCTUARY_GRID = {
  cols: 16,
  rows: 16,
  cellW: 72,
  cellH: 74,
  startX: 860,
  startY: 330,
};

export const SANCTUARY_WORLD_WIDTH = 2900;
export const SANCTUARY_WORLD_HEIGHT = 1950;

export interface SanctuaryPlotInfo {
  field: 'main' | 'left' | 'right';
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  isUnlocked: boolean;
  key: string;
}

/**
 * 8 Sequential Sanctuary Expansions in Botanical Market
 */
export const SANCTUARY_EXPANSIONS = [
  {
    tier: 1,
    name: 'Expansion I – Inner Wings',
    plots: 32,
    addedPlots: 16,
    cost: 50,
    reqRank: 0,
    description: 'Unlocks 2×4 columns to left (cols 4,5) and right (cols 10,11) of starter zone (+16 plots, 32 total).',
    impact: '+16 Plots: Expands inner wings around the starter greenhouse zone',
  },
  {
    tier: 2,
    name: 'Expansion II – First four Rows Completion',
    plots: 64,
    addedPlots: 32,
    cost: 200,
    reqRank: 0,
    description: 'Unlocks remaining outer wings on left (cols 0..3) & right (cols 12..15), completing top 4 rows (+32 plots, 64 total).',
    impact: '+32 Plots: Completes the full first 4 rows across all 16 columns',
  },
  {
    tier: 3,
    name: 'Expansion III – Two additional Rows',
    plots: 96,
    addedPlots: 32,
    cost: 500,
    reqRank: 0,
    description: 'Unlocks the next two rows to the south: Rows 4 & 5 across all 16 columns (+32 plots, 96 total).',
    impact: '+32 Plots: Opens Rows 4 & 5 across all 16 columns',
  },
  {
    tier: 4,
    name: 'Expansion IV – Two additional Rows',
    plots: 128,
    addedPlots: 32,
    cost: 1000,
    reqRank: 0,
    description: 'Unlocks rows 6 & 7 across all 16 columns, completing the top 8×16 rows of the main grid (+32 plots, 128 total).',
    impact: '+32 Plots: Completes top half of the central grid (Rows 6 & 7)',
  },
  {
    tier: 5,
    name: 'Expansion V – Left Field',
    plots: 192,
    addedPlots: 64,
    cost: 1500,
    reqRank: 1,
    description: 'Unlocks the dedicated 8×8 Western Field (+64 plots, 192 total).',
    impact: '+64 Plots: Unlocks the dedicated Left 8×8 botanical terrace',
  },
  {
    tier: 6,
    name: 'Expansion VI – Right Field',
    plots: 256,
    addedPlots: 64,
    cost: 2000,
    reqRank: 1,
    description: 'Unlocks the dedicated 8×8 Eastern Field (+64 plots, 256 total).',
    impact: '+64 Plots: Unlocks the dedicated Right 8×8 botanical terrace',
  },
  {
    tier: 7,
    name: 'Expansion VII – Four additional Rows',
    plots: 320,
    addedPlots: 64,
    cost: 2500,
    reqRank: 2,
    description: 'Unlocks rows 8–11 across all 16 columns of the main grid (+64 plots, 320 total).',
    impact: '+64 Plots: Opens Rows 8–11 across all 16 columns of the central grid',
  },
  {
    tier: 8,
    name: 'Expansion VIII – Four additional Rows',
    plots: 384,
    addedPlots: 64,
    cost: 3000,
    reqRank: 2,
    description: 'Unlocks rows 12–15 across all 16 columns, completing the entire 16×16 main grid (+64 plots, 384 total).',
    impact: '+64 Plots: Completes all Rows 12–15, finishing the entire 384-plot Sanctuary!',
  },
];

/**
 * Returns the exact sanctuary plot physically bounding the player avatar coordinate.
 * Accurately handles Left Field (8x8), Right Field (8x8), and Main Grid (16x16).
 */
export function getPlotAtCoords(
  playerX: number,
  playerY: number,
  expansionTier = 0,
): SanctuaryPlotInfo | null {
  const { cellW, cellH, mainStartX, mainStartY, mainCols, mainRows, leftStartX, leftStartY, rightStartX, rightStartY, sideCols, sideRows } = SANCTUARY_LAYOUT;
  const halfTileW = (cellW - 8) / 2;
  const halfTileH = (cellH - 8) / 2;
  const tileW = halfTileW * 2;
  const tileH = halfTileH * 2;

  // 1. Check Left Field (8x8)
  const leftGridLeft = leftStartX - cellW / 2;
  const leftGridRight = leftStartX + (sideCols - 0.5) * cellW;
  const sideGridTop = leftStartY - cellH / 2;
  const sideGridBottom = leftStartY + (sideRows - 0.5) * cellH;

  if (playerX >= leftGridLeft && playerX < leftGridRight && playerY >= sideGridTop && playerY < sideGridBottom) {
    const c = Math.floor((playerX - leftGridLeft) / cellW);
    const r = Math.floor((playerY - sideGridTop) / cellH);
    if (c >= 0 && c < sideCols && r >= 0 && r < sideRows) {
      const centerX = leftStartX + c * cellW;
      const centerY = leftStartY + r * cellH;
      const isUnlocked = expansionTier >= 5;
      return {
        field: 'left',
        col: c,
        row: r,
        x: centerX - halfTileW,
        y: centerY - halfTileH,
        width: tileW,
        height: tileH,
        centerX,
        centerY,
        isUnlocked,
        key: `left_${r}_${c}`,
      };
    }
  }

  // 2. Check Right Field (8x8)
  const rightGridLeft = rightStartX - cellW / 2;
  const rightGridRight = rightStartX + (sideCols - 0.5) * cellW;

  if (playerX >= rightGridLeft && playerX < rightGridRight && playerY >= sideGridTop && playerY < sideGridBottom) {
    const c = Math.floor((playerX - rightGridLeft) / cellW);
    const r = Math.floor((playerY - sideGridTop) / cellH);
    if (c >= 0 && c < sideCols && r >= 0 && r < sideRows) {
      const centerX = rightStartX + c * cellW;
      const centerY = rightStartY + r * cellH;
      const isUnlocked = expansionTier >= 6;
      return {
        field: 'right',
        col: c,
        row: r,
        x: centerX - halfTileW,
        y: centerY - halfTileH,
        width: tileW,
        height: tileH,
        centerX,
        centerY,
        isUnlocked,
        key: `right_${r}_${c}`,
      };
    }
  }

  // 3. Check Main Grid (16x16)
  const mainGridLeft = mainStartX - cellW / 2;
  const mainGridRight = mainStartX + (mainCols - 0.5) * cellW;
  const mainGridTop = mainStartY - cellH / 2;
  const mainGridBottom = mainStartY + (mainRows - 0.5) * cellH;

  if (playerX >= mainGridLeft && playerX < mainGridRight && playerY >= mainGridTop && playerY < mainGridBottom) {
    const c = Math.floor((playerX - mainGridLeft) / cellW);
    const r = Math.floor((playerY - mainGridTop) / cellH);
    if (c >= 0 && c < mainCols && r >= 0 && r < mainRows) {
      const centerX = mainStartX + c * cellW;
      const centerY = mainStartY + r * cellH;

      let isUnlocked = false;
      if (r <= 3) {
        if (expansionTier >= 2) isUnlocked = true;
        else if (expansionTier === 1) isUnlocked = c >= 4 && c <= 11;
        else isUnlocked = c >= 6 && c <= 9;
      } else if (r <= 5) {
        isUnlocked = expansionTier >= 3;
      } else if (r <= 7) {
        isUnlocked = expansionTier >= 4;
      } else if (r <= 11) {
        isUnlocked = expansionTier >= 7;
      } else {
        isUnlocked = expansionTier >= 8;
      }

      return {
        field: 'main',
        col: c,
        row: r,
        x: centerX - halfTileW,
        y: centerY - halfTileH,
        width: tileW,
        height: tileH,
        centerX,
        centerY,
        isUnlocked,
        key: `main_${r}_${c}`,
      };
    }
  }

  return null;
}

/**
 * Returns sanctuary plot info for placement preview.
 * Clamps coordinates to the nearest valid grid plot bounds.
 */
export function getPreviewPlot(
  playerX: number,
  playerY: number,
  expansionTier = 0,
): SanctuaryPlotInfo {
  const current = getPlotAtCoords(playerX, playerY, expansionTier);
  if (current) return current;

  // Fallback to nearest field
  const { cellW, cellH, mainStartX, mainStartY, mainCols, mainRows, leftStartX, leftStartY, rightStartX, rightStartY, sideCols, sideRows } = SANCTUARY_LAYOUT;
  const halfTileW = (cellW - 8) / 2;
  const halfTileH = (cellH - 8) / 2;

  if (playerX < mainStartX - cellW / 2) {
    // Closer to left field
    const leftGridLeft = leftStartX - cellW / 2;
    const sideGridTop = leftStartY - cellH / 2;
    const c = Math.max(0, Math.min(sideCols - 1, Math.floor((playerX - leftGridLeft) / cellW)));
    const r = Math.max(0, Math.min(sideRows - 1, Math.floor((playerY - sideGridTop) / cellH)));
    const centerX = leftStartX + c * cellW;
    const centerY = leftStartY + r * cellH;
    return {
      field: 'left',
      col: c,
      row: r,
      x: centerX - halfTileW,
      y: centerY - halfTileH,
      width: halfTileW * 2,
      height: halfTileH * 2,
      centerX,
      centerY,
      isUnlocked: expansionTier >= 5,
      key: `left_${r}_${c}`,
    };
  } else if (playerX > mainStartX + (mainCols - 0.5) * cellW) {
    // Closer to right field
    const rightGridLeft = rightStartX - cellW / 2;
    const sideGridTop = rightStartY - cellH / 2;
    const c = Math.max(0, Math.min(sideCols - 1, Math.floor((playerX - rightGridLeft) / cellW)));
    const r = Math.max(0, Math.min(sideRows - 1, Math.floor((playerY - sideGridTop) / cellH)));
    const centerX = rightStartX + c * cellW;
    const centerY = rightStartY + r * cellH;
    return {
      field: 'right',
      col: c,
      row: r,
      x: centerX - halfTileW,
      y: centerY - halfTileH,
      width: halfTileW * 2,
      height: halfTileH * 2,
      centerX,
      centerY,
      isUnlocked: expansionTier >= 6,
      key: `right_${r}_${c}`,
    };
  } else {
    // Main grid
    const mainGridLeft = mainStartX - cellW / 2;
    const mainGridTop = mainStartY - cellH / 2;
    const c = Math.max(0, Math.min(mainCols - 1, Math.floor((playerX - mainGridLeft) / cellW)));
    const r = Math.max(0, Math.min(mainRows - 1, Math.floor((playerY - mainGridTop) / cellH)));
    const centerX = mainStartX + c * cellW;
    const centerY = mainStartY + r * cellH;

    let isUnlocked = false;
    if (r <= 3) {
      if (expansionTier >= 2) isUnlocked = true;
      else if (expansionTier === 1) isUnlocked = c >= 4 && c <= 11;
      else isUnlocked = c >= 6 && c <= 9;
    } else if (r <= 5) {
      isUnlocked = expansionTier >= 3;
    } else if (r <= 7) {
      isUnlocked = expansionTier >= 4;
    } else if (r <= 11) {
      isUnlocked = expansionTier >= 7;
    } else {
      isUnlocked = expansionTier >= 8;
    }

    return {
      field: 'main',
      col: c,
      row: r,
      x: centerX - halfTileW,
      y: centerY - halfTileH,
      width: halfTileW * 2,
      height: halfTileH * 2,
      centerX,
      centerY,
      isUnlocked,
      key: `main_${r}_${c}`,
    };
  }
}

export function isGridPlotUnlocked(x: number, y: number, expansionTier = 0): boolean {
  const plot = getPlotAtCoords(x, y, expansionTier);
  return plot ? plot.isUnlocked : false;
}

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
