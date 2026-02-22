"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconSize?: number;
    textSize?: string;
}

export function Logo({ className, iconSize = 24, textSize = "text-xl" }: LogoProps) {
    return (
        <div className={cn("flex items-center font-bold tracking-tight", textSize, className)}>
            <span>H</span>
            <Clock size={iconSize} className="mx-[1px] text-current" strokeWidth={3} />
            <span>urlog</span>
        </div>
    );
}
