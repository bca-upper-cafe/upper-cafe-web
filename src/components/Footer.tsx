'use client';

import React from 'react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const copyright = year === 2026 ? '© 2026 Kabir Sekhon' : `© 2026-${year} Kabir Sekhon`;

  return (
    <footer className="border-t border-slate-200 py-5 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span>{copyright}</span>
        <div className="flex items-center gap-4">
          <a href="https://www.bcaupper.cafe/terms" className="hover:text-slate-700 underline transition-colors">Terms</a>
          <a href="https://www.bcaupper.cafe/privacy" className="hover:text-slate-700 underline transition-colors">Privacy</a>
          <a href="mailto:kabsek30@bergen.org" className="hover:text-slate-700 underline transition-colors">Contact</a>
          <a href="https://github.com/bca-upper-cafe/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 underline transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
};
