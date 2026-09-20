'use client';
import AppShell from "../../components/AppShell";
import { useState, useEffect, useRef } from "react";
import { User, Monitor, Key, Database, Check, AlertCircle, Download, Trash2, ChevronRight, Moon, Sun, Camera, FileText } from "lucide-react";
import { getTheme, setTheme, type Theme } from "../../lib/theme";

type Profile = { name: string; role: string; initials: string };
type DisplayPrefs = { currency: string; density: "comfortable" | "compact"; theme: Theme };

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"];

const API_STATUSES = [
  { label: "Market Data API",     key: "MARKET_DATA_API_KEY", description: "Provides real-time price data for all assets.", configured: true },
  { label: "OpenAI API",          key: "OPENAI_API_KEY",      description: "Powers the AI Analyst assistant.", configured: true },
  { label: "PostgreSQL Database", key: "DATABASE_URL",        description: "Persistent storage for analyses, history, and user data.", configured: false },
];

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--blue-light)" }}>
          <Icon size={15} style={{ color: "var(--primary)" }} />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function Settings() {
  const [profile, setProfile]     = useState<Profile>({ name: "Vikram K.", role: "Portfolio Analyst", initials: "VK" });
  const [display, setDisplay]     = useState<DisplayPrefs>({ currency: "USD", density: "comfortable", theme: "light" });
  const [saved, setSaved]         = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [avatar, setAvatar]       = useState<string | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Load persisted data */
  useEffect(() => {
    try {
      const p = localStorage.getItem("neltrix_profile");
      const d = localStorage.getItem("neltrix_display");
      const av = localStorage.getItem("neltrix_avatar");
      if (p) setProfile(JSON.parse(p));
      if (d) setDisplay(JSON.parse(d));
      if (av) setAvatar(av);
    } catch {}
    // Sync theme toggle state with current applied theme
    setDisplay(prev => ({ ...prev, theme: getTheme() }));
  }, []);

  /* ── Avatar upload ── */
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      setAvatar(base64);
      localStorage.setItem("neltrix_avatar", base64);
      // Notify AppShell in same tab
      window.dispatchEvent(new Event("neltrix:profile-updated"));
    };
    reader.readAsDataURL(file);
  }

  /* ── Save profile ── */
  function saveProfile() {
    localStorage.setItem("neltrix_profile", JSON.stringify(profile));
    localStorage.setItem("neltrix_display", JSON.stringify(display));
    // Apply theme immediately
    setTheme(display.theme);
    window.dispatchEvent(new Event("neltrix:profile-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  /* ── Theme toggle from Settings ── */
  function handleThemeChange(t: Theme) {
    setDisplay(d => ({ ...d, theme: t }));
    setTheme(t);
  }

  /* ── JSON Export ── */
  function exportJSON() {
    try {
      const data = {
        profile,
        display,
        watchlist: JSON.parse(localStorage.getItem("neltrix_watchlist") || "[]"),
        history: JSON.parse(localStorage.getItem("neltrix_history") || "[]"),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `neltrix-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
    } catch {}
  }

  /* ── PDF Export ── */
  function exportPDF() {
    try {
      const watchlist: any[] = JSON.parse(localStorage.getItem("neltrix_watchlist") || "[]");
      const history: any[]   = JSON.parse(localStorage.getItem("neltrix_history") || "[]");
      const now = new Date().toLocaleString();

      const watchlistRows = watchlist.length
        ? watchlist.map((w: any) => `
            <tr>
              <td>${w.symbol ?? w.ticker ?? "-"}</td>
              <td>${w.name ?? "-"}</td>
              <td>${w.price ?? "-"}</td>
              <td style="color:${(w.change ?? 0) >= 0 ? "#4A7A3A" : "#C96F4F"}">${w.change ?? "-"}</td>
            </tr>`).join("")
        : `<tr><td colspan="4" style="text-align:center;color:#7A8C72">No watchlist items</td></tr>`;

      const historyRows = history.length
        ? history.slice(0, 50).map((h: any) => `
            <tr>
              <td>${h.symbol ?? h.ticker ?? "-"}</td>
              <td>${h.action ?? "-"}</td>
              <td>${h.date ? new Date(h.date).toLocaleDateString() : "-"}</td>
              <td>${h.price ?? "-"}</td>
            </tr>`).join("")
        : `<tr><td colspan="4" style="text-align:center;color:#7A8C72">No history items</td></tr>`;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Neltrix Export — ${now}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "IBM Plex Sans", sans-serif; color: #1C2419; background: white; padding: 40px; }
    .header { border-bottom: 3px solid #2E3A2F; padding-bottom: 16px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { font-size: 24px; font-weight: 700; color: #2E3A2F; letter-spacing: -0.5px; }
    .logo span { color: #C96F4F; }
    .meta { font-size: 11px; color: #7A8C72; text-align: right; line-height: 1.6; }
    .profile-card { background: #F8F6EE; border: 1px solid #DDD8C8; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; display: flex; gap: 16px; align-items: center; }
    .avatar { width: 52px; height: 52px; border-radius: 50%; background: #2E3A2F; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; overflow: hidden; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile-info h2 { font-size: 16px; font-weight: 700; }
    .profile-info p  { font-size: 12px; color: #7A8C72; margin-top: 2px; }
    .section-title { font-size: 13px; font-weight: 700; color: #2E3A2F; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; margin-top: 28px; display: flex; align-items: center; gap: 8px; }
    .section-title::after { content: ""; flex: 1; height: 1px; background: #DDD8C8; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #2E3A2F; color: white; padding: 9px 12px; text-align: left; font-weight: 600; }
    th:first-child { border-radius: 8px 0 0 8px; }
    th:last-child  { border-radius: 0 8px 8px 0; }
    td { padding: 8px 12px; border-bottom: 1px solid #EEE8DC; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #F8F6EE; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .setting-item { background: #F8F6EE; border: 1px solid #DDD8C8; border-radius: 8px; padding: 12px; }
    .setting-label { font-size: 10px; font-weight: 700; color: #7A8C72; text-transform: uppercase; letter-spacing: 0.06em; }
    .setting-value { font-size: 14px; font-weight: 600; color: #1C2419; margin-top: 4px; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #DDD8C8; font-size: 10px; color: #7A8C72; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">NELTRIX <span>●</span> Market Intelligence</div>
    <div class="meta">
      <strong>Data Export Report</strong><br/>
      Generated: ${now}<br/>
      Currency: ${display.currency}
    </div>
  </div>

  <div class="profile-card">
    <div class="avatar">
      ${avatar ? `<img src="${avatar}" />` : `<span>${profile.initials}</span>`}
    </div>
    <div class="profile-info">
      <h2>${profile.name}</h2>
      <p>${profile.role}</p>
    </div>
  </div>

  <div class="section-title">Watchlist</div>
  <table>
    <thead><tr><th>Symbol</th><th>Name</th><th>Price (${display.currency})</th><th>Change</th></tr></thead>
    <tbody>${watchlistRows}</tbody>
  </table>

  <div class="section-title">Analysis History</div>
  <table>
    <thead><tr><th>Symbol</th><th>Action</th><th>Date</th><th>Price</th></tr></thead>
    <tbody>${historyRows}</tbody>
  </table>

  <div class="section-title">Settings Snapshot</div>
  <div class="settings-grid">
    <div class="setting-item"><div class="setting-label">Currency</div><div class="setting-value">${display.currency}</div></div>
    <div class="setting-item"><div class="setting-label">Layout Density</div><div class="setting-value">${display.density}</div></div>
    <div class="setting-item"><div class="setting-label">Theme</div><div class="setting-value">${display.theme}</div></div>
  </div>

  <div class="footer">
    <span>Neltrix Market Intelligence Platform</span>
    <span>Exported ${now}</span>
  </div>
</body>
</html>`;

      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 600);
    } catch (err) { console.error(err); }
  }

  function clearData() {
    localStorage.removeItem("neltrix_watchlist");
    localStorage.removeItem("neltrix_history");
    localStorage.removeItem("neltrix_profile");
    localStorage.removeItem("neltrix_display");
    localStorage.removeItem("neltrix_avatar");
    setClearConfirm(false);
    window.location.reload();
  }

  return (
    <AppShell>
      {/* Hidden file input for avatar */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      <div className="mb-6">
        <div className="text-sm font-medium tracking-wide" style={{ color: "var(--primary)" }}>SETTINGS</div>
        <h1 className="mt-1 text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Configure your profile, display preferences, and API connections.</p>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* ── Profile ── */}
        <Section icon={User} title="Profile">
          <div className="flex items-start gap-5">
            {/* Avatar upload */}
            <div className="relative shrink-0"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => fileRef.current?.click()}>
              {avatar
                ? <img src={avatar} alt="avatar"
                    className="h-16 w-16 rounded-2xl object-cover cursor-pointer ring-2 ring-[var(--border)]" />
                : <div className="grid h-16 w-16 place-items-center rounded-2xl text-xl font-bold cursor-pointer transition-colors select-none"
                    style={{ background: "var(--blue-light)", color: "var(--primary)" }}>
                    {profile.initials}
                  </div>
              }
              {/* Camera overlay */}
              {avatarHover && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer"
                  style={{ background: "rgba(46,58,47,0.6)" }}>
                  <Camera size={20} color="white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full text-white"
                style={{ background: "var(--primary)" }}>
                <Camera size={10} />
              </div>
            </div>

            <div className="flex-1 grid gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Display Name</label>
                <input value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="input-base mt-1" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Role</label>
                <input value={profile.role}
                  onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                  className="input-base mt-1" placeholder="e.g. Portfolio Analyst" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Initials (avatar fallback)</label>
                <input value={profile.initials}
                  onChange={e => setProfile(p => ({ ...p, initials: e.target.value.slice(0,3).toUpperCase() }))}
                  className="input-base mt-1 max-w-[80px]" maxLength={3} placeholder="VK" />
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                💡 Click the avatar circle above to upload a custom photo.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Display Preferences ── */}
        <Section icon={Monitor} title="Display Preferences">
          <div className="space-y-5">
            {/* Currency */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Display Currency</label>
              <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Used for formatting prices across the platform.</p>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setDisplay(d => ({ ...d, currency: c }))}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium border transition-all"
                    style={{
                      background:   display.currency === c ? "var(--primary)" : "transparent",
                      color:        display.currency === c ? "white"          : "var(--muted)",
                      borderColor:  display.currency === c ? "var(--primary)" : "var(--border)",
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Layout Density</label>
              <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Controls spacing and padding throughout the UI.</p>
              <div className="flex gap-2">
                {(["comfortable", "compact"] as const).map(d => (
                  <button key={d} onClick={() => setDisplay(prev => ({ ...prev, density: d }))}
                    className="flex-1 rounded-lg border py-2.5 text-sm font-medium capitalize transition-all"
                    style={{
                      background:  display.density === d ? "var(--blue-light)" : "transparent",
                      color:       display.density === d ? "var(--primary)"    : "var(--muted)",
                      borderColor: display.density === d ? "var(--secondary)"  : "var(--border)",
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Theme</label>
              <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Toggle between light and dark mode.</p>
              <div className="flex gap-2">
                {([["light", Sun], ["dark", Moon]] as const).map(([val, Icon]) => (
                  <button key={val} onClick={() => handleThemeChange(val)}
                    className="flex items-center gap-2 flex-1 rounded-lg border py-2.5 px-3 text-sm font-medium capitalize transition-all"
                    style={{
                      background:  display.theme === val ? "var(--blue-light)" : "transparent",
                      color:       display.theme === val ? "var(--primary)"    : "var(--muted)",
                      borderColor: display.theme === val ? "var(--secondary)"  : "var(--border)",
                    }}>
                    <Icon size={14} />{val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── API Connections ── */}
        <Section icon={Key} title="API Connections">
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
            Secrets are configured server-side in <code className="rounded px-1 py-0.5 text-xs" style={{ background: "var(--blue-light)" }}>backend/.env</code>. Status shown below.
          </p>
          <div className="space-y-3">
            {API_STATUSES.map(api => (
              <div key={api.key} className="flex items-start gap-3 rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full mt-0.5 ${api.configured ? "bg-green-50" : "bg-amber-50"}`}>
                  {api.configured ? <Check size={14} className="text-green-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{api.label}</span>
                    <span className={`badge text-[10px] ${api.configured ? "badge-green" : "badge-amber"}`}>
                      {api.configured ? "Configured ✓" : "Not set"}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{api.description}</p>
                  <code className="text-[10px]" style={{ color: "var(--muted)" }}>{api.key}</code>
                </div>
                <ChevronRight size={16} style={{ color: "var(--muted)" }} className="shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Data Management ── */}
        <Section icon={Database} title="Data Management">
          <div className="space-y-3">
            {/* Export row */}
            <div className="flex items-center justify-between rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-medium text-sm">Export Data</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Download your watchlist, history, and settings.</div>
              </div>
              <div className="flex gap-2">
                <button onClick={exportJSON}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                  <Download size={13} /> JSON
                </button>
                <button onClick={exportPDF}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors"
                  style={{ background: "var(--primary)" }}>
                  <FileText size={13} /> PDF
                </button>
              </div>
            </div>

            {/* Clear data */}
            <div className="flex items-center justify-between rounded-lg border p-4" style={{ borderColor: "#C96F4F33", background: "#C96F4F08" }}>
              <div>
                <div className="font-medium text-sm" style={{ color: "var(--accent)" }}>Clear All Local Data</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Deletes watchlist, history, avatar, and saved preferences.</div>
              </div>
              {clearConfirm ? (
                <div className="flex gap-2">
                  <button onClick={clearData} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors">Confirm</button>
                  <button onClick={() => setClearConfirm(false)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors" style={{ borderColor: "var(--border)" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setClearConfirm(true)}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: "#C96F4F66", color: "var(--accent)" }}>
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* Save button */}
        <div className="flex justify-end pt-1">
          <button onClick={saveProfile}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all"
            style={{ background: saved ? "#4A7A3A" : "var(--primary)" }}>
            {saved ? <><Check size={15} /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
