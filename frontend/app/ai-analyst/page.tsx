'use client';
import AppShell from "../../components/AppShell";
import { useState, useRef, useEffect } from "react";
import { BrainCircuit, Send, RefreshCw, ChevronDown } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

const ASSETS = ["BTC/USD","ETH/USD","SOL/USD","AAPL","NVDA","TSLA","MSFT","AMZN","META","EUR/USD","GBP/USD","USD/JPY"];
const TIMEFRAMES = ["1m","5m","15m","1H","4H","1D","1W"];

const DEMO_CONTEXT: Record<string, { price: string; change: string; rsi: string; macd: string; pattern: string; volume: string; sentiment: string }> = {
  "BTC/USD":  { price: "$104,820", change: "+2.84%", rsi: "58.4", macd: "Positive",  pattern: "Ascending Triangle", volume: "$38.2B",  sentiment: "Bullish" },
  "ETH/USD":  { price: "$3,812",   change: "+1.62%", rsi: "54.1", macd: "Neutral",   pattern: "Bull Flag",           volume: "$18.4B",  sentiment: "Neutral-Bullish" },
  "SOL/USD":  { price: "$198.40",  change: "+4.21%", rsi: "67.2", macd: "Positive",  pattern: "Breakout",            volume: "$4.1B",   sentiment: "Bullish" },
  "AAPL":     { price: "$227.81",  change: "+0.91%", rsi: "52.8", macd: "Neutral",   pattern: "Range Consolidation", volume: "$52.1M",  sentiment: "Neutral" },
  "NVDA":     { price: "$146.38",  change: "-0.42%", rsi: "48.3", macd: "Negative",  pattern: "Distribution",        volume: "$198M",   sentiment: "Cautious" },
  "TSLA":     { price: "$342.91",  change: "+1.34%", rsi: "55.9", macd: "Positive",  pattern: "Recovery Rally",      volume: "$88.4M",  sentiment: "Bullish" },
  "MSFT":     { price: "$441.26",  change: "+0.53%", rsi: "53.0", macd: "Neutral",   pattern: "Steady Uptrend",      volume: "$19.8M",  sentiment: "Neutral-Bullish" },
  "AMZN":     { price: "$209.14",  change: "+1.18%", rsi: "56.4", macd: "Positive",  pattern: "Cup and Handle",      volume: "$34.7M",  sentiment: "Bullish" },
  "META":     { price: "$598.73",  change: "+2.04%", rsi: "61.2", macd: "Positive",  pattern: "Strong Uptrend",      volume: "$15.6M",  sentiment: "Bullish" },
  "EUR/USD":  { price: "1.0842",   change: "-0.18%", rsi: "44.2", macd: "Negative",  pattern: "Downtrend",           volume: "$320B",   sentiment: "Bearish" },
  "GBP/USD":  { price: "1.2938",   change: "+0.12%", rsi: "50.1", macd: "Neutral",   pattern: "Range",               volume: "$198B",   sentiment: "Neutral" },
  "USD/JPY":  { price: "154.82",   change: "+0.34%", rsi: "57.3", macd: "Positive",  pattern: "Uptrend",             volume: "$215B",   sentiment: "Bullish" },
};

