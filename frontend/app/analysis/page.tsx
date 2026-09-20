'use client';
import AppShell from "../../components/AppShell";
import Chart from "../../components/Chart";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrainCircuit, Save, Sparkles, Check } from "lucide-react";

const ASSETS = ["BTC/USD","ETH/USD","SOL/USD","BNB/USD","XRP/USD","AAPL","NVDA","TSLA","MSFT","AMZN","GOOGL","META","EUR/USD","GBP/USD","USD/JPY"];

const CONTEXT: Record<string, { price: string; change: string; rsi: string; macd: string; pattern: string; ema: string; vol: string; volCtx: string; momentum: string }> = {
  "BTC/USD":  { price: "$104,820.12", change: "+2.84%", rsi: "58.4", macd: "Positive", pattern: "Ascending Triangle", ema: "$103,420",  vol: "31.2%", volCtx: "Elevated",     momentum: "Constructive" },
  "ETH/USD":  { price: "$3,812.42",   change: "+1.62%", rsi: "54.1", macd: "Neutral",  pattern: "Bull Flag",           ema: "$3,780",    vol: "28.4%", volCtx: "Moderate",     momentum: "Neutral"  },
  "SOL/USD":  { price: "$198.40",     change: "+4.21%", rsi: "67.2", macd: "Positive", pattern: "Breakout",            ema: "$191.20",   vol: "45.1%", volCtx: "High",          momentum: "Strong"   },
  "AAPL":     { price: "$227.81",     change: "+0.91%", rsi: "52.8", macd: "Neutral",  pattern: "Range Consolidation", ema: "$225.40",   vol: "18.2%", volCtx: "Low",           momentum: "Neutral"  },
  "NVDA":     { price: "$146.38",     change: "-0.42%", rsi: "48.3", macd: "Negative", pattern: "Distribution",        ema: "$148.90",   vol: "38.9%", volCtx: "Elevated",     momentum: "Cautious" },
  "TSLA":     { price: "$342.91",     change: "+1.34%", rsi: "55.9", macd: "Positive", pattern: "Recovery Rally",      ema: "$337.10",   vol: "52.4%", volCtx: "Very High",    momentum: "Constructive" },
  "MSFT":     { price: "$441.26",     change: "+0.53%", rsi: "53.0", macd: "Neutral",  pattern: "Steady Uptrend",      ema: "$438.50",   vol: "16.1%", volCtx: "Low",           momentum: "Stable"   },
  "AMZN":     { price: "$209.14",     change: "+1.18%", rsi: "56.4", macd: "Positive", pattern: "Cup and Handle",      ema: "$205.80",   vol: "22.3%", volCtx: "Moderate",     momentum: "Constructive" },
  "META":     { price: "$598.73",     change: "+2.04%", rsi: "61.2", macd: "Positive", pattern: "Strong Uptrend",      ema: "$588.40",   vol: "26.7%", volCtx: "Moderate",     momentum: "Strong"   },
  "GOOGL":    { price: "$186.42",     change: "-0.22%", rsi: "49.8", macd: "Neutral",  pattern: "Sideways",            ema: "$186.90",   vol: "19.4%", volCtx: "Low",           momentum: "Neutral"  },
  "EUR/USD":  { price: "1.0842",      change: "-0.18%", rsi: "44.2", macd: "Negative", pattern: "Downtrend",           ema: "1.0880",    vol: "6.8%",  volCtx: "Low",           momentum: "Cautious" },
  "GBP/USD":  { price: "1.2938",      change: "+0.12%", rsi: "50.1", macd: "Neutral",  pattern: "Range",               ema: "1.2920",    vol: "7.1%",  volCtx: "Low",           momentum: "Neutral"  },
  "USD/JPY":  { price: "154.82",      change: "+0.34%", rsi: "57.3", macd: "Positive", pattern: "Uptrend",             ema: "153.50",    vol: "8.2%",  volCtx: "Low",           momentum: "Constructive" },
};

