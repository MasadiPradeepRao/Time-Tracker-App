"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, PlusSquare } from "lucide-react";

export function InstallApp() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already installed
        const checkStandalone = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
                || (window.navigator as any).standalone
                || document.referrer.includes('android-app://');
            setIsStandalone(isStandaloneMode);
            return isStandaloneMode;
        };

        const isInstalled = checkStandalone();

        // Detect iOS
        const detectIOS = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };

        const ios = detectIOS();
        setIsIOS(ios);

        // Visibility logic
        if (!isInstalled) {
            if (ios) {
                setIsVisible(true);
            }
        }

        // Android/Desktop Install Prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log("PWA: beforeinstallprompt event fired");
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        console.log("PWA: Listening for beforeinstallprompt. Standalone:", isInstalled, "iOS:", ios);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="flex items-center animate-in fade-in slide-in-from-top-1 duration-500">
            {isIOS ? (
                <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-100 p-3 rounded-lg text-left shadow-lg fixed top-20 right-4 z-[100] max-w-[280px]">
                    <p className="text-xs text-blue-900 font-bold mb-1 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        Install Hourlog
                    </p>
                    <div className="space-y-1 text-[11px] text-blue-800/80">
                        <div className="flex items-center gap-1.5">
                            <span className="flex items-center justify-center min-w-[14px] h-[14px] rounded-full bg-blue-200 text-blue-900 text-[10px] font-black">1</span>
                            <span>Tap <strong>Share</strong> <Share className="inline w-3 h-3 -mt-0.5" /></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="flex items-center justify-center min-w-[14px] h-[14px] rounded-full bg-blue-200 text-blue-900 text-[10px] font-black">2</span>
                            <span>Select <strong>'Add to Home Screen'</strong> <PlusSquare className="inline w-3 h-3 -mt-0.5" /></span>
                        </div>
                    </div>
                </div>
            ) : deferredPrompt ? (
                <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-9 text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
                >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                </Button>
            ) : null}
        </div>
    );
}
