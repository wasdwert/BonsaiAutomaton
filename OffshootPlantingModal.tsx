import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Sprout,
  CheckCircle2,
  X,
  ArrowDown,
  Award,
  Package,
} from 'lucide-react';
import {
  BonsaiAttributes,
  DEFAULT_BONSAI_ATTRIBUTES,
  ATTRIBUTE_CONFIG,
  getAttributeTier,
  SeedlingItem,
  BONSAI_NATURES,
  getBonsaiNature,
} from './types';
import {
  getMaturityDef,
  getBonsaiDisplayName,
  getSpeciesName,
  getSpeciesFindOdds,
  getLeafTypeDef,
  drawLeafShape,
  drawCherryBlossom,
  getBonsaiStyleDef,
} from './bonsaiData';
import SanctuaryCanvas from './SanctuaryCanvas';
import { gameAudio } from './utils/helper';

export interface OffshootPlantingModalProps {
  isOpen: boolean;
  parentBonsai: any | null;
  onClose: () => void;
  onComplete: (seedlingsCount: number, seedlings: SeedlingItem[]) => void;
  skills?: any;
  offshootMultiplierLevel?: number;
}

interface PotTarget {
  id: number;
  centerX: number;
  width: number;
  hit: boolean;
  hitSeedlingColor?: string;
}

