'use client';
import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Clock3, Trash2, ChevronDown, ChevronUp, BarChart3, ExternalLink, Search } from "lucide-react";

type SavedAnalysis = {
  id: string;
  asset: string;
  timeframe: string;
  date: string;
  aiSummary: string;
  indicators: { rsi: string; macd: string; pattern: string; volatility: string };
  notes?: string;
};

// Demo seeded history entries
const DEMO_HISTORY: SavedAnalysis[] = [
  {
    id: "demo-1",
    asset: "BTC/USD",
    timeframe: "1D",
    date: new Date(Date.now() - 2 * 3600000).toISOString(),
    aiSummary: "Ascending triangle forming on the daily chart with bullish MACD divergence. RSI at 58 suggests momentum without overbought conditions. Volume profile confirms accumulation bias. Key resistance at $106,500.",
    indicators: { rsi: "58.4", macd: "Positive", pattern: "Ascending Triangle", volatility: "Elevated" },
    notes: "Watch $106,500 resistance. Volume picking up. Cautiously bullish.",
  },
  {
    id: "demo-2",
    asset: "NVDA",
    timeframe: "4H",
    date: new Date(Date.now() - 18 * 3600000).toISOString(),
    aiSummary: "Distribution pattern visible on 4H timeframe. RSI declining from overbought territory. MACD showing negative crossover. Earnings risk still elevated. Monitor for confirmation of breakdown below $144.",
    indicators: { rsi: "48.3", macd: "Negative", pattern: "Distribution", volatility: "High" },
    notes: "Potential short-term pullback. Wait for clearer signal.",
  },
  {
    id: "demo-3",
    asset: "ETH/USD",
    timeframe: "1W",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    aiSummary: "Weekly timeframe showing bull flag consolidation after strong upside move. RSI healthy at 54. If the flag resolves upward, next target zone around $4,200. Volume declining during consolidation — typical for healthy flag pattern.",
    indicators: { rsi: "54.1", macd: "Neutral", pattern: "Bull Flag", volatility: "Moderate" },
    notes: "Patient position — waiting for breakout confirmation.",
  },
  {
    id: "demo-4",
    asset: "EUR/USD",
    timeframe: "1H",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    aiSummary: "Short-term downtrend intact on the hourly chart. RSI stuck below 45 — bearish bias. Dollar strength narrative keeping EUR/USD under pressure. Watch 1.0800 as near-term support.",
    indicators: { rsi: "44.2", macd: "Negative", pattern: "Downtrend", volatility: "Low" },
  },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "Just now";
}

export default function History() {
  const [entries, setEntries] = useState<SavedAnalysis[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("neltrix_history");
      const parsed: SavedAnalysis[] = saved ? JSON.parse(saved) : [];
      // Merge demo entries (show demo ones if user has none yet)
      const merged = parsed.length > 0 ? [...parsed, ...DEMO_HISTORY] : DEMO_HISTORY;
      setEntries(merged);
    } catch {
      setEntries(DEMO_HISTORY);
    }
  }, []);

  function deleteEntry(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    // Only persist non-demo entries
    const toSave = updated.filter(e => !e.id.startsWith("demo-"));
    localStorage.setItem("neltrix_history", JSON.stringify(toSave));
  }

  function clearAll() {
    setEntries(DEMO_HISTORY);
    localStorage.removeItem("neltrix_history");
    setConfirmClear(false);
  }

  const filtered = entries.filter(e =>
    !filter ||
    e.asset.toLowerCase().includes(filter.toLowerCase()) ||
    e.timeframe.toLowerCase().includes(filter.toLowerCase())
  );

  const macdColor = (v: string) => v === "Positive" ? "text-green-600" : v === "Negative" ? "text-red-600" : "text-[#64748B]";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-[#2563EB] tracking-wide">HISTORY</div>
          <h1 className="mt-1 text-3xl font-bold">Analysis History</h1>
          <p className="mt-1 text-sm text-[#64748B]">Your saved analyses and AI-generated summaries.</p>
        </div>
        <div className="flex items-center gap-2">
          {confirmClear ? (
            <>
              <span className="text-sm text-[#64748B]">Clear all?</span>
              <button onClick={clearAll} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Confirm</button>
              <button onClick={() => setConfirmClear(false)} className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
            </>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#64748B] hover:bg-slate-50 hover:text-red-600 transition-colors">
              <Trash2 size={14}/> Clear history
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"/>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by asset or timeframe..."
          className="input-base pl-9"
        />
      </div>

      {/* Count */}
      <div className="mb-3 text-xs text-[#94A3B8]">{filtered.length} analysis entries</div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Clock3 size={40} className="text-[#CBD5E1] mb-4"/>
          <h2 className="text-lg font-semibold">No history yet</h2>
          <p className="mt-2 text-sm text-[#64748B] max-w-xs">Save analyses from the Analysis workspace to see them here.</p>
          <Link href="/analysis" className="mt-5 flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">
            <BarChart3 size={15}/> Open Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const isOpen = expanded === e.id;
            const isDemo = e.id.startsWith("demo-");
            return (
              <div key={e.id} className="card overflow-hidden transition-all">
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EFF6FF]">
                      <BarChart3 size={18} className="text-[#2563EB]"/>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{e.asset}</span>
                        <span className="badge badge-blue">{e.timeframe}</span>
                        {isDemo && <span className="badge badge-slate">Demo</span>}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-xs sm:max-w-md">
                        {e.aiSummary.slice(0, 80)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="hidden sm:block text-xs text-[#94A3B8]">{timeAgo(e.date)}</span>
                    {isOpen ? <ChevronUp size={16} className="text-[#64748B]"/> : <ChevronDown size={16} className="text-[#64748B]"/>}
                  </div>
                </button>

                {/* Expanded panel */}
                {isOpen && (
                  <div className="border-t border-[#F1F5F9] px-4 pb-4 pt-3 animate-fade-in">
                    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                      <div>
                        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">AI Summary</div>
                        <p className="text-sm text-[#334155] leading-relaxed">{e.aiSummary}</p>
                        {e.notes && (
                          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 p-3">
                            <div className="text-xs font-bold text-amber-700 mb-1">Notes</div>
                            <p className="text-sm text-amber-800">{e.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">Indicators snapshot</div>
                          <div className="card p-3 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-[#64748B]">RSI</span><b>{e.indicators.rsi}</b></div>
                            <div className="flex justify-between"><span className="text-[#64748B]">MACD</span><b className={macdColor(e.indicators.macd)}>{e.indicators.macd}</b></div>
                            <div className="flex justify-between"><span className="text-[#64748B]">Pattern</span><b className="text-right text-xs max-w-[110px]">{e.indicators.pattern}</b></div>
                            <div className="flex justify-between"><span className="text-[#64748B]">Volatility</span><b>{e.indicators.volatility}</b></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/analysis?asset=${encodeURIComponent(e.asset)}`}
                            className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
                          >
                            <ExternalLink size={12}/> Re-open
                          </Link>
                          <button
                            onClick={() => deleteEntry(e.id)}
                            className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs text-[#64748B] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}