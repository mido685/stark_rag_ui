"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [message]);

    return (
        <div className="p-8 bg-background">
            <div className="max-w-5xl mx-auto flex items-center gap-4">
                {/* Attachment Button */}
                <button className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl bg-sidebar-hover text-text-secondary hover:text-accent-cyan transition-all border border-white/5 hover:border-accent-cyan/20">
                    <Paperclip size={20} />
                </button>

                {/* Input Bar */}
                <div className="flex-1 flex items-center gap-3 bg-sidebar/50 p-1.5 pr-3 rounded-xl border border-white/10 focus-within:border-accent-cyan/50 focus-within:shadow-[0_0_15px_rgba(0,202,239,0.15)] transition-all duration-300">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        disabled={disabled}
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none py-3 px-4 resize-none text-foreground placeholder:text-text-secondary/40 text-[14px] max-h-[150px] custom-scrollbar"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || disabled}
                        className={cn(
                            "p-2.5 rounded-lg transition-all flex items-center justify-center",
                            message.trim() && !disabled
                                ? "text-accent-cyan hover:scale-110"
                                : "text-text-secondary/20 cursor-not-allowed"
                        )}
                    >
                        <Send size={20} className={cn(message.trim() && !disabled && "drop-shadow-[0_0_8px_#00d8ff]")} />
                    </button>
                </div>
            </div>
        </div>
    );
}
