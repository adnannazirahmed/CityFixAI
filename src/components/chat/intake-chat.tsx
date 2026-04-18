'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Globe, AlertTriangle, CheckCircle2, Clock, Building2, Zap, MessageSquare, Camera, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DEPARTMENT_LABELS } from '@/data/seeclickfix-categories';
import type { ChatMessage, IntakeData } from '@/lib/openai/intake-chat';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', label: 'English',    placeholder: 'Describe the city issue…' },
  { code: 'es', flag: '🇪🇸', label: 'Español',    placeholder: 'Describe el problema…' },
  { code: 'pt', flag: '🇧🇷', label: 'Português',  placeholder: 'Descreva o problema…' },
  { code: 'fr', flag: '🇫🇷', label: 'Français',   placeholder: 'Décrivez le problème…' },
  { code: 'zh', flag: '🇨🇳', label: '中文',        placeholder: '描述城市问题…' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية',    placeholder: 'صف المشكلة…' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt', placeholder: 'Mô tả vấn đề…' },
  { code: 'so', flag: '🇸🇴', label: 'Soomaali',   placeholder: 'Sharax dhibaatada…' },
];

export function IntakeChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [chatState, setChatState] = useState<string>('greeting');
  const [language, setLanguage] = useState('en');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  // Fetch initial greeting on mount
  useEffect(() => { callAI([], language); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function callAI(history: ChatMessage[], lang: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language: lang }),
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'assistant', content: data.reply ?? '…' },
      ]);
      if (data.intake) setIntake(data.intake);
      if (data.state) setChatState(data.state);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: `ai-err-${Date.now()}`, role: 'assistant', content: "I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || chatState === 'complete') return;

    const userMsg: DisplayMessage = { id: `user-${Date.now()}`, role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');

    await callAI(updated.map(m => ({ role: m.role, content: m.content })), language);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
      setPhotoName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoDataUrl(null);
    setPhotoName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmitReport() {
    if (!intake || submitted) return;

    if (!photoDataUrl) {
      setPhotoError('A photo is required. Please upload a photo of the issue.');
      return;
    }

    setPhotoError(null);
    setSubmitting(true);

    // Try geolocation; fall back to Worcester, MA City Hall
    let lat = 42.2626;
    let lng = -71.8023;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch { /* use default */ }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: intake.description_en, latitude: lat, longitude: lng, image_url: photoDataUrl }),
      });

      if (!res.ok) throw new Error('submit failed');

      setSubmitted(true);
      setChatState('complete');

      const successMsg: Record<string, string> = {
        en: '✅ Report submitted! City staff will be notified shortly. Thank you for helping improve Worcester.',
        es: '✅ ¡Reporte enviado! El personal de la ciudad será notificado pronto. Gracias por mejorar Worcester.',
        pt: '✅ Relatório enviado! A equipe da cidade será notificada em breve. Obrigado por ajudar Worcester.',
      };
      setMessages(prev => [
        ...prev,
        { id: `done-${Date.now()}`, role: 'assistant', content: successMsg[language] ?? successMsg.en },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', content: 'Failed to submit. Please try again.' },
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  const isConfirming = chatState === 'confirming' || chatState === 'complete';

  return (
    <div className="flex flex-col h-full">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            <MessageSquare className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">CityFix AI</p>
            <p className="text-xs text-gray-500">Choose your language below</p>
          </div>
        </div>

        {/* Language picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangPickerOpen(o => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span>{selectedLang.flag} {selectedLang.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {langPickerOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-gray-100 bg-white shadow-lg py-1 overflow-hidden">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    if (lang.code === language) { setLangPickerOpen(false); return; }
                    setLanguage(lang.code);
                    setLangPickerOpen(false);
                    // Reset conversation in new language
                    setMessages([]);
                    setIntake(null);
                    setChatState('greeting');
                    setSubmitted(false);
                    callAI([], lang.code);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                    lang.code === language ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Messages ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 mr-2 shrink-0 mt-0.5">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white text-gray-900 border border-gray-100 shadow-sm rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 mr-2 shrink-0 mt-0.5">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─── Intake Preview ───────────────────────────────────────────────────── */}
      {intake && isConfirming && (
        <div className="border-t bg-white px-4 py-3 shrink-0">
          <Card className={`border-2 ${intake.auto_escalate ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
            <CardContent className="pt-3 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Report Preview</p>
                {intake.auto_escalate && (
                  <Badge className="bg-red-500 text-white text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    EMERGENCY
                  </Badge>
                )}
              </div>

              <p className="text-sm font-semibold text-gray-800">{intake.seeclickfix_label}</p>

              <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>{DEPARTMENT_LABELS[intake.department]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>
                    {intake.sla_hours < 24
                      ? `${intake.sla_hours}h SLA`
                      : `${Math.round(intake.sla_hours / 24)}d SLA`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Detected: {intake.detected_language} · Ticket filed in English</span>
                </div>
              </div>

              {!submitted && (
                <>
                  {/* Photo upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {photoDataUrl ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-blue-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoDataUrl} alt="Issue photo" className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                        {photoName}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 py-3 text-sm text-red-600 font-medium hover:bg-red-100 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      Upload a photo (required)
                    </button>
                  )}

                  {photoError && (
                    <p className="text-xs text-red-600 font-medium">{photoError}</p>
                  )}

                  <Button
                    onClick={handleSubmitReport}
                    disabled={submitting}
                    size="sm"
                    className={`w-full ${intake.auto_escalate ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {submitting
                      ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting…</>
                      : <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Submit Report</>}
                  </Button>
                </>
              )}
              {submitted && (
                <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Report submitted!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Input ────────────────────────────────────────────────────────────── */}
      {!submitted && (
        <div className="px-4 py-3 border-t bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={selectedLang.placeholder}
              disabled={loading || chatState === 'complete'}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading || chatState === 'complete'}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 text-center">
            8 languages supported · tickets filed in English for city staff
          </p>
        </div>
      )}
    </div>
  );
}