function getDemoResponse(prompt: string, asset: string, tf: string): string {
  const ctx = DEMO_CONTEXT[asset] || DEMO_CONTEXT["BTC/USD"];
  const p = prompt.toLowerCase();

  if (p.includes("trend")) return `**${asset} — Trend Analysis (${tf})**\n\nCurrent price is ${ctx.price} (${ctx.change} today). The primary trend on the ${tf} timeframe is ${ctx.sentiment === "Bullish" ? "bullish" : ctx.sentiment === "Bearish" ? "bearish" : "neutral with mixed signals"}.\n\n• RSI at ${ctx.rsi} — ${parseFloat(ctx.rsi) > 60 ? "approaching overbought conditions" : parseFloat(ctx.rsi) < 40 ? "near oversold territory" : "in the neutral zone"}\n• MACD signal: ${ctx.macd}\n• Volume: ${ctx.volume} — ${ctx.sentiment.includes("Bull") ? "supporting the upward move" : "not confirming a breakout yet"}\n\nOverall, the ${tf} trend leans ${ctx.sentiment.toLowerCase()} with ${ctx.macd === "Positive" ? "constructive momentum" : "caution warranted near resistance"}.`;

  if (p.includes("pattern") || p.includes("signal")) return `**${asset} — Technical Signals (${tf})**\n\nDetected pattern: **${ctx.pattern}**\n\nKey signals:\n• RSI ${ctx.rsi} — ${parseFloat(ctx.rsi) > 55 ? "momentum tilting bullish" : parseFloat(ctx.rsi) < 45 ? "momentum tilting bearish" : "balanced"}\n• MACD: ${ctx.macd} crossover\n• Volume profile: ${ctx.volume} traded, ${ctx.sentiment.includes("Bull") ? "accumulation bias" : "distribution bias"}\n• Pattern confidence: Medium (demo context)\n\nNote: Technical patterns carry inherent uncertainty. Always combine with risk management.`;

  if (p.includes("risk") || p.includes("danger")) return `**${asset} — Risk Context (${tf})**\n\nSentiment signal: **${ctx.sentiment}**\n\nRisk factors to monitor:\n• Volatility: ${ctx.sentiment === "Bullish" ? "Elevated — breakout momentum can reverse sharply" : "Moderate — range-bound environments can be deceptive"}\n• Volume confirmation: ${ctx.volume} — ${parseFloat(ctx.rsi) > 60 ? "High volume supports move but watch for exhaustion" : "Moderate volume, needs confirmation"}\n• Key levels: Watch price near pattern boundaries of the **${ctx.pattern}**\n\nThis is analytical context, not financial advice.`;

  if (p.includes("buy") || p.includes("sell") || p.includes("entry")) return `**${asset} — Analytical Context (${tf})**\n\nI provide market context, not buy/sell recommendations. Here's what the data shows:\n\n• Pattern: ${ctx.pattern}\n• RSI: ${ctx.rsi} (${parseFloat(ctx.rsi) > 60 ? "elevated" : parseFloat(ctx.rsi) < 40 ? "depressed" : "neutral"})\n• Sentiment: ${ctx.sentiment}\n• Price: ${ctx.price} (${ctx.change})\n\nAny decision should factor in your own risk tolerance, position sizing, and broader portfolio context. AI output here is analytical only.`;

  return `**${asset} Analysis — ${tf}**\n\nHere's a structured overview of the current market context:\n\n• **Price**: ${ctx.price} (${ctx.change} 24h)\n• **RSI**: ${ctx.rsi} — ${parseFloat(ctx.rsi) > 60 ? "trending strong" : parseFloat(ctx.rsi) < 40 ? "oversold region" : "balanced reading"}\n• **MACD**: ${ctx.macd} signal\n• **Pattern**: ${ctx.pattern}\n• **Volume**: ${ctx.volume}\n• **Sentiment**: ${ctx.sentiment}\n\nThe technical picture for ${asset} on the ${tf} timeframe is ${ctx.sentiment.toLowerCase()}. Key levels are being tested around the ${ctx.pattern} formation. Monitor for confirmation before interpreting signals as definitive.`;
}

const SUGGESTED = [
  "Explain the current trend",
  "What technical signals matter here?",
  "Explain the detected pattern",
  "What are the key risk factors?",
  "Summarize the market context",
];