function getDemoAnswer(prompt: string, asset: string): string {
  const ctx = CONTEXT[asset] || CONTEXT["BTC/USD"];
  const p = prompt.toLowerCase();
  if (p.includes("trend")) return `${asset} is showing a ${ctx.momentum.toLowerCase()} trend. RSI at ${ctx.rsi} and MACD ${ctx.macd.toLowerCase()} — momentum leans ${ctx.macd === "Positive" ? "bullish" : ctx.macd === "Negative" ? "bearish" : "neutral"}. Pattern: ${ctx.pattern}. Monitor volume for confirmation.`;
  if (p.includes("signal") || p.includes("indicator")) return `Key signals for ${asset}: RSI ${ctx.rsi} (${parseFloat(ctx.rsi) > 60 ? "elevated" : parseFloat(ctx.rsi) < 40 ? "oversold" : "neutral"}), MACD ${ctx.macd}, EMA 20 at ${ctx.ema}. Volatility is ${ctx.volCtx} at ${ctx.vol}. Pattern: ${ctx.pattern}. Confluence of signals leans ${ctx.macd === "Positive" ? "bullish" : "cautious"}.`;
  if (p.includes("pattern")) return `Detected pattern on ${asset}: **${ctx.pattern}**. This formation suggests ${ctx.macd === "Positive" ? "potential continuation of upside momentum — watch for a breakout above resistance with volume confirmation" : "distribution or consolidation — confirmation needed before interpreting as directional signal"}. Pattern confidence: Medium (demo context).`;
  return `${asset} analytical summary: Price ${ctx.price} (${ctx.change}). RSI ${ctx.rsi}, MACD ${ctx.macd}, EMA-20 ${ctx.ema}. Volatility ${ctx.volCtx} at ${ctx.vol}. Momentum: ${ctx.momentum}. Pattern: ${ctx.pattern}. This is demo analytical context — connect a live data provider for real-time signals.`;
}

