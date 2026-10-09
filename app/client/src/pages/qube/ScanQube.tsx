import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, Terminal, ShieldAlert, Loader2, 
  GitBranch, Server, Code2, ShieldCheck, Cpu, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Qube } from '@/types';
import { qubeService } from '@/services/qube-service';
import { toast } from 'sonner';

type ScanStage = 'QUEUED' | 'INITIALIZING' | 'CLONING' | 'STATIC_ANALYSIS' | 'DEPENDENCY_CHECK' | 'REMEDIATION' | 'COMPLETED' | 'FAILED';

export default function ScanQube() {
  const { qubeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const qube = location.state?.qube as Qube;

  const [logs, setLogs] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<ScanStage>('QUEUED');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qube) {
      navigate('/manage-qube');
      return;
    }
  }, [qube, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!qube) return;

    let eventSource: EventSource | null = null;
    let isMounted = true;

    const initiateScan = async () => {
      try {
        setCurrentStage('INITIALIZING');
        
        // 1. Actually trigger the scan in the backend
        await qubeService.startScan(qube.id);
        
        // 2. Connect to the SSE endpoint to stream the logs
        const baseUrl = import.meta.env.VITE_SEVER_URL || 'http://localhost:8081/api';
        const sseUrl = `${baseUrl}/scans/stream/${qube.id}`;
        eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          const data = event.data;
          setLogs((prev) => [...prev, data]);
          
          // Update stages based on simulated backend logs
          if (data.includes('Cloning repository')) setCurrentStage('CLONING');
          else if (data.includes('Running Semgrep')) setCurrentStage('STATIC_ANALYSIS');
          else if (data.includes('Running Trivy') || data.includes('Running Gitleaks')) setCurrentStage('DEPENDENCY_CHECK');
          else if (data.includes('AI provider')) setCurrentStage('REMEDIATION');
          else if (data.includes('[SUCCESS]')) {
            setCurrentStage('COMPLETED');
            eventSource?.close();
            toast.success('Scan completed successfully!');
          }
          else if (data.includes('[ERROR]')) {
            setCurrentStage('FAILED');
            eventSource?.close();
            toast.error('Scan failed to complete.');
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE Error:', err);
          if (isMounted) {
            setCurrentStage('FAILED');
          }
          eventSource?.close();
        };

      } catch (error: any) {
        console.error('Failed to start scan:', error);
        toast.error('Failed to trigger the scan. Ensure the backend and scanner are running.');
        if (isMounted) {
          setCurrentStage('FAILED');
        }
      }
    };

    initiateScan();

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [qube]);

  if (!qube) return null;

  const stages = [
    { id: 'INITIALIZING', label: 'Initialization', icon: Server },
    { id: 'CLONING', label: 'Clone Repository', icon: GitBranch },
    { id: 'STATIC_ANALYSIS', label: 'Static Analysis (SAST)', icon: Code2 },
    { id: 'DEPENDENCY_CHECK', label: 'Dependency Scanning', icon: ShieldCheck },
    { id: 'REMEDIATION', label: 'AI Remediation', icon: Cpu },
  ];

  const getStageState = (stageId: string) => {
    const stageOrder = ['QUEUED', ...stages.map(s => s.id), 'COMPLETED', 'FAILED'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const thisIndex = stageOrder.indexOf(stageId);

    if (currentStage === 'FAILED' && thisIndex >= currentIndex) return 'pending';
    if (thisIndex < currentIndex) return 'completed';
    if (thisIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/manage-qube')}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Scan Execution
            <span className="text-[#FF3B3B]">{qube.qubeName}</span>
          </h1>
          <p className="text-sm text-[#8E939E] font-mono mt-1">Target: {qube.repoOwner}/{qube.repoName}</p>
        </div>
        
        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0D13] border border-white/5">
          {currentStage === 'QUEUED' || currentStage === 'INITIALIZING' ? (
             <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : currentStage === 'COMPLETED' ? (
             <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : currentStage === 'FAILED' ? (
             <ShieldAlert className="w-4 h-4 text-red-500" />
          ) : (
             <Loader2 className="w-4 h-4 text-[#FF3B3B] animate-spin" />
          )}
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {currentStage.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Stages Sidebar (CI/CD Pipeline View) */}
        <div className="w-full lg:w-80 flex flex-col gap-1 bg-[#121620]/40 border border-white/[0.05] rounded-2xl p-4">
          <h3 className="text-xs font-black text-[#A1A1AA] uppercase tracking-widest mb-4 px-2">Execution Stages</h3>
          
          <div className="flex flex-col gap-1 relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10 z-0"></div>

            {stages.map((stage) => {
              const state = getStageState(stage.id);
              const Icon = stage.icon;
              
              return (
                <div key={stage.id} className="relative z-10 flex items-center gap-4 p-2 rounded-xl transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    state === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    state === 'active' ? 'bg-[#FF3B3B]/10 border-[#FF3B3B] text-[#FF3B3B] shadow-[0_0_15px_rgba(255,59,59,0.3)]' :
                    'bg-[#0A0D13] border-white/10 text-[#71717A]'
                  }`}>
                    {state === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                     state === 'active' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                     <Icon className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold truncate ${
                      state === 'active' ? 'text-white' :
                      state === 'completed' ? 'text-emerald-400' :
                      'text-[#71717A]'
                    }`}>
                      {stage.label}
                    </span>
                    {state === 'active' && (
                      <span className="text-[10px] text-[#FF3B3B] font-mono animate-pulse">Running...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {currentStage === 'COMPLETED' && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="mt-auto p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
             >
               <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
               <p className="text-sm font-black text-white">Scan Successful</p>
               <p className="text-xs text-emerald-400/80 mt-1">Review vulnerabilities in the dashboard.</p>
             </motion.div>
          )}

          {currentStage === 'FAILED' && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="mt-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
             >
               <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
               <p className="text-sm font-black text-white">Scan Failed</p>
               <p className="text-xs text-red-400/80 mt-1">Check the logs for error details.</p>
             </motion.div>
          )}
        </div>

        {/* Terminal View */}
        <div className="flex-1 flex flex-col bg-[#0A0D13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative min-h-0">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#121620] border-b border-white/10">
            <Terminal className="w-4 h-4 text-[#FF3B3B]" />
            <span className="text-xs font-mono font-bold text-[#A1A1AA]">job_execution.log</span>
            
            <div className="ml-auto flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 font-mono text-[13px] leading-relaxed scroll-smooth"
          >
            {logs.length === 0 && currentStage === 'QUEUED' && (
              <div className="text-[#71717A] italic">Connecting to job queue...</div>
            )}
            
            {logs.map((log, index) => {
              let colorClass = 'text-[#A1A1AA]';
              if (log.includes('[INFO]')) colorClass = 'text-blue-400';
              if (log.includes('[WARN]')) colorClass = 'text-amber-400';
              if (log.includes('[ERROR]')) colorClass = 'text-red-500';
              if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400';
              
              // highlight file paths
              const formattedLog = log.replace(/([a-zA-Z0-9_\-\./]+\.(java|js|ts|py|go|rs|json|yml|yaml)):(\d+)/g, '<span class="text-[#FF3B3B] underline decoration-white/20 underline-offset-2">$1:$3</span>');
              
              return (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className={`mb-1.5 ${colorClass} hover:bg-white/[0.02] -mx-6 px-6 py-0.5 transition-colors`}
                  dangerouslySetInnerHTML={{ __html: formattedLog }}
                />
              );
            })}
            
            {(currentStage !== 'COMPLETED' && currentStage !== 'FAILED') && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-[#FF3B3B] mt-2 font-black"
              >
                &gt;_
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