export default function AIAnalyst() {
  const [asset, setAsset]       = useState("BTC/USD");
  const [tf, setTf]             = useState("1D");
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: `**Welcome to Neltrix AI Analyst**\n\nI'm your context-aware market intelligence assistant. Select an asset and timeframe above, then ask me anything about:\n\n• Current trends and momentum\n• Technical indicators and patterns\n• Risk context and market sentiment\n• Comparative analysis\n\nDemo responses use structured analytical context. Connect your OpenAI key in Settings for live AI responses.`,
      timestamp: new Date(),
    }
  ]);
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(promptOverride?: string) {
    const text = (promptOverride || input).trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Try real backend, fall back to demo
    let aiText = "";
    try {
      const r = await fetch("http://localhost:5000/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, context: { asset, timeframe: tf, signals: [`RSI ${DEMO_CONTEXT[asset]?.rsi}`], pattern: DEMO_CONTEXT[asset]?.pattern } }),
      });
      if (r.ok) {
        const j = await r.json();
        aiText = j.answer || getDemoResponse(text, asset, tf);
      } else {
        aiText = getDemoResponse(text, asset, tf);
      }
    } catch {
      aiText = getDemoResponse(text, asset, tf);
    }

    // Simulate typing delay
    await new Promise(res => setTimeout(res, 700 + Math.random() * 600));
    setLoading(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: aiText, timestamp: new Date() }]);
  }

  function clearChat() {
    setMessages([{
      id: "welcome2",
      role: "ai",
      content: `Chat cleared. Ask me anything about **${asset}** on the **${tf}** timeframe.`,
      timestamp: new Date(),
    }]);
  }

  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} className={line.startsWith("•") ? "ml-2" : ""} dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
    });
  }

  return (
    <AppShell>
      <div className="flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-sm font-medium text-[#2563EB] tracking-wide">AI ANALYST</div>
            <h1 className="mt-1 text-3xl font-bold">AI Analyst</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={asset} onChange={e => setAsset(e.target.value)} className="input-base pr-8 appearance-none cursor-pointer w-36 text-sm">
                {ASSETS.map(a => <option key={a}>{a}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"/>
            </div>
            <div className="flex gap-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-1">
              {TIMEFRAMES.map(t => (
                <button key={t} onClick={() => setTf(t)} className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${tf === t ? "bg-white text-[#2563EB] shadow-sm" : "text-[#64748B] hover:text-[#334155]"}`}>{t}</button>
              ))}
            </div>
            <button onClick={clearChat} title="Clear chat" className="rounded-lg p-2 border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] transition-colors">
              <RefreshCw size={16}/>
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Messages */}
          <div className="flex flex-1 flex-col card overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  {m.role === "ai" && (
                    <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#CFFAFE] text-[#0891B2]">
                      <BrainCircuit size={14}/>
                    </div>
                  )}
                  <div className={m.role === "user" ? "chat-user" : "chat-ai"}>
                    <div className="space-y-1 text-sm leading-relaxed">
                      {renderContent(m.content)}
                    </div>
                    <div className={`text-[10px] mt-2 ${m.role === "user" ? "text-blue-200" : "text-[#94A3B8]"}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#CFFAFE] text-[#0891B2]">
                    <BrainCircuit size={14}/>
                  </div>
                  <div className="chat-ai flex items-center gap-1.5 px-4 py-3">
                    <span className="typing-dot"/>
                    <span className="typing-dot"/>
                    <span className="typing-dot"/>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="border-t border-[#E2E8F0] p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder={`Ask about ${asset} on ${tf}...`}
                  className="input-base flex-1"
                  disabled={loading}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="grid w-10 shrink-0 place-items-center rounded-lg bg-[#2563EB] text-white disabled:opacity-40 hover:bg-[#1D4ED8] transition-colors"
                >
                  <Send size={16}/>
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[#94A3B8]">AI output is analytical context only — not financial advice.</p>
            </div>
          </div>

          {/* Suggested prompts sidebar */}
          <div className="hidden xl:flex w-56 flex-col gap-3">
            <div className="card p-4 flex-1">
              <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-3">Suggested</div>
              <div className="space-y-2">
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => send(s)} disabled={loading}
                    className="w-full text-left rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-xs text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all disabled:opacity-50">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Context card */}
            <div className="card p-4">
              <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-3">Live Context</div>
              {DEMO_CONTEXT[asset] ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-[#64748B]">Price</span><b>{DEMO_CONTEXT[asset].price}</b></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">24h</span><b className={DEMO_CONTEXT[asset].changeNum !== undefined || true ? parseFloat(DEMO_CONTEXT[asset].change) >= 0 ? "text-green-600" : "text-red-600" : ""}>{DEMO_CONTEXT[asset].change}</b></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">RSI</span><b>{DEMO_CONTEXT[asset].rsi}</b></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">MACD</span><b>{DEMO_CONTEXT[asset].macd}</b></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Pattern</span><b className="text-right text-[10px] leading-tight max-w-[90px]">{DEMO_CONTEXT[asset].pattern}</b></div>
                </div>
              ) : <p className="text-xs text-[#94A3B8]">Select an asset above.</p>}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}