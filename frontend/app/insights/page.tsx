'use client';
import AppShell from "../../components/AppShell";
import Sparkline from "../../components/Sparkline";
import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Lightbulb, Globe, Zap } from "lucide-react";

function genSpark(base: number, trend: number): number[] {
  const pts: number[] = [];
  let v = base;
  for (let i = 0; i < 20; i++) {
    v = v * (1 + trend * 0.01 + (Math.random() - 0.48) * 0.012);
    pts.push(v);
  }
  return pts;
}

// Sentiment gauge SVG
function SentimentGauge({ value }: { value: number }) {
  // value: 0 (extreme fear) → 100 (extreme greed)
  const r = 70;
  const cx = 100;
  const cy = 90;
  const circumference = Math.PI * r; // half circle
  const pct = value / 100;
  const filled = circumference * pct;
  const angle = -180 + pct * 180;

  const label =
    value < 20 ? "Extreme Fear"
    : value < 40 ? "Fear"
    : value < 60 ? "Neutral"
    : value < 80 ? "Greed"
    : "Extreme Greed";

  const color =
    value < 20 ? "#DC2626"
    : value < 40 ? "#F97316"
    : value < 60 ? "#EAB308"
    : value < 80 ? "#22C55E"
    : "#16A34A";

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="110" viewBox="0 0 200 110">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#E2E8F0" strokeWidth="14" strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.34,1.56,.64,1), stroke 0.5s" }}
        />
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={cx + Math.cos((angle * Math.PI) / 180) * (r - 10)}
          y2={cy + Math.sin((angle * Math.PI) / 180) * (r - 10)}
          stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: "all 1s cubic-bezier(.34,1.56,.64,1)" }}
        />
        <circle cx={cx} cy={cy} r="5" fill="#0F172A"/>
        {/* Labels */}
        <text x="18" y={cy + 18} fontSize="9" fill="#94A3B8">Fear</text>
        <text x="165" y={cy + 18} fontSize="9" fill="#94A3B8">Greed</text>
      </svg>
      <div className="text-center -mt-2">
        <div className="text-3xl font-bold" style={{ color }}>{value}</div>
        <div className="text-sm font-semibold mt-0.5" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

const MOVERS = [
  { symbol: "SOL/USD",  change: "+4.21%", changeNum: 4.21,  price: "$198.40", spark: genSpark(185, 0.2) },
  { symbol: "BTC/USD",  change: "+2.84%", changeNum: 2.84,  price: "$104,820", spark: genSpark(98000, 0.15) },
  { symbol: "META",     change: "+2.04%", changeNum: 2.04,  price: "$598.73", spark: genSpark(582, 0.1) },
  { symbol: "XRP/USD",  change: "+3.15%", changeNum: 3.15,  price: "$2.41", spark: genSpark(2.2, 0.14) },
  { symbol: "DOGE/USD", change: "-1.22%", changeNum: -1.22, price: "$0.381", spark: genSpark(0.39, -0.06) },
  { symbol: "BNB/USD",  change: "-0.38%", changeNum: -0.38, price: "$654.20", spark: genSpark(660, -0.05) },
  { symbol: "GOOGL",    change: "-0.22%", changeNum: -0.22, price: "$186.42", spark: genSpark(188, -0.01) },
  { symbol: "EUR/USD",  change: "-0.18%", changeNum: -0.18, price: "1.0842", spark: genSpark(1.088, -0.01) },
];

const THEMES = [
  {
    icon: Globe,
    title: "Fed Rate Expectations",
    tag: "Macro",
    color: "#2563EB",
    bg: "#EFF6FF",
    body: "Markets are pricing in a higher-for-longer rate environment. Dollar strength is persisting, creating headwinds for risk assets and EM currencies.",
    signals: ["USD index elevated", "10Y yield above 4.2%", "Risk-off bias in equities"],
  },
  {
    icon: Zap,
    title: "Crypto Market Structure",
    tag: "Crypto",
    color: "#7C3AED",
    bg: "#F5F3FF",
    body: "Bitcoin's ascending triangle on the daily chart is at a decision point. ETF inflows remain positive. Altcoin season indicators suggest capital rotation may be underway.",
    signals: ["BTC dominance: 52.4%", "ETF net inflow: +$380M", "Alt season index: 62/100"],
  },
  {
    icon: TrendingUp,
    title: "AI & Semiconductor Rally",
    tag: "Equity Theme",
    color: "#0891B2",
    bg: "#ECFEFF",
    body: "AI infrastructure spending continues to drive semiconductor stocks. NVDA and AMD are key proxies for the theme, though valuations remain elevated.",
    signals: ["NVDA P/E: 58x (elevated)", "Data center capex rising", "AMD gaining market share"],
  },
];

