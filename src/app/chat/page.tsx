import { Navbar } from '@/components/layout/navbar';
import { IntakeChat } from '@/components/chat/intake-chat';
import { Globe, Zap, MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          {/* ─── Page header ─────────────────────────────────────────────── */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 mb-4">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Multilingual AI Intake</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Chat to Report
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Just describe the issue in your language. AI classifies, routes, and files the report.
            </p>
          </div>

          {/* ─── Feature pills ────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Globe, label: 'Any Language', sub: 'EN · ES · PT · more' },
              { icon: Zap, label: 'Smart Routing', sub: '35 SeeClickFix categories' },
              { icon: MessageSquare, label: 'No Forms', sub: 'Just chat' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center bg-white rounded-xl border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 mx-auto mb-1.5">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* ─── Chat window ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ height: '580px' }}>
            <IntakeChat />
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Routes to the right city department automatically · Worcester, MA
          </p>
        </div>
      </div>
    </div>
  );
}
