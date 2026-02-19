"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Menu, X, Paperclip, Copy, Check, Trash2, Settings, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CosmicBackground } from '@/components/cosmic-background';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  file?: {
    name: string;
    type: string;
  };
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
// Fallback message while connecting to neural network
const FALLBACK_WELCOME = "Initializing STARK Neural Network link...";
const STORAGE_KEY = 'stark_chat_data';
const API_BASE_URL = 'https://uneulogised-liliana-unheedfully.ngrok-free.dev';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [invoiceLoaded, setInvoiceLoaded] = useState(false);
  const [apiWelcome, setApiWelcome] = useState<string>('');

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

    // Initialize API Chat
    const initChat = async () => {
      console.log("STARK: Initializing neural network link...");
      try {
        const response = await fetch(`${API_BASE_URL}/`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("STARK: Init Response:", data);

        setInvoiceLoaded(data.invoice_loaded);

        // Save welcome message for future "New Chat" sessions
        if (data.message) {
          setApiWelcome(data.message);

          // Retroactively update the welcome message in history if it's the first one
          const apiWelcomeMessage: Message = {
            id: 'api-init',
            text: data.message,
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages(prev => {
            // Only replace if the first message is the fallback
            if (prev.length === 1 && prev[0].text === FALLBACK_WELCOME) {
              return [apiWelcomeMessage];
            }
            return prev;
          });

          setChatSessions(prev => prev.map(session => {
            if (session.messages.length === 1 && session.messages[0].text === FALLBACK_WELCOME) {
              return { ...session, messages: [apiWelcomeMessage] };
            }
            return session;
          }));
        }
      } catch (error) {
        console.error("STARK: Connection Error:", error);
        toast.error("Stark Neural Network unavailable. Please check console (F12).");
      }
    };

    initChat();
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
        id: Date.now().toString(),
        text: apiWelcome || FALLBACK_WELCOME,
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
      ...(selectedFile && {
        file: {
          name: selectedFile.name,
          type: selectedFile.type || 'FILE'
        }
      })
    };

    // Update both UI and session store
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateSessionMessages(activeChatId, updatedMessages);

    setInputValue('');
    setSelectedFile(null);
    setIsLoading(true);

    const processAIResponse = async () => {
      console.log("STARK: Processing message...");
      try {
        let aiResponseText = '';

        if (selectedFile) {
          console.log("STARK: Uploading file:", selectedFile.name);
          // 2. Upload PDF
          const form = new FormData();
          form.append('file', selectedFile); // Key matches guide: 'file'

          const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
              'ngrok-skip-browser-warning': 'true'
            },
            body: form
            // ⚠️ guide: DO NOT set Content-Type header
          });

          if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

          const data = await response.json();
          console.log("STARK: Upload Success:", data);
          aiResponseText = data.message;
          setInvoiceLoaded(data.success);
        } else {
          console.log("STARK: Querying:", userMessage.text);
          // 3. Ask question
          const response = await fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ question: userMessage.text })
          });

          if (!response.ok) throw new Error(`Query failed: ${response.status}`);

          const data = await response.json();
          console.log("STARK: Query Result:", data);
          aiResponseText = data.data.answer;
          setInvoiceLoaded(data.invoice_loaded);
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText || 'Neural network link established, but no data received.',
          sender: 'ai',
          timestamp: new Date(),
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        updateSessionMessages(activeChatId, finalMessages);
      } catch (error) {
        console.error("STARK: API Error:", error);
        toast.error("STARK: API Error. Please check console (F12).");
      } finally {
        setIsLoading(false);
      }
    };

    processAIResponse();
  };

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setChatSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, messages: newMessages } : s
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File "${file.name}" selected!`);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
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

  const handleClearInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/invoice`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) throw new Error(`Clear failed: ${response.status}`);

      const data = await response.json();

      const clearMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        sender: 'ai',
        timestamp: new Date(),
      };

      const newMessages = [...messages, clearMessage];
      setMessages(newMessages);
      updateSessionMessages(activeChatId, newMessages);
      setInvoiceLoaded(false);
      toast.success("Neural context cleared");
    } catch (error) {
      console.error("Failed to clear invoice:", error);
      toast.error("Failed to clear neural context");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-background text-foreground relative overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Chat History - Premium Style */}
      <div
        className={`fixed md:relative z-50 h-full ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'
          } transition-all duration-300 bg-gradient-to-b from-background to-stark-card-dark border-r border-stark-border flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header - Premium */}
        <div className="p-6 border-b border-stark-border/50 bg-stark-card-dark/50 backdrop-blur shrink-0">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <span className="font-bold text-stark-cyan">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-stark-card-dark rounded-lg stark-transition"
            >
              <X size={20} />
            </button>
          </div>
          <Button
            onClick={() => {
              handleNewChat();
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
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
                onClick={() => {
                  setActiveChatId(session.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className="w-full text-left"
              >
                <div className={`truncate text-sm font-semibold ${activeChatId === session.id ? 'text-stark-cyan' : 'text-stark-text-muted'
                  }`}>
                  {session.title}
                </div>
                <div className="truncate text-[10px] text-stark-text-muted/60 mt-1 italic">
                  {session.messages.length > 0 ? session.messages[session.messages.length - 1].text : "No messages yet"}
                </div>
                <div className="text-[10px] text-stark-text-muted mt-1 opacity-50">
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
        <div className="border-t border-stark-border/50 p-2 bg-stark-card-dark/30 backdrop-blur shrink-0">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stark-card-dark/50 stark-transition text-stark-text-muted hover:text-stark-cyan hover:stark-glow-cyan hover:translate-x-1 group">
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" />
            <span className="text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 hover:text-red-500 py-2 rounded-lg hover:bg-stark-card-dark/50 stark-transition text-stark-text-muted hover:text-stark-green hover:stark-glow-green hover:translate-x-1 group">
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        {/* Sidebar Footer - Accent Stripe */}
        <div className="h-1 bg-gradient-to-r from-stark-cyan via-stark-purple to-stark-green opacity-60 shrink-0"></div>
      </div>

      {/* Main Chat Area - Premium */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Premium with Large Logo */}
        <header className="bg-gradient-to-r from-background via-stark-card-dark/30 to-background border-b border-stark-border/50 px-4 md:px-8 py-2 flex items-center justify-between backdrop-blur-sm z-30">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-stark-card-dark rounded-lg stark-transition md:hidden"
            >
              <Menu size={24} />
            </button>

            {/* Large Animated Logo - Company Centerpiece */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-stark-cyan via-stark-purple to-stark-green rounded-full blur-xl opacity-40 animate-pulse"></div>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="relative h-12 w-12 md:h-16 md:w-16 rounded-full object-contain stark-logo-glow drop-shadow-2xl"
                >
                  <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663303194648/oWubjrfMnYuOknoT.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="leading-tight">
                <h1 className="text-xl md:text-3xl font-bold stark-logo">
                  STARK
                </h1>
                <p className="text-[10px] md:text-xs text-sidebar-accent font-semibold tracking-[0.2em]">AI ASSISTANT</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {invoiceLoaded && messages.some(msg => !!msg.file) && (
              <Button
                onClick={handleClearInvoice}
                variant="outline"
                className="stark-border-cyan text-stark-cyan hover:text-red-400 hover:bg-stark-cyan/10 px-4 py-2 h-auto text-xs font-bold uppercase tracking-widest stark-transition"
              >
                <Trash2 size={14} className="mr-2" />
                Clear Context
              </Button>
            )}
            <div className={`h-2 w-2 border bg-green-400 rounded-full ${invoiceLoaded ? 'bg-stark-green stark-glow-green' : 'bg-stark-purple stark-glow-purple'} animate-pulse`} />
            <span className="text-[10px] text-stark-text-muted font-bold uppercase tracking-widest transition-colors">
              {invoiceLoaded ? 'Neural Data Loaded' : 'System Ready'}
            </span>
          </div>
        </header>

        {/* Chat Messages Area - Premium */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Persistent Cosmic Background */}
          <CosmicBackground />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10">

            {/* Messages */}
            <div className="relative z-10 space-y-6 max-w-6xl mx-auto w-full">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`group max-w-[85%] md:max-w-xl px-4 bg-black/10 md:px-6 py-2 md:py-3 stark-transition ${message.sender === 'user'
                      ? 'stark-message-user stark-glow-cyan hover:stark-glow-cyan'
                      : 'stark-message-ai stark-glow-purple hover:stark-glow-purple'
                      } relative flex flex-col gap-2`}
                  >
                    {message.file && (
                      <div className=" min-w-16 flex items-center gap-3 py-2 px-3 rounded-lg bg-stark-card-dark/30 border border-white/5 backdrop-blur-sm self-start w-full">
                        <div className="p-1.5 rounded-md bg-red-500/20 text-red-500 flex-shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-10 ">
                          <div className="text-sm font-semibold truncate text-foreground">{message.file.name}</div>
                          <div className="text-[10px] text-stark-text-muted uppercase tracking-wider">{message.file.type}</div>
                        </div>
                      </div>
                    )}
                    <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[10px] md:text-xs text-stark-text-muted opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <button
                        onClick={() => handleCopyMessage(message.text, message.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-stark-cyan stark-transition"
                      >
                        {copiedId === message.id ? <Check size={14} className="text-stark-green" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className=" stark-message-ai text-gray-500 px-2 py-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-stark-cyan via-stark-purple to-stark-green rounded-full blur-xl opacity-40 animate-pulse"></div>
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="relative h-8 w-8 md:h-12 md:w-12 rounded-full object-cover stark-logo-glow drop-shadow-2xl"
                      >
                        <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663303194648/oWubjrfMnYuOknoT.mp4" type="video/mp4" />
                      </video>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Bar - Premium */}
          <div className="bg-gradient-to-t from-background via-background/80 to-transparent border-t border-stark-border/50 p-4 md:p-6 backdrop-blur-sm z-20">
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              {/* File Preview */}
              {selectedFile && (
                <div className="flex items-center gap-3 p-3 rounded-xl stark-glass bg-stark-card-dark/50 border-stark-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-500">
                    <FileText className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-foreground">{selectedFile.name}</div>
                    <div className="text-[10px] text-stark-text-muted uppercase tracking-wider">
                      {selectedFile.type || 'FILE'}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-white/10 rounded-full stark-transition text-stark-text-muted hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="flex gap-2 md:gap-4 w-full">
                <button
                  onClick={triggerFileUpload}
                  className="p-2 md:p-3 rounded-lg stark-glass stark-glass-hover stark-transition hover:stark-glow-cyan flex-shrink-0"
                >
                  <Paperclip size={20} className="text-stark-cyan" />
                </button>

                <div className="flex-1 flex gap-2 md:gap-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="stark-glass h-10 md:h-12 stark-transition focus:stark-glow-cyan border-stark-border bg-stark-card-dark text-foreground placeholder:text-stark-text-muted text-sm md:text-base py-2 md:py-3"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                    className="bg-sky-400 hover:bg-sky-500 text-stark-dark font-bold rounded-lg px-4 md:px-6 stark-transition stark-glow-cyan  disabled:cursor-not-allowed shadow-lg"
                  >
                    <Send size={30} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
