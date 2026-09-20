'use client';
import AppShell from "../../components/AppShell";
import Sparkline from "../../components/Sparkline";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, X, Star, Search, TrendingUp, TrendingDown } from "lucide-react";

type WatchAsset = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changeNum: number;
  category: string;
  spark: number[];
};

function genSpark(base: number, trend: number): number[] {
  const pts: number[] = [];
  let v = base;
  for (let i = 0; i < 20; i++) {
    v = v * (1 + trend * 0.01 + (Math.random() - 0.48) * 0.012);
    pts.push(v);
  }
  return pts;
}

const UNIVERSE: WatchAsset[] = [
  { symbol: "BTC/USD",  name: "Bitcoin",      price: "$104,820", change: "+2.84%", changeNum: 2.84,  category: "Crypto", spark: genSpark(98000, 0.15) },
  { symbol: "ETH/USD",  name: "Ethereum",     price: "$3,812",   change: "+1.62%", changeNum: 1.62,  category: "Crypto", spark: genSpark(3600, 0.08) },
  { symbol: "SOL/USD",  name: "Solana",       price: "$198.40",  change: "+4.21%", changeNum: 4.21,  category: "Crypto", spark: genSpark(185, 0.2) },
  { symbol: "BNB/USD",  name: "BNB",          price: "$654.20",  change: "-0.38%", changeNum: -0.38, category: "Crypto", spark: genSpark(660, -0.05) },
  { symbol: "XRP/USD",  name: "XRP",          price: "$2.41",    change: "+3.15%", changeNum: 3.15,  category: "Crypto", spark: genSpark(2.2, 0.14) },
  { symbol: "AAPL",    name: "Apple",         price: "$227.81",  change: "+0.91%", changeNum: 0.91,  category: "Stock",  spark: genSpark(222, 0.05) },
  { symbol: "NVDA",    name: "NVIDIA",        price: "$146.38",  change: "-0.42%", changeNum: -0.42, category: "Stock",  spark: genSpark(148, -0.03) },
  { symbol: "TSLA",    name: "Tesla",         price: "$342.91",  change: "+1.34%", changeNum: 1.34,  category: "Stock",  spark: genSpark(335, 0.07) },
  { symbol: "MSFT",    name: "Microsoft",     price: "$441.26",  change: "+0.53%", changeNum: 0.53,  category: "Stock",  spark: genSpark(438, 0.03) },
  { symbol: "AMZN",    name: "Amazon",        price: "$209.14",  change: "+1.18%", changeNum: 1.18,  category: "Stock",  spark: genSpark(204, 0.06) },
  { symbol: "GOOGL",   name: "Alphabet",      price: "$186.42",  change: "-0.22%", changeNum: -0.22, category: "Stock",  spark: genSpark(188, -0.01) },
  { symbol: "META",    name: "Meta",          price: "$598.73",  change: "+2.04%", changeNum: 2.04,  category: "Stock",  spark: genSpark(582, 0.1) },
  { symbol: "EUR/USD", name: "Euro/Dollar",   price: "1.0842",   change: "-0.18%", changeNum: -0.18, category: "Forex",  spark: genSpark(1.088, -0.01) },
  { symbol: "GBP/USD", name: "Pound/Dollar",  price: "1.2938",   change: "+0.12%", changeNum: 0.12,  category: "Forex",  spark: genSpark(1.29, 0.01) },
  { symbol: "USD/JPY", name: "Dollar/Yen",    price: "154.82",   change: "+0.34%", changeNum: 0.34,  category: "Forex",  spark: genSpark(153.5, 0.02) },
];

