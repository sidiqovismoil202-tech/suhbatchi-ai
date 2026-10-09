import React, { useState, useEffect } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, RotateCw, AlertCircle, Sparkles } from 'lucide-react';
import { Message } from '../types/chat';
import { MarkdownView } from './MarkdownView';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // copy fallback
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown syntax for clearer text-to-speech
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, "Keltirilgan dasturiy kod.")
      .replace(/[*_#`~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'uz-UZ';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group w-full py-4 px-3 sm:px-5 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-slate-900/40 border-y border-slate-800/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3.5 md:gap-4 items-start">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md ring-2 ring-sky-500/30">
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          ) : (
            <div className="relative">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg ring-2 ring-emerald-500/30">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950"></span>
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">
                {isUser ? "Siz" : "Hamdam AI"}
              </span>
              {!isUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  O'zbekcha
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">{formattedTime}</span>
          </div>

          {/* Message content */}
          {message.error ? (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Xatolik yuz berdi</p>
                <p className="text-xs text-rose-300/80 mt-0.5">{message.content}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-800/50 hover:bg-rose-800 text-xs text-white font-medium transition cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Qayta urinish
                  </button>
                )}
              </div>
            </div>
          ) : isUser ? (
            <div className="text-slate-100 text-[15px] whitespace-pre-wrap leading-relaxed select-text">
              {message.content}
            </div>
          ) : (
            <div className="relative">
              <MarkdownView content={message.content} />

              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
              )}
            </div>
          )}

          {/* Action buttons (copy, voice, retry) */}
          {!isUser && !message.error && !message.isStreaming && message.content && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/40 text-slate-400">
              <button
                onClick={handleCopy}
                title="Xabarni nusxalash"
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 hover:text-slate-200 text-xs transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nusxa olish</span>
                  </>
                )}
              </button>

              {'speechSynthesis' in window && (
                <button
                  onClick={handleSpeak}
                  title={isSpeaking ? "O'qishni to'xtatish" : "Ovoz chiqarib o'qish"}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition cursor-pointer ${
                    isSpeaking
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>To'xtatish</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Ovozli eshitish</span>
                    </>
                  )}
                </button>
              )}

              {onRetry && (
                <button
                  onClick={onRetry}
                  title="Qayta javob olish"
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 hover:text-slate-200 text-xs transition cursor-pointer ml-auto"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Qayta yozish</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
