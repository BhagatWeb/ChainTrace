'use client';

import React, { useState } from 'react';
import { FiDollarSign, FiPercent, FiClock, FiArrowRight } from 'react-icons/fi';

interface FactoringCalculatorProps {
  orderAmount?: string;
  onApply?: (advanceAmount: string) => void;
  className?: string;
}

export function FactoringCalculator({
  orderAmount = '1000',
  onApply,
  className = '',
}: FactoringCalculatorProps) {
  const [invoiceAmount, setInvoiceAmount] = useState<string>(orderAmount);
  const [advanceRate, setAdvanceRate] = useState<number>(80); // 80% advance rate
  const interestRate = 5; // 5% fixed interest from smart contract

  const numericInvoice = parseFloat(invoiceAmount) || 0;
  const advanceAmount = (numericInvoice * advanceRate) / 100;
  const interestFee = (advanceAmount * interestRate) / 100;
  const netSupplierPayout = advanceAmount - interestFee;
  const remainingReserve = numericInvoice - advanceAmount;

  return (
    <div className={`rounded-xl border border-hairline bg-surface/70 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3">
        <div>
          <p className="eyebrow">DEFI TRADE FINANCE</p>
          <h3 className="font-display font-semibold text-ink text-base tracking-tight">Factoring & Advance Calculator</h3>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-brand/10 text-brand border border-brand/20">
          5% Fixed APR
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
              Escrow Invoice Value (XLM)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                className="w-full bg-elevated/60 border border-hairline rounded-lg px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:border-brand"
                placeholder="1000"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-ink-muted">XLM</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-ink-muted mb-1.5">
              <span className="uppercase">Advance Rate</span>
              <span className="text-brand font-bold">{advanceRate}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={advanceRate}
              onChange={(e) => setAdvanceRate(Number(e.target.value))}
              className="w-full h-1.5 bg-elevated rounded-lg appearance-none cursor-pointer accent-brand"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-faint mt-1">
              <span>50% (Conservative)</span>
              <span>90% (Max Advance)</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-elevated/40 p-4 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-ink-muted">Immediate Advance:</span>
              <span className="font-bold text-ink tnum">{advanceAmount.toFixed(2)} XLM</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-ink-muted">Finance Fee (5%):</span>
              <span className="text-short font-bold tnum">-{interestFee.toFixed(2)} XLM</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-ink-muted">Escrow Reserve:</span>
              <span className="text-ink-muted tnum">{remainingReserve.toFixed(2)} XLM</span>
            </div>
            <div className="border-t border-hairline pt-2 flex justify-between text-xs font-mono">
              <span className="text-brand font-semibold">Net Instant Liquidity:</span>
              <span className="text-brand font-bold text-sm tnum">{netSupplierPayout.toFixed(2)} XLM</span>
            </div>
          </div>

          {onApply && (
            <button
              onClick={() => onApply(advanceAmount.toString())}
              className="btn-primary w-full mt-4 h-9 text-xs"
            >
              Request {advanceAmount.toFixed(0)} XLM Liquidity <FiArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