const DEFAULT_WATCHLIST = ["BTC/USD", "ETH/USD", "AAPL", "NVDA", "TSLA", "EUR/USD"];

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neltrix_watchlist");
      setWatchlist(saved ? JSON.parse(saved) : DEFAULT_WATCHLIST);
    } catch {
      setWatchlist(DEFAULT_WATCHLIST);
    }
  }, []);

  function save(list: string[]) {
    setWatchlist(list);
    localStorage.setItem("neltrix_watchlist", JSON.stringify(list));
  }

  function remove(symbol: string) {
    save(watchlist.filter(s => s !== symbol));
  }

  function add(symbol: string) {
    if (!watchlist.includes(symbol)) save([...watchlist, symbol]);
  }

  const watchedAssets = UNIVERSE.filter(a => watchlist.includes(a.symbol));
  const availableToAdd = UNIVERSE
    .filter(a => !watchlist.includes(a.symbol))
    .filter(a => !search || a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()));

  const gainCount = watchedAssets.filter(a => a.changeNum > 0).length;
  const lossCount = watchedAssets.filter(a => a.changeNum < 0).length;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-[#2563EB] tracking-wide">WATCHLIST</div>
          <h1 className="mt-1 text-3xl font-bold">My Watchlist</h1>
          <p className="mt-1 text-sm text-[#64748B]">Track your assets. Click any card to open analysis.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Summary strip */}
      {watchedAssets.length > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold">{watchedAssets.length}</div>
            <div className="text-xs text-[#64748B] mt-1">Tracked</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{gainCount}</div>
            <div className="text-xs text-[#64748B] mt-1 flex items-center justify-center gap-1"><TrendingUp size={11}/>Gaining</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{lossCount}</div>
            <div className="text-xs text-[#64748B] mt-1 flex items-center justify-center gap-1"><TrendingDown size={11}/>Losing</div>
          </div>
        </div>
      )}

      {/* Asset grid */}
      {watchedAssets.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Star size={40} className="text-[#CBD5E1] mb-4" />
          <h2 className="text-lg font-semibold">Your watchlist is empty</h2>
          <p className="mt-2 text-sm text-[#64748B] max-w-xs">Add assets to track their performance and quickly open them for analysis.</p>
          <button onClick={() => setShowModal(true)} className="mt-5 flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">
            <Plus size={15}/> Add your first asset
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {watchedAssets.map(a => (
            <div key={a.symbol} className="card-hover group relative">
              <button
                onClick={() => remove(a.symbol)}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 rounded-full p-1 hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-all"
                title="Remove from watchlist"
              >
                <X size={14}/>
              </button>
              <Link href={`/analysis?asset=${encodeURIComponent(a.symbol)}`} className="block p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-base">{a.symbol}</div>
                    <div className="text-xs text-[#94A3B8]">{a.name}</div>
                    <div className="mt-0.5">
                      <span className={`badge text-[10px] ${a.category === "Crypto" ? "badge-cyan" : a.category === "Stock" ? "badge-blue" : "badge-amber"}`}>
                        {a.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xl font-bold font-mono">{a.price}</div>
                    <div className={`text-sm font-semibold mt-0.5 ${a.changeNum >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {a.changeNum >= 0 ? "▲" : "▼"} {a.change.replace(/^[+-]/, "")}
                    </div>
                  </div>
                  <Sparkline data={a.spark} positive={a.changeNum >= 0} width={72} height={36}/>
                </div>
              </Link>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={() => setShowModal(true)}
            className="card flex flex-col items-center justify-center gap-2 py-10 border-dashed hover:border-[#2563EB] hover:text-[#2563EB] text-[#94A3B8] transition-colors"
          >
            <Plus size={24}/>
            <span className="text-sm font-medium">Add Asset</span>
          </button>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md card shadow-2xl animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <h2 className="font-semibold text-lg">Add Asset to Watchlist</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 text-[#64748B]"><X size={18}/></button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"/>
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="input-base pl-9"
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {availableToAdd.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#64748B]">All matching assets are already in your watchlist.</div>
                ) : availableToAdd.map(a => (
                  <button
                    key={a.symbol}
                    onClick={() => { add(a.symbol); }}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[#F8FAFC] transition-colors text-left group"
                  >
                    <div>
                      <div className="font-semibold text-sm">{a.symbol}</div>
                      <div className="text-xs text-[#94A3B8]">{a.name} · {a.category}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${a.changeNum >= 0 ? "text-green-600" : "text-red-600"}`}>{a.change}</span>
                      <Plus size={16} className="text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}