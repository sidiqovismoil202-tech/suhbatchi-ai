/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, Bot, Sparkles, MessageSquareHeart } from 'lucide-react';
import { Conversation, Message } from './types/chat';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { QuickPrompts } from './components/QuickPrompts';

const STORAGE_KEY = 'hamdam_ai_conversations_v1';
const ACTIVE_CONV_KEY = 'hamdam_ai_active_id_v1';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_CONV_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // ignore
    }
  }, [conversations]);

  // Sync activeId to localStorage
  useEffect(() => {
    if (activeId) {
      localStorage.setItem(ACTIVE_CONV_KEY, activeId);
    }
  }, [activeId]);

  // Find active conversation
  const currentConversation = conversations.find((c) => c.id === activeId) || null;

  // Scroll to bottom smoothly
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeId]);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom('smooth');
    }
  }, [currentConversation?.messages]);

  // Create a new conversation
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'Yangi suhbat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Clear all conversations
  const handleClearAll = () => {
    setConversations([]);
    setActiveId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CONV_KEY);
  };

  // Export conversation to markdown
  const handleExport = () => {
    if (!currentConversation || currentConversation.messages.length === 0) {
      alert("Hozircha yuklab olish uchun xabarlar mavjud emas.");
      return;
    }

    const title = currentConversation.title || "Suhbat";
    let markdown = `# Hamdam AI - ${title}\nSana: ${new Date().toLocaleString()}\n\n---\n\n`;

    for (const msg of currentConversation.messages) {
      const speaker = msg.role === 'user' ? 'Siz' : 'Hamdam AI';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      markdown += `### ${speaker} (${time}):\n${msg.content}\n\n`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '_')}_suhbat.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send a message
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    let targetConvId = activeId;

    // If no active conversation, create one immediately
    if (!targetConvId) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: userText.slice(0, 32) + (userText.length > 32 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => [newConv, ...prev]);
      targetConvId = newConv.id;
      setActiveId(newConv.id);
    }

    const userMsg: Message = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const assistantMsgId = `msg_${Date.now()}_a`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Update state with user message and placeholder assistant message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          const isFirstMessage = c.messages.length === 0;
          return {
            ...c,
            title: isFirstMessage
              ? userText.slice(0, 32) + (userText.length > 32 ? '...' : '')
              : c.title,
            messages: [...c.messages, userMsg, initialAssistantMsg],
            updatedAt: Date.now(),
          };
        }
        return c;
      })
    );

    setIsLoading(true);

    // Abort controller for stopping generation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Prepare message history
      const existingMessages =
        conversations.find((c) => c.id === targetConvId)?.messages || [];
      const payloadMessages = [...existingMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Server javobi: ${res.status} ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Oqim (stream) o'quvchisi mavjud emas.");
      }

      const decoder = new TextDecoder('utf-8');
      let assistantText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              assistantText += parsed.text;

              // Progressively update state
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id === targetConvId) {
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, content: assistantText, isStreaming: true }
                          : m
                      ),
                      updatedAt: Date.now(),
                    };
                  }
                  return c;
                })
              );
            }
          } catch {
            // chunk parse issue ignored for partial bytes
          }
        }
      }

      // Mark streaming completed
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, isStreaming: false } : m
              ),
              updatedAt: Date.now(),
            };
          }
          return c;
        })
      );
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        // Stop called by user
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                ),
              };
            }
            return c;
          })
        );
      } else {
        const errMsg = err instanceof Error ? err.message : 'Ulanishda xatolik yuz berdi.';
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConvId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `Kechirasiz, xatolik yuz berdi: ${errMsg}`,
                        error: true,
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetryLast = () => {
    if (!currentConversation || currentConversation.messages.length === 0) return;
    const msgs = currentConversation.messages;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove last assistant message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            const filtered = c.messages.slice(0, c.messages.length - 1);
            return { ...c, messages: filtered };
          }
          return c;
        })
      );
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onClearAll={handleClearAll}
        onExport={handleExport}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main chat viewport */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Navbar */}
        <header className="h-14 shrink-0 px-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Menyu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white truncate flex items-center gap-2">
                  <span>{currentConversation?.title || "Hamdam AI - Shaxsiy Suhbatdoshingiz"}</span>
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Faol va suhbatga tayyor</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yangi</span>
            </button>

            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>O'zbek tili (Lotin)</span>
            </div>
          </div>
        </header>

        {/* Chat message scroll area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 flex flex-col">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className="my-auto py-6">
              <QuickPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            </div>
          ) : (
            <div className="py-2 divide-y divide-slate-800/30">
              {currentConversation.messages.map((message, idx) => (
                <ChatMessage
                  key={message.id || idx}
                  message={message}
                  onRetry={
                    idx === currentConversation.messages.length - 1 &&
                    message.role === 'assistant'
                      ? handleRetryLast
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="shrink-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-2">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStop={handleStop}
          />
        </div>
      </main>
    </div>
  );
}
