'use client';

import React from 'react';
import type { OrderStatus } from '@/lib/types';
import { FiCheck, FiAlertTriangle, FiClock, FiTruck, FiShield, FiDollarSign } from 'react-icons/fi';

interface OrderProgressProps {
  status: OrderStatus;
  className?: string;
}

const STEPS = [
  { key: 'created', label: 'Created', icon: FiClock },
  { key: 'funded', label: 'Funded', icon: FiDollarSign },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiShield },
  { key: 'inspected_passed', label: 'Completed', icon: FiCheck },
];

export function OrderProgress({ status, className = '' }: OrderProgressProps) {
  const getStepIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'created':
        return 0;
      case 'funded':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'inspected_passed':
        return 4;
      case 'inspected_failed':
      case 'disputed':
      case 'refunded':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);
  const isTerminalNegative = status === 'inspected_failed' || status === 'disputed' || status === 'refunded';

  return (
    <div className={`w-full rounded-xl border border-hairline bg-surface/60 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="eyebrow">SUPPLY CHAIN LIFECYCLE</p>
          <h4 className="font-display font-semibold text-ink text-sm tracking-tight">Milestone Progression</h4>
        </div>
        {isTerminalNegative ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FiAlertTriangle className="h-3.5 w-3.5" />
            {status === 'disputed' ? 'Dispute Raised' : status === 'refunded' ? 'Funds Refunded' : 'Inspection Failed'}
          </span>
        ) : (
          <span className="text-xs font-mono text-ink-muted">
            Stage {Math.min(currentIndex + 1, 5)} of 5 ({Math.round(((currentIndex + (status === 'inspected_passed' ? 1 : 0.5)) / 5) * 100)}%)
          </span>
        )}
      </div>

      {/* Progress Line */}
      <div className="relative mb-6 mt-2">
        <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-elevated" />
        <div
          className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500 ${
            isTerminalNegative ? 'bg-amber-400' : 'bg-brand'
          }`}
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex || (index === currentIndex && status === 'inspected_passed');
            const isCurrent = index === currentIndex && status !== 'inspected_passed';
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                    isCompleted
                      ? 'border-brand bg-brand text-canvas font-bold'
                      : isCurrent
                      ? isTerminalNegative
                        ? 'border-amber-400 bg-canvas text-amber-400 ring-4 ring-amber-400/20'
                        : 'border-brand bg-canvas text-brand ring-4 ring-brand/20 animate-pulse'
                      : 'border-hairline bg-surface text-ink-faint'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${
                    isCompleted ? 'text-ink font-semibold' : isCurrent ? 'text-brand font-bold' : 'text-ink-faint'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
