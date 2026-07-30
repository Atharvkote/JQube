import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import {
  Webhook,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  GitCommit,
  Eye,
  X,
  Radio
} from 'lucide-react';

const WebhookLogs = () => {
  const { webhookLogs } = useContext(AppContext);
  const [selectedLog, setSelectedLog] = useState(null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Webhook className="w-7 h-7 text-[#FF3B3B]" /> Webhook Event Logs
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-[1.7]">
            Real-time execution log of GitHub and GitLab push & pull request webhook events.
          </p>
        </div>
      </div>

      {/* Webhook Status Banner */}
      <div className="p-4 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Webhook Listener Active</h3>
            <p className="text-[11px] text-[#A1A1AA]">Endpoints: `/api/webhooks/github` and `/api/webhooks/gitlab`</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
          Listening...
        </span>
      </div>

      {/* Webhook Logs Table */}
      <div className="p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#FF3B3B]/15 text-[#71717A] font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-2">Received At</th>
                <th className="pb-3 px-2">Provider</th>
                <th className="pb-3 px-2">Event Type</th>
                <th className="pb-3 px-2">Repository</th>
                <th className="pb-3 px-2">Branch / Commit</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FF3B3B]/10">
              {webhookLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FF3B3B]/5 transition-colors">
                  <td className="py-4 pr-2 font-mono text-[#A1A1AA] text-[11px]">
                    {log.receivedAt}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      log.provider === 'github' ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]' : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {log.provider}
                    </span>
                  </td>
                  <td className="py-4 px-2 font-semibold text-white">
                    {log.eventType}
                  </td>
                  <td className="py-4 px-2 text-[#A1A1AA] font-medium">
                    <div className="flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#FF3B3B]" />
                      <span>{log.repository}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 font-mono text-[#A1A1AA]">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><GitBranch className="w-3 h-3 text-[#71717A]" />{log.branch}</span>
                      <span className="text-[#71717A]">|</span>
                      <span className="flex items-center gap-1 text-[10px]"><GitCommit className="w-3 h-3 text-[#71717A]" />{log.commitHash}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" /> {log.status || 'scanned'}
                    </span>
                  </td>
                  <td className="py-4 pl-2 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1.5 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-[#A1A1AA] hover:text-white font-medium text-xs rounded-xl border border-[#FF3B3B]/15 transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FF3B3B]" /> Payload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-sm">
          <div className="bg-[#151922] border border-[#FF3B3B]/20 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FF3B3B]/15 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Webhook className="w-5 h-5 text-[#FF3B3B]" /> Webhook Payload ({selectedLog.provider})
              </h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-[#71717A] hover:text-white bg-[#0F1117] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="p-4 bg-[#09090B] border border-[#FF3B3B]/15 rounded-xl font-mono text-xs text-[#A1A1AA] overflow-x-auto max-h-96">
              <code>{selectedLog.payload}</code>
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};

export default WebhookLogs;
