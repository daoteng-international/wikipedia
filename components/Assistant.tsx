
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';

interface AssistantProps {
  branches: any[];
  equipments: any[];
  rules: string[];
}

const Assistant: React.FC<AssistantProps> = ({ branches, equipments, rules }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'report' | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: '你好！我是道騰小幫手。請問有什麼可以幫您？(Wifi、印表機、周邊美食)' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setLoading(true);

    const reply = await chatWithGemini(userMsg, branches, equipments, rules);

    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  const handleReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const location = formData.get('location') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;

    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`收到您的回報！\n地點: ${location}\n問題: ${type}\n我們會盡快處理。`);
      setMode(null);
      setIsOpen(false);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setMode('chat'); }}
        className="absolute bottom-24 right-4 bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition-all z-40 flex items-center gap-2 group"
      >
        <Sparkles className="animate-pulse" size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
          AI 幫手
        </span>
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={() => setIsOpen(false)}></div>

      <div className="bg-white w-full h-[80%] sm:h-[600px] sm:w-[90%] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden transform transition-transform mb-0 sm:mb-8">
        {/* Header */}
        <div className="bg-brand-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <h3 className="font-bold">道騰智慧助理</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-brand-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setMode('chat')}
            className={`flex-1 p-3 text-sm font-medium ${mode === 'chat' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}
          >
            AI 諮詢
          </button>
          <button
            onClick={() => setMode('report')}
            className={`flex-1 p-3 text-sm font-medium ${mode === 'report' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}
          >
            一鍵報修
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 relative">

          {mode === 'chat' ? (
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${m.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                    }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                    <Loader2 className="animate-spin text-brand-500" size={16} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <form onSubmit={handleReport} className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex gap-3">
                <AlertTriangle className="text-orange-500 shrink-0" size={24} />
                <p className="text-sm text-orange-800">
                  遇到設備故障或環境髒亂？請填寫下方表單，管理員會立即收到通知。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">發生地點</label>
                <input
                  name="location"
                  type="text"
                  required
                  placeholder="例如：21F 茶水間、20A 會議室"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">問題類型</label>
                <select
                  name="type"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option>Wi-Fi 連線問題</option>
                  <option>印表機故障/缺紙</option>
                  <option>咖啡機/茶水間</option>
                  <option>冷氣/燈光</option>
                  <option>環境清潔</option>
                  <option>其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">詳細描述</label>
                <textarea
                  name="description"
                  className="w-full p-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="請描述發生狀況..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : '送出回報'}
              </button>
            </form>
          )}
        </div>

        {/* Chat Input */}
        {mode === 'chat' && (
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="輸入問題..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputText.trim()}
              className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assistant;
