export const assets = [
  { symbol: "BTC/USD", name: "Bitcoin", type: "crypto", price: 104820.12, change: 2.84, volume: 28400000000, volatility: 31.2 },
  { symbol: "ETH/USD", name: "Ethereum", type: "crypto", price: 3812.42, change: 1.62, volume: 11200000000, volatility: 36.7 },
  { symbol: "AAPL", name: "Apple Inc.", type: "stock", price: 227.81, change: 0.91, volume: 52300000, volatility: 21.4 },
  { symbol: "NVDA", name: "NVIDIA", type: "stock", price: 146.38, change: -0.42, volume: 76100000, volatility: 29.1 },
  { symbol: "TSLA", name: "Tesla", type: "stock", price: 342.91, change: 1.34, volume: 88400000, volatility: 41.3 },
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "forex", price: 1.0842, change: -0.18, volume: 9100000000, volatility: 8.7 }
];

export function history(symbol: string) {
  const asset = assets.find(a => a.symbol === symbol) ?? assets[0];
  const points = [];
  let value = asset.price * 0.93;
  for (let i = 0; i < 120; i++) {
    const drift = (Math.sin(i / 9) * 0.004) + ((i % 17 === 0) ? 0.012 : -0.001);
    const open = value;
    const close = value * (1 + drift);
    const high = Math.max(open, close) * (1 + Math.random() * 0.006);
    const low = Math.min(open, close) * (1 - Math.random() * 0.006);
    points.push({ time: 1730000000 + i * 3600, open, high, low, close, volume: Math.round(asset.volume / 120 * (0.65 + Math.random() * .7)) });
    value = close;
  }
  return points;
}