export default function OffshootPlantingModal({
  isOpen,
  parentBonsai,
  onClose,
  onComplete,
  skills,
  offshootMultiplierLevel,
}: OffshootPlantingModalProps) {
  const effectiveMultiplierLevel =
    offshootMultiplierLevel ??
    (skills?.offshoot_multiplier || skills?.offshootMultiplier || 0);
  const totalOffshoots = Math.min(5, Math.max(2, 2 + effectiveMultiplierLevel));

  const [phase, setPhase] = useState<'MINIGAME' | 'RESULT'>('MINIGAME');
  const [maxOffshoots, setMaxOffshoots] = useState<number>(totalOffshoots);
  const [offshootsLeft, setOffshootsLeft] = useState<number>(totalOffshoots);
  const [successfulHits, setSuccessfulHits] = useState<number>(0);
  const [generatedSeedlings, setGeneratedSeedlings] = useState<SeedlingItem[]>([]);

  // Minigame canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation and physics state in refs (60fps simulation)
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const dropStateRef = useRef<{
    isDropping: boolean;
    dropX: number;
    dropY: number;
    impactTimer: number;
    lastOutcome: 'hit' | 'miss' | null;
  }>({
    isDropping: false,
    dropX: 450,
    dropY: 65,
    impactTimer: 0,
    lastOutcome: null,
  });

  const potsRef = useRef<PotTarget[]>([]);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
  }>>([]);

  // Calculate parameters strictly based on parent bonsai:
  const parentRating = parentBonsai?.maturityRating ?? (parentBonsai ? getMaturityDef(parentBonsai.maturity || 'sprout').rank : 1);
  const ratingSpeeds: Record<number, number> = {
    1: 3.2,
    2: 3.6,
    3: 4.2,
    4: 5.0,
    5: 6.0,
  };
  const oscillationSpeed = ratingSpeeds[parentRating] ?? 3.6;

  // Aperture width governed by species find odds & blooming shrinkage
  const rawOdds = parentBonsai?.findOdds ?? (parentBonsai ? getSpeciesFindOdds(parentBonsai.leafType) : 25);
  const speciesFindOdds = Math.max(1, Math.min(33, rawOdds));
  const oddsSizeMult = 1.0 - (33 - speciesFindOdds) * 0.01;
  const isBlooming = parentBonsai?.variant === 'blooming';
  const baseAperture = 70 * oddsSizeMult;
  const apertureWidth = Math.round(isBlooming ? baseAperture * 0.67 : baseAperture);

  // Canvas logical dimensions: 900 x 520
  const CW = 900;
  const CH = 520;
  const RAIL_Y = 65;
  const POT_RIM_Y = 370;

  // Initialize 5 planting pots across the 900px width
  useEffect(() => {
    if (!isOpen || !parentBonsai) return;

    const total = Math.min(5, Math.max(2, 2 + (effectiveMultiplierLevel || 0)));
    setPhase('MINIGAME');
    setMaxOffshoots(total);
    setOffshootsLeft(total);
    setSuccessfulHits(0);
    setGeneratedSeedlings([]);

    dropStateRef.current = {
      isDropping: false,
      dropX: CW / 2,
      dropY: RAIL_Y,
      impactTimer: 0,
      lastOutcome: null,
    };
    particlesRef.current = [];

    // 5 pot centers spaced across 900px width
    const centers = [130, 290, 450, 610, 770];
    potsRef.current = centers.map((cx, idx) => ({
      id: idx,
      centerX: cx,
      width: 110,
      hit: false,
    }));
  }, [isOpen, parentBonsai, effectiveMultiplierLevel]);

  const dropOffshoot = useCallback(() => {
    if (dropStateRef.current.isDropping || dropStateRef.current.impactTimer > 0 || offshootsLeft <= 0) {
      return;
    }

    const t = timeRef.current;
    const amplitude = 330;
    const railCenterX = CW / 2;
    const currentRailX = railCenterX + amplitude * Math.sin(t * oscillationSpeed);

    dropStateRef.current.isDropping = true;
    dropStateRef.current.dropX = currentRailX;
    dropStateRef.current.dropY = RAIL_Y;
    dropStateRef.current.impactTimer = 0;
    dropStateRef.current.lastOutcome = null;

    gameAudio?.playCrispClick?.();
  }, [offshootsLeft, oscillationSpeed]);

  // Main canvas animation loop
  useEffect(() => {
    if (!isOpen || !parentBonsai || phase !== 'MINIGAME') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CW * 2;
    canvas.height = CH * 2;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      timeRef.current += dt;

      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, CW, CH);

      // Arena background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CH);
      bgGrad.addColorStop(0, '#022c22');
      bgGrad.addColorStop(0.35, '#064e3b');
      bgGrad.addColorStop(1, '#021811');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CW, CH);

      // Subtle atmospheric grid mesh
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 50; x < CW; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CH);
        ctx.stroke();
      }
      for (let y = 40; y < CH; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CW, y);
        ctx.stroke();
      }

      // Top Rail Bar
      const railMinX = 110;
      const railMaxX = 790;

      // Heavy wooden cedar substrate rail
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(railMinX - 35, RAIL_Y - 8, (railMaxX - railMinX) + 70, 16, 5);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brass guide slider groove
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(railMinX - 28, RAIL_Y - 2, (railMaxX - railMinX) + 56, 4);

      // Rail End Bracket Posts
      [-30, (railMaxX - railMinX) + 30].forEach((ox) => {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(railMinX + ox - 5, RAIL_Y - 14, 10, 28, 3);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Calculate current oscillating X of offshoot cutting
      const amplitude = 330;
      const railCenterX = CW / 2;
      const currentRailX = railCenterX + amplitude * Math.sin(timeRef.current * oscillationSpeed);

      // Draw 5 Planting Boxes / Pots at Bottom
      const pots = potsRef.current;

      pots.forEach((pot) => {
        const px = pot.centerX;
        const pw = pot.width;
        const ph = 95;

        // Pot ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(px, POT_RIM_Y + ph + 2, pw * 0.54, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ceramic pot body
        const potGrad = ctx.createLinearGradient(px - pw / 2, POT_RIM_Y, px + pw / 2, POT_RIM_Y + ph);
        potGrad.addColorStop(0, pot.hit ? '#065f46' : '#1e293b');
        potGrad.addColorStop(0.5, pot.hit ? '#047857' : '#0f172a');
        potGrad.addColorStop(1, '#021811');
        ctx.fillStyle = potGrad;
        ctx.beginPath();
        ctx.roundRect(px - pw / 2, POT_RIM_Y + 5, pw, ph - 5, [3, 3, 10, 10]);
        ctx.fill();
        ctx.strokeStyle = pot.hit ? '#34d399' : '#475569';
        ctx.lineWidth = pot.hit ? 2.5 : 1.5;
        ctx.stroke();

        // Pot Upper Rim
        ctx.fillStyle = pot.hit ? '#10b981' : '#334155';
        ctx.beginPath();
        ctx.roundRect(px - pw / 2 - 3, POT_RIM_Y, pw + 6, 10, 3);
        ctx.fill();
        ctx.strokeStyle = pot.hit ? '#6ee7b7' : '#64748b';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Dark nutrient soil inside rim
        ctx.fillStyle = '#3b1802';
        ctx.beginPath();
        ctx.ellipse(px, POT_RIM_Y + 4, pw * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Open Soil Aperture / Catch Zone (Target Area)
        const apW = apertureWidth;
        const apLeft = px - apW / 2;

        if (!pot.hit) {
          // Open target zone indicator
          ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
          ctx.beginPath();
          ctx.roundRect(apLeft, POT_RIM_Y - 3, apW, 14, 4);
          ctx.fill();

          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center target landing notch
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(px, POT_RIM_Y - 8);
          ctx.lineTo(px, POT_RIM_Y + 7);
          ctx.stroke();

          // Aperture width tag below pot
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(px - 34, POT_RIM_Y + ph + 8, 68, 17, 5);
          ctx.fill();
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#a7f3d0';
          ctx.font = 'bold 9.5px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(`Target: ${apW}px`, px, POT_RIM_Y + ph + 20);
        } else {
          // HIT! Pot blooms with thriving rooted young cutting!
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(apLeft, POT_RIM_Y - 2, apW, 10, 4);
          ctx.fill();

          // Sprouted baby stem
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(px, POT_RIM_Y + 4);
          ctx.quadraticCurveTo(px - 6, POT_RIM_Y - 16, px, POT_RIM_Y - 34);
          ctx.stroke();

          // Baby leaves
          const leafDef = getLeafTypeDef(parentBonsai.leafType);
          drawLeafShape(ctx, px - 8, POT_RIM_Y - 30, 13, parentBonsai.leafType, leafDef.color, leafDef.accentColor, isBlooming);
          drawLeafShape(ctx, px + 8, POT_RIM_Y - 36, 12, parentBonsai.leafType, leafDef.color, leafDef.accentColor, isBlooming);

          if (isBlooming) {
            drawCherryBlossom(ctx, px, POT_RIM_Y - 38, 6.0, leafDef.color, 0.4);
          }

          // Planted Check Badge
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(px - 34, POT_RIM_Y + ph + 8, 68, 17, 5);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('✓ Rooted', px, POT_RIM_Y + ph + 20);
        }
      });

      // Handle Falling or Hovering Offshoot Cutting
      const drop = dropStateRef.current;

      const drawOffshootCutting = (x: number, y: number, angle = 0) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Branch stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-5, 16, 0, 32);
        ctx.stroke();

        // Twig sprout
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-3, 14);
        ctx.lineTo(-11, 7);
        ctx.stroke();

        // Lush cutting foliage
        const leafDef = getLeafTypeDef(parentBonsai.leafType);
        drawLeafShape(ctx, -10, 6, 14, parentBonsai.leafType, leafDef.color, leafDef.accentColor, isBlooming);
        drawLeafShape(ctx, 6, 26, 15, parentBonsai.leafType, leafDef.color, leafDef.accentColor, isBlooming);
        drawLeafShape(ctx, 0, 34, 13, parentBonsai.leafType, leafDef.color, leafDef.accentColor, isBlooming);

        if (isBlooming) {
          drawCherryBlossom(ctx, -5, 15, 6.5, leafDef.color, 0.3);
          drawCherryBlossom(ctx, 5, 28, 6.0, leafDef.color, 1.2);
        }

        ctx.restore();
      };

      if (!drop.isDropping && drop.impactTimer <= 0 && offshootsLeft > 0) {
        // HOVERING ON RAIL
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.roundRect(currentRailX - 12, RAIL_Y - 12, 24, 24, 4);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Suspension cord
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentRailX, RAIL_Y + 12);
        ctx.lineTo(currentRailX, RAIL_Y + 26);
        ctx.stroke();

        // Vertical Guide Laser / Alignment Beam pointing down to pots
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(currentRailX, RAIL_Y + 26);
        ctx.lineTo(currentRailX, POT_RIM_Y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated swinging offshoot branch cutting
        const swingAngle = Math.cos(timeRef.current * oscillationSpeed) * 0.18;
        drawOffshootCutting(currentRailX, RAIL_Y + 26, swingAngle);

      } else if (drop.isDropping) {
        // DROPPING
        drop.dropY += 480 * dt;

        drawOffshootCutting(drop.dropX, drop.dropY, 0);

        // Falling trail motes
        for (let p = 0; p < 2; p++) {
          particlesRef.current.push({
            x: drop.dropX + (Math.random() - 0.5) * 10,
            y: drop.dropY - 6,
            vx: (Math.random() - 0.5) * 24,
            vy: -45,
            size: 2.5,
            color: '#a7f3d0',
            alpha: 0.85,
            life: 0.28,
          });
        }

        // Check landing impact at POT_RIM_Y
        if (drop.dropY >= POT_RIM_Y) {
          drop.dropY = POT_RIM_Y;
          drop.isDropping = false;
          drop.impactTimer = 0.8;

          let hitPotIndex = -1;
          for (let i = 0; i < pots.length; i++) {
            const pot = pots[i];
            const apW = apertureWidth;
            const minX = pot.centerX - apW / 2;
            const maxX = pot.centerX + apW / 2;
            if (drop.dropX >= minX && drop.dropX <= maxX) {
              hitPotIndex = i;
              break;
            }
          }

          if (hitPotIndex !== -1) {
            drop.lastOutcome = 'hit';
            pots[hitPotIndex].hit = true;
            setSuccessfulHits((prev) => prev + 1);
            gameAudio?.playLevelUpStinger?.();

            const hitCenter = pots[hitPotIndex].centerX;
            for (let i = 0; i < 24; i++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 50 + Math.random() * 90;
              particlesRef.current.push({
                x: hitCenter,
                y: POT_RIM_Y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 35,
                size: 3 + Math.random() * 3,
                color: i % 2 === 0 ? '#34d399' : isBlooming ? '#f472b6' : '#facc15',
                alpha: 1,
                life: 0.65,
              });
            }
          } else {
            drop.lastOutcome = 'miss';
            gameAudio?.playErrorBuzz?.();

            for (let i = 0; i < 14; i++) {
              const ang = Math.random() * Math.PI;
              const spd = 25 + Math.random() * 50;
              particlesRef.current.push({
                x: drop.dropX,
                y: POT_RIM_Y,
                vx: Math.cos(ang) * spd,
                vy: -Math.sin(ang) * spd,
                size: 2.5,
                color: '#78350f',
                alpha: 0.8,
                life: 0.45,
              });
            }
          }

          setOffshootsLeft((prev) => prev - 1);
        }
      } else if (drop.impactTimer > 0) {
        drop.impactTimer = Math.max(0, drop.impactTimer - dt);

        if (drop.lastOutcome === 'hit') {
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 24px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('🌟 ROOTED!', drop.dropX, POT_RIM_Y - 45);
        } else if (drop.lastOutcome === 'miss') {
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 22px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('MISSED!', drop.dropX, POT_RIM_Y - 35);
        }

        if (drop.impactTimer === 0 && offshootsLeft <= 0) {
          const hitsCount = pots.filter((p) => p.hit).length;
          const parentGP = parentBonsai.attributes || parentBonsai.geneticPotential || DEFAULT_BONSAI_ATTRIBUTES;
          const parentSpecies = parentBonsai.leafType;
          const leafDef = getLeafTypeDef(parentSpecies);
          const newSeedlings: SeedlingItem[] = [];

          for (let i = 0; i < hitsCount; i++) {
            const uniqueId = `seedling_prop_${parentSpecies}_${Date.now()}_${i}`;
            const pickedNature = parentBonsai.nature
              ? getBonsaiNature(parentBonsai.nature)
              : BONSAI_NATURES[Math.floor(Math.random() * BONSAI_NATURES.length)];

            newSeedlings.push({
              id: uniqueId,
              leafType: parentSpecies,
              group: parentBonsai.group || leafDef.group,
              maturity: parentBonsai.maturity || 'sprout',
              maturityRating: parentRating,
              species: parentSpecies,
              variant: isBlooming ? 'blooming' : 'normal',
              name: getBonsaiDisplayName(parentBonsai),
              rarity: parentBonsai.rarity,
              nature: pickedNature,
              color: parentBonsai.color || leafDef.color,
              flowerColor: parentBonsai.flowerColor || leafDef.accentColor,
              findOdds: parentBonsai.findOdds,
              geneticPotential: { ...parentGP },
              attributes: { ...parentGP },
              cultivationPotential: { foliage: 0, branches: 0, trunk: 0, roots: 0 },
              discoveredAreaId: parentBonsai.discoveredAreaId || 'FOOTHILLS',
            });
          }

          setGeneratedSeedlings(newSeedlings);
          setPhase('RESULT');
          if (hitsCount > 0) {
            gameAudio?.playVictoryFanfare?.();
          } else {
            gameAudio?.playDefeatMotif?.();
          }
        }
      }

      // Render & update active particles
      const pool = particlesRef.current;
      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / 0.65);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.life <= 0) {
          pool.splice(i, 1);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isOpen, parentBonsai, phase, offshootsLeft, oscillationSpeed, apertureWidth, isBlooming]);

  // Keyboard controls listener
  useEffect(() => {
    if (!isOpen || !parentBonsai) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'MINIGAME') {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          dropOffshoot();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      } else if (phase === 'RESULT') {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          onComplete(generatedSeedlings.length, generatedSeedlings);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onComplete(generatedSeedlings.length, generatedSeedlings);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, parentBonsai, phase, dropOffshoot, generatedSeedlings, onComplete, onClose]);

  if (!isOpen || !parentBonsai) return null;

  const matDef = getMaturityDef(parentBonsai.maturity || 'sprout');
  const speciesDisplayName = getBonsaiDisplayName(parentBonsai);
  const styleDef = getBonsaiStyleDef(parentBonsai.style);
  const parentGP = parentBonsai.attributes || parentBonsai.geneticPotential || DEFAULT_BONSAI_ATTRIBUTES;

  const attributes = [
    { key: 'foliage' as const, config: ATTRIBUTE_CONFIG.foliage, val: parentGP.foliage },
    { key: 'branches' as const, config: ATTRIBUTE_CONFIG.branches, val: parentGP.branches },
    { key: 'trunk' as const, config: ATTRIBUTE_CONFIG.trunk, val: parentGP.trunk },
    { key: 'roots' as const, config: ATTRIBUTE_CONFIG.roots, val: parentGP.roots },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-hidden animate-in fade-in duration-200">
      {phase === 'MINIGAME' ? (
        /* ========================================================================= */
        /* FULL-SCREEN MINIGAME VIEWPORT */
        /* ========================================================================= */
        <div className="w-full max-w-5xl flex flex-col items-center justify-between gap-3 h-full max-h-[92vh]">
          {/* Top Spacious HUD Banner */}
          <div className="w-full bg-slate-900/95 border-2 border-emerald-500/60 rounded-2xl px-5 py-3 shadow-2xl flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400/80 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-emerald-300 tracking-wide">
                    Offshoot Planting Minigame
                  </h3>
                  <span
                    style={{
                      backgroundColor: matDef.bg,
                      borderColor: matDef.border,
                      color: matDef.color,
                    }}
                    className="text-xs px-2.5 py-0.5 rounded-full font-black border flex items-center gap-1 shadow-sm">
                    <span>{matDef.kanji}</span>
                    <span>Rating {parentRating} ({matDef.name})</span>
                  </span>
                  {isBlooming && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-pink-950/90 border border-pink-400 text-pink-300 flex items-center gap-1 shadow-sm animate-pulse">
                      <span>🌸 Blooming</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Parent: <strong>{speciesDisplayName}</strong> • Speed: <strong>{oscillationSpeed.toFixed(1)}x</strong> • Aperture: <strong>{apertureWidth}px{isBlooming ? ' (-33% Blooming)' : ''}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-center font-mono shadow-inner">
                <span className="text-[10px] text-slate-400 block uppercase">Offshoots</span>
                <span className="text-base font-black text-amber-300">{offshootsLeft} / {maxOffshoots}</span>
              </div>
              <div className="bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-center font-mono shadow-inner">
                <span className="text-[10px] text-slate-400 block uppercase">Rooted</span>
                <span className="text-base font-black text-emerald-400">{successfulHits} / {maxOffshoots}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Full Resolution Interactive Arena Canvas */}
          <div
            onClick={dropOffshoot}
            className="relative w-full flex-1 max-h-[70vh] rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-slate-950 cursor-pointer group flex items-center justify-center">
            <canvas
              ref={canvasRef}
              style={{
                aspectRatio: `${CW} / ${CH}`,
                width: '100%',
                maxHeight: '100%',
              }}
              className="w-full h-auto block drop-shadow-2xl"
            />

            {/* Click / Space Hint */}
            <div className="absolute top-3 right-4 pointer-events-none text-xs font-mono font-bold bg-slate-950/85 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-xl shadow-lg">
              [Space / Enter / Click Arena to Drop]
            </div>
          </div>

          {/* Bottom Action Controls Bar */}
          <div className="w-full bg-slate-900/95 border-2 border-emerald-500/40 rounded-2xl px-5 py-3 shadow-2xl flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-300 font-mono hidden sm:block">
              Time the release as the branch carrier aligns with an open pot! 100% of Genetic Potential is inherited.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer">
                Cancel [Esc]
              </button>
              <button
                onClick={dropOffshoot}
                disabled={dropStateRef.current.isDropping || dropStateRef.current.impactTimer > 0 || offshootsLeft <= 0}
                className={`font-black text-sm py-2.5 px-6 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  dropStateRef.current.isDropping || dropStateRef.current.impactTimer > 0 || offshootsLeft <= 0
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white ring-2 ring-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                }`}>
                <ArrowDown className="w-4 h-4 animate-bounce" />
                <span>Drop Offshoot [Space / Click] ({offshootsLeft} left)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* WIDE LANDSCAPE RESULT MODAL ("BONSAI PROPAGATED!") */
        /* ========================================================================= */
        <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto bg-slate-900/95 border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 text-white text-left">
          {/* Header Ribbon */}
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-lg ${
                generatedSeedlings.length > 0
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'bg-rose-950/90 border-rose-500 text-rose-300'
              }`}>
                {generatedSeedlings.length > 0 ? '🎉' : '🥀'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-300 tracking-wide">
                    Bonsai Propagated!
                  </h3>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    generatedSeedlings.length > 0
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-rose-950 text-rose-300 border border-rose-500'
                  }`}>
                    {generatedSeedlings.length} of {maxOffshoots} Offshoots Rooted!
                  </span>
                  {isBlooming && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-pink-950/90 border border-pink-400 text-pink-300 flex items-center gap-1 shadow-sm">
                      <span>🌸 Blooming Preserved</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  {generatedSeedlings.length > 0
                    ? 'Offshoot branches rooted into fresh young seedlings with 100% inherited Genetic Potential!'
                    : 'No offshoots aligned with the catch zones this time.'}
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column Wide Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
            {/* LEFT COLUMN: Specimen Showcase with Large Vector Bonsai Render (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between gap-4 shadow-inner">
              <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Parent Specimen Heritage
                </span>
                <span
                  style={{
                    backgroundColor: matDef.bg,
                    borderColor: matDef.border,
                    color: matDef.color,
                  }}
                  className="text-xs px-2.5 py-0.5 rounded-full font-black border flex items-center gap-1 shadow-sm">
                  <span>{matDef.kanji}</span>
                  <span>Rating {parentRating} ({matDef.name})</span>
                </span>
              </div>

              {/* Large Vector Bonsai Render of Parent Specimen */}
              <div className="w-full flex items-center justify-center py-1">
                <SanctuaryCanvas
                  bonsai={parentBonsai}
                  width={260}
                  height={200}
                  className="shadow-md"
                />
              </div>

              <div className="w-full space-y-3">
                <div className="text-center">
                  <h4 className="text-lg font-black text-slate-100 flex items-center justify-center gap-1.5">
                    {isBlooming && <span>🌸</span>}
                    <span>{speciesDisplayName}</span>
                    <span className="text-xs font-normal text-slate-400 font-mono">(Lv.100)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Style: <strong className="text-emerald-300">{styleDef.japanese} ({styleDef.name})</strong> • Nature: <strong>{parentBonsai.nature ? (typeof parentBonsai.nature === 'string' ? parentBonsai.nature : parentBonsai.nature.name) : 'Balanced'}</strong>
                  </p>
                </div>

                <div className={`p-3 rounded-xl border space-y-1 ${
                  generatedSeedlings.length > 0
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Sprout className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {generatedSeedlings.length === maxOffshoots
                        ? `🌟 Perfect Propagation! ${maxOffshoots} of ${maxOffshoots} Offshoots Planted!`
                        : generatedSeedlings.length > 0
                        ? `🌱 ${generatedSeedlings.length} of ${maxOffshoots} Offshoots Successfully Planted!`
                        : 'No offshoots took root.'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Parent specimen is safely preserved in its plot with all Care Points (CP) intact! Seedlings strictly inherit parent's <strong>Maturity Rating ({parentRating})</strong>, <strong>Genetic Potential (GP)</strong>, and <strong>Variant</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Inherited Genetic Potential (GP) Breakdown (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-inner">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-300">
                      Inherited Genetic Potential (GP)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/50 font-bold">
                    ✨ 100% Preserved
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Each propagated seedling strictly carries forward the exact botanical Genetic Potential of the parent specimen:
                </p>
              </div>

              {/* 4 Spacious Attribute Cards (Zero Overlapping Text) */}
              <div className="space-y-2.5 flex-1 flex flex-col justify-around">
                {attributes.map(({ key, config, val }) => {
                  const tierName = getAttributeTier(val);

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl bg-slate-900/90 border ${config.border} space-y-2 shadow-sm`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs sm:text-sm flex items-center gap-1.5 ${config.text}`}>
                          <span>{config.icon}</span>
                          <span>{config.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black font-mono ${config.lightText}`}>
                            = {val}%
                          </span>
                          <span className="text-[10px] text-slate-300 font-semibold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                            {tierName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Inherited GP Value:</span>
                        <strong className="text-slate-200">{val}% Mastery</strong>
                      </div>

                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${Math.max(2, Math.min(100, val))}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${config.bar}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-2 border-t border-slate-800 shrink-0">
            <button
              onClick={() => {
                gameAudio?.playConfirmSelect?.();
                onComplete(generatedSeedlings.length, generatedSeedlings);
              }}
              autoFocus
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-95 ring-2 ring-emerald-400/50">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {generatedSeedlings.length > 0
                  ? `Deposit ${generatedSeedlings.length} Seedling(s) into Nursery Inventory [E / Enter]`
                  : 'Return to Sanctuary [Esc / Enter]'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
