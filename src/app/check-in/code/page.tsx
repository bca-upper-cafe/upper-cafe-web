'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setCode(clean);
    if (error) setError('');
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('Please enter a 6-character code.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await verifyCafeCodeApi(code);
      if (res.valid) {
        router.push(`/check-in/reason?period=${res.period || '4'}`);
      } else {
        setError(res.message);
      }
    } catch {
      if (currentValidCode && code === currentValidCode) {
        router.push('/check-in/reason?period=4');
      } else {
        setError('Incorrect Cafe Code.');
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="w-full max-w-3xl mx-auto px-6 sm:px-10 py-16 space-y-8">
      <div>
        <Link
          href="/"
          className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>

      <header className="space-y-2 border-b border-[#eaeaea] pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Enter Cafe Code.
        </h1>
        <p className="text-sm sm:text-base text-[#666666]">
          Enter the 6-character code currently displayed on the screens inside Upper Cafe.
        </p>
      </header>

      <form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={handleChange}
            maxLength={6}
            placeholder="000000"
            autoFocus
            autoComplete="off"
            spellCheck="false"
            className="w-full h-16 px-6 rounded-xl border border-[#eaeaea] bg-white text-2xl font-mono tracking-[0.4em] text-[#111111] text-center focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#cccccc]"
          />

          {error && (
            <p className="text-sm text-[#b91c1c]">{error}</p>
          )}

          {currentValidCode && (
            <p className="text-xs text-[#666666]">
              Display code preview:{' '}
              <button
                type="button"
                onClick={() => setCode(currentValidCode)}
                className="underline font-mono text-[#111111]"
              >
                {currentValidCode} (Click to auto-fill)
              </button>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={code.length < 6 || verifying}
          className={`w-full h-14 text-base ${
            code.length === 6 && !verifying
              ? 'btn-minimal-primary'
              : 'btn-minimal-disabled'
          }`}
        >
          {verifying ? 'Verifying Code...' : 'Next \u2192'}
        </button>
      </form>
    </main>
  );
}
