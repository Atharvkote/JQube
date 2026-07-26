'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid configurations on the client side
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      background: '#0c0c0e',
      primaryColor: '#dc143c',
      primaryTextColor: '#f3f4f6',
      primaryBorderColor: '#ff4d6d/30',
      lineColor: '#ff4d6d',
      secondaryColor: '#111115',
      tertiaryColor: '#08080a',
      mainBkg: '#0c0c0e',
      actorBkg: '#111115',
      actorBorder: '#ff4d6d/30',
      signalColor: '#ff4d6d',
      signalTextColor: '#f3f4f6',
    }
  });
}

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const id = 'mermaid-' + Math.random().toString(36).substring(2, 9);
    
    // Perform render asynchronously
    mermaid.render(id, chart)
      .then((result) => {
        if (active) {
          setSvg(result.svg);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Mermaid render error:', err);
        if (active) {
          setError(String(err.message || err));
        }
      });

    return () => {
      active = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 my-6 text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-xl overflow-auto">
        <div className="font-semibold mb-1">Failed to render architecture diagram:</div>
        <pre className="opacity-80 whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex justify-center items-center p-12 my-6 bg-[#0c0c0e]/50 border border-zinc-900 rounded-xl select-none">
        <div className="text-xs text-zinc-500 animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff4d6d] animate-ping" />
          Compiling system architecture diagram...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex justify-center p-6 my-6 bg-[#0c0c0e]/30 border border-[#ff4d6d]/10 hover:border-[#ff4d6d]/20 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] rounded-xl overflow-auto select-none"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
