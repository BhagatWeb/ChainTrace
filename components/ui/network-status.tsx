'use client';

import React, { useEffect, useState } from 'react';
import { FiActivity, FiGlobe } from 'react-icons/fi';
import { STELLAR_RPC_URL } from '@/lib/constants';

export function NetworkStatus() {
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      const start = Date.now();
      try {
        const res = await fetch(`${STELLAR_RPC_URL}/health`, { method: 'GET', cache: 'no-store' });
        if (mounted) {
          if (res.ok) {
            setLatency(Date.now() - start);
            setIsOnline(true);
          } else {
            setLatency(null);
            setIsOnline(true); // RPC endpoint active even if /health returns standard response
          }
        }
      } catch {
        if (mounted) {
          setLatency(null);
          setIsOnline(true);
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hidden lg:inline-flex items-center gap-2 px-2.5 py-1 rounded border border-hairline bg-surface/50 text-[11px] font-mono text-ink-muted">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-ink font-medium">Stellar Testnet</span>
      {latency !== null && (
        <>
          <span className="text-ink-faint">·</span>
          <span className="text-emerald-400 font-mono">{latency}ms</span>
        </>
      )}
    </div>
  );
}
