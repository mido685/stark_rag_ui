'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    twinkleDuration: number;
    fallDuration: number;
    delay: number;
}

interface ShootingStar {
    id: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
}

export const CosmicBackground: React.FC = () => {
    const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize stars to prevent re-renders
    const stars = useMemo(() => {
        if (!mounted) return [];
        const starCount = 200; // Increased for global coverage
        const generatedStars: Star[] = [];
        for (let i = 0; i < starCount; i++) {
            generatedStars.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 1.5 + 0.5,
                twinkleDuration: Math.random() * 2 + 1,
                fallDuration: Math.random() * 10 + 5, // Faster falling
                delay: Math.random() * -20,
            });
        }
        return generatedStars;
    }, [mounted]);

    // Handle shooting stars
    useEffect(() => {
        if (!mounted) return;
        const interval = setInterval(() => {
            if (Math.random() > 0.6) { // More frequent shooting stars
                const newStar: ShootingStar = {
                    id: Date.now(),
                    x: Math.random() * 100,
                    y: Math.random() * 60,
                    duration: 1 + Math.random() * 2,
                    delay: 0,
                };
                setShootingStars(prev => [...prev.slice(-5), newStar]);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [mounted]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0B0F1A]">
            {/* Base Gradient Layers */}
            <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-[#111827] to-[#0B0F1A] opacity-80" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,217,255,0.05)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(176,38,255,0.05)_0%,transparent_50%)]" />

            {/* Star Field */}
            <div className="absolute inset-0">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white animate-star-twinkle animate-star-fall"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y - 10}%`, // Start slightly above
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            '--twinkle-duration': `${star.twinkleDuration}s`,
                            '--fall-duration': `${star.fallDuration}s`,
                            animationDelay: `${star.delay}s`,
                            boxShadow: star.size > 2 ? '0 0 4px rgba(255, 255, 255, 0.8)' : 'none',
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Shooting Stars */}
            <AnimatePresence>
                {shootingStars.map((star) => (
                    <motion.div
                        key={star.id}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1, 1, 0.5],
                            x: 400,
                            y: 400,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: star.duration, ease: "linear" }}
                        className="absolute h-[2px] w-[100px] bg-linear-to-r from-transparent via-stark-cyan to-white"

                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            transform: 'rotate(-45deg)',
                            filter: 'blur(1px) drop-shadow(0 0 5px #00D9FF)',
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Floating Nebula Particles */}
            {mounted && [...Array(5)].map((_, i) => (
                <motion.div
                    key={`nebula-${i}`}
                    animate={{
                        x: [0, 30, -30, 0],
                        y: [0, -40, 40, 0],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 20 + i * 5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute rounded-full blur-[80px]"
                    style={{
                        width: `${300 + i * 100}px`,
                        height: `${300 + i * 100}px`,
                        left: `${Math.random() * 80}%`,
                        top: `${Math.random() * 80}%`,
                        background: i % 2 === 0 ? 'rgba(0, 217, 255, 0.05)' : 'rgba(176, 38, 255, 0.05)',
                    }}
                />
            ))}
        </div>
    );
};
