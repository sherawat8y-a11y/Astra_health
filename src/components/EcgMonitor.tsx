'use client';

import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

interface EcgMonitorProps {
  heartRate: number;
  status?: 'nominal' | 'elevated' | 'critical';
  height?: number;
  bare?: boolean;
}

export default function EcgMonitor({ heartRate = 65, status = 'nominal', height = 120, bare = false }: EcgMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    // Line color based on status
    const strokeColor = status === 'critical' ? '#EF4444' : status === 'elevated' ? '#F59E0B' : '#26C6E8';
    const glowColor = status === 'critical' ? 'rgba(239, 68, 68, 0.45)' : status === 'elevated' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(38, 198, 232, 0.45)';

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      ctx.clearRect(0, 0, width, h);

      // Draw faint aerospace grid
      ctx.strokeStyle = 'rgba(38, 198, 232, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 16;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw ECG wave
      ctx.beginPath();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;

      const cycleLength = Math.max(30, Math.round((60 / heartRate) * 80));

      for (let x = 0; x < width; x++) {
        const cyclePos = (x + offset) % cycleLength;
        const phase = cyclePos / cycleLength;
        let yDelta = 0;

        // P wave
        if (phase >= 0.1 && phase < 0.2) {
          yDelta = -0.15 * Math.sin(((phase - 0.1) / 0.1) * Math.PI);
        }
        // Q wave
        else if (phase >= 0.28 && phase < 0.32) {
          yDelta = 0.18 * Math.sin(((phase - 0.28) / 0.04) * Math.PI);
        }
        // R wave (sharp peak)
        else if (phase >= 0.32 && phase < 0.38) {
          yDelta = -0.92 * Math.sin(((phase - 0.32) / 0.06) * Math.PI);
        }
        // S wave (dip)
        else if (phase >= 0.38 && phase < 0.42) {
          yDelta = 0.32 * Math.sin(((phase - 0.38) / 0.04) * Math.PI);
        }
        // T wave
        else if (phase >= 0.52 && phase < 0.70) {
          yDelta = -0.28 * Math.sin(((phase - 0.52) / 0.18) * Math.PI);
        }

        const y = midY + yDelta * (midY * 0.75);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Sweeping scanner beam
      const scanX = (width - (offset % width));
      const grad = ctx.createLinearGradient(scanX - 30, 0, scanX, 0);
      grad.addColorStop(0, 'rgba(16, 27, 43, 0)');
      grad.addColorStop(1, 'rgba(16, 27, 43, 0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(scanX - 30, 0, 30, h);

      // Sweep head line
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, h);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      offset += (heartRate / 60) * 2.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, status]);

  if (bare) {
    return (
      <div className="w-full overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          width={720}
          height={height}
          className="w-full bg-[#101B2B]"
          style={{ height: `${height}px` }}
        />
      </div>
    );
  }

  let rhythm = 'Normal Sinus Rhythm';
  if (heartRate > 100) rhythm = 'Sinus Tachycardia';
  else if (heartRate < 55) rhythm = 'Sinus Bradycardia';

  return (
    <div className="relative rounded-xl border border-[#162338] bg-[#070B14]/90 p-3 shadow-inner overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${status === 'critical' ? 'text-[#EF4444] animate-bounce' : 'text-[#19C7E8] animate-pulse'}`} />
          <span className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider">
            Lead II Rhythm Strip
          </span>
          <span className="text-[10px] font-mono text-[#19C7E8] px-1.5 py-0.5 rounded bg-[#162338] border border-[#19C7E8]/30">
            25 mm/s • 10 mm/mV
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#94A3B8]">
            {rhythm}
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className={`text-base font-bold ${status === 'critical' ? 'text-[#EF4444]' : status === 'elevated' ? 'text-[#F59E0B]' : 'text-[#19C7E8]'}`}>
              {heartRate}
            </span>
            <span className="text-[10px] text-[#94A3B8]">BPM</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={height}
        className="w-full rounded-lg bg-[#040810] border border-[#162338]"
        style={{ height: `${height}px` }}
      />

      {/* Interval Telemetry Badges */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#162338] text-[10px] font-mono text-[#94A3B8]">
        <div>PR: <span className="text-[#F1F5F9] font-medium">156 ms</span></div>
        <div>QRS: <span className="text-[#F1F5F9] font-medium">88 ms</span></div>
        <div>QT / QTc: <span className="text-[#F1F5F9] font-medium">380 / 412 ms</span></div>
        <div>ST: <span className="text-[#F1F5F9] font-medium">Isoelectric</span></div>
        <div className="flex items-center gap-1 text-[#22C55E]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-ping"></span>
          <span>Lead Impedance Nominal</span>
        </div>
      </div>
    </div>
  );
}
