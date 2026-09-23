import React, { useState } from 'react';
import {
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  PackageCheck,
  Truck,
  BookOpen,
  Search,
  ChevronRight,
  Layers,
  Sparkles,
  Calendar,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AccountSummaryCard } from './AccountSummaryCard';

export const DashboardView: React.FC = () => {
  const {
    businessProfile,
    orders,
    catalogueDispatches,
    setActiveView,
    setSelectedProduct,
    setSearchQuery,
    products,
    setInvoiceToView,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'mtd' | '30d' | 'all'>('mtd');

  // Filter orders by date range
  const filteredOrders = orders.filter(ord => {
    if (dateFilter === 'all') return true;
    const ordTime = new Date(ord.orderDate).getTime();
    const now = Date.now();
    if (dateFilter === '30d') {
      return now - ordTime <= 30 * 86400000;
    }
    // MTD (Month to Date - September 2026)
    const ordDate = new Date(ord.orderDate);
    const currentDate = new Date();
    return (
      ordDate.getMonth() === currentDate.getMonth() &&
      ordDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const completedCount = filteredOrders.filter(o => o.status === 'Delivered').length;
  const pendingCount = filteredOrders.filter(
    o => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Procurement in Progress' || o.status === 'Dispatched'
  ).length;

  const quickJumpToSku = (sku: string) => {
    const prod = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (prod) {
      setSelectedProduct(prod);
      setSearchQuery(sku);
      setActiveView('place-order');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* SECTION 1: DYNAMIC MULTI-DEALER ACCOUNT SUMMARY CARD */}
      <AccountSummaryCard />

      {/* PROMOTIONAL BANNER CAROUSEL */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2C2417] to-[#4A3B2C] text-[#FBF7EE] p-5 sm:p-7 shadow-md">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B5A3C] text-[11px] font-semibold uppercase tracking-wider text-[#FBF7EE]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Wholesale Series</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
            Onyx Dimout 800 Series
          </h2>
          <p className="text-xs sm:text-sm text-[#E7DAC0] leading-relaxed">
            Premium 265 GSM 100% Polyester dimout fabric. Ready stock in 27 sophisticated shades with automated roll discounts on orders above 50m.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                quickJumpToSku('AMH0011');
              }}
              className="px-5 py-2.5 rounded-full bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Order Onyx Dimout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('stock-check')}
              className="px-4 py-2.5 rounded-full bg-[#FBF7EE]/15 hover:bg-[#FBF7EE]/25 text-[#FBF7EE] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Check Live Roll Stock</span>
            </button>
          </div>
        </div>

        {/* Decorative Swatch Visual in Banner */}
        <div className="absolute right-4 -bottom-6 w-52 sm:w-72 h-52 sm:h-72 rounded-full border-12 border-[#8B5A3C]/30 opacity-40 pointer-events-none fabric-pattern-woven" />
      </section>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveView('place-order')}
          className="p-3.5 rounded-xl bg-[#FBF7EE] hover:bg-[#F3EBDA] border border-[#DACBAA] text-left transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-[#E9D9C5] text-[#8B5A3C] group-hover:scale-105 transition-transform">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2C2417]">Place Order</p>
            <p className="text-[11px] text-[#766A57]">SKU Search & QR</p>
          </div>
        </button>

        <button
          onClick={() => setActiveView('stock-check')}
          className="p-3.5 rounded-xl bg-[#FBF7EE] hover:bg-[#F3EBDA] border border-[#DACBAA] text-left transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-[#E9D9C5] text-[#8B5A3C] group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2C2417]">Stock Check</p>
            <p className="text-[11px] text-[#766A57]">Live Roll Buckets</p>
          </div>
        </button>

        <button
          onClick={() => setActiveView('track-orders')}
          className="p-3.5 rounded-xl bg-[#FBF7EE] hover:bg-[#F3EBDA] border border-[#DACBAA] text-left transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-[#E9D9C5] text-[#8B5A3C] group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2C2417]">Track Orders</p>
            <p className="text-[11px] text-[#766A57]">Transporter & Docket</p>
          </div>
        </button>

        <button
          onClick={() => setActiveView('catalogue-order')}
          className="p-3.5 rounded-xl bg-[#FBF7EE] hover:bg-[#F3EBDA] border border-[#DACBAA] text-left transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-[#E9D9C5] text-[#8B5A3C] group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2C2417]">Catalogue Books</p>
            <p className="text-[11px] text-[#766A57]">Physical Swatches</p>
          </div>
        </button>
      </div>

      {/* SECTION 2: MY ORDERS SUMMARY */}
      <section className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DACBAA]/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E9D9C5] rounded-xl text-[#8B5A3C]">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#2C2417]">My Orders</h2>
              <p className="text-xs text-[#766A57]">Order pipeline & dispatch status</p>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-[#766A57] flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Filter:
            </span>
            <div className="flex bg-[#E7DAC0] rounded-lg p-0.5 border border-[#DACBAA]">
              <button
                onClick={() => setDateFilter('mtd')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  dateFilter === 'mtd' ? 'bg-[#8B5A3C] text-white shadow-xs' : 'text-[#766A57]'
                }`}
              >
                MTD
              </button>
              <button
                onClick={() => setDateFilter('30d')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  dateFilter === '30d' ? 'bg-[#8B5A3C] text-white shadow-xs' : 'text-[#766A57]'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  dateFilter === 'all' ? 'bg-[#8B5A3C] text-white shadow-xs' : 'text-[#766A57]'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* Counts summary pills */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#E3E7D8] border border-[#5F6B4A]/30 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#5F6B4A]">Completed Orders</span>
              <p className="font-display font-bold text-xl text-[#5F6B4A]">{completedCount}</p>
            </div>
            <span className="text-[10px] bg-[#5F6B4A] text-white px-2 py-0.5 rounded-full font-semibold">
              Delivered
            </span>
          </div>

          <div className="p-3 bg-[#E9D9C5] border border-[#8B5A3C]/30 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#8B5A3C]">Pending Orders</span>
              <p className="font-display font-bold text-xl text-[#8B5A3C]">{pendingCount}</p>
            </div>
            <span className="text-[10px] bg-[#8B5A3C] text-white px-2 py-0.5 rounded-full font-semibold">
              In Transit / Prep
            </span>
          </div>
        </div>

        {/* Orders list preview */}
        <div className="space-y-2.5 pt-1">
          {filteredOrders.slice(0, 3).map(order => (
            <div
              key={order.id}
              className="p-3 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#8B5A3C] font-mono">{order.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      order.status === 'Delivered'
                        ? 'bg-[#E3E7D8] text-[#5F6B4A]'
                        : order.status === 'Dispatched'
                        ? 'bg-[#E9D9C5] text-[#8B5A3C]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-[#766A57] text-[11px]">
                    {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-[#2C2417] font-medium">
                  {order.items.map(i => `${i.catalogueName} (${i.quantityMeters}m)`).join(', ')}
                </p>

                {order.transporterName && (
                  <p className="text-[11px] text-[#766A57]">
                    Carrier: <strong>{order.transporterName}</strong> | Docket: <span className="font-mono">{order.docketNumber}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DACBAA]/40">
                <div className="text-right">
                  <span className="text-[10px] text-[#766A57] block">Grand Total</span>
                  <strong className="text-sm font-display text-[#2C2417]">
                    ₹{order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInvoiceToView(order)}
                    className="p-1.5 rounded-lg bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] transition-colors"
                    title="View GST Tax Invoice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveView('track-orders')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#8B5A3C] text-white font-medium hover:bg-[#72482E] transition-colors flex items-center gap-1"
                  >
                    <span>Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: CATALOGUE TRACKER (REFERENCE SCREEN FEATURE) */}
      <section className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E9D9C5] rounded-xl text-[#8B5A3C]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#2C2417]">Catalogue Tracker</h2>
              <p className="text-xs text-[#766A57]">
                Physical sample books & swatch binders dispatched to your dealership
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('catalogue-order')}
            className="text-xs font-semibold text-[#8B5A3C] hover:underline"
          >
            Order New Sample Book
          </button>
        </div>

        <div className="divide-y divide-[#DACBAA]/60">
          {catalogueDispatches.map(cat => (
            <div
              key={cat.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2C2417]">{cat.catalogueName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      cat.status === 'Delivered'
                        ? 'bg-[#E3E7D8] text-[#5F6B4A]'
                        : 'bg-[#E9D9C5] text-[#8B5A3C]'
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#766A57] text-[11px]">
                  <span>Code: <strong className="text-[#2C2417] font-mono">{cat.catalogueCode}</strong></span>
                  <span>Qty: <strong>{cat.quantity} pcs</strong></span>
                  <span>Invoice: <strong>{cat.invoiceNo}</strong></span>
                </div>
              </div>

              <div className="text-left sm:text-right text-[11px] text-[#766A57] bg-[#F3EBDA] sm:bg-transparent p-2 sm:p-0 rounded-lg">
                <p>Transporter: <strong className="text-[#2C2417]">{cat.transporter}</strong></p>
                <p>
                  Dispatched: <strong>{cat.dispatchedDate}</strong> | Docket: <span className="font-mono text-[#2C2417]">{cat.docketNumber}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PERSISTENT FLOATING / PROMINENT PLACE ORDER CTA BUTTON */}
      <div className="fixed bottom-4 right-4 sm:right-8 z-30">
        <button
          onClick={() => setActiveView('place-order')}
          className="px-6 py-3.5 rounded-full bg-[#8B5A3C] hover:bg-[#72482E] text-white font-semibold text-sm shadow-xl flex items-center gap-2 border-2 border-[#FBF7EE] transition-transform active:scale-95 cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span>Place New Order</span>
        </button>
      </div>
    </div>
  );
};
