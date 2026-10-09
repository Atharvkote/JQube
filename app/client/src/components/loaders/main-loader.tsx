import { useState, useEffect } from "react";
import { Shield, Cpu, Activity, Server, Lock, CheckCircle2, Terminal } from "lucide-react";
import CubeLoader from "@/components/shared/cube";

const LOADING_TIPS = [
    "Preparing your secure session...",
    "Loading system modules...",
    "Authenticating credentials...",
    "Initializing security components...",
    "Establishing encrypted channel...",
    "Almost ready...",
];

const CARD_STEPS = [
    {
        title: "Secure Session Initialization",
        desc: "Encrypting connection & loading security shields",
        Icon: Shield,
    },
    {
        title: "Kernel Synchronization",
        desc: "Booting JQube sandbox & compiling components",
        Icon: Cpu,
    },
    {
        title: "Subsystem Telemetry",
        desc: "Scanning diagnostic ports & system health check",
        Icon: Activity,
    },
    {
        title: "Cloud Handshake",
        desc: "Verifying credentials & fetching configurations",
        Icon: Server,
    },
    {
        title: "Environment Finalization",
        desc: "Decrypting key vault secrets & resolving workspace",
        Icon: Lock,
    },
    {
        title: "Handshake Complete",
        desc: "All shields active. Redirecting to workspace...",
        Icon: CheckCircle2,
    },
];

export default function MainLoader() {
    const [mounted, setMounted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setMounted(true);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Increments by a random value between 5 and 15
                return Math.min(prev + (Math.random() * 10 + 5), 100);
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const currentTip = LOADING_TIPS[Math.min(Math.floor((progress / 100) * LOADING_TIPS.length), LOADING_TIPS.length - 1)];
    const activeStep = CARD_STEPS[Math.min(Math.floor((progress / 100) * CARD_STEPS.length), CARD_STEPS.length - 1)];
    const CardIcon = activeStep.Icon;

    return (
        <div className="min-h-screen flex flex-col justify-center bg-[#07080B] text-slate-100 overflow-hidden ">
            {/* Ambient Red glow background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-950/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />

            <div
                className={`w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 transition-all duration-1000 relative min-h-[50vh] lg:min-h-screen ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="w-full flex flex-col items-center max-w-4xl relative z-10">

                    {/* Loader Header & Content layout */}
                    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 mb-8">

                        {/* Circular 3D Cube Container */}
                        <div className="flex-shrink-0">
                            <div className="relative w-56 h-56 flex items-center justify-center">
                                {/* Outer rotating ring (Slow) */}
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-red-950/30 border-t-red-900/50 border-b-red-900/50 animate-spin"
                                    style={{ animationDuration: "6s" }}
                                />

                                {/* Inner rotating ring (Fast, Reverse) */}
                                <div
                                    className="absolute inset-4 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin"
                                    style={{ animationDuration: "3s", animationDirection: "reverse" }}
                                />

                                {/* Centered 3D Cube Component */}
                                <div className="scale-75 select-none pointer-events-none mt-[-20px]">
                                    <CubeLoader />
                                </div>
                            </div>
                        </div>

                        {/* Loader Branding & Progress Info */}
                        <div className="flex-1 text-center lg:text-left max-w-lg">
                            <img src="/logo.png" alt="logo" className="w-64 h-32 mx-auto lg:mx-0" />
                            <div className="flex justify-between items-center">


                                <div className="text-3xl mt-2 tracking-tighter uppercase sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-1 animate-pulse">
                                    Loading...
                                </div>

                                {/* Dynamically changing loading tips */}
                                <p className="text-red-300/80 text-lg text-right font-medium min-h-[28px]">
                                    {currentTip}
                                </p>
                            </div>

                            {/* Themed Progress Bar */}
                            <div className="w-full bg-red-950/40 rounded-full h-2.5 overflow-hidden border border-red-900/30">
                                <div
                                    className="h-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-xs text-red-400/60 font-semibold mt-2">
                                <span>{Math.round(progress)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Card */}
                    <div className="mt-8 bg-[#09090C] rounded-full px-6 py-3 border border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.1)] w-full max-w-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                                <div className="w-8 h-8 bg-red-950/50 border border-red-800/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    <Terminal className="w-4 h-4 text-red-500 animate-pulse" />
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-white font-medium text-xs sm:text-sm truncate">{activeStep.title}</p>
                                    <p className="text-red-400/60 text-[10px] sm:text-xs truncate">{activeStep.desc}</p>
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
                            This should only take a moment. Please don't refresh the page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}