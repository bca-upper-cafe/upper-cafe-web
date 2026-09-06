'use client';

import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const yearString = currentYear === 2026 ? '2026' : `2026-${currentYear}`;

  return (
    <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {yearString} Kabir Sekhon</p>
        <p className="text-slate-400">Bergen County Academies • Upper Cafe</p>
      </div>
    </footer>
  );
};
