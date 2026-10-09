import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Download,
  Info,
  X,
  Sparkles,
  Bot,
  ExternalLink,
  BookOpenCheck,
} from 'lucide-react';
import { Conversation } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  onExport: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAll,
  onExport,
  isOpen,
  onClose,
}) => {
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App brand header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                Hamdam AI
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  v3.8
                </span>
              </h1>
              <p className="text-xs text-slate-400">Shaxsiy AI suhbatdoshingiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md shadow-emerald-950/50 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi suhbat boshlash</span>
          </button>
        </div>

        {/* Search input if more than 3 chats */}
        {conversations.length > 3 && (
          <div className="px-3 pb-2">
            <input
              type="text"
              placeholder="Suhbatlarni qidirish..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Suhbatlar tarixi</span>
            <span className="text-slate-500 font-normal">{conversations.length} ta</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              {conversations.length === 0
                ? "Hozircha suhbatlar yo'q. Birinchi xabaringizni yozing!"
                : "Mos suhbat topilmadi."}
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{conv.title || "Yangi suhbat"}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    title="O'chirish"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom controls */}
        <div className="p-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
          <button
            onClick={() => setShowRulesModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
          >
            <BookOpenCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Vazifalari & Qoidalari</span>
          </button>

          <button
            onClick={onExport}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Suhbatni yuklab olish (.md)</span>
          </button>

          {conversations.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Barcha suhbatlar tarixini tozalashni tasdiqlaysizmi?")) {
                  onClearAll();
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Tarixni tozalash</span>
            </button>
          )}

          <div className="pt-2 px-2 text-[11px] text-slate-400 border-t border-slate-800/50 flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-400" /> O'zbek tili
            </span>
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </aside>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <BookOpenCheck className="w-5 h-5 text-emerald-400" />
                <span>AI Vazifalari & Suhbat Qoidalari</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                <p className="font-semibold mb-1">Doimo o'zbek tilida (lotin yozuvida)</p>
                <p className="text-xs text-emerald-200/80">
                  Oddiy, samimiy, insondek va tushunarli uslubda gaplashadi. Rus tilida javob bermaydi.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-400">
                  Belgilangan 10 ta asosiy vazifa:
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-300 text-xs">
                  <li>Yozilgan savollarni to‘liq tushunib, aniq javob berish.</li>
                  <li>Oddiy insondek, samimiy va do‘stona suhbatlashish.</li>
                  <li>Savol noaniq bo‘lsa, aniqlashtiruvchi savol berish.</li>
                  <li>Javoblarni murakkablashtirmasdan, hayotiy misollar bilan tushuntirish.</li>
                  <li>Matematika, fizika, informatika, ingliz tili va boshqa fanlarda chuqur yordam.</li>
                  <li>Kod yozishda bosqichma-bosqich, qator-ba-qator tushuntirish.</li>
                  <li>"Salom" deb yozilganda iliq va samimiy salomlashish.</li>
                  <li>Imlo xatolarini tushunib, to‘g‘ri ma’noni ilg‘ash.</li>
                  <li>Rus tilida emas, faqat o‘zbek tilida gaplashish.</li>
                  <li>Keraksiz cho‘zmasdan, lo‘nda va foydali javob qaytarish.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-semibold text-white text-xs mb-1">Maxsus savol:</p>
                <p className="text-xs text-amber-300 font-mono">"Sen kimsan?"</p>
                <p className="text-xs text-slate-400 mt-1 italic">
                  Javob: "Men sen bilan suhbatlashish, savollaringga javob berish va turli vazifalarda yordam berish uchun yaratilgan AI yordamchiman"
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition cursor-pointer"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
