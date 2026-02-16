"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/chat-header";
import { ChatMessages, type Message } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import ChatBot from "@/components/chat-sidebar";

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export default function Home() {
  const [chats, setChats] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Welcome to STARK",
      date: "2/16/2026",
      messages: [
        {
          id: "m1",
          role: "assistant",
          content: "Hello! I'm STARK, your AI assistant. How can I help you today?",
          timestamp: "06:23 PM",
        },
      ],
    },
  ]);
  const [activeChatId, setActiveChatId] = useState<string>("1");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-title generation (simple version for demo)
  const generateTitle = (content: string) => {
    return content.length > 20 ? content.substring(0, 20) + "..." : content;
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = (content: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp,
    };

    // Update current chat with user message
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          const updatedMessages = [...chat.messages, userMessage];
          // Update title if it's "New Chat"
          const title = chat.title === "New Chat" ? generateTitle(content) : chat.title;
          return { ...chat, messages: updatedMessages, title };
        }
        return chat;
      })
    );

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "This is a demo response. In a production environment, this would be connected to your AI backend.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            return { ...chat, messages: [...chat.messages, aiResponse] };
          }
          return chat;
        })
      );
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <ChatBot />
    </div>
  );
}

