"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Menu, X, Paperclip, Copy, Check, Trash2, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CosmicBackground } from '@/components/cosmic-background';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

/**
 * STARK Cyberpunk Neural Network Chatbot Interface - Premium Edition
 * Design Philosophy: Futuristic, minimal, glassmorphism with prominent company branding
 * Logo: Centered and enlarged as company centerpiece
 * Color Palette: Deep navy (#0B0F1A), Neon cyan (#00D9FF), Electric purple (#B026FF), Vibrant green (#00FF88)
 */
const DEFAULT_WELCOME_MESSAGE = "Hello! I'm STARK, your AI assistant. How can I help you today?";
const STORAGE_KEY = 'stark_chat_data';

export default function ChatBot() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial Load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Revive dates
        const revivedSessions = parsed.sessions.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setChatSessions(revivedSessions);
        setActiveChatId(parsed.activeId || revivedSessions[0]?.id || '');
      } catch (e) {
        console.error("Failed to parse saved chat data", e);
        createNewEmptyChat();
      }
    } else {
      createNewEmptyChat();
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever chatSessions or activeChatId changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessions: chatSessions,
        activeId: activeChatId
      }));
    }
  }, [chatSessions, activeChatId, isLoaded]);

  // Sync messages state with activeChatId
  useEffect(() => {
    if (isLoaded && activeChatId) {
      const activeSession = chatSessions.find(s => s.id === activeChatId);
      if (activeSession) {
        setMessages(activeSession.messages);
      }
    }
  }, [activeChatId, isLoaded]);

  const createNewEmptyChat = () => {
    const defaultMessages: Message[] = [
      {
        id: '1',
        text: DEFAULT_WELCOME_MESSAGE,
        sender: 'ai',
        timestamp: new Date(),
      },
    ];
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'Welcome to STARK',
      messages: defaultMessages,
      createdAt: new Date(),
    };
    setChatSessions((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessages(defaultMessages);
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !activeChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    // Update both UI and session store
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateSessionMessages(activeChatId, updatedMessages);

    setInputValue('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'This is a demo response. In a production environment, this would be connected to your AI backend.',
        sender: 'ai',
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      updateSessionMessages(activeChatId, finalMessages);
      setIsLoading(false);
    }, 1500);
  };

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setChatSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, messages: newMessages } : s
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`File "${file.name}" uploaded successfully!`);
      // In a real app, you'd handle the file upload logic here
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleNewChat = () => {
    createNewEmptyChat();
    toast.success('New chat created');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Message copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteChat = (id: string) => {
    const newSessions = chatSessions.filter((chat) => chat.id !== id);
    setChatSessions(newSessions);
    if (activeChatId === id) {
      setActiveChatId(newSessions[0]?.id || '');
    }
    toast.success('Chat deleted');

    if (newSessions.length === 0) {
      createNewEmptyChat();
    }
  };

  return (
    <div className="flex w-full h-screen bg-background text-foreground">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Left Sidebar - Chat History - Premium Style */}
      <div
        className={`${sidebarOpen ? 'w-72' : 'w-0'
          } transition-all duration-300 bg-gradient-to-b from-background to-stark-card-dark border-r border-stark-border flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header - Premium */}
        <div className="p-6 border-b border-stark-border/50 bg-stark-card-dark/50 backdrop-blur">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 right-0 hover:bg-stark-card-dark rounded-lg stark-transition md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={0} />}
          </button>
          <Button
            onClick={handleNewChat}
            className="w-full from-stark-cyan/90 hover:from-stark-cyan/80 hover:to-stark-purple/80 text-white rounded-lg flex items-center justify-center gap-2 stark-transition font-semibold shadow-lg stark-glow-cyan"
          >
            <Plus size={20} />
            New Chat
          </Button>
        </div>

        {/* Chat History List - Premium */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative px-4 py-3 rounded-lg stark-transition backdrop-blur border ${activeChatId === session.id
                ? 'bg-stark-card-dark/50 stark-border-cyan stark-glow-cyan shadow-lg'
                : 'hover:bg-stark-card-dark/50 text-stark-text-muted border-white/5 hover:border-white/20'
                }`}
            >
              <button
                onClick={() => setActiveChatId(session.id)}
                className="w-full text-left"
              >
                <div className={`truncate text-sm font-semibold ${activeChatId === session.id ? 'text-stark-cyan' : 'text-stark-text-muted'
                  }`}>
                  {session.title}
                </div>
                <div className="text-xs text-stark-text-muted mt-1 opacity-70">
                  {session.createdAt.toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={() => handleDeleteChat(session.id)}
                className="absolute right-3 top-3 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 stark-transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar Footer - Premium */}
        <div className="border-t border-stark-border/50 p-2 bg-stark-card-dark/30 backdrop-blur">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stark-card-dark/50 stark-transition text-stark-text-muted hover:text-stark-cyan hover:stark-glow-cyan hover:translate-x-1 group">
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" />
            <span className="text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stark-card-dark/50 stark-transition text-stark-text-muted hover:text-stark-green hover:stark-glow-green hover:translate-x-1 group">
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        {/* Sidebar Footer - Accent Stripe */}
        <div className="h-1 bg-gradient-to-r from-stark-cyan via-stark-purple to-stark-green opacity-60"></div>
      </div>

      {/* Main Chat Area - Premium */}
      <div className="flex-1 flex flex-col">
        {/* Header - Premium with Large Logo */}
        <header className="bg-gradient-to-r from-background via-stark-card-dark/30 to-background border-b border-stark-border/50 px-8 py-2 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-6">

            {/* Large Animated Logo - Company Centerpiece */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-stark-cyan via-stark-purple to-stark-green rounded-full blur-xl opacity-40 animate-pulse"></div>
                <video
                  autoPlay
                  loop
                  muted
                  width={64}
                  height={64}
                  playsInline
                  className="relative h-17 w-17 rounded-full object-contain stark-logo-glow drop-shadow-2xl"
                >
                  <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663303194648/oWubjrfMnYuOknoT.mp4" type="video/mp4" />
                </video>
              </div>
              <div>
                <h1 className="text-3xl font-bold stark-logo">
                  STARK
                </h1>
                <p className="text-xs text-sidebar-accent font-semibold tracking-widest">AI ASSISTANT</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-stark-card-dark rounded-lg stark-transition md:hidden"
          >
            {sidebarOpen ? <X size={0} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Chat Messages Area - Premium */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Persistent Cosmic Background */}
          <CosmicBackground />

          <div className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10">

            {/* Messages */}
            <div className="relative z-10 space-y-6 max-w-6xl mx-auto w-full">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`group max-w-xl px-6 py-3 stark-transition ${message.sender === 'user'
                      ? 'stark-message-user stark-glow-cyan hover:stark-glow-cyan'
                      : 'stark-message-ai stark-glow-purple hover:stark-glow-purple'
                      } relative`}
                  >
                    <p className="text-base leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-stark-text-muted opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <button
                        onClick={() => handleCopyMessage(message.text, message.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-stark-cyan stark-transition"
                      >
                        {copiedId === message.id ? <Check size={16} className="text-stark-green" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className=" stark-message-ai text-gray-500 px-4 py-2">
                    <div className="loader"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Bar - Premium */}
          <div className="bg-gradient-to-t from-background via-background to-transparent border-t border-stark-border/50 p-6 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex gap-4">
              <button
                onClick={triggerFileUpload}
                className="p-3 rounded-lg stark-glass stark-glass-hover stark-transition hover:stark-glow-cyan flex-shrink-0"
              >
                <Paperclip size={20} className="text-stark-cyan" />
              </button>

              <div className="flex-1 flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="stark-glass h-10 stark-transition focus:stark-glow-cyan border-stark-border bg-stark-card-dark text-foreground placeholder:text-stark-text-muted text-base py-3"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-sky-400 hover:bg-sky-500 text-stark-dark font-bold rounded-lg px-6 stark-transition stark-glow-cyan  disabled:cursor-not-allowed shadow-lg"
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
