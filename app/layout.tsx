import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentForge",
  description: "Multi-LLM agent builder platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-slate-200">
        <header className="border-b border-slate-700/50 bg-[#0d1526]/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <span className="text-cyan-400 text-xs font-bold">A</span>
                </div>
                <span className="text-white font-semibold">AgentForge</span>
              </Link>
              <nav className="flex gap-1">
                <Link href="/" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Agents
                </Link>
                <Link href="/compare" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-sm transition-colors">
                  Compare
                </Link>
              </nav>
            </div>
            <Link
              href="/agents/new"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
            >
              + New Agent
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