function AnalysisContent() {
  const params = useSearchParams();
  const urlAsset = params.get("asset");
  const [asset, setAsset]   = useState(urlAsset && ASSETS.includes(urlAsset) ? urlAsset : "BTC/USD");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("Ask the AI Analyst to explain the current trend, technical signals, detected pattern, or recent market context.");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]   = useState(false);

  const ctx = CONTEXT[asset] || CONTEXT["BTC/USD"];

  async function ask(override?: string) {
    const q = override || prompt;
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("Analyzing...");
    try {
      const r = await fetch("http://localhost:5000/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q, context: { asset, timeframe: "1D", signals: [`RSI ${ctx.rsi}`, `MACD ${ctx.macd}`], pattern: ctx.pattern } }),
      });
      if (r.ok) {
        const j = await r.json();
        setAnswer(j.answer || getDemoAnswer(q, asset));
      } else {
        await new Promise(r => setTimeout(r, 500));
        setAnswer(getDemoAnswer(q, asset));
      }
    } catch {
      await new Promise(r => setTimeout(r, 500));
      setAnswer(getDemoAnswer(q, asset));
    }
    setLoading(false);
  }

  function saveAnalysis() {
    const entry = {
      id: Date.now().toString(),
      asset,
      timeframe: "1D",
      date: new Date().toISOString(),
      aiSummary: answer !== "Ask the AI Analyst to explain the current trend, technical signals, detected pattern, or recent market context."
        ? answer
        : `Analysis snapshot for ${asset}: Price ${ctx.price} (${ctx.change}). RSI ${ctx.rsi}, MACD ${ctx.macd}. Pattern: ${ctx.pattern}. Volatility ${ctx.volCtx}.`,
      indicators: { rsi: ctx.rsi, macd: ctx.macd, pattern: ctx.pattern, volatility: ctx.volCtx },
    };
    try {
      const existing = JSON.parse(localStorage.getItem("neltrix_history") || "[]");
      localStorage.setItem("neltrix_history", JSON.stringify([entry, ...existing].slice(0, 50)));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-[#2563EB] tracking-wide">ANALYSIS</div>
          <h1 className="mt-1 text-3xl font-bold">Analysis Workspace</h1>
        </div>
        <div className="flex gap-2">
          <select value={asset} onChange={e => setAsset(e.target.value)} className="input-base w-36">
            {ASSETS.map(a => <option key={a}>{a}</option>)}
          </select>
          <button onClick={saveAnalysis}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all ${saved ? "bg-green-600" : "bg-[#2563EB] hover:bg-[#1D4ED8]"}`}>
            {saved ? <><Check size={15}/> Saved!</> : <><Save size={15}/> Save Analysis</>}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <b>{asset}</b>
                <span className={`text-sm font-semibold ${parseFloat(ctx.change) >= 0 ? "text-green-600" : "text-red-600"}`}>{ctx.change}</span>
                <b className="text-lg">{ctx.price}</b>
                <span className="badge badge-slate text-[10px]">Demo data</span>
              </div>
            </div>
            <div className="p-2">
              <Chart/>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <section className="card p-5">
              <h3 className="font-semibold mb-4">Technical Indicators</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#64748B]">RSI</span><b>{ctx.rsi}</b></div>
                <div className="flex justify-between"><span className="text-[#64748B]">MACD</span>
                  <b className={ctx.macd === "Positive" ? "text-green-600" : ctx.macd === "Negative" ? "text-red-600" : ""}>{ctx.macd}</b>
                </div>
                <div className="flex justify-between"><span className="text-[#64748B]">EMA 20</span><b>{ctx.ema}</b></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Volatility</span><b>{ctx.vol}</b></div>
              </div>
            </section>
            <section className="card p-5">
              <h3 className="font-semibold mb-4">Detected Patterns</h3>
              <div className="rounded-lg bg-blue-50 p-3">
                <b className="text-sm">{ctx.pattern}</b>
                <p className="mt-1 text-xs text-slate-500">Context confidence: Medium · 1D</p>
              </div>
              <p className="mt-3 text-xs text-slate-500">Pattern detection does not guarantee future price movement.</p>
            </section>
            <section className="card p-5">
              <h3 className="font-semibold mb-4">Risk Context</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#64748B]">Volatility</span><b>{ctx.volCtx}</b></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Volume</span><b>Increasing</b></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Momentum</span><b>{ctx.momentum}</b></div>
              </div>
            </section>
          </div>
        </div>

        <section className="card h-fit p-5">
          <div className="flex items-center gap-2 text-[#06B6D4]">
            <BrainCircuit size={19}/><b>AI ANALYST</b>
          </div>
          <p className="mt-1 text-xs text-slate-500">Context-aware analytical assistant</p>
          <div className={`mt-4 min-h-[100px] rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700 ${loading ? "opacity-60" : ""}`}>
            {loading ? (
              <div className="flex items-center gap-1.5 py-2">
                <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
              </div>
            ) : answer}
          </div>
          <div className="mt-4 space-y-2">
            {["Explain the current trend","What technical signals matter here?","Explain the detected pattern"].map(s => (
              <button key={s} onClick={() => { setPrompt(s); ask(s); }} disabled={loading}
                className="w-full rounded-lg border border-slate-200 p-2 text-left text-xs hover:bg-slate-50 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors disabled:opacity-50">
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} disabled={loading}
              className="input-base flex-1 min-w-0" placeholder="Ask a question..."/>
            <button onClick={() => ask()} disabled={loading || !prompt.trim()}
              className="grid w-10 shrink-0 place-items-center rounded-lg bg-[#2563EB] text-white disabled:opacity-40 hover:bg-[#1D4ED8] transition-colors">
              <Sparkles size={16}/>
            </button>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">AI output is analytical context, not financial advice.</p>
        </section>
      </div>
    </AppShell>
  );
}

export default function Analysis() {
  return (
    <Suspense>
      <AnalysisContent/>
    </Suspense>
  );
}
