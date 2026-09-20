'use client';
import AppShell from "../../components/AppShell";
import Sparkline from "../../components/Sparkline";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, ArrowUpDown, ExternalLink } from "lucide-react";

type Asset = {
  symbol: string;
  name: string;
  price: string;
  priceNum: number;
  change: string;
  changeNum: number;
  volume: string;
  mktCap: string;
  category: "crypto" | "stocks" | "forex";
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

const ALL_ASSETS: Asset[] = [
  // Crypto
  { symbol: "BTC/USD",  name: "Bitcoin",        price: "$104,820", priceNum: 104820, change: "+2.84%", changeNum: 2.84,  volume: "$38.2B", mktCap: "$2.07T", category: "crypto", spark: genSpark(98000, 0.15) },
  { symbol: "ETH/USD",  name: "Ethereum",        price: "$3,812",   priceNum: 3812,  change: "+1.62%", changeNum: 1.62,  volume: "$18.4B", mktCap: "$458B",  category: "crypto", spark: genSpark(3600, 0.08) },
  { symbol: "SOL/USD",  name: "Solana",          price: "$198.40",  priceNum: 198.4, change: "+4.21%", changeNum: 4.21,  volume: "$4.1B",  mktCap: "$91B",   category: "crypto", spark: genSpark(185, 0.2) },
  { symbol: "BNB/USD",  name: "BNB",             price: "$654.20",  priceNum: 654.2, change: "-0.38%", changeNum: -0.38, volume: "$1.8B",  mktCap: "$95B",   category: "crypto", spark: genSpark(660, -0.05) },
  { symbol: "XRP/USD",  name: "XRP",             price: "$2.41",    priceNum: 2.41,  change: "+3.15%", changeNum: 3.15,  volume: "$7.2B",  mktCap: "$138B",  category: "crypto", spark: genSpark(2.2, 0.14) },
  { symbol: "DOGE/USD", name: "Dogecoin",        price: "$0.3814",  priceNum: 0.38,  change: "-1.22%", changeNum: -1.22, volume: "$2.3B",  mktCap: "$56B",   category: "crypto", spark: genSpark(0.39, -0.06) },
  { symbol: "ADA/USD",  name: "Cardano",         price: "$0.9124",  priceNum: 0.91,  change: "+0.84%", changeNum: 0.84,  volume: "$812M",  mktCap: "$32B",   category: "crypto", spark: genSpark(0.89, 0.04) },
  // Stocks
  { symbol: "AAPL",    name: "Apple Inc.",        price: "$227.81",  priceNum: 227.81, change: "+0.91%", changeNum: 0.91,  volume: "$52.1M", mktCap: "$3.48T", category: "stocks", spark: genSpark(222, 0.05) },
  { symbol: "NVDA",    name: "NVIDIA Corp.",       price: "$146.38",  priceNum: 146.38, change: "-0.42%", changeNum: -0.42, volume: "$198M",  mktCap: "$3.59T", category: "stocks", spark: genSpark(148, -0.03) },
  { symbol: "TSLA",    name: "Tesla Inc.",         price: "$342.91",  priceNum: 342.91, change: "+1.34%", changeNum: 1.34,  volume: "$88.4M", mktCap: "$1.10T", category: "stocks", spark: genSpark(335, 0.07) },
  { symbol: "MSFT",    name: "Microsoft Corp.",    price: "$441.26",  priceNum: 441.26, change: "+0.53%", changeNum: 0.53,  volume: "$19.8M", mktCap: "$3.28T", category: "stocks", spark: genSpark(438, 0.03) },
  { symbol: "AMZN",    name: "Amazon.com Inc.",    price: "$209.14",  priceNum: 209.14, change: "+1.18%", changeNum: 1.18,  volume: "$34.7M", mktCap: "$2.21T", category: "stocks", spark: genSpark(204, 0.06) },
  { symbol: "GOOGL",   name: "Alphabet Inc.",      price: "$186.42",  priceNum: 186.42, change: "-0.22%", changeNum: -0.22, volume: "$22.1M", mktCap: "$2.29T", category: "stocks", spark: genSpark(188, -0.01) },
  { symbol: "META",    name: "Meta Platforms",     price: "$598.73",  priceNum: 598.73, change: "+2.04%", changeNum: 2.04,  volume: "$15.6M", mktCap: "$1.52T", category: "stocks", spark: genSpark(582, 0.1) },
  // Forex
  { symbol: "EUR/USD", name: "Euro / US Dollar",   price: "1.0842",   priceNum: 1.0842, change: "-0.18%", changeNum: -0.18, volume: "$320B",  mktCap: "—",      category: "forex", spark: genSpark(1.088, -0.01) },
  { symbol: "GBP/USD", name: "Pound / US Dollar",  price: "1.2938",   priceNum: 1.2938, change: "+0.12%", changeNum: 0.12,  volume: "$198B",  mktCap: "—",      category: "forex", spark: genSpark(1.29, 0.01) },
  { symbol: "USD/JPY", name: "US Dollar / Yen",    price: "154.82",   priceNum: 154.82, change: "+0.34%", changeNum: 0.34,  volume: "$215B",  mktCap: "—",      category: "forex", spark: genSpark(153.5, 0.02) },
  { symbol: "USD/CHF", name: "US Dollar / Franc",  price: "0.8942",   priceNum: 0.8942, change: "-0.09%", changeNum: -0.09, volume: "$92B",   mktCap: "—",      category: "forex", spark: genSpark(0.897, -0.005) },
  { symbol: "AUD/USD", name: "Aust. Dollar / USD", price: "0.6421",   priceNum: 0.6421, change: "+0.28%", changeNum: 0.28,  volume: "$78B",   mktCap: "—",      category: "forex", spark: genSpark(0.638, 0.015) },
];

type SortKey = "symbol" | "priceNum" | "changeNum" | "volume";

export default function Markets() {
  const [tab, setTab] = useState<"all" | "crypto" | "stocks" | "forex">("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("changeNum");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(-1); }
  }

  const filtered = useMemo(() => {
    return ALL_ASSETS
      .filter(a => (tab === "all" || a.category === tab))
      .filter(a => !query || a.symbol.toLowerCase().includes(query.toLowerCase()) || a.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const av = a[sortKey] as number | string;
        const bv = b[sortKey] as number | string;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
  }, [tab, query, sortKey, sortDir]);

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)}
      className="flex items-center gap-1 text-xs font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#2563EB] transition-colors">
      {label}
      <ArrowUpDown size={11} className={sortKey === k ? "text-[#2563EB]" : ""} />
    </button>
  );

  const gainers = ALL_ASSETS.filter(a => a.changeNum > 0).sort((a, b) => b.changeNum - a.changeNum).slice(0, 3);
  const losers  = ALL_ASSETS.filter(a => a.changeNum < 0).sort((a, b) => a.changeNum - b.changeNum).slice(0, 3);

  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-sm font-medium text-[#2563EB] tracking-wide">MARKETS</div>
        <h1 className="mt-1 text-3xl font-bold">Market Overview</h1>
        <p className="mt-1 text-sm text-[#64748B]">Real-time prices across crypto, equities and forex. Demo data.</p>
      </div>

      {/* Top movers strip */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-green-600" />
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Top Gainers</span>
          </div>
          <div className="space-y-2">
            {gainers.map(a => (
              <div key={a.symbol} className="flex items-center justify-between text-sm">
                <span className="font-medium">{a.symbol}</span>
                <span className="badge badge-green">{a.change}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={15} className="text-red-600" />
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Top Losers</span>
          </div>
          <div className="space-y-2">
            {losers.map(a => (
              <div key={a.symbol} className="flex items-center justify-between text-sm">
                <span className="font-medium">{a.symbol}</span>
                <span className="badge badge-red">{a.change}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4 sm:col-span-2 lg:col-span-1">
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-3">Market Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#64748B]">Assets tracked</span><b>{ALL_ASSETS.length}</b></div>
            <div className="flex justify-between"><span className="text-[#64748B]">Gainers</span><b className="text-green-600">{ALL_ASSETS.filter(a => a.changeNum > 0).length}</b></div>
            <div className="flex justify-between"><span className="text-[#64748B]">Losers</span><b className="text-red-600">{ALL_ASSETS.filter(a => a.changeNum < 0).length}</b></div>
            <div className="flex justify-between"><span className="text-[#64748B]">Avg. 24h change</span>
              <b className={ALL_ASSETS.reduce((s,a)=>s+a.changeNum,0)/ALL_ASSETS.length > 0 ? "text-green-600":"text-red-600"}>
                {(ALL_ASSETS.reduce((s,a)=>s+a.changeNum,0)/ALL_ASSETS.length).toFixed(2)}%
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] p-4">
          <div className="flex gap-1 rounded-lg bg-[#F8FAFC] p-1">
            {(["all","crypto","stocks","forex"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`tab-btn capitalize ${tab === t ? "active" : ""}`}>{t}</button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search assets..."
              className="input-base pl-9 w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                <th className="px-5 py-3 text-left"><SortBtn k="symbol" label="Asset" /></th>
                <th className="px-4 py-3 text-right"><SortBtn k="priceNum" label="Price" /></th>
                <th className="px-4 py-3 text-right"><SortBtn k="changeNum" label="24h Change" /></th>
                <th className="px-4 py-3 text-right hidden md:table-cell"><SortBtn k="volume" label="Volume" /></th>
                <th className="px-4 py-3 text-right hidden lg:table-cell text-xs font-semibold text-[#64748B] uppercase tracking-wide">Mkt Cap</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell text-xs font-semibold text-[#64748B] uppercase tracking-wide">7d Trend</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-[#64748B] text-sm">No assets match your search.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.symbol} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold">{a.symbol}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">{a.name}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold">{a.price}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`badge ${a.changeNum >= 0 ? "badge-green" : "badge-red"}`}>
                      {a.changeNum >= 0 ? "▲" : "▼"} {a.change.replace(/^[+-]/, "")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[#64748B] hidden md:table-cell">{a.volume}</td>
                  <td className="px-4 py-3.5 text-right text-[#64748B] hidden lg:table-cell">{a.mktCap}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <div className="flex justify-center">
                      <Sparkline data={a.spark} positive={a.changeNum >= 0} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Link
                      href={`/analysis?asset=${encodeURIComponent(a.symbol)}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
                    >
                      Analyse <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#F1F5F9] px-5 py-3 text-xs text-[#94A3B8]">
          Showing {filtered.length} of {ALL_ASSETS.length} assets · Demo data · Updates simulated
        </div>
      </div>
    </AppShell>
  );
}