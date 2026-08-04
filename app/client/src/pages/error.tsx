import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw, Home, Terminal } from 'lucide-react';

// error 404 page component
export default function Error() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // refresh page handler
  const handleRefresh = () => {
    window.location.reload();
  };

  // navigate home handler
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#07080B] text-slate-100 overflow-hidden relative">
      {/* Ambient Red glow background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-950/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />

      <div
        className={`w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 transition-all duration-1000 relative min-h-[50vh] lg:min-h-screen ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="w-full flex flex-col items-center max-w-4xl relative z-10">
          
          {/* Main layout container */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 mb-8">
            
            {/* Circular container with rotating rings and 404 text */}
            <div className="flex-shrink-0">
              <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Outer rotating ring */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-red-950/30 border-t-red-900/50 border-b-red-900/50 animate-spin"
                  style={{ animationDuration: '6s' }}
                />

                {/* Inner rotating ring */}
                <div
                  className="absolute inset-4 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin"
                  style={{ animationDuration: '3s', animationDirection: 'reverse' }}
                />

                {/* Centered big 404 text */}
                <div className="flex flex-col items-center justify-center select-none mt-[-5px]">
                  <span className="text-5xl font-black tracking-widest text-red-500 font-mono drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse">
                    404
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-red-400/60 mt-1">
                    node offline
                  </span>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 text-center lg:text-left max-w-lg">
              <img src="/logo.png" alt="logo" className="w-64 h-24 mx-auto lg:mx-0 select-none" />
              
              <div className="mt-2 mb-6">
                <h1 className="text-3xl font-bold tracking-tighter uppercase sm:text-3xl bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-2">
                  Node Not Resolved
                </h1>
                <p className="text-red-300/80 text-lg font-medium leading-relaxed">
                  The requested system routing node could not be resolved or does not exist in the JQube navigation tree.
                </p>
              </div>

              {/* Action buttons instead of progress bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleRefresh}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0C0505] hover:bg-[#1A0A0A] border border-red-900/50 hover:border-red-600/70 rounded-full font-mono text-sm font-semibold transition-all duration-300 group shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <RefreshCw className="w-4 h-4 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
                  <span>REFRESH_NODE</span>
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-950/20 hover:bg-red-600 border border-red-700/60 hover:border-red-500 rounded-full font-mono text-sm font-semibold transition-all duration-300 group shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white"
                >
                  <Home className="w-4 h-4 text-red-300 group-hover:text-white" />
                  <span>BACK_TO_HOME</span>
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Status Card */}
          <div className="mt-8 bg-[#09090C] rounded-full px-6 py-3 border border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.1)] w-full max-w-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="w-8 h-8 bg-red-950/50 border border-red-800/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-white font-medium text-xs sm:text-sm truncate">Routing Error Identified</p>
                  <p className="text-red-400/60 text-[10px] sm:text-xs truncate">ERR_NODE_NOT_FOUND: Status 404</p>
                </div>
              </div>
              <div className="flex space-x-1.5 flex-shrink-0 ml-4">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${dot * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Warning / Help Text */}
          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-red-400/40 tracking-wide">
              Security Protocol JQ-404 Active. Authorized connections only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}