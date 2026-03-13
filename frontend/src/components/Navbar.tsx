import React, { useState } from 'react';
import { Settings, BarChart2, Layers, Cpu, MountainSnow } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { IssueReportModal } from './IssueReportModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center relative overflow-hidden group-hover:border-purple-500/60 transition-colors">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl group-hover:bg-purple-500/40 transition-all duration-300"></div>
                  <MountainSnow className="w-6 h-6 text-purple-300 relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-semibold text-lg text-zinc-100 tracking-wide">Sim2Terrain</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`flex items-center gap-2 transition-colors text-sm ${path === '/' ? 'text-purple-400 font-semibold' : 'text-zinc-200 hover:text-purple-300 font-medium'}`}
              >
                <Layers className="w-4 h-4" /> Workspace
              </Link>
              <Link 
                to="/analysis" 
                className={`flex items-center gap-2 transition-colors text-sm ${path === '/analysis' ? 'text-purple-400 font-semibold' : 'text-zinc-400 hover:text-purple-300 font-medium'}`}
              >
                <Cpu className="w-4 h-4" /> Models & Analysis
              </Link>
              <Link 
                to="/datasets" 
                className={`flex items-center gap-2 transition-colors text-sm ${path === '/datasets' ? 'text-purple-400 font-semibold' : 'text-zinc-400 hover:text-purple-300 font-medium'}`}
              >
                <BarChart2 className="w-4 h-4" /> Datasets
              </Link>
              <a href="#" className="flex items-center gap-2 text-zinc-400 hover:text-purple-300 transition-colors text-sm font-medium">
                <Settings className="w-4 h-4" /> Settings
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsReportOpen(true)}
                className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 hover:text-rose-400 transition-all backdrop-blur-md"
              >
                Report Issue
              </button>
              <button onClick={() => window.dispatchEvent(new Event('runAnalysis'))} className="relative overflow-hidden px-4 py-2 text-sm font-bold text-zinc-950 bg-gradient-to-r from-rose-700 to-zinc-100 rounded-lg shadow-[0_0_15px_rgba(190,18,60,0.3)] hover:shadow-[0_0_25px_rgba(190,18,60,0.5)] transition-all group">
                <div className="absolute inset-0 w-[200%] h-full bg-white/40 -translate-x-full -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                Run Analysis
              </button>
            </div>
          </div>
        </div>
      </nav>

      <IssueReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
      />
    </>
  );
};
