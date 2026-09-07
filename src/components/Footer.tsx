'use client';

import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const yearDisplay = currentYear === 2026 ? '2026' : `2026 - ${currentYear}`;

  return (
    <footer className="border-t border-[#eaeaea] py-8 bg-white mt-auto text-[0.85rem] text-[#666666]">
      <div className="max-w-[680px] mx-auto px-6 space-y-1.5">
        <div>Built and maintained by Kabir Sekhon (ATCS &apos;30).</div>
        <div>&copy; {yearDisplay} Kabir Sekhon. All rights reserved.</div>
        <nav className="flex items-center gap-3 pt-2 text-xs text-[#666666]">
          <a
            href="https://bcaupper.cafe/terms"
            className="underline underline-offset-2 decoration-[#d1d1d1] hover:decoration-[#111111] transition-colors"
          >
            Terms of Service
          </a>
          <span>&middot;</span>
          <a
            href="https://bcaupper.cafe/privacy"
            className="underline underline-offset-2 decoration-[#d1d1d1] hover:decoration-[#111111] transition-colors"
          >
            Privacy Policy
          </a>
          <span>&middot;</span>
          <a
            href="https://github.com/bca-upper-cafe/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 decoration-[#d1d1d1] hover:decoration-[#111111] transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
};
