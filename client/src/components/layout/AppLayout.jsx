import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-2.5 sm:p-4 lg:p-6"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Centered Professional Application Container (Proportional to Login Card) */}
      <div
        className="w-full max-w-6xl h-[calc(100vh-2rem)] min-h-[620px] max-h-[920px] rounded-3xl border shadow-2xl overflow-hidden flex relative"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)',
          boxShadow: '0 25px 60px -15px var(--accent-glow)'
        }}
      >
        {/* Left Sidebar (spans full container height) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right Column: Content Header + Scrollable Main Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
