'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/orders/OrderCard';
import Link from 'next/link';

export default function DashboardPage() {
  const { publicKey, isConnected, connect } = useWallet();
  const { orders, loading } = useOrders(publicKey || undefined);
  const [activeTab, setActiveTab] = useState<'all' | 'buyer' | 'supplier' | 'shipper' | 'inspector'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    if (!publicKey) return false;
    const pub = publicKey.toUpperCase();
    
    // Role filter
    if (activeTab === 'buyer' && order.buyer.toUpperCase() !== pub) return false;
    if (activeTab === 'supplier' && order.supplier.toUpperCase() !== pub) return false;
    if (activeTab === 'shipper' && order.shipper.toUpperCase() !== pub) return false;
    if (activeTab === 'inspector' && order.inspector.toUpperCase() !== pub) return false;

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    // Search query filter (by order ID or address)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesId = String(order.id).includes(q) || `ct-order-${order.id}`.includes(q);
      const matchesAddr =
        order.buyer.toLowerCase().includes(q) ||
        order.supplier.toLowerCase().includes(q) ||
        order.shipper.toLowerCase().includes(q) ||
        order.inspector.toLowerCase().includes(q);
      if (!matchesId && !matchesAddr) return false;
    }

    return true;
  });

  const exportOrdersCsv = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Order ID', 'Status', 'Amount (XLM)', 'Buyer', 'Supplier', 'Shipper', 'Inspector', 'Created Block'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.status,
      o.amount,
      o.buyer,
      o.supplier,
      o.shipper,
      o.inspector,
      o.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chaintrace_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <p className="eyebrow">CONSOLE // CORE</p>
          <h1 className="text-3xl font-bold text-ink font-display tracking-tight sm:text-4xl">Trade Dashboard</h1>
          <p className="text-sm text-ink-muted">Track your supply chain orders and escrow milestones with on-chain precision.</p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-3">
            <button
              onClick={exportOrdersCsv}
              disabled={filteredOrders.length === 0}
              className="btn-secondary h-11 px-4 text-xs font-mono tracking-wider"
              title="Export filtered orders as CSV"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              EXPORT CSV
            </button>
            <Link href="/orders/create">
              <button className="btn-primary h-11 px-5 whitespace-nowrap">
                <span className="material-symbols-outlined text-[20px]">add</span>
                NEW ORDER
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-hairline pb-2 md:border-b-0 md:pb-0">
          {([
            { id: 'all', label: 'As All' },
            { id: 'buyer', label: 'As Buyer' },
            { id: 'supplier', label: 'As Supplier' },
            { id: 'shipper', label: 'As Shipper' },
            { id: 'inspector', label: 'As Inspector' },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap border ${
                  isActive
                    ? 'bg-elevated text-ink border-line'
                    : 'bg-transparent border-transparent text-ink-muted hover:text-ink hover:bg-elevated/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {isConnected && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID or Address..."
                className="w-full bg-elevated/60 border border-hairline rounded-md px-3 py-1.5 text-xs font-mono text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1.5 text-ink-faint hover:text-ink text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-elevated/60 border border-hairline rounded-md px-3 py-1.5 text-xs font-mono text-ink-muted focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">ALL STATUSES</option>
              <option value="created">CREATED</option>
              <option value="funded">FUNDED</option>
              <option value="shipped">SHIPPED</option>
              <option value="delivered">DELIVERED</option>
              <option value="inspected_passed">PASSED</option>
              <option value="inspected_failed">FAILED</option>
              <option value="disputed">DISPUTED</option>
              <option value="refunded">REFUNDED</option>
            </select>
          </div>
        )}
      </div>

      {/* Disconnected Alert State */}
      {!isConnected ? (
        <div className="mb-8 border border-hairline bg-surface/50 p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-4 py-16">
          <div className="w-16 h-16 rounded-xl bg-elevated/60 border border-hairline flex items-center justify-center text-ink-muted">
            <span className="material-symbols-outlined text-[32px]">account_balance_wallet</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-ink font-display tracking-tight mb-1">Wallet Disconnected</h3>
            <p className="text-xs text-ink-muted leading-relaxed">Please connect your wallet using the button in the top right to view your dashboard and manage your trade smart contracts.</p>
          </div>
          <button
            onClick={() => connect('freighter')}
            className="btn-primary mt-2"
          >
            CONNECT NOW
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border border-hairline bg-surface p-6 rounded-xl h-56 flex flex-col justify-between overflow-hidden relative">
                  <div className="space-y-3">
                    <div className="w-20 h-4 bg-elevated rounded-md animate-pulse-soft"></div>
                    <div className="w-full h-8 bg-elevated rounded-md animate-pulse-soft"></div>
                    <div className="w-2/3 h-4 bg-elevated rounded-md animate-pulse-soft"></div>
                  </div>
                  <div className="w-full h-2 bg-elevated rounded-md animate-pulse-soft"></div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="border border-hairline bg-surface/30 p-12 rounded-xl text-center py-20">
              <span className="material-symbols-outlined text-4xl text-ink-faint mb-2">inbox</span>
              <p className="text-xs text-ink-muted font-mono uppercase tracking-wider">No orders found matching this role filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Network Live Status Section */}
          <div className="border-t border-hairline pt-8 mt-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-ink-faint">sync</span>
              <h3 className="text-2xs font-bold font-mono text-ink-faint uppercase tracking-widest">Network Live Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border border-hairline bg-surface p-6 rounded-xl h-44 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-20 h-4 bg-elevated rounded-md"></div>
                    <div className="w-full h-6 bg-elevated rounded-md"></div>
                  </div>
                  <div className="w-full h-2 bg-elevated rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
