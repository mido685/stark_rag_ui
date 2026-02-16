"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Header() {
    return (
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-4">
                {/* LOGO */}
                <div className="w-16 h-16 relative overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-accent-purple/20 animate-pulse" />
                    <video
                        src="/logo.mp4"
                        width={64}
                        height={64}
                        autoPlay
                        loop
                        muted
                        className="absolute inset-0 z-10 object-cover"
                    >
                    </video>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-widest text-foreground">AI ASSISTANT</span>
                </div>
            </div>
        </header>
    );
}
