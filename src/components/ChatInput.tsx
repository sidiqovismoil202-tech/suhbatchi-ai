import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, MicOff, Sparkles, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStop,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  // Voice speech-to-text setup
  useEffect(() => {
    // Check speech recognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'uz-UZ';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Kechirasiz, brauzeringiz ovozli kiritishni (Speech Recognition) qo‘llab-quvvatlamaydi.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-4">
      {/* Short quick action tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => {
            setInput("Sen kimsan?");
            textareaRef.current?.focus();
          }}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
        >
          ❓ Sen kimsan?
        </button>
        <button
          onClick={() => {
            setInput("Salom! Qalaysan?");
            textareaRef.current?.focus();
          }}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
        >
          👋 Salom, qalaysan?
        </button>
        <button
          onClick={() => {
            setInput("Menga dasturlashda biror masalani bosqichma-bosqich tushuntirib ber");
            textareaRef.current?.focus();
          }}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
        >
          💻 Dasturlashda yordam
        </button>
        <button
          onClick={() => {
            setInput("Matematikadan bitta qiziq masala yechamizmi?");
            textareaRef.current?.focus();
          }}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
        >
          🧮 Matematika
        </button>
        <button
          onClick={() => {
            setInput("Ingliz tilida so'zlashuv mashqi qilamiz");
            textareaRef.current?.focus();
          }}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
        >
          🇬🇧 Ingliz tili
        </button>
      </div>

      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-xl transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="O'zbek tilida savolingizni yozing yoki ovoz bering..."
          rows={1}
          className="w-full py-3.5 pl-4 pr-24 sm:pr-28 text-slate-100 placeholder-slate-500 bg-transparent resize-none focus:outline-none text-sm md:text-[15px] leading-relaxed max-h-48"
        />

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {/* Voice button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Ovoz yozishni to'xtatish" : "Ovozli kiritish (Mikrofon)"}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send or Stop button */}
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              title="Javobni to'xtatish"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!input.trim()}
              title="Xabarni yuborish (Enter)"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                input.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 active:scale-95'
                  : 'bg-slate-800/80 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <CornerDownLeft className="w-3 h-3 text-slate-400" /> Enter — yuborish, Shift+Enter — yangi qator
        </span>
        <span className="flex items-center gap-1 text-emerald-300 font-medium">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Faqat o'zbek tilida
        </span>
      </div>
    </div>
  );
};
