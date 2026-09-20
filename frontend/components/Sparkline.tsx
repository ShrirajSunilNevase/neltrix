interface SparklineProps {
  data: number[];
  positive?: boolean;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, positive, width = 80, height = 32 }: SparklineProps) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const color = positive === false ? "#DC2626" : positive === true ? "#16A34A" : "#2563EB";
  const fillId = `spark-fill-${Math.random().toString(36).slice(2)}`;

  const polyline = pts.join(" ");
  const firstPt = pts[0].split(",");
  const lastPt  = pts[pts.length - 1].split(",");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${firstPt[0]},${height} ${polyline} ${lastPt[0]},${height}`}
        fill={`url(#${fillId})`}
      />
      <polyline points={polyline} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
