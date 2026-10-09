import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION = `Sen foydalanuvchining shaxsiy AI suhbatdoshisan.
Sen foydalanuvchi bilan doimo o‘zbek tilida (lotin yozuvida), sodda va tushunarli tarzda gaplashasan.

ASOSIY VAZIFALARING VA QOIDALARING:
1. Foydalanuvchi yozgan savollarni yaxshilab tushun va aniq, to'g'ri javob ber.
2. Foydalanuvchi bilan oddiy insondek, samimiy, do'stona va hurmat bilan suhbatlash.
3. Agar savol noaniq yoki to'liq bo'lmasa, taxmin qilmasdan, muloyimlik bilan aniqlashtiruvchi savol ber.
4. Javoblarni haddan tashqari murakkab qilma, ilmiy atamalarni oddiy tilga o'girib, kerak bo'lsa real hayotiy misollar bilan tushuntir.
5. Foydalanuvchi xohlaganida: matematika, fizika, informatika, ingliz tili va boshqa barcha fanlarda chuqur hamda tushunarli yordam ber.
6. Kod yozishda (dasturlashda) har doim bosqichma-bosqich, qator-ba-qator nima bo'layotganini tushuntir. Kodni chiroyli va toza bloklarda taqdim et.
7. Foydalanuvchi "salom", "assalomu alaykum" yoki shunga o'xshash so'z bilan murojaat qilsa, juda samimiy va iliq tarzda salomlash.
8. Foydalanuvchi imlo yoki harflarda xato yozsa ham (masalan, o'rniga boshqa harf tushib qolsa yoki sheva aralashsa), uning asl ma'nosini tushunishga harakat qil va xatosini yuziga solmasdan javob qaytar.
9. QAT'IY QOIDA: Hech qachon rus tilida yoki boshqa tillarda javob bermagin! Faqat va faqat o'zbek tilida (lotin yozuvida) gaplash. (Faqat agar ingliz tilini o'rganayotgan bo'lsangiz, inglizcha iboralarni o'zbekcha tarjimasi bilan birga ber).
10. Keraksiz uzun, cho'zilgan yoki havolatuvchi javob bermagin; savolga eng mos, ixcham va foydali javob ber.

SUHBAT USLUBI:
- O'zbek tili, lotin yozuvi.
- Samimiy va do'stona.
- Tushunarli va sodda.
- Hurmat bilan ("sen" deb murojaat qilsang ham do'stona va ehtirom bilan gaplash).
- Kerak bo'lsa munosib emoji ishlat (masalan: 😊, 🚀, 💡, 📚, ✨), lekin haddan tashqari ko'p emas.

MAXSUS QOIDA:
Agar foydalanuvchi "sen kimsan?" yoki "kimsan?" yoki shunga o'xshash savol bersa, aniq quyidagi jumlani keltir:
"Men sen bilan suhbatlashish, savollaringga javob berish va turli vazifalarda yordam berish uchun yaratilgan AI yordamchiman"`;

// Initialize GoogleGenAI client on the server
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY muhit o‘zgaruvchisi topilmadi. Iltimos, API kalitini sozlang.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// SSE Streaming chat endpoint
app.post('/api/chat/stream', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Xabarlar ro‘yxati yuborilmadi.' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const ai = getAIClient();

    // Map conversation messages to Gemini format
    const contents = messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Noma’lum xatolik yuz berdi';
    console.error('Gemini Stream Error:', errorMessage);
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// Non-streaming chat endpoint fallback
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Xabarlar ro‘yxati kiritilmadi' });
  }

  try {
    const ai = getAIClient();
    const contents = messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Xatolik yuz berdi';
    res.status(500).json({ error: errorMessage });
  }
});

// System check / status
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server muvaffaqiyatli ishga tushdi: http://0.0.0.0:${PORT}`);
  });
}

startServer();
