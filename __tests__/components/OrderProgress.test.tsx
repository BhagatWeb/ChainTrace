import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { OrderProgress } from '@/components/orders/OrderProgress';

describe('OrderProgress Component', () => {
  it('renders standard progression for created status', () => {
    render(<OrderProgress status="created" />);
    expect(screen.getByText('Milestone Progression')).toBeInTheDocument();
    expect(screen.getByText(/Stage 1 of 5/i)).toBeInTheDocument();
  });

  it('renders funded progress stage', () => {
    render(<OrderProgress status="funded" />);
    expect(screen.getByText(/Stage 2 of 5/i)).toBeInTheDocument();
  });

  it('renders completed 100% progress for inspected_passed', () => {
    render(<OrderProgress status="inspected_passed" />);
    expect(screen.getByText(/Stage 5 of 5 \(100%\)/i)).toBeInTheDocument();
  });

  it('displays dispute alert badge for disputed status', () => {
    render(<OrderProgress status="disputed" />);
    expect(screen.getByText('Dispute Raised')).toBeInTheDocument();
  });

  it('displays refund alert badge for refunded status', () => {
    render(<OrderProgress status="refunded" />);
    expect(screen.getByText('Funds Refunded')).toBeInTheDocument();
  });
});
