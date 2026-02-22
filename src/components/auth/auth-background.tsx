"use client";

export function AuthBackground() {
    return (
        <div className="absolute inset-0 z-0 h-full w-full bg-slate-50 hidden lg:block overflow-hidden">
            <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-80"
            >
                <defs>
                    <pattern id="triangles" width="100" height="100" patternUnits="userSpaceOnUse">
                        {/* Higher contrast triangles to match screenshot */}
                        <path d="M0 0 L200 0 L100 200 Z" fill="#cbd5e1" opacity="0.6" />
                        <path d="M200 0 L400 0 L300 200 Z" fill="#94a3b8" opacity="0.4" />
                        <path d="M0 200 L200 200 L100 400 Z" fill="#94a3b8" opacity="0.3" />
                        <path d="M200 200 L400 200 L300 400 Z" fill="#cbd5e1" opacity="0.6" />

                        {/* Fillers */}
                        <path d="M100 200 L300 200 L200 0 Z" fill="#787b7fff" />
                        <path d="M100 400 L300 400 L200 200 Z" fill="#424344ff" />
                        <path d="M0 0 L100 200 L0 200 Z" fill="#e2e8f0" />
                        <path d="M400 0 L300 200 L400 200 Z" fill="#f1f5f9" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#triangles)" />
            </svg>
        </div>
    );
}
