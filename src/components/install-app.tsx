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

        // Detect iOS (iPhone, iPad, iPod) and exclude Mac desktops
        const detectIOS = () => {
            if (typeof window === 'undefined') return false;
            const ua = window.navigator.userAgent;
            const isIOS = /iPhone|iPad|iPod/.test(ua);
            const isiPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            return isIOS || isiPadOS;
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
                <div className="bg-blue-50/95 backdrop-blur-md border-2 border-blue-100 p-4 rounded-2xl text-left shadow-2xl fixed bottom-6 left-4 right-4 z-[100] md:top-24 md:right-8 md:bottom-auto md:left-auto md:max-w-xs">
                    <p className="text-sm text-blue-900 font-extrabold mb-3 flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-600" />
                        Install Hourlog App
                    </p>
                    <p className="text-xs text-blue-700/80 mb-3 font-medium">To install this app on iPhone:</p>
                    <div className="space-y-2.5 text-sm text-blue-800/90">
                        <div className="flex items-start gap-3 bg-white/50 p-2 rounded-lg">
                            <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-600 text-white text-[12px] font-black">1</span>
                            <span>Open in <strong>Safari</strong></span>
                        </div>
                        <div className="flex items-start gap-3 bg-white/50 p-2 rounded-lg">
                            <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-600 text-white text-[12px] font-black">2</span>
                            <span>Tap <strong>Share</strong> button <Share className="inline w-4 h-4 -mt-1 ml-1" /></span>
                        </div>
                        <div className="flex items-start gap-3 bg-white/50 p-2 rounded-lg">
                            <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-600 text-white text-[12px] font-black">3</span>
                            <span>Tap <strong>'Add to Home Screen'</strong> <PlusSquare className="inline w-4 h-4 -mt-1 ml-1" /></span>
                        </div>
                    </div>
                </div>
            ) : deferredPrompt ? (
                <Button
                    onClick={handleInstallClick}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-12 text-sm shadow-xl shadow-blue-200/50 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 font-bold"
                >
                    <Download className="w-5 h-5" />
                    Install App
                </Button>
            ) : null}
        </div>
    );
}
