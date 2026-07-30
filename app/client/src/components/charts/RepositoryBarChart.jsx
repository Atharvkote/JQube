import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { FolderGit2, AlertCircle, RefreshCw, Download, MoreVertical } from 'lucide-react';

const CHART_MARGIN = { top: 15, right: 10, left: -20, bottom: 0 };
const CONTAINER_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 }
};

// CustomTooltip defined OUTSIDE component to prevent Recharts unmount/remount loop
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const hasResolved = payload.some((p) => p.dataKey === 'resolved');
    return (
      <div className="bg-[#0F1117] border border-[#FF3B3B]/30 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl text-xs space-y-2 z-50 min-w-44">
        <div className="flex items-center gap-2 border-b border-[#FF3B3B]/15 pb-2">
          <FolderGit2 className="w-4 h-4 text-[#FF3B3B]" />
          <span className="font-bold text-white truncate">{item.name}</span>
        </div>
        <div className="flex justify-between items-center text-[#A1A1AA]">
          <span className="text-[#FF3B3B] font-medium">Vulnerabilities:</span>
          <strong className="text-white font-bold text-sm">{item.vulnerabilities}</strong>
        </div>
        {hasResolved && (
          <div className="flex justify-between items-center text-[#A1A1AA]">
            <span className="text-emerald-400 font-medium">Resolved:</span>
            <strong className="text-white font-bold text-sm">{item.resolved}</strong>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const RepositoryBarChart = ({
  data,
  repositoryData,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load repository metrics.',
  onRetry,
  title = 'Repository Comparison',
  description = 'Vulnerabilities detected across connected repositories'
}) => {
  // Normalize dataset from props
  const normalizedData = useMemo(() => {
    const raw = repositoryData || data;
    if (!raw || !Array.isArray(raw)) return [];

    return raw.map((item) => {
      const name = item.repository || item.name || 'Unknown';
      const vulnerabilities = Number(item.vulnerabilities ?? item.count ?? item.issues ?? 0);
      const resolved = Number(item.resolved ?? 0);

      return {
        name,
        vulnerabilities,
        resolved
      };
    });
  }, [data, repositoryData]);

  const hasResolvedData = useMemo(() => {
    return normalizedData.some((item) => item.resolved > 0);
  }, [normalizedData]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full h-[360px] p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-2xl flex flex-col justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-[#0F1117] rounded-lg" />
          <div className="h-3 w-56 bg-[#0F1117] rounded-lg" />
        </div>
        <div className="flex items-end justify-between h-48 gap-3 px-4 pt-6">
          <div className="w-12 h-36 bg-[#0F1117] rounded-t-lg" />
          <div className="w-12 h-24 bg-[#0F1117] rounded-t-lg" />
          <div className="w-12 h-44 bg-[#0F1117] rounded-t-lg" />
          <div className="w-12 h-20 bg-[#0F1117] rounded-t-lg" />
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
      {/* Header with Title, Subtitle, Export Icon & Actions */}
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

      {/* Bar Chart Visualizer */}
      <div className="flex-1 w-full my-2 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <BarChart data={normalizedData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,59,59,0.08)" vertical={false} />
            <XAxis
              dataKey="name"
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
            />
            <Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(255,59,59,0.05)' }} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 12 }}
              formatter={(value) => (
                <span className="text-xs font-semibold text-[#A1A1AA] capitalize">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="vulnerabilities"
              name="Vulnerabilities"
              fill="#FF3B3B"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
            {hasResolvedData && (
              <Bar
                dataKey="resolved"
                name="Resolved"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default React.memo(RepositoryBarChart);
