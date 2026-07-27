import React, { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { motion } from 'framer-motion';
import {
  Columns,
  AlignJustify,
  Copy,
  Download,
  Check,
  Code2,
  FileCode
} from 'lucide-react';

const customDarkTheme = {
  variables: {
    dark: {
      diffViewerBackground: '#090d16',
      diffViewerColor: '#cbd5e1',
      addedBackground: '#064e3b33',
      addedColor: '#4ade80',
      removedBackground: '#7f1d1d33',
      removedColor: '#f87171',
      wordAddedBackground: '#065f46',
      wordRemovedBackground: '#991b1b',
      addedGutterBackground: '#064e3b4d',
      removedGutterBackground: '#7f1d1d4d',
      gutterBackground: '#0f172a',
      gutterBackgroundNormal: '#0f172a',
      gutterColor: '#64748b',
      gutterColorPower: '#94a3b8',
      lineNumberColor: '#475569',
      highlightBackground: '#1e293b',
      highlightGutterBackground: '#334155',
      codeFoldGutterBackground: '#0f172a',
      codeFoldBackground: '#0f172a',
      emptyLineBackground: '#090d16',
    }
  },
  styles: {
    contentText: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '12px',
      lineHeight: '1.6',
    },
    lineNumber: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '11px',
    },
    line: {
      padding: '2px 8px',
    }
  }
};

const DiffViewer = ({
  oldCode = '',
  newCode = '',
  splitView: initialSplitView = true,
  fileName = 'PatchedFile.java'
}) => {
  const [splitView, setSplitView] = useState(initialSplitView);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(newCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    const patchContent = `--- a/${fileName}\n+++ b/${fileName}\n@@ -1,10 +1,10 @@\n- ${oldCode.split('\n').join('\n- ')}\n+ ${newCode.split('\n').join('\n+ ')}`;
    const blob = new Blob([patchContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/[/\\?%*:|"<>]/g, '_')}.patch`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0"
    >
      {/* Control Bar Header */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <FileCode className="w-4 h-4 text-blue-500" />
          <span className="font-mono text-white">{fileName}</span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
            AI Patch Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setSplitView(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                splitView
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Side-by-Side
            </button>
            <button
              onClick={() => setSplitView(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                !splitView
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" /> Unified
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 transition-all flex items-center gap-1.5"
            title="Copy Fixed Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Fix
              </>
            )}
          </button>

          {/* Download Patch Button */}
          <button
            onClick={handleDownloadPatch}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded-xl border border-blue-500/30 transition-all flex items-center gap-1.5"
            title="Download Git Patch File"
          >
            <Download className="w-3.5 h-3.5" /> Patch File
          </button>
        </div>
      </div>

      {/* Diff Viewer Body */}
      <div className="overflow-x-auto text-xs font-mono border-t border-slate-900">
        <ReactDiffViewer
          oldValue={oldCode}
          newValue={newCode}
          splitView={splitView}
          useDarkTheme={true}
          compareMethod={DiffMethod.WORDS}
          customStyles={customDarkTheme.styles}
          leftTitle="Original Vulnerable Code"
          rightTitle="AI Corrected Secure Code"
        />
      </div>
    </motion.div>
  );
};

export default DiffViewer;
