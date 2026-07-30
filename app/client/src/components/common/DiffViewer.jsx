import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { motion } from 'framer-motion';
import {
  Columns,
  AlignJustify,
  Copy,
  Download,
  Check,
  FileCode
} from 'lucide-react';

const customDarkTheme = {
  variables: {
    dark: {
      diffViewerBackground: '#09090B',
      diffViewerColor: '#A1A1AA',
      addedBackground: '#064e3b33',
      addedColor: '#4ade80',
      removedBackground: '#FF3B3B22',
      removedColor: '#FF3B3B',
      wordAddedBackground: '#065f46',
      wordRemovedBackground: '#991b1b',
      addedGutterBackground: '#064e3b4d',
      removedGutterBackground: '#FF3B3B33',
      gutterBackground: '#0F1117',
      gutterBackgroundNormal: '#0F1117',
      gutterColor: '#71717A',
      gutterColorPower: '#A1A1AA',
      lineNumberColor: '#71717A',
      highlightBackground: '#151922',
      highlightGutterBackground: '#151922',
      codeFoldGutterBackground: '#0F1117',
      codeFoldBackground: '#0F1117',
      emptyLineBackground: '#09090B',
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
      className="bg-[#151922] border border-[#FF3B3B]/15 rounded-xl overflow-hidden shadow-2xl space-y-0"
    >
      {/* Control Bar Header */}
      <div className="px-5 py-3.5 bg-[#0F1117] border-b border-[#FF3B3B]/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA]">
          <FileCode className="w-4 h-4 text-[#FF3B3B]" />
          <span className="font-mono text-white">{fileName}</span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/20 rounded-full">
            AI Patch Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Split / Unified View Toggle */}
          <div className="flex items-center bg-[#09090B] border border-[#FF3B3B]/15 rounded-lg p-1">
            <button
              onClick={() => setSplitView(true)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-all ${
                splitView
                  ? 'bg-[#FF3B3B]/15 text-[#FF3B3B] font-bold border border-[#FF3B3B]/30'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Split View Side-by-Side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setSplitView(false)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-all ${
                !splitView
                  ? 'bg-[#FF3B3B]/15 text-[#FF3B3B] font-bold border border-[#FF3B3B]/30'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Unified View Stacked"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>Unified</span>
            </button>
          </div>

          {/* Copy Patch Code */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#09090B] hover:bg-[#FF3B3B]/10 text-[#A1A1AA] hover:text-white border border-[#FF3B3B]/15 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Copy Fixed Code to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#FF3B3B]" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {/* Download Patch File */}
          <button
            onClick={handleDownloadPatch}
            className="px-3 py-1.5 bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-[#FF3B3B]/20 flex items-center gap-1.5"
            title="Download .patch Unified Diff File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .patch</span>
          </button>
        </div>
      </div>

      {/* Diff Viewer Body */}
      <div className="overflow-x-auto text-xs font-mono">
        <ReactDiffViewer
          oldValue={oldCode}
          newValue={newCode}
          splitView={splitView}
          useDarkTheme={true}
          customStyles={customDarkTheme.styles}
          styles={customDarkTheme.variables}
          leftTitle="Vulnerable Implementation"
          rightTitle="AI Remediated Patch"
        />
      </div>
    </motion.div>
  );
};

export default DiffViewer;
