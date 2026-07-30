import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, RefreshCw, PieChart as PieChartIcon, Download, MoreVertical } from 'lucide-react';

const SEVERITY_COLORS = {
  Critical: '#FF3B3B', // JQube Primary Red
  High: '#F97316',     // Orange-500
  Medium: '#F59E0B',   // Amber-500
  Low: '#3B82F6'       // Blue-500
};

const CONTAINER_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 }
};

// CustomTooltip defined OUTSIDE component to prevent Recharts remount loop
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0F1117] border border-[#FF3B3B]/30 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-white text-sm">{item.name} Severity</span>
        </div>
        <div className="flex items-center justify-between gap-6 pt-1.5 border-t border-[#FF3B3B]/15 text-[#A1A1AA]">
          <span>Count: <strong className="text-white font-bold text-sm">{item.value}</strong></span>
          <span>Share: <strong className="text-white font-semibold">{item.percentage}%</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

const SeverityPieChart = ({
  data,
  severityData,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load severity distribution data.',
  onRetry,
  title = 'Vulnerability Severity',
  description = 'Distribution of unresolved security findings'
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Normalize data from props
  const normalizedData = useMemo(() => {
    const raw = severityData || data;
    if (!raw) return [];

    let items = [];
    if (Array.isArray(raw)) {
      items = raw.map((item) => {
        const name = item.severity || item.name || 'Unknown';
        const value = Number(item.count ?? item.value ?? item.vulnerabilities ?? 0);
        return {
          name,
          value,
          color: SEVERITY_COLORS[name] || '#94A3B8'
        };
      }).filter((item) => item.value > 0);
    } else if (typeof raw === 'object') {
      items = [
        { name: 'Critical', value: Number(raw.critical || 0), color: SEVERITY_COLORS.Critical },
        { name: 'High', value: Number(raw.high || 0), color: SEVERITY_COLORS.High },
        { name: 'Medium', value: Number(raw.medium || 0), color: SEVERITY_COLORS.Medium },
        { name: 'Low', value: Number(raw.low || 0), color: SEVERITY_COLORS.Low }
      ].filter((item) => item.value > 0);
    }

    const total = items.reduce((acc, item) => acc + item.value, 0);
    return items.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
    }));
  }, [data, severityData]);

  // Compute total count
  const totalVulnerabilities = useMemo(() => {
    return normalizedData.reduce((acc, item) => acc + item.value, 0);
  }, [normalizedData]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full h-[360px] p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-2xl flex flex-col justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-[#0F1117] rounded-lg" />
          <div className="h-3 w-56 bg-[#0F1117] rounded-lg" />
        </div>
        <div className="flex items-center justify-center my-auto">
          <div className="w-44 h-44 rounded-full border-4 border-[#0F1117] border-t-[#FF3B3B] animate-spin" />
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
        <p className="text-sm font-semibold text-white">Data Unavailable</p>
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
      {/* Header with Title, Subtitle, and Export/Action controls */}
      <div className="flex items-start justify-between gap-2 border-b border-[#FF3B3B]/10 pb-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-[#A1A1AA] mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-[#71717A] hover:text-white bg-[#0F1117] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 rounded-lg text-xs transition-colors"
            title="Export Chart Data"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 text-[#71717A] hover:text-white bg-[#0F1117] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 rounded-lg text-xs transition-colors"
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
            <PieChartIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-medium text-[#A1A1AA]">No active vulnerabilities found</p>
          <p className="text-[11px] text-[#71717A] mt-1">All severity categories are currently clear</p>
        </div>
      ) : (
        /* Pie Chart Visualizer with Center Overlay */
        <div className="relative flex-1 w-full my-2 min-h-[220px]">
          {/* Center Total Count Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-7">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {totalVulnerabilities}
            </span>
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider mt-0.5">
              Total Issues
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <PieChart>
              <Pie
                data={normalizedData}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={92}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
                onClick={(_, index) => setActiveIndex(index === activeIndex ? null : index)}
              >
                {normalizedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                    className="transition-all duration-300 cursor-pointer hover:opacity-90 focus:outline-none"
                    style={{
                      transform: activeIndex === index ? 'scale(1.06)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => {
                  const item = entry.payload;
                  return (
                    <span className="text-xs font-medium text-[#A1A1AA] hover:text-white ml-1 cursor-pointer">
                      {value} <span className="text-[#71717A]">({item.value})</span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(SeverityPieChart);
