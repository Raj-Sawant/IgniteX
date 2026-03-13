import React from 'react';
import { Navbar } from './Navbar';
import { BackgroundRays } from './BackgroundRays';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden">
      {/* Background patterns and glowing orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>
      
      <BackgroundRays />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
