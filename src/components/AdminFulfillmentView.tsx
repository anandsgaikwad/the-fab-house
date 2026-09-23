import React, { useState } from 'react';
import {
  Shield,
  Factory,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Building,
  User,
  Package,
  Mail,
  LogOut,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { EmailOutboxModal } from './EmailOutboxModal';
import { ShippingLabelModal } from './ShippingLabelModal';
import { openWhatsAppShare } from '../services/whatsappService';
import { AdminDirectInvoiceModal } from './AdminDirectInvoiceModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { RecordLedgerAdjustmentModal } from './RecordLedgerAdjustmentModal';
import { CreditCard, Plus } from 'lucide-react';

export const AdminFulfillmentView: React.FC = () => {
  const {
    orders,
    adminRaiseMillProcurement,
    adminGenerateInvoice,
    adminDispatchOrder,
    adminDeliverOrder,
    setInvoiceToView,
    businessProfile,
    showToast,
    adminUser,
    logoutAdmin,
    emailNotifications,
    ownerNotificationEmail,
    sendOrderEmail,
    sendDispatchEmail,
    products,
    setActiveView,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [transporterInput, setTransporterInput] = useState('VRL Logistics Ltd');
  const [docketInput, setDocketInput] = useState('');
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);
  const [isDirectInvoiceModalOpen, setIsDirectInvoiceModalOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isLedgerAdjustmentOpen, setIsLedgerAdjustmentOpen] = useState(false);

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'All') return true;
    return o.status === filterStatus;
  });

  const handleOpenDispatchModal = (order: Order) => {
    setDispatchModalOrder(order);
    setTransporterInput(order.transporterName || 'VRL Logistics Ltd');
    setDocketInput(order.docketNumber || `VRL-PUN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const submitDispatch = () => {
    if (!dispatchModalOrder || !transporterInput || !docketInput) return;
    adminDispatchOrder(dispatchModalOrder.id, transporterInput, docketInput);
    setDispatchModalOrder(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Admin Back Office Header */}
      <div className="bg-[#2C2417] text-[#FBF7EE] p-5 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#8B5A3C] text-white">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="font-display font-bold text-xl sm:text-2xl">
              Back Office Fulfillment Protocol
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#E7DAC0]">
            <span>THE FAB HOUSE Admin Portal · Anand Sachin Gaikwad</span>
            {adminUser && (
              <span className="inline-flex items-center gap-1 bg-[#5F6B4A]/40 text-[#D7E2C7] px-2.5 py-0.5 rounded-full border border-[#5F6B4A]/60 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3C088]" />
                <span>Google Verified: {adminUser.email}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setIsDirectInvoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold transition-colors shadow-xs"
            title="Create Direct GST Tax Invoice for any dealer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Create GST Invoice</span>
          </button>

          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5F6B4A] hover:bg-[#4E593D] text-white font-bold transition-colors shadow-xs"
            title="Record payment received from dealer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setActiveView('admin-fabrics')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4A3B2C] hover:bg-[#5C4936] text-[#E7DAC0] hover:text-white font-bold transition-colors border border-[#8B5A3C]/40"
            title="Open Fabric Inventory and Sample Management"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fabric Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setIsOutboxOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4A3B2C] hover:bg-[#5C4936] text-[#E7DAC0] hover:text-white font-bold transition-colors border border-[#8B5A3C]/40"
            title="View all dispatched email alerts to owner"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Outbox ({emailNotifications.length})</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3A2B1D] hover:bg-[#4D3A27] text-neutral-300 hover:text-white transition-colors border border-[#8B5A3C]/40"
            title="Lock Admin Panel and switch to Dealer view"
          >
            <LogOut className="w-3.5 h-3.5 text-red-300" />
            <span>Lock Admin</span>
          </button>
        </div>
      </div>

      {/* Protocol Workflow Steps Diagram */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#766A57]">
          Order Fulfillment Workflow Protocol (§4.7)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="font-bold text-[#8B5A3C] block mb-1">1. Confirm Order</span>
            <p className="text-[#766A57]">Order placed by buyer and credit/payment verified.</p>
          </div>
          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="font-bold text-[#8B5A3C] block mb-1">2. Mill Procurement</span>
            <p className="text-[#766A57]">Raise procurement req to mill for out-of-stock rolls.</p>
          </div>
          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="font-bold text-[#8B5A3C] block mb-1">3. Generate GST Invoice</span>
            <p className="text-[#766A57]">Auto-calculated with HSN 5407, CGST+SGST, & buyer GSTIN.</p>
          </div>
          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="font-bold text-[#8B5A3C] block mb-1">4. Dispatch & Track</span>
            <p className="text-[#766A57]">Transporter & docket pushed live to buyer's tracking.</p>
          </div>
        </div>
      </div>

      {/* Orders Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['All', 'Confirmed', 'Procurement in Progress', 'Dispatched', 'Delivered'] as (OrderStatus | 'All')[]).map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === st
                ? 'bg-[#8B5A3C] text-white shadow-xs'
                : 'bg-[#FBF7EE] text-[#766A57] hover:bg-[#E7DAC0] border border-[#DACBAA]'
            }`}
          >
            {st} ({st === 'All' ? orders.length : orders.filter(o => o.status === st).length})
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-8 text-center text-xs text-[#766A57]">
            No orders found matching the status filter "{filterStatus}".
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
            >
              {/* Top metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DACBAA]/60 pb-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-[#8B5A3C]">{order.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      order.status === 'Delivered'
                        ? 'bg-[#E3E7D8] text-[#5F6B4A]'
                        : order.status === 'Dispatched'
                        ? 'bg-[#E9D9C5] text-[#8B5A3C]'
                        : order.status === 'Procurement in Progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-[#766A57]">
                    Placed: {new Date(order.orderDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#766A57]">
                    Buyer: <strong className="text-[#2C2417]">{businessProfile.companyName}</strong> ({businessProfile.dealerCode})
                  </span>
                </div>
              </div>

              {/* Items in Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60 space-y-1"
                  >
                    <div className="flex justify-between font-bold text-[#2C2417]">
                      <span>{item.catalogueName}</span>
                      <span className="font-mono">{item.quantityMeters}m</span>
                    </div>
                    <p className="text-[11px] text-[#766A57]">
                      SKU: <span className="font-mono">{item.sku}</span> · Shade {item.shadeNo}
                    </p>
                    <div className="flex justify-between text-[11px] text-[#766A57] pt-1">
                      <span>Rate: ₹{item.ratePerMeter}/m</span>
                      <span className="font-mono font-semibold text-[#8B5A3C]">
                        ₹{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Destination & Value Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#E7DAC0]/50 p-3 rounded-xl text-xs">
                <div className="space-y-0.5">
                  <p className="text-[#766A57]">
                    Ship To: <strong className="text-[#2C2417]">{order.shippingAddress.title}</strong> ({order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode})
                  </p>
                  <p className="text-[11px] text-[#766A57]">
                    Mode: <strong>{order.shippingMode} Transportation</strong> · Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#766A57] block">Grand Total (incl. GST):</span>
                  <span className="font-mono font-bold text-base text-[#8B5A3C]">
                    ₹{order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Fulfillment Protocol Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#DACBAA]/60 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {order.invoiceNumber ? (
                    <button
                      onClick={() => setInvoiceToView(order)}
                      className="px-3 py-1.5 rounded-lg bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#8B5A3C]" />
                      <span>Invoice: {order.invoiceNumber}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => adminGenerateInvoice(order.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#8B5A3C] hover:bg-[#72482E] text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate GST Invoice</span>
                    </button>
                  )}

                  {/* Mill Procurement Action */}
                  {!order.millProcurementRaised && order.status !== 'Delivered' && (
                    <button
                      onClick={() => adminRaiseMillProcurement(order.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#F3EBDA] hover:bg-[#E7DAC0] text-[#8B5A3C] font-semibold border border-[#DACBAA] flex items-center gap-1.5 transition-colors"
                    >
                      <Factory className="w-3.5 h-3.5" />
                      <span>Raise Mill Procurement</span>
                    </button>
                  )}

                  {order.millProcurementRaised && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#E3E7D8] text-[#5F6B4A] text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mill Req: {order.millProcurementStatus || 'Order Placed'}</span>
                    </span>
                  )}
                </div>

                {/* Dispatch & Delivery Triggers & Email Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Direct WhatsApp Share to Dealer */}
                  <button
                    onClick={() => openWhatsAppShare(order, order.shippingAddress.phone)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#25D366]/40 bg-[#DCF8C6] hover:bg-[#cbf1af] text-[#075E54] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Send instant WhatsApp dispatch status to dealer phone"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Parcel Packaging Slip 4x6 */}
                  <button
                    onClick={() => setSelectedLabelOrder(order)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] hover:bg-[#F3EBDA] text-[#2C2417] font-semibold flex items-center gap-1 transition-colors"
                    title="Print 4x6 Roll Bale Packaging Tag / Shipping Slip"
                  >
                    <Package className="w-3.5 h-3.5 text-[#8B5A3C]" />
                    <span>Parcel Label</span>
                  </button>

                  <button
                    onClick={() => sendOrderEmail(order)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] hover:bg-[#F3EBDA] text-[#2C2417] font-semibold flex items-center gap-1 transition-colors"
                    title="Generate and view Order Confirmation email for owner"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#8B5A3C]" />
                    <span>Order Email</span>
                  </button>

                  {order.status === 'Dispatched' && (
                    <button
                      onClick={() => sendDispatchEmail(order)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] hover:bg-[#F3EBDA] text-[#2C2417] font-semibold flex items-center gap-1 transition-colors"
                      title="Generate and view Dispatch Notification email for owner"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#5F6B4A]" />
                      <span>Dispatch Email</span>
                    </button>
                  )}

                  {order.status !== 'Dispatched' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleOpenDispatchModal(order)}
                      className="px-4 py-1.5 rounded-lg bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch via Transporter</span>
                    </button>
                  )}

                  {order.status === 'Dispatched' && (
                    <button
                      onClick={() => adminDeliverOrder(order.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#5F6B4A] hover:bg-[#4d573c] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DISPATCH ORDER MODAL */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2C2417]/60 backdrop-blur-xs"
            onClick={() => setDispatchModalOrder(null)}
          />

          <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-md w-full p-5 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DACBAA]/60">
              <Truck className="w-5 h-5 text-[#8B5A3C]" />
              <h3 className="font-display font-bold text-base text-[#2C2417]">
                Dispatch Order #{dispatchModalOrder.id}
              </h3>
            </div>

            <p className="text-[#766A57]">
              Enter logistics transporter name and consignment / docket number to notify buyer in their Track Orders tab.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-[#2C2417] block mb-1">Transporter / Logistics Partner</label>
                <input
                  type="text"
                  value={transporterInput}
                  onChange={e => setTransporterInput(e.target.value)}
                  placeholder="e.g. VRL Logistics, TCI Express, Safechem"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs text-[#2C2417]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2C2417] block mb-1">Docket / LR / Waybill Number</label>
                <input
                  type="text"
                  value={docketInput}
                  onChange={e => setDocketInput(e.target.value)}
                  placeholder="e.g. VRL-PUN-9821481"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs font-mono text-[#2C2417]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="px-4 py-2 rounded-xl border border-[#DACBAA] font-semibold text-[#766A57]"
              >
                Cancel
              </button>
              <button
                onClick={submitDispatch}
                className="px-5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold transition-colors shadow-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Email Notifications Outbox Modal */}
      <EmailOutboxModal
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
      />

      {/* Parcel Packaging Slip / Shipping Label Modal */}
      <ShippingLabelModal
        order={selectedLabelOrder}
        isOpen={Boolean(selectedLabelOrder)}
        onClose={() => setSelectedLabelOrder(null)}
      />

      {/* Admin Direct GST Invoice Creation Modal */}
      <AdminDirectInvoiceModal
        isOpen={isDirectInvoiceModalOpen}
        onClose={() => setIsDirectInvoiceModalOpen(false)}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
      />

      {/* Record Ledger Adjustment / Credit Note Modal */}
      <RecordLedgerAdjustmentModal
        isOpen={isLedgerAdjustmentOpen}
        onClose={() => setIsLedgerAdjustmentOpen(false)}
      />
    </div>
  );
};
