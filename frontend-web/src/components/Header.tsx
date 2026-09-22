import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
            N
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              NexusOps
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              Enterprise AI Core
            </span>
          </div>
        </div>

        <nav className="flex space-x-6 text-sm font-medium">
          <Link href="/" className="text-slate-300 hover:text-white transition">
            Executive Dashboard
          </Link>
          <Link href="/workflows" className="text-slate-400 hover:text-white transition">
            Workflows
          </Link>
          <Link href="/ai-insights" className="text-slate-400 hover:text-white transition">
            AI & RAG
          </Link>
          <Link href="/telemetry" className="text-slate-400 hover:text-white transition">
            Telemetry
          </Link>
          <Link href="/database-inspector" className="text-slate-400 hover:text-white transition">
            Database
          </Link>
          <Link href="/executive-reports" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
            Executive Reports
          </Link>
          <Link href="/code-inspector" className="text-blue-400 font-semibold hover:text-blue-300 transition flex items-center space-x-1">
            <span>Code Inspector</span>
          </Link>
        </nav>


        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SignalR Active</span>
          </span>
        </div>
      </div>
    </header>
  );
};
