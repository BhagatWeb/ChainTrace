import { describe, it, expect } from 'vitest';
import { orderClient } from '@/lib/contracts/order-client';
import { escrowClient } from '@/lib/contracts/escrow-client';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';

describe('Contracts Integration & Parsing Utilities', () => {
  it('defines status colors and labels for all order lifecycle states including disputed', () => {
    const states = ['created', 'funded', 'shipped', 'delivered', 'inspected_passed', 'inspected_failed', 'disputed', 'refunded'];
    for (const state of states) {
      expect(STATUS_COLORS[state]).toBeDefined();
      expect(STATUS_LABELS[state]).toBeDefined();
      expect(STATUS_COLORS[state].bg).toBeDefined();
      expect(STATUS_COLORS[state].dot).toBeDefined();
    }
  });

  it('instantiates OrderContractClient and EscrowContractClient with configured contract IDs', () => {
    expect(orderClient).toBeDefined();
    expect(escrowClient).toBeDefined();
    expect(typeof orderClient.createOrder).toBe('function');
    expect(typeof orderClient.disputeOrder).toBe('function');
    expect(typeof escrowClient.hasActiveEscrow).toBe('function');
  });
});
