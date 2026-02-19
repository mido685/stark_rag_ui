"use client";

import Link from 'next/link';
import { CosmicBackground } from '@/components/cosmic-background';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Zap } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background font-sans">
            {/* Background with Cosmic Effects */}
            <CosmicBackground />

            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
                {/* Animated Logo Container */}
                <div className="mb-8 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-stark-cyan via-stark-purple to-stark-green rounded-full blur-3xl opacity-50 animate-pulse group-hover:opacity-75 transition-opacity duration-700"></div>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="relative h-56 w-56 rounded-full object-cover stark-logo-glow drop-shadow-[0_0_30px_rgba(0,217,255,0.5)] border-2 border-stark-cyan/30"
                    >
                        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663303194648/oWubjrfMnYuOknoT.mp4" type="video/mp4" />
                    </video>
                </div>

                {/* Error Code */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stark-cyan/10 border border-stark-cyan/30 text-stark-cyan text-xs font-bold uppercase tracking-[0.3em] mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Zap size={14} className="animate-pulse" />
                    Error Code: 404
                </div>

                {/* Main Headings */}
                <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 stark-logo italic tracking-tighter">
                    NEURAL LINK SEVERED
                </h1>
                <p className="text-xl md:text-2xl font-bold text-stark-cyan mb-6 tracking-widest uppercase">
                    Coordinate Not Found
                </p>

                {/* Description */}
                <div className="stark-glass p-6 rounded-2xl border-stark-border/50 bg-stark-card-dark/30 backdrop-blur-xl mb-10 max-w-lg shadow-2xl">
                    <p className="text-stark-text-muted leading-relaxed">
                        The requested neural path could not be mapped within the STARK Network core.
                        The synchronization with the specified data coordinate has failed.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/">
                        <Button
                            className="bg-stark-cyan hover:bg-sky-400 text-stark-dark font-bold px-8 py-6 rounded-xl stark-transition stark-glow-cyan flex items-center gap-2 group shadow-[0_0_20px_rgba(0,217,255,0.3)]"
                        >
                            <Home size={20} className="group-hover:scale-110 transition-transform" />
                            RETURN TO CORE
                        </Button>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-stark-text-muted hover:text-white stark-transition px-6 py-2 group font-semibold tracking-widest text-xs uppercase"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Previous State
                    </button>
                </div>
            </div>

            {/* Decorative Accents */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-stark-cyan rounded-full animate-ping opacity-20"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-stark-purple rounded-full animate-ping opacity-20 delay-1000"></div>
        </div>
    );
}
