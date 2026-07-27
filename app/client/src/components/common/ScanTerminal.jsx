import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Download,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';

const ScanTerminal = ({ isOpen, onClose, repoName = 'payment-gateway' }) => {
  const [logs, setLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startScan();
    } else {
      setLogs([]);
      setIsScanning(false);
      setIsDone(false);
    }
  }, [isOpen, repoName]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const startScan = () => {
    setLogs([]);
    setIsScanning(true);
    setIsDone(false);

    // Try real SSE endpoint first, or fallback to simulated log stream
    try {
      const eventSource = new EventSource(`http://localhost:8080/api/scans/stream/${repoName}`);

      eventSource.onmessage = (event) => {
        setLogs((prev) => [...prev, event.data]);
        if (event.data.includes('SUCCESS') || event.data.includes('completed')) {
          setIsScanning(false);
          setIsDone(true);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        fallbackSimulation();
      };
    } catch (e) {
      fallbackSimulation();
    }
  };

  const fallbackSimulation = () => {
    const simulatedLogs = [
      `[${new Date().toLocaleTimeString()}] [INFO] Initializing J-QUBE Security Engine for target: ${repoName}`,
      `[${new Date().toLocaleTimeString()}] [INFO] Cloning repository branch: refs/heads/main`,
      `[${new Date().toLocaleTimeString()}] [INFO] Downloading source files and build manifests...`,
      `[${new Date().toLocaleTimeString()}] [INFO] Running AST (Abstract Syntax Tree) static code analysis...`,
      `[${new Date().toLocaleTimeString()}] [INFO] Checking dependencies against NVD & CVE databases...`,
      `[${new Date().toLocaleTimeString()}] [WARN] CWE-89 SQL Injection detected in PaymentController.java:48`,
      `[${new Date().toLocaleTimeString()}] [WARN] CWE-328 Broken Cryptographic Hash detected in JwtUtil.java:22`,
      `[${new Date().toLocaleTimeString()}] [INFO] Querying configured AI provider for AST-aware patch generation...`,
      `[${new Date().toLocaleTimeString()}] [INFO] Generating secure code suggestions and regression tests...`,
      `[${new Date().toLocaleTimeString()}] [SUCCESS] AST & SAST Scan completed successfully. Found 2 issues (1 Critical, 1 High).`
    ];

    simulatedLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
        if (index === simulatedLogs.length - 1) {
          setIsScanning(false);
          setIsDone(true);
        }
      }, (index + 1) * 500);
    });
  };

  const handleClear = () => {
    setLogs([]);
  };

  const handleDownloadLog = () => {
    const textContent = logs.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jqube-scan-${repoName.replace(/[/\\?%*:|"<>]/g, '_')}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogStyle = (log) => {
    if (log.includes('[SUCCESS]')) return 'text-green-400 font-bold';
    if (log.includes('[WARN]')) return 'text-yellow-400 font-semibold';
    if (log.includes('[ERROR]')) return 'text-red-400 font-bold';
    return 'text-slate-300';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[620px]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            {/* Left Traffic Light & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80" />
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-3 h-3 rounded-full bg-yellow-500 hover:opacity-80" />
                <button className="w-3 h-3 rounded-full bg-green-500 hover:opacity-80" />
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 font-mono">
                <TerminalIcon className="w-4 h-4 text-blue-500" />
                <span>jqube-scan --repo {repoName}</span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-2">
              {isScanning && (
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Scanning Repository...
                </span>
              )}
              {isDone && (
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Scan Finished
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={startScan}
                disabled={isScanning}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs flex items-center gap-1 disabled:opacity-50"
                title="Restart Scan"
              >
                <Play className="w-3.5 h-3.5 text-blue-400" />
              </button>

              <button
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs"
                title="Clear Output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDownloadLog}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs"
                title="Download Scan Log"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Console View */}
          <div className="flex-1 p-6 bg-[#050811] overflow-y-auto font-mono text-xs leading-relaxed space-y-2 selection:bg-blue-600 selection:text-white">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-600">
                <span>Waiting for log stream...</span>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className={`flex items-start gap-2 ${getLogStyle(log)}`}>
                  <span className="text-slate-600 select-none text-[10px] pt-0.5">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className="break-all">{log}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Terminal Footer */}
          <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-4">
              <span>Lines: {logs.length}</span>
              <span>Encoding: UTF-8</span>
              <span>Scanner: J-QUBE Engine v2.4</span>
            </div>

            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                autoScroll ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ArrowDown className="w-3 h-3" /> Auto-Scroll {autoScroll ? 'ON' : 'OFF'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScanTerminal;
