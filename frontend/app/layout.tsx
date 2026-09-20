import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neltrix | Market Intelligence",
  description: "Enterprise multi-asset market intelligence platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Inline script runs before any paint — prevents flash of wrong theme */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('neltrix_theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
