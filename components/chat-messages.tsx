"use client";

import React, { useRef, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface ChatMessagesProps {
    messages: Message[];
    isTyping?: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-10 space-y-10 custom-scrollbar" ref={scrollRef}>
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                        "flex flex-col max-w-[85%] md:max-w-[70%] lg:max-w-[65%] group h-full",
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                >
                    <div
                        className={cn(
                            "relative p-6 rounded-2xl glass transition-all duration-300",
                            msg.role === "user"
                                ? "bg-accent-cyan/5 glow-cyan rounded-tr-none"
                                : "bg-accent-purple/5 glow-purple rounded-tl-none"
                        )}
                    >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">{msg.content}</p>

                        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-10">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary/50">
                                {msg.timestamp}
                            </span>

                            {msg.role === "assistant" && (
                                <button
                                    onClick={() => copyToClipboard(msg.content, msg.id)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-text-secondary/40 hover:text-foreground active:scale-90"
                                >
                                    {copiedId === msg.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="flex flex-col mr-auto max-w-[70%]">
                    <div className="bg-accent-purple/5 border border-accent-purple/30 glow-purple p-6 rounded-2xl rounded-tl-none flex items-center gap-3">
                        <span className="text-sm font-medium text-text-secondary/70">STARK is thinking</span>
                        <div className="flex gap-1.5 h-full items-center">
                            <div className="typing-dot" style={{ animationDelay: "0s" }} />
                            <div className="typing-dot" style={{ animationDelay: "0.2s" }} />
                            <div className="typing-dot" style={{ animationDelay: "0.4s" }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
