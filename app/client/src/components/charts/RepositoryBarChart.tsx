// JQube — RepositoryBarChart Component (TSX)

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { FolderGit2, AlertCircle, RefreshCw, Download, MoreVertical } from 'lucide-react';
import type { RepositoryBarChartProps, RepositoryChartItem } from '@/types';

const CHART_MARGIN = { top: 15, right: 10, left: -20, bottom: 0 };
const CONTAINER_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

interface TooltipPayloadItem {
  dataKey?: string;
  payload: RepositoryChartItem;
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
    const hasResolved = payload.some((p) => p.dataKey === 'resolved');
    return (
      <div className="bg-[#0F1117]/95 border border-[#FF3B3B]/30 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl text-[10px] space-y-2 z-50 min-w-44 font-mono uppercase tracking-wider">
        <div className="flex items-center gap-2 border-b border-[#FF3B3B]/15 pb-2">
          <FolderGit2 className="w-4 h-4 text-[#FF3B3B]" />
          <span className="font-bold text-white truncate">{item.name}</span>
        </div>
        <div className="flex justify-between items-center text-[#A1A1AA]">
          <span className="text-[#FF3B3B] font-bold">Vulnerabilities:</span>
          <strong className="text-white font-extrabold text-xs">{item.vulnerabilities}</strong>
        </div>
        {hasResolved && (
          <div className="flex justify-between items-center text-[#A1A1AA]">
            <span className="text-emerald-400 font-bold">Resolved:</span>
            <strong className="text-white font-extrabold text-xs">{item.resolved}</strong>
          </div>
        )}
      </div>
    );
  }
  return null;
};

function RepositoryBarChart({
  data,
  repositoryData,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load repository metrics.',
  onRetry,
  title = 'Repository Comparison',
  description = 'Vulnerabilities detected across connected repositories',
}: RepositoryBarChartProps) {
  const normalizedData = useMemo(() => {
    const raw = repositoryData || data;
    if (!raw || !Array.isArray(raw)) return [];

    return ((raw as unknown) as Record<string, unknown>[]).map((item) => {
      const name = String(item.repository || item.name || 'Unknown');
      const vulnerabilities = Number(item.vulnerabilities ?? item.count ?? item.issues ?? 0);
      const resolved = Number(item.resolved ?? 0);

      return {
        name,
        vulnerabilities,
        resolved,
      };
    });
  }, [data, repositoryData]);

  const hasResolvedData = useMemo(() => {
    return normalizedData.some((item) => (item.resolved ?? 0) > 0);
  }, [normalizedData]);

  if (isLoading) {
    return (
      <div className="w-full h-[360px] p-6 bg-[#121620]/40 border border-[#FF3B3B]/10 rounded-2xl flex flex-col justify-between animate-pulse backdrop-blur-md">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-[#0F1117]/60 rounded-lg" />
          <div className="h-3 w-56 bg-[#0F1117]/60 rounded-lg" />
        </div>
        <div className="flex items-end justify-between h-48 gap-3 px-4 pt-6">
          <div className="w-12 h-36 bg-[#0F1117]/60 rounded-t-lg" />
          <div className="w-12 h-24 bg-[#0F1117]/60 rounded-t-lg" />
          <div className="w-12 h-44 bg-[#0F1117]/60 rounded-t-lg" />
          <div className="w-12 h-20 bg-[#0F1117]/60 rounded-t-lg" />
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
        <p className="text-xs font-bold text-white font-mono uppercase tracking-wider">Data Unavailable</p>
        <p className="text-[11px] text-[#71717A] max-w-xs">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F1117]/80 hover:bg-[#FF3B3B]/10 text-[10px] font-bold text-white rounded-xl border border-[#FF3B3B]/15 transition-colors font-mono uppercase tracking-wider"
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
        className="relative w-full h-full p-6 bg-[#121620]/60 border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/30 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-2 border-b border-[#FF3B3B]/10 pb-3">
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono flex items-center gap-2">
              {title}
            </h3>
            {description && (
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">{description}</p>
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

        <div className="flex-1 w-full my-2 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <BarChart data={normalizedData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,59,59,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
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
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,59,59,0.05)' }} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12 }}
                formatter={(value: string) => (
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
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
    </div>
  );
}

export default React.memo(RepositoryBarChart);