const SIGNAL_FEED = [
  { asset: "BTC/USD",  tf: "1D", signal: "Ascending Triangle near resistance — watch for breakout above $106,500.", type: "pattern", time: "2m ago" },
  { asset: "SOL/USD",  tf: "4H", signal: "RSI approaching overbought (67). Momentum strong but risk of pullback increases.", type: "indicator", time: "8m ago" },
  { asset: "EUR/USD",  tf: "1H", signal: "MACD bearish crossover confirmed. 1.0800 support being tested.", type: "signal", time: "15m ago" },
  { asset: "NVDA",     tf: "1D", signal: "Distribution pattern forming. Volume declining on up-days — cautious signal.", type: "warning", time: "34m ago" },
  { asset: "META",     tf: "1W", signal: "Weekly uptrend intact. RSI healthy at 61. Next resistance zone at $620.", type: "trend", time: "1h ago" },
  { asset: "ETH/USD",  tf: "1D", signal: "Bull flag consolidation. Volume dry-up typical — waiting for breakout.", type: "pattern", time: "2h ago" },
];

const SIGNAL_COLORS: Record<string, string> = {
  pattern:   "badge-blue",
  indicator: "badge-cyan",
  signal:    "badge-green",
  warning:   "badge-red",
  trend:     "badge-amber",
};

export default function Insights() {
  const [sentiment, setSentiment] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Animate gauge on mount
  useEffect(() => {
    const timer = setTimeout(() => setSentiment(62), 400);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setSentiment(0);
    setTimeout(() => {
      setSentiment(Math.floor(40 + Math.random() * 40));
      setRefreshKey(k => k + 1);
      setRefreshing(false);
    }, 800);
  }

  const gainers = MOVERS.filter(m => m.changeNum > 0).sort((a,b) => b.changeNum - a.changeNum);
  const losers  = MOVERS.filter(m => m.changeNum < 0).sort((a,b) => a.changeNum - b.changeNum);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-[#2563EB] tracking-wide">INSIGHTS</div>
          <h1 className="mt-1 text-3xl font-bold">Market Insights</h1>
          <p className="mt-1 text-sm text-[#64748B]">Sentiment, top movers, macro themes, and AI signals.</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50 disabled:opacity-50 transition-colors">
          <RefreshCw size={14} className={refreshing ? "animate-spin-slow" : ""}/>
          Refresh
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5">
          {/* Sentiment gauge */}
          <div className="card p-5">
            <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-4">Market Sentiment</div>
            <SentimentGauge value={sentiment}/>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-red-50 py-2"><div className="font-bold text-red-600">Fear</div><div className="text-[#94A3B8]">0–40</div></div>
              <div className="rounded-lg bg-yellow-50 py-2"><div className="font-bold text-yellow-600">Neutral</div><div className="text-[#94A3B8]">40–60</div></div>
              <div className="rounded-lg bg-green-50 py-2"><div className="font-bold text-green-600">Greed</div><div className="text-[#94A3B8]">60–100</div></div>
            </div>
            <p className="mt-3 text-[11px] text-center text-[#94A3B8]">Composite sentiment index · Demo data</p>
          </div>

          {/* Top movers */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-green-600"/>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Top Gainers</span>
            </div>
            <div className="space-y-2.5">
              {gainers.map(m => (
                <div key={m.symbol} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{m.symbol}</div>
                    <div className="text-xs text-[#94A3B8]">{m.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkline data={m.spark} positive={true} width={48} height={24}/>
                    <span className="badge badge-green text-[10px]">{m.change}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F1F5F9] mt-4 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={14} className="text-red-600"/>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Top Losers</span>
              </div>
              <div className="space-y-2.5">
                {losers.map(m => (
                  <div key={m.symbol} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{m.symbol}</div>
                      <div className="text-xs text-[#94A3B8]">{m.price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkline data={m.spark} positive={false} width={48} height={24}/>
                      <span className="badge badge-red text-[10px]">{m.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right two columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Macro themes */}
          <div>
            <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-3">Macro Themes</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {THEMES.map(t => (
                <div key={t.title} className="card-hover p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: t.bg }}>
                      <t.icon size={15} style={{ color: t.color }}/>
                    </div>
                    <span className="badge badge-slate text-[10px]">{t.tag}</span>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mb-2">{t.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">{t.body}</p>
                  <div className="space-y-1">
                    {t.signals.map(s => (
                      <div key={s} className="text-[11px] text-[#64748B] flex items-start gap-1">
                        <span className="mt-0.5 shrink-0" style={{ color: t.color }}>•</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI signal feed */}
          <div className="card overflow-hidden">
            <div className="border-b border-[#E2E8F0] px-5 py-3 flex items-center gap-2">
              <Lightbulb size={15} className="text-[#2563EB]"/>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">AI Signal Feed</span>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {SIGNAL_FEED.map((s, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3 hover:bg-[#F8FAFC] transition-colors">
                  <div className="shrink-0 pt-0.5">
                    <span className={`badge ${SIGNAL_COLORS[s.type]}`}>{s.type}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">{s.asset}</span>
                      <span className="badge badge-slate text-[10px]">{s.tf}</span>
                    </div>
                    <p className="text-sm text-[#334155]">{s.signal}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[#94A3B8] mt-0.5">{s.time}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F1F5F9] px-5 py-2.5 text-[11px] text-[#94A3B8]">
              Demo signals · Connect live data provider for real-time feed
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}