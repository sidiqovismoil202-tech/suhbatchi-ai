import React from 'react';
import {
  HelpCircle,
  Calculator,
  Atom,
  Code2,
  BookOpen,
  MessageCircle,
  Lightbulb,
} from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  const promptList = [
    {
      category: "Tanishuv",
      icon: HelpCircle,
      title: "Sen kimsan?",
      prompt: "Sen kimsan?",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300",
      description: "AI yordamchining maqsadi va vazifalari",
    },
    {
      category: "Salomlashuv",
      icon: MessageCircle,
      title: "Salom, qalaysan?",
      prompt: "Salom! Bugungi kayfiyating qanday?",
      color: "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-300",
      description: "Oddiy insondek iliq va do'stona suhbat",
    },
    {
      category: "Dasturlash",
      icon: Code2,
      title: "Kod yozishni o'rganish",
      prompt: "Python-da ro'yxatdan takrorlangan elementlarni (dublikatlarni) olib tashlashni menga bosqichma-bosqich tushuntirib ber.",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300",
      description: "Qadam-baqadam izohli kod va misollar",
    },
    {
      category: "Matematika",
      icon: Calculator,
      title: "Tenglamalar tizimi",
      prompt: "Menga quyidagi tenglamalar tizimini oddiy usulda yechishni tushuntir: 2x + y = 10 va x - y = 2.",
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300",
      description: "Tushunarli formula va amaliy hisoblash",
    },
    {
      category: "Fizika",
      icon: Atom,
      title: "Nyuton qonunlari",
      prompt: "Nyutonning ikkinchi qonunini hayotiy va oddiy misol orqali tushuntirib bera olasanmi?",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300",
      description: "Murakkab fizika qonunlarini sodda til bilan",
    },
    {
      category: "Ingliz tili",
      icon: BookOpen,
      title: "Grammatika qoidasi",
      prompt: "Ingliz tilida 'Present Perfect' va 'Past Simple' zamonlarining farqini o'zbek tilida oddiy misollar bilan tushuntir.",
      color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300",
      description: "So'zlashuv va grammatika mashqi",
    },
    {
      category: "Mantiq",
      icon: Lightbulb,
      title: "Qiziqarli mantiqiy savol",
      prompt: "Menga o'ylantiradigan qiziqarli mantiqiy topishmoq ayt-chi, keyin javobini topishimga qarab baho berarsan.",
      color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-300",
      description: "Zehnni charxlovchi savol-javob",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <span>🇺🇿 Shaxsiy AI Suhbatdoshingiz</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Nima haqida gaplashamiz?
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Istagan savolingizni bering. Dasturlash, fanlar yoki oddiy do‘stona suhbat — doimo xizmatingizdaman.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {promptList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} border text-left hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer shadow-lg hover:shadow-xl group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold tracking-wide uppercase opacity-75">
                    {item.category}
                  </span>
                  <Icon className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-semibold text-white text-sm mb-1 line-clamp-1">
                  {item.title}
                </div>
                <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
