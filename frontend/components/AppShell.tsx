'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BrainCircuit, Clock3, LayoutDashboard, LineChart, Search, Settings, Star, Lightbulb, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { getTheme, toggleTheme, type Theme } from "../lib/theme";

const nav = [
  { label: "Overview",    href: "/dashboard",   icon: LayoutDashboard },
  { label: "Markets",     href: "/markets",     icon: LineChart },
  { label: "Analysis",    href: "/analysis",    icon: BarChart3 },
  { label: "Watchlist",   href: "/watchlist",   icon: Star },
  { label: "AI Analyst",  href: "/ai-analyst",  icon: BrainCircuit },
  { label: "History",     href: "/history",     icon: Clock3 },
  { label: "Insights",    href: "/insights",    icon: Lightbulb },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen]        = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");
  const [avatar, setAvatar]    = useState<string | null>(null);
  const [initials, setInitials]= useState("VK");
  const pathname = usePathname();

  useEffect(() => {
    setThemeState(getTheme());
    try {
      const av = localStorage.getItem("neltrix_avatar");
      if (av) setAvatar(av);
      const p = localStorage.getItem("neltrix_profile");
      if (p) { const parsed = JSON.parse(p); if (parsed.initials) setInitials(parsed.initials); }
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === "neltrix_avatar") setAvatar(e.newValue);
      if (e.key === "neltrix_profile") {
        try { const p = JSON.parse(e.newValue ?? "{}"); if (p.initials) setInitials(p.initials); } catch {}
      }
    };
    const onUpdate = () => {
      setAvatar(localStorage.getItem("neltrix_avatar"));
      try { const p = JSON.parse(localStorage.getItem("neltrix_profile") ?? "{}"); if (p.initials) setInitials(p.initials); } catch {}
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("neltrix:profile-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("neltrix:profile-updated", onUpdate);
    };
  }, []);

  function handleToggleTheme() {
    const next = toggleTheme();
    setThemeState(next);
  }

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const NavItems = ({ collapsed }: { collapsed?: boolean }) => (
    <>
      {nav.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              active ? "nav-active" : "text-[var(--muted)] hover:bg-[var(--blue-light)] hover:text-[var(--primary)]"
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className={active ? "text-[var(--primary)]" : ""} />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </>
  );

  const AvatarCircle = () => (
    avatar
      ? <img src={avatar} alt="avatar"
          className="h-9 w-9 rounded-full object-cover cursor-pointer ring-2 ring-[var(--secondary)]"
          onClick={() => { window.location.href = "/settings"; }} />
      : <div
          className="h-9 w-9 grid place-items-center rounded-full cursor-pointer font-bold text-sm transition-colors select-none"
          style={{ background: "var(--blue-light)", color: "var(--primary)" }}
          onClick={() => { window.location.href = "/settings"; }}
        >{initials}</div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:flex lg:flex-col"
        style={{ borderRight: "1px solid var(--border)", background: "var(--card)" }}>
        <div className="flex h-16 items-center gap-3 px-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="grid h-9 w-9 place-items-center rounded-lg font-bold text-sm shrink-0 text-white" style={{ background: "var(--primary)" }}>N</div>
          <div>
            <div className="font-bold tracking-tight leading-none">NELTRIX</div>
            <div className="text-[10px] mt-0.5 tracking-wide" style={{ color: "var(--muted)" }}>MARKET INTELLIGENCE</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto"><NavItems /></nav>
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              isActive("/settings") ? "nav-active" : "text-[var(--muted)] hover:bg-[var(--blue-light)] hover:text-[var(--primary)]"
            }`}>
            <Settings size={18} className={isActive("/settings") ? "text-[var(--primary)]" : ""} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl flex flex-col animate-fade-in"
            style={{ background: "var(--card)" }} onClick={e => e.stopPropagation()}>
            <div className="flex h-16 items-center justify-between px-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg font-bold text-sm text-white" style={{ background: "var(--primary)" }}>N</div>
                <div>
                  <div className="font-bold tracking-tight leading-none">NELTRIX</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>MARKET INTELLIGENCE</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5" style={{ color: "var(--muted)" }}><X size={18} /></button>
            </div>
            <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto"><NavItems /></nav>
            <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/settings" onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive("/settings") ? "nav-active" : ""}`}
                style={!isActive("/settings") ? { color: "var(--muted)" } : {}}>
                <Settings size={18} />Settings
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-10 h-16 backdrop-blur lg:left-64"
        style={{ borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--card) 95%, transparent)" }}>
        <div className="flex h-full items-center justify-between px-5">
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 lg:hidden" style={{ color: "var(--muted)" }}>
            <Menu size={20} />
          </button>
          <button className="hidden w-80 items-center gap-2 rounded-lg px-3 py-2 text-sm md:flex transition-colors"
            style={{ border: "1px solid var(--border)", background: "var(--bg)", color: "var(--muted)" }}>
            <Search size={16} />
            Search assets, pages, analyses...
            <kbd className="ml-auto rounded border px-1.5 text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>⌘K</kbd>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full px-3 py-1 text-xs font-medium sm:block badge-green">● Demo Environment</span>
            {/* Dark / Light toggle */}
            <button onClick={handleToggleTheme}
              title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
              className="rounded-lg p-2 transition-all duration-200"
              style={{ background: "var(--blue-light)", color: "var(--primary)", border: "1px solid var(--border)" }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <AvatarCircle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-screen pt-16 lg:pl-64">
        <div className="p-4 md:p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
