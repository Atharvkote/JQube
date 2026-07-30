import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, RefreshCw, Download, MoreVertical } from 'lucide-react';

const CHART_MARGIN = { top: 15, right: 10, left: -20, bottom: 0 };
const CONTAINER_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 }
};
const ACTIVE_DOT_STYLE = { r: 6, fill: '#FF3B3B', stroke: '#FFFFFF', strokeWidth: 2 };

// CustomTooltip defined OUTSIDE component to prevent Recharts remount loop
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0F1117] border border-[#FF3B3B]/30 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-white">{item.day}</span>
          <span className="text-[#71717A] text-[10px]">Daily Total</span>
        </div>
        <div className="flex items-center gap-2 pt-1.5 border-t border-[#FF3B3B]/15 text-[#A1A1AA]">
          <span className="w-2 h-2 rounded-full bg-[#FF3B3B]" />
          <span>Scans:</span>
          <strong className="text-white font-bold text-sm">{item.scans}</strong>
        </div>
      </div>
    );
  }
  return null;
};

const WeeklyScanChart = ({
  data,
  weeklyScanData,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load weekly scan metrics.',
  onRetry,
  title = 'Scan Volume Trends',
  description = 'Automated security pipeline executions'
}) => {
  // Normalize dataset from props
  const normalizedData = useMemo(() => {
    const raw = weeklyScanData || data;
    if (!raw || !Array.isArray(raw)) return [];

    return raw.map((item) => ({
      day: item.day || item.name || 'Day',
      scans: Number(item.scans ?? item.count ?? item.value ?? 0)
    }));
  }, [data, weeklyScanData]);

  // Find peak scan value and corresponding day
  const peakPoint = useMemo(() => {
    if (normalizedData.length === 0) return null;
    return normalizedData.reduce((max, item) => (item.scans > max.scans ? item : max), normalizedData[0]);
  }, [normalizedData]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full h-[360px] p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-2xl flex flex-col justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-[#0F1117] rounded-lg" />
          <div className="h-3 w-56 bg-[#0F1117] rounded-lg" />
        </div>
        <div className="h-44 w-full bg-[#0F1117] rounded-xl my-4" />
        <div className="flex justify-between px-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="h-3 w-8 bg-[#0F1117] rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="w-full h-[360px] p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-3 bg-[#FF3B3B]/10 text-[#FF3B3B] rounded-xl border border-[#FF3B3B]/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-white">Scan Data Error</p>
        <p className="text-xs text-[#71717A] max-w-xs">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-xs font-semibold text-white rounded-xl border border-[#FF3B3B]/15 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={CONTAINER_VARIANTS.initial}
      animate={CONTAINER_VARIANTS.animate}
      transition={{ duration: 0.3 }}
      className="w-full h-[360px] p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-2xl shadow-xl hover:-translate-y-1 hover:border-[#FF3B3B]/35 hover:shadow-[0_0_25px_rgba(255,59,59,0.15)] transition-all duration-300 flex flex-col justify-between"
      aria-label={title}
    >
      {/* Header with Title, Subtitle, Peak Badge, Export & Actions */}
      <div className="flex items-start justify-between gap-2 border-b border-[#FF3B3B]/10 pb-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
          {description && (
            <p className="text-xs text-[#A1A1AA] mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {peakPoint && peakPoint.scans > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded-lg text-[10px] font-bold text-[#FF3B3B] whitespace-nowrap">
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

      {/* Empty State */}
      {normalizedData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="p-3 bg-[#0F1117] border border-[#FF3B3B]/15 text-[#71717A] rounded-xl mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-[#A1A1AA]">No Scan Data Available</p>
          <p className="text-[11px] text-[#71717A] mt-1">Automated scans will populate weekly frequency trends</p>
        </div>
      ) : (
        /* Area Chart Visualizer */
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
                tick={{ fill: '#A1A1AA', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,59,59,0.15)' }}
              />
              <YAxis
                stroke="#71717A"
                tick={{ fill: '#A1A1AA', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,59,59,0.15)' }}
                allowDecimals={false}
              />
              <Tooltip content={CustomTooltip} />

              {/* Peak Point Highlighter Dot */}
              {peakPoint && peakPoint.scans > 0 && (
                <ReferenceDot
                  x={peakPoint.day}
                  y={peakPoint.scans}
                  r={5}
                  fill="#FF3B3B"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  isFront={true}
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
  );
};

export default React.memo(WeeklyScanChart);
