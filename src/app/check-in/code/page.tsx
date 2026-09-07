'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { verifyCafeCodeApi, fetchActiveCafeCode } from '@/lib/schedule';

export default function EnterCafeCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [currentValidCode, setCurrentValidCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentCode() {
      const active = await fetchActiveCafeCode();
      if (active.isValid && active.code) {
        setCurrentValidCode(active.code);
      }
    }
    loadCurrentCode();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Alphanumeric, automatically capitalize, max length 6
    const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setCode(clean);
    if (error) setError('');
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('Please enter a complete 6-character code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await verifyCafeCodeApi(code);
      if (res.valid) {
        // Pass verified code and period to next step
        router.push(`/check-in/reason?period=${res.period || '4'}`);
      } else {
        setError(res.message);
      }
    } catch {
      // Fallback
      if (currentValidCode && code === currentValidCode) {
        router.push(`/check-in/reason?period=4`);
      } else {
        setError('Incorrect Cafe Code. Please check the screen in Upper Cafe.');
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="min-h-[80vh] max-w-[480px] mx-auto px-6 py-8 flex flex-col justify-between">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        {/* Header matching duoTextEnter.webp */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            Enter Cafe Code.
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed">
            Enter the 6-character code currently displayed on the Upper Cafe screen for this period.
          </p>
        </div>

        {/* Input Box matching duoTextEnter.webp */}
        <form onSubmit={handleNext} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={handleChange}
                maxLength={6}
                placeholder="000000"
                autoFocus
                autoComplete="off"
                spellCheck="false"
                className="w-full h-16 px-5 rounded-2xl bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#6355D8] focus:bg-white text-2xl font-mono font-bold tracking-[0.35em] text-[#111111] focus:outline-none transition-all placeholder:text-[#CBD5E1]"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-medium bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Dev helper to display active code for testing */}
          {currentValidCode && (
            <div className="p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs text-[#5B21B6] flex items-center justify-between">
              <span>Upper Cafe Display Code:</span>
              <button
                type="button"
                onClick={() => setCode(currentValidCode)}
                className="font-mono font-bold tracking-wider underline hover:text-[#372498] cursor-pointer"
              >
                {currentValidCode} (Click to auto-fill)
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Bottom Action Button matching duoTextEnter.webp */}
      <div className="pt-8 pb-4">
        <button
          onClick={handleNext}
          disabled={code.length < 6 || verifying}
          className={`w-full py-4 text-base ${
            code.length === 6 && !verifying
              ? 'btn-duo-purple'
              : 'btn-duo-disabled'
          }`}
        >
          {verifying ? 'VERIFYING...' : 'NEXT'}
        </button>
      </div>
    </main>
  );
}
