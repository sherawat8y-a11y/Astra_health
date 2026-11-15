'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RotateCcw
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

interface Message {
  id: string;
  sender: 'user' | 'astra_ai';
  text: string;
  timestamp: string;
}

const PRESET_QUERIES = [
  { label: 'Current Health Status', prompt: 'What is my current health status?' },
  { label: 'Why Alert Generated?', prompt: 'Why did I receive this health alert?' },
  { label: '7-Day Heart Rate Trend', prompt: 'How has my heart rate changed over the last seven days?' },
  { label: 'Sleep Consistency', prompt: 'Am I sleeping consistently?' },
  { label: 'Radiation Trend', prompt: 'Show my radiation exposure trend.' },
  { label: 'Indicators Needing Attention', prompt: 'What health indicators need attention?' },
  { label: 'Weekly Report Summary', prompt: 'Summarize my weekly health report.' }
];

export default function AstraAiAssistantPage() {
  const { astronauts, selectedAstronautId, setSelectedAstronautId } = useTelemetry();

  const astro = astronauts.find(a => a.id === selectedAstronautId) || astronauts[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'astra_ai',
      text: `Greetings, ${astro?.rank || 'Commander'} ${astro?.name || 'Astronaut'}. I am **ASTRA AI**, your deep-space clinical decision intelligence assistant on the Lunar Gateway.\n\nI continuously synthesize your vital signs, active dosimeters, sleep architecture, and countermeasure records to provide explainable decision support.\n\nHow may I assist your mission health review today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          astronautId: selectedAstronautId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          setMessages(prev => [...prev, {
            id: data.message.id || `ai-${Date.now()}`,
            sender: 'astra_ai',
            text: data.message.text,
            timestamp: data.message.timestamp
          }]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <Bot className="h-4 w-4" />
            <span>Autonomous Medical Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            ASTRA AI Assistant
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Conversational astronaut health companion synthesizing multi-parameter telemetry, radiation thresholds, and countermeasure guidelines.
          </p>
        </div>

        {/* Astronaut Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6E6E73] font-medium">Consulting For:</span>
          <select
            value={selectedAstronautId}
            onChange={(e) => setSelectedAstronautId(e.target.value)}
            className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl py-1.5 px-3 text-xs text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            {astronauts.map(a => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Fast-Action Queries */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide px-1">
          Recommended Clinical Inquiries
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.prompt)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0F7FF] text-[#1D1D1F] hover:text-[#0071E3] border border-[#E5E5EA] hover:border-[#0071E3] text-xs font-medium transition-all shadow-xs"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-sm flex flex-col h-[580px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  isUser ? 'bg-[#0071E3] text-white' : 'bg-[#EBF5FF] text-[#0071E3]'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[80%] ${
                  isUser 
                    ? 'bg-[#0071E3] text-white rounded-tr-xs' 
                    : 'bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA] rounded-tl-xs'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[10px] mt-2 font-medium ${isUser ? 'text-blue-100 text-right' : 'text-[#6E6E73]'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EBF5FF] text-[#0071E3] flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-xs p-4 bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#6E6E73] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0071E3] animate-pulse" />
                <span>Synthesizing multi-indicator spaceflight health vectors...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#F5F5F7]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#0071E3]/20 focus-within:border-[#0071E3] transition-all"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Ask ASTRA AI about ${astro?.name || 'crew'} health metrics, alerts, or flight protocols...`}
              className="flex-1 px-4 py-2 bg-transparent text-sm text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="w-10 h-10 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
