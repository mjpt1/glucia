'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_PROMPTS = [
  'قند خون بالای ۲۵۰ چه کاری باید بکنم؟',
  'بهترین میان‌وعده برای دیابت نوع ۲؟',
  'ورزش صبحگاهی چه تاثیری بر قند دارد؟',
  'با HbA1c بالا چطور کنار بیام؟',
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'سلام! من کوچ هوشمند مهسا هستم. هر سوالی درباره دیابت، قند خون، تغذیه یا سبک زندگی داری بپرس. 🌟' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: text });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      toast.error('خطا در ارتباط با هوش مصنوعی');
      setMessages(prev => [...prev, { role: 'assistant', content: 'متأسفانه خطایی رخ داد. لطفاً دوباره امتحان کنید.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="کوچ هوشمند">
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto gap-4">
        {/* Header */}
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">کوچ مهسا</h2>
              <p className="text-white/50 text-sm">مشاور هوشمند دیابت — پاسخ‌های شخصی‌سازی‌شده</p>
            </div>
            <div className="mr-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs">آنلاین</span>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-4 h-full overflow-y-auto space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                    {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-white/5 border border-white/10 text-white rounded-tr-sm' : 'bg-blue-600 text-white rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 rounded-tr-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </CardContent>
        </Card>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs text-right hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                <Sparkles size={12} className="text-purple-400 shrink-0" />
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <Card>
          <CardContent className="p-3">
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="سوال خود را بنویسید..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || loading} loading={loading} size="icon">
                <Send size={16} />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
