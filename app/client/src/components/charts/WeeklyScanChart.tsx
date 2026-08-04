// JQube — WeeklyScanChart Component (TSX)

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, RefreshCw, Download, MoreVertical } from 'lucide-react';
import type { WeeklyScanChartProps, WeeklyScanDataItem } from '@/types';

const CHART_MARGIN = { top: 15, right: 10, left: -20, bottom: 0 };
const CONTAINER_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};
const ACTIVE_DOT_STYLE = { r: 6, fill: '#FF3B3B', stroke: '#FFFFFF', strokeWidth: 2 };

interface TooltipPayloadItem {
  payload: WeeklyScanDataItem;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0F1117]/95 border border-[#FF3B3B]/30 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl text-[10px] space-y-1.5 z-50 font-mono">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-white uppercase tracking-wider">{item.day}</span>
          <span className="text-[#71717A] text-[9px] uppercase tracking-wider">Daily Total</span>
        </div>
        <div className="flex items-center gap-2 pt-1.5 border-t border-[#FF3B3B]/15 text-[#A1A1AA] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#FF3B3B]" />
          <span>Scans:</span>
          <strong className="text-white font-bold text-xs">{item.scans}</strong>
        </div>
      </div>
    );
  }
  return null;
};

function WeeklyScanChart({
  data,
  weeklyScanData,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load weekly scan metrics.',
  onRetry,
  title = 'Scan Volume Trends',
  description = 'Automated security pipeline executions',
}: WeeklyScanChartProps) {
  const normalizedData = useMemo(() => {
    const raw = weeklyScanData || data;
    if (!raw || !Array.isArray(raw)) return [];

    return ((raw as unknown) as Record<string, unknown>[]).map((item) => ({
      day: String(item.day || item.name || 'Day'),
      scans: Number(item.scans ?? item.count ?? item.value ?? 0),
    }));
  }, [data, weeklyScanData]);

  const peakPoint = useMemo(() => {
    if (normalizedData.length === 0) return null;
    return normalizedData.reduce(
      (max, item) => (item.scans > max.scans ? item : max),
      normalizedData[0]
    );
  }, [normalizedData]);

  if (isLoading) {
    return (
      <div className="w-full h-[360px] p-6 bg-[#121620]/40 border border-[#FF3B3B]/10 rounded-2xl flex flex-col justify-between animate-pulse backdrop-blur-md">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-[#0F1117]/60 rounded-lg" />
          <div className="h-3 w-56 bg-[#0F1117]/60 rounded-lg" />
        </div>
        <div className="h-44 w-full bg-[#0F1117]/60 rounded-xl my-4" />
        <div className="flex justify-between px-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="h-3 w-8 bg-[#0F1117]/60 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-[360px] p-6 bg-[#121620]/60 border border-[#FF3B3B]/15 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 backdrop-blur-md">
        <div className="p-3 bg-[#FF3B3B]/10 text-[#FF3B3B] rounded-xl border border-[#FF3B3B]/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-white font-mono uppercase tracking-wider">Scan Data Error</p>
        <p className="text-[11px] text-[#71717A] max-w-xs">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-[10px] font-bold text-white rounded-xl border border-[#FF3B3B]/15 transition-colors font-mono uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative group w-full h-[360px]">
      {/* Decorative Offset Red Glow Box behind card */}
      <div className="absolute -top-1 -right-1 bottom-1 left-1 border border-[#FF3B3B]/15 bg-transparent rounded-2xl pointer-events-none transition-all duration-300 group-hover:top-0 group-hover:right-0 group-hover:bottom-0 group-hover:left-0 group-hover:border-transparent" />

      <motion.div
        initial={CONTAINER_VARIANTS.initial}
        animate={CONTAINER_VARIANTS.animate}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full p-6 bg-[#121620]/60 border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/35 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-2 border-b border-[#FF3B3B]/10 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">{title}</h3>
            {description && (
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {peakPoint && peakPoint.scans > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded-lg text-[10px] font-bold text-[#FF3B3B] whitespace-nowrap font-mono uppercase tracking-wider">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>Peak: {peakPoint.scans} ({peakPoint.day})</span>
              </div>
            )}
            <button
              className="p-1.5 text-[#71717A] hover:text-white bg-[#0F1117] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 rounded-lg transition-colors"
              title="Export Chart Data"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 text-[#71717A] hover:text-white bg-[#0F1117] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 rounded-lg transition-colors"
              title="Chart Actions"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {normalizedData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="p-3 bg-[#0F1117] border border-[#FF3B3B]/15 text-[#71717A] rounded-xl mb-2">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">No Scan Data Available</p>
            <p className="text-[11px] text-[#71717A] mt-1">Automated scans will populate weekly frequency trends</p>
          </div>
        ) : (
          <div className="flex-1 w-full mt-3 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <AreaChart data={normalizedData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B3B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,59,59,0.08)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#71717A"
                  tick={{ fill: '#A1A1AA', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,59,59,0.15)' }}
                />
                <YAxis
                  stroke="#71717A"
                  tick={{ fill: '#A1A1AA', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,59,59,0.15)' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />

                {peakPoint && peakPoint.scans > 0 && (
                  <ReferenceDot
                    x={peakPoint.day}
                    y={peakPoint.scans}
                    r={5}
                    fill="#FF3B3B"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#FF3B3B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scanGradient)"
                  isAnimationActive={true}
                  animationDuration={800}
                  activeDot={ACTIVE_DOT_STYLE}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default React.memo(WeeklyScanChart);
