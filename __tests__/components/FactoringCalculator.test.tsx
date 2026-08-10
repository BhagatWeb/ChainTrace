import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FactoringCalculator } from '@/components/finance/FactoringCalculator';

describe('FactoringCalculator Component', () => {
  it('renders factoring calculator with default 80% advance rate', () => {
    render(<FactoringCalculator orderAmount="1000" />);
    expect(screen.getByText('Factoring & Advance Calculator')).toBeInTheDocument();
    expect(screen.getByText('800.00 XLM')).toBeInTheDocument();
    expect(screen.getByText('-40.00 XLM')).toBeInTheDocument(); // 5% fee on 800
    expect(screen.getByText('760.00 XLM')).toBeInTheDocument(); // 800 - 40
  });

  it('updates calculations when invoice value changes', () => {
    render(<FactoringCalculator orderAmount="1000" />);
    const input = screen.getByPlaceholderText('1000') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2000' } });

    // 80% of 2000 = 1600 XLM advance, 5% fee = 80 XLM, net payout = 1520 XLM
    expect(screen.getByText('1600.00 XLM')).toBeInTheDocument();
    expect(screen.getByText('-80.00 XLM')).toBeInTheDocument();
    expect(screen.getByText('1520.00 XLM')).toBeInTheDocument();
  });
});
