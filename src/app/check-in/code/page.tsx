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
    <main className="max-w-2xl mx-auto px-6 sm:px-8 py-12 space-y-6">
      <Link
        href="/"
        className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
      >
        &larr; Back
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
          Enter Cafe Code.
        </h1>
        <p className="text-sm text-[#666666]">
          Enter the 6-character code displayed on the screen in Upper Cafe.
        </p>
      </header>

      <hr className="border-none border-t border-[#eaeaea]" />

      <form onSubmit={handleNext} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={handleChange}
            maxLength={6}
            placeholder="000000"
            autoFocus
            autoComplete="off"
            spellCheck="false"
            className="w-full h-12 px-4 rounded-lg border border-[#eaeaea] bg-white text-lg font-mono tracking-widest text-[#111111] focus:outline-none focus:border-[#111111] transition-colors placeholder:text-[#cccccc]"
          />
        </div>

        {error && (
          <p className="text-xs text-[#b91c1c]">{error}</p>
        )}

        {currentValidCode && (
          <p className="text-xs text-[#666666]">
            Display code:{' '}
            <button
              type="button"
              onClick={() => setCode(currentValidCode)}
              className="underline text-[#111111]"
            >
              {currentValidCode}
            </button>
          </p>
        )}

        <button
          type="submit"
          disabled={code.length < 6 || verifying}
          className={`w-full py-2.5 text-sm ${
            code.length === 6 && !verifying
              ? 'btn-minimal-primary'
              : 'btn-minimal-disabled'
          }`}
        >
          {verifying ? 'Verifying...' : 'Next \u2192'}
        </button>
      </form>
    </main>
  );
}
