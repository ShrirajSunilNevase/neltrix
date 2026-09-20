'use client';
import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

export default function Chart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      height: 390, layout: { background: { type: ColorType.Solid, color: "#FFFFFF" }, textColor: "#64748B" },
      grid: { vertLines: { color: "#F1F5F9" }, horzLines: { color: "#F1F5F9" } },
      rightPriceScale: { borderColor: "#E2E8F0" }, timeScale: { borderColor: "#E2E8F0" }
    });
    const series = chart.addCandlestickSeries({ upColor: "#16A34A", downColor: "#DC2626", borderVisible: false, wickUpColor: "#16A34A", wickDownColor: "#DC2626" });
    let value = 98000;
    const data: any[] = [];
    for (let i=0;i<90;i++) {
      const open = value, close = value * (1 + Math.sin(i/7)*0.002 + (i%13===0?0.008:-0.0005));
      data.push({time: 1730000000+i*86400, open, high: Math.max(open,close)*1.004, low: Math.min(open,close)*.996, close});
      value = close;
    }
    series.setData(data);
    chart.timeScale().fitContent();
    const ro = new ResizeObserver(() => chart.applyOptions({ width: ref.current?.clientWidth ?? 800 }));
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart.remove(); };
  }, []);
  return <div ref={ref} className="w-full" />;
}
