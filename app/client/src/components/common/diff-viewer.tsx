// JQube — DiffViewer Component (TSX)

import { memo, useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  splitView?: boolean;
  fileName?: string;
}

function DiffViewerComponent({
  oldCode,
  newCode,
  splitView = true,
  fileName,
}: DiffViewerProps) {
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const handleCopyFixed = async () => {
    await navigator.clipboard.writeText(newCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customStyles = {
    variables: {
      dark: {
        diffViewerBackground: '#09090B',
        diffViewerTitleBackground: '#0F1117',
        addedBackground: 'rgba(16,185,129,0.08)',
        addedColor: '#10B981',
        removedBackground: 'rgba(255,59,59,0.08)',
        removedColor: '#FF3B3B',
        wordAddedBackground: 'rgba(16,185,129,0.15)',
        wordRemovedBackground: 'rgba(255,59,59,0.15)',
        addedGutterBackground: 'rgba(16,185,129,0.05)',
        removedGutterBackground: 'rgba(255,59,59,0.05)',
        gutterBackground: '#0F1117',
        gutterBackgroundDark: '#0F1117',
        highlightBackground: 'rgba(255,59,59,0.05)',
        highlightGutterBackground: 'rgba(255,59,59,0.08)',
        codeFoldBackground: '#151922',
        codeFoldGutterBackground: '#0F1117',
        codeFoldContentColor: '#71717A',
        emptyLineBackground: '#09090B',
      },
    },
    line: {
      padding: '4px 12px',
      fontSize: '12px',
      lineHeight: '1.6',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    },
    gutter: {
      padding: '4px 12px',
      fontSize: '10px',
      color: '#71717A',
    },
    contentText: {
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    },
  };

  return (
    <div className="bg-[#151922] border border-[#FF3B3B]/15 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0F1117] border-b border-[#FF3B3B]/15">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#FF3B3B] tracking-wide">
            {'</>'} Code Diff
          </span>
          {fileName && (
            <span className="text-[10px] text-[#71717A] font-mono">
              {fileName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="p-1.5 text-[#A1A1AA] hover:text-white bg-[#0F1117] hover:bg-[#FF3B3B]/10 rounded-lg border border-[#FF3B3B]/15 transition-colors"
            title={showDiff ? 'Hide diff' : 'Show diff'}
          >
            {showDiff ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={handleCopyFixed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-xs font-semibold text-[#A1A1AA] hover:text-white rounded-lg border border-[#FF3B3B]/15 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Fixed Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diff Content */}
      {showDiff && (
        <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
          <ReactDiffViewer
            oldValue={oldCode}
            newValue={newCode}
            splitView={splitView}
            useDarkTheme
            styles={customStyles}
            leftTitle="Original Vulnerable Code"
            rightTitle="AI-Remediated Secure Code"
          />
        </div>
      )}
    </div>
  );
}

export default memo(DiffViewerComponent);
