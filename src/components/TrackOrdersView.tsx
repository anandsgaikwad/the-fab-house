import React, { useState } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  Package,
  MapPin,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus, Order } from '../types';
import { ShippingLabelModal } from './ShippingLabelModal';
import { openWhatsAppShare } from '../services/whatsappService';

export const TrackOrdersView: React.FC = () => {
  const { orders, setInvoiceToView, setActiveView, role, activeDealerId, activeDealer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'All' | 'Active' | 'Dispatched' | 'Delivered'>('All');
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);

  // In Buyer role, isolate orders to the active dealer
  const dealerOrders = role === 'buyer'
    ? orders.filter(ord => !ord.dealerId || ord.dealerId === activeDealerId || ord.dealerCode === activeDealer.dealerCode)
    : orders;

  const filteredOrders = dealerOrders.filter(ord => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      ord.id.toLowerCase().includes(q) ||
      (ord.docketNumber && ord.docketNumber.toLowerCase().includes(q)) ||
      ord.items.some(i => i.catalogueName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (activeStatusTab === 'All') return true;
    if (activeStatusTab === 'Active') {
      return ord.status === 'Placed' || ord.status === 'Confirmed' || ord.status === 'Procurement in Progress';
    }
    if (activeStatusTab === 'Dispatched') return ord.status === 'Dispatched';
    if (activeStatusTab === 'Delivered') return ord.status === 'Delivered';
    return true;
  });

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Procurement in Progress':
        return 2;
      case 'Dispatched':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const steps = [
    'Placed',
    'Confirmed',
    'Mill Procurement',
    'Dispatched',
    'Delivered',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Track Fabric Orders
          </h1>
          <p className="text-xs text-[#766A57]">
            Real-time status updates from mill procurement to transporter dispatch & delivery
          </p>
        </div>
        <button
          onClick={() => setActiveView('place-order')}
          className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors self-start sm:self-auto shadow-xs"
        >
          + Place New Order
        </button>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#766A57] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search with Order ID (e.g. TFH-2026-0891), docket number, or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417] focus:outline-hidden focus:border-[#8B5A3C] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {(['All', 'Active', 'Dispatched', 'Delivered'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeStatusTab === tab
                  ? 'bg-[#8B5A3C] text-white shadow-xs'
                  : 'bg-[#FBF7EE] text-[#766A57] hover:bg-[#E7DAC0] border border-[#DACBAA]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-10 text-center space-y-2">
            <Package className="w-10 h-10 text-[#8B5A3C] mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#2C2417]">No matching orders found</p>
            <p className="text-xs text-[#766A57]">Try adjusting your search terms or filter.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const currentStepIdx = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DACBAA]/60 pb-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-[#8B5A3C]">{order.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        order.status === 'Delivered'
                          ? 'bg-[#E3E7D8] text-[#5F6B4A]'
                          : order.status === 'Dispatched'
                          ? 'bg-[#E9D9C5] text-[#8B5A3C]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.millProcurementStatus && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7DAC0] text-[#766A57] border border-[#DACBAA]">
                        Mill: {order.millProcurementStatus}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[#766A57]">
                    <span>
                      Ordered: {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold text-[#2C2417]">
                      ₹{order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="py-2">
                  <div className="relative flex items-center justify-between">
                    {/* Connecting line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#DACBAA]/60 z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#8B5A3C] z-0 transition-all duration-500"
                      style={{
                        width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                      }}
                    />

                    {steps.map((st, i) => {
                      const isComplete = i <= currentStepIdx;
                      const isCurrent = i === currentStepIdx;

                      return (
                        <div key={st} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                              isComplete
                                ? 'bg-[#8B5A3C] text-white shadow-xs'
                                : 'bg-[#E7DAC0] text-[#766A57] border border-[#DACBAA]'
                            } ${isCurrent ? 'ring-4 ring-[#8B5A3C]/20' : ''}`}
                          >
                            {isComplete ? '✓' : i + 1}
                          </div>
                          <span
                            className={`text-[10px] font-semibold mt-1.5 text-center hidden sm:block ${
                              isCurrent ? 'text-[#8B5A3C] font-bold' : 'text-[#766A57]'
                            }`}
                          >
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items preview in card */}
                <div className="bg-[#F3EBDA] p-3 rounded-xl border border-[#DACBAA]/60 space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[#2C2417]">
                      <div>
                        <span className="font-semibold">{item.catalogueName}</span>
                        <span className="text-[#766A57] text-[11px] ml-1.5">
                          (Shade {item.shadeNo}, SKU: {item.sku})
                        </span>
                      </div>
                      <span className="font-mono font-semibold">{item.quantityMeters}m</span>
                    </div>
                  ))}
                </div>

                {/* Logistics & Transporter Details Box */}
                {(order.transporterName || order.docketNumber) && (
                  <div className="bg-[#E9D9C5] p-3.5 rounded-xl border border-[#8B5A3C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FBF7EE] rounded-lg text-[#8B5A3C] shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#2C2417]">
                          Carrier: {order.transporterName}
                        </p>
                        <p className="text-[#766A57]">
                          Docket / LR No: <strong className="font-mono text-[#8B5A3C]">{order.docketNumber}</strong>
                        </p>
                        {order.dispatchedDate && (
                          <p className="text-[11px] text-[#766A57]">
                            Dispatched On: {order.dispatchedDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#766A57] block">Destination Site</span>
                      <strong className="text-[#2C2417]">{order.shippingAddress.title}</strong>
                    </div>
                  </div>
                )}

                {/* Actions: View GST Invoice / Claim */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-[#766A57]">
                    Mode: <strong>{order.shippingMode} Transportation</strong> · Payment: <strong>{order.paymentMethod}</strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* WhatsApp Share */}
                    <button
                      onClick={() => openWhatsAppShare(order, order.shippingAddress.phone)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#25D366]/40 bg-[#DCF8C6] hover:bg-[#cbf1af] text-[#075E54] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Share Order & Tracking status on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Parcel Packaging Slip */}
                    <button
                      onClick={() => setSelectedLabelOrder(order)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] hover:bg-[#E7DAC0] text-[#2C2417] font-semibold flex items-center gap-1 transition-colors"
                      title="View standard 4x6 Roll Bale Shipping Label"
                    >
                      <Package className="w-3.5 h-3.5 text-[#8B5A3C]" />
                      <span>Parcel Label</span>
                    </button>

                    <button
                      onClick={() => setActiveView('complaints')}
                      className="px-3 py-1.5 rounded-lg border border-[#DACBAA] text-[#766A57] hover:bg-[#E7DAC0] font-semibold transition-colors"
                    >
                      Report Discrepancy
                    </button>
                    <button
                      onClick={() => setInvoiceToView(order)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#8B5A3C] hover:bg-[#72482E] text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>GST Tax Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Parcel Packaging Slip Modal */}
      <ShippingLabelModal
        order={selectedLabelOrder}
        isOpen={Boolean(selectedLabelOrder)}
        onClose={() => setSelectedLabelOrder(null)}
      />
    </div>
  );
};
