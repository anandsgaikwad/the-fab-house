import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  CheckSquare,
  Square,
  Building,
  Edit3,
  Save,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderItem } from '../types';
import { FAB_HOUSE_CONTACT } from '../data/mockBusiness';
import { useApp } from '../context/AppContext';

interface BulkInvoiceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export const BulkInvoiceExportModal: React.FC<BulkInvoiceExportModalProps> = ({
  isOpen,
  onClose,
  defaultStartDate,
  defaultEndDate,
}) => {
  const { orders, businessProfile, updateOrder, showToast } = useApp();

  // Date filters: default to past 30 days to today
  const [startDate, setStartDate] = useState<string>(() => {
    if (defaultStartDate) return defaultStartDate;
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    if (defaultEndDate) return defaultEndDate;
    return new Date().toISOString().split('T')[0];
  });

  // Filter mode: All vs Pending GST Invoices (or All GST Invoices)
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Dispatched' | 'Delivered'>('Pending');

  // Interactive Editable Invoices state (allows admin to adjust invoice numbers, dates, HSN, rates before PDF export)
  const [editableOrders, setEditableOrders] = useState<{ [orderId: string]: Order }>({});
  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Filtered orders based on date range and status
  const matchedOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDateStr = (order.invoiceDate || order.orderDate).split('T')[0];
      const isInDateRange = orderDateStr >= startDate && orderDateStr <= endDate;
      if (!isInDateRange) return false;

      if (statusFilter === 'Pending') {
        // Pending invoices: Not yet delivered or payment pending / procurement in progress or confirmed
        return order.status !== 'Delivered' && order.status !== 'Cancelled';
      }
      if (statusFilter === 'Dispatched') {
        return order.status === 'Dispatched';
      }
      if (statusFilter === 'Delivered') {
        return order.status === 'Delivered';
      }
      return order.status !== 'Cancelled';
    });
  }, [orders, startDate, endDate, statusFilter]);

  // Sync initial selection when matchedOrders changes
  React.useEffect(() => {
    const ids = matchedOrders.map(o => o.id);
    setSelectedOrderIds(ids);

    // Populate editable state for matched orders
    const initialMap: { [orderId: string]: Order } = {};
    matchedOrders.forEach(o => {
      initialMap[o.id] = {
        ...o,
        invoiceNumber: o.invoiceNumber || `TFH/26-27/0${o.id.split('-').pop()}`,
        invoiceDate: o.invoiceDate || (o.orderDate ? o.orderDate.split('T')[0] : new Date().toISOString().split('T')[0]),
      };
    });
    setEditableOrders(initialMap);
  }, [matchedOrders]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === matchedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(matchedOrders.map(o => o.id));
    }
  };

  const handleUpdateField = (
    orderId: string,
    field: keyof Order,
    value: any
  ) => {
    setEditableOrders(prev => {
      const current = prev[orderId] || orders.find(o => o.id === orderId);
      if (!current) return prev;
      return {
        ...prev,
        [orderId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleUpdateItem = (
    orderId: string,
    itemIdx: number,
    field: keyof OrderItem,
    value: any
  ) => {
    setEditableOrders(prev => {
      const current = prev[orderId];
      if (!current) return prev;
      const newItems = [...current.items];
      const targetItem = { ...newItems[itemIdx], [field]: value };

      if (field === 'quantityMeters' || field === 'ratePerMeter' || field === 'discountPercentage') {
        const qty = Number(field === 'quantityMeters' ? value : targetItem.quantityMeters) || 0;
        const rate = Number(field === 'ratePerMeter' ? value : targetItem.ratePerMeter) || 0;
        const disc = Number(field === 'discountPercentage' ? value : targetItem.discountPercentage) || 0;
        const netRate = Number((rate * (1 - disc / 100)).toFixed(2));
        targetItem.quantityMeters = qty;
        targetItem.ratePerMeter = rate;
        targetItem.discountPercentage = disc;
        targetItem.netRatePerMeter = netRate;
        targetItem.totalAmount = Number((netRate * qty).toFixed(2));
      }

      newItems[itemIdx] = targetItem;

      // Recalculate totals for order
      const subtotal = newItems.reduce((acc, it) => acc + (Number(it.ratePerMeter) || 0) * (Number(it.quantityMeters) || 0), 0);
      const discount = newItems.reduce(
        (acc, it) => acc + ((Number(it.ratePerMeter) || 0) * ((Number(it.discountPercentage) || 0) / 100)) * (Number(it.quantityMeters) || 0),
        0
      );
      const taxable = subtotal - discount;
      const gst = Number((taxable * 0.05).toFixed(2));
      const total = Number((taxable + gst + current.shippingCharge).toFixed(2));

      return {
        ...prev,
        [orderId]: {
          ...current,
          items: newItems,
          subtotalDpl: subtotal,
          totalRollDiscount: discount,
          taxableAmount: taxable,
          gstAmount: gst,
          grandTotal: total,
        },
      };
    });
  };

  const handleSaveToDatabase = (orderId: string) => {
    const updated = editableOrders[orderId];
    if (updated) {
      updateOrder(updated);
      setEditingOrderId(null);
    }
  };

  const handlePrintAll = () => {
    // Save any pending edits to AppContext
    selectedOrderIds.forEach(id => {
      if (editableOrders[id]) {
        updateOrder(editableOrders[id]);
      }
    });
    // Print window
    window.print();
  };

  // Orders to render in bulk export
  const exportOrders = selectedOrderIds
    .map(id => editableOrders[id] || orders.find(o => o.id === id))
    .filter(Boolean) as Order[];

  const totalExportValue = exportOrders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalExportMeters = exportOrders.reduce(
    (acc, o) => acc + o.items.reduce((s, it) => s + (Number(it.quantityMeters) || 0), 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-[#2C2417]/75 backdrop-blur-xs no-print" onClick={onClose} />

      <div className="relative bg-[#FFFFFF] text-[#2C2417] rounded-2xl max-w-5xl w-full shadow-2xl z-10 flex flex-col max-h-[94vh] overflow-hidden border border-[#DACBAA] print:border-none print:shadow-none print:max-h-none print:p-0 print:m-0 print:rounded-none">
        {/* MODAL CONTROL HEADER (hidden in print) */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-b border-[#DACBAA] flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8B5A3C] text-white rounded-xl shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B5A3C] block">
                Bulk GST Tax Invoices Export Engine
              </span>
              <h2 className="font-display font-bold text-base text-[#2C2417]">
                Consolidated Date-Range Invoices into Single PDF
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="bg-[#DACBAA]/60 p-0.5 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setActiveTab('configure')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'configure'
                    ? 'bg-[#8B5A3C] text-white shadow-xs'
                    : 'text-[#2C2417] hover:bg-[#E7DAC0]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Edit ({exportOrders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-[#8B5A3C] text-white shadow-xs'
                    : 'text-[#2C2417] hover:bg-[#E7DAC0]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Single Multi-Page PDF Preview</span>
              </button>
            </div>

            <button
              onClick={handlePrintAll}
              disabled={exportOrders.length === 0}
              className="px-4 py-1.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF ({exportOrders.length})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FBF7EE] print:bg-white print:p-0">
          {/* TAB 1: CONFIGURE, DATE-RANGE FILTER & EDITABLE TABLE */}
          {activeTab === 'configure' && (
            <div className="space-y-5 no-print">
              {/* Date Filter Strip */}
              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DACBAA] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#8B5A3C]" />
                    <span className="font-bold text-xs text-[#2C2417] uppercase tracking-wider">
                      Select Date Range & GST Status
                    </span>
                  </div>
                  <span className="text-[11px] text-[#766A57]">
                    Found <strong>{matchedOrders.length}</strong> matching orders · <strong>{selectedOrderIds.length}</strong> selected for PDF
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {/* Start Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#766A57] mb-1">
                      From Invoice/Order Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] text-[#2C2417] font-semibold text-xs focus:ring-1 focus:ring-[#8B5A3C] outline-hidden"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#766A57] mb-1">
                      To Invoice/Order Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] text-[#2C2417] font-semibold text-xs focus:ring-1 focus:ring-[#8B5A3C] outline-hidden"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#766A57] mb-1">
                      Invoice Status Scope
                    </label>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] text-[#2C2417] font-semibold text-xs focus:ring-1 focus:ring-[#8B5A3C] outline-hidden"
                    >
                      <option value="Pending">Pending Invoices (Open / In-Progress / Dispatched)</option>
                      <option value="All">All Invoices in Date Range</option>
                      <option value="Dispatched">Dispatched Orders Only</option>
                      <option value="Delivered">Delivered Orders Only</option>
                    </select>
                  </div>

                  {/* Quick summary stats */}
                  <div className="bg-[#F3EBDA] p-2 rounded-lg border border-[#DACBAA] flex flex-col justify-center">
                    <span className="text-[10px] text-[#766A57] block">Selected PDF Total Value:</span>
                    <strong className="text-sm font-display text-[#8B5A3C]">
                      ₹{totalExportValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[10px] text-[#5F6B4A]">
                      {totalExportMeters} Metres total fabric
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Invoices List */}
              <div className="bg-[#FFFFFF] border border-[#DACBAA] rounded-xl overflow-hidden shadow-xs space-y-0">
                <div className="px-4 py-3 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#2C2417] hover:text-[#8B5A3C]"
                    >
                      {selectedOrderIds.length === matchedOrders.length && matchedOrders.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#8B5A3C]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#766A57]" />
                      )}
                      <span>Select All ({matchedOrders.length})</span>
                    </button>
                    <span className="text-[11px] text-[#766A57]">
                      Click <Edit3 className="w-3 h-3 inline text-[#8B5A3C]" /> to edit Invoice Number, Date, Transporter, or Rates before generating the PDF.
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('preview')}
                    className="px-3 py-1 rounded-lg bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-1"
                  >
                    <span>View Consolidated PDF</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-[#DACBAA]/50">
                  {matchedOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#766A57] space-y-2">
                      <AlertCircle className="w-8 h-8 text-[#8B5A3C] mx-auto opacity-70" />
                      <p className="font-semibold text-sm text-[#2C2417]">
                        No pending invoices found for selected date range
                      </p>
                      <p>
                        Try widening the dates (e.g. from 01 Aug 2026) or change the status filter to "All Invoices".
                      </p>
                    </div>
                  ) : (
                    matchedOrders.map(order => {
                      const cur = editableOrders[order.id] || order;
                      const isSelected = selectedOrderIds.includes(order.id);
                      const isEditing = editingOrderId === order.id;

                      return (
                        <div
                          key={order.id}
                          className={`p-4 transition-colors ${
                            isSelected ? 'bg-[#FAF6EE]' : 'bg-[#FFFFFF] opacity-75'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(order.id)}
                                className="mt-1 w-4 h-4 rounded border-[#DACBAA] text-[#8B5A3C] focus:ring-[#8B5A3C]"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <strong className="font-mono text-xs text-[#2C2417] bg-[#E7DAC0] px-1.5 py-0.5 rounded-sm">
                                    {cur.invoiceNumber || 'TFH/26-27/TEMP'}
                                  </strong>
                                  <span className="font-mono text-xs text-[#8B5A3C] font-semibold">
                                    Ref: {cur.id}
                                  </span>
                                  <span className="text-[10px] bg-[#E3E7D8] text-[#5F6B4A] font-bold px-2 py-0.5 rounded-full border border-[#5F6B4A]/20">
                                    {cur.status}
                                  </span>
                                </div>
                                <p className="text-xs text-[#766A57]">
                                  Buyer: <strong className="text-[#2C2417]">{cur.shippingAddress.title}</strong> · {cur.shippingAddress.city}
                                </p>
                                <p className="text-[11px] text-[#766A57]">
                                  Items: {cur.items.map(it => `${it.catalogueName} (${it.quantityMeters}m)`).join(', ')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:text-right">
                              <div>
                                <span className="text-[10px] text-[#766A57] block">Invoice Total:</span>
                                <strong className="text-xs font-mono font-bold text-[#2C2417]">
                                  ₹{cur.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </strong>
                                <span className="text-[10px] text-[#766A57] block">
                                  Date: {cur.invoiceDate || cur.orderDate.split('T')[0]}
                                </span>
                              </div>

                              <button
                                onClick={() => setEditingOrderId(isEditing ? null : order.id)}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                                  isEditing
                                    ? 'bg-[#8B5A3C] text-white border-[#8B5A3C]'
                                    : 'bg-[#F3EBDA] border-[#DACBAA] text-[#2C2417] hover:bg-[#E7DAC0]'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isEditing ? 'Close Editor' : 'Edit Invoice'}</span>
                              </button>
                            </div>
                          </div>

                          {/* INLINE EDITABLE FORM ACCORDION */}
                          {isEditing && (
                            <div className="mt-4 pt-3 border-t border-[#DACBAA] bg-[#FFFFFF] p-3 rounded-lg border space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-[#8B5A3C] tracking-wider">
                                  Live Editable Invoice Fields (#{cur.id})
                                </span>
                                <button
                                  onClick={() => handleSaveToDatabase(order.id)}
                                  className="px-3 py-1 bg-[#5F6B4A] hover:bg-[#4d573c] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save Changes</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <label className="block text-[10px] text-[#766A57] font-semibold">
                                    Invoice No:
                                  </label>
                                  <input
                                    type="text"
                                    value={cur.invoiceNumber || ''}
                                    onChange={e =>
                                      handleUpdateField(order.id, 'invoiceNumber', e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-[#DACBAA] rounded bg-[#FAF6EE] font-mono text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-[#766A57] font-semibold">
                                    Invoice Date:
                                  </label>
                                  <input
                                    type="date"
                                    value={cur.invoiceDate || cur.orderDate.split('T')[0]}
                                    onChange={e =>
                                      handleUpdateField(order.id, 'invoiceDate', e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-[#DACBAA] rounded bg-[#FAF6EE] text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-[#766A57] font-semibold">
                                    Transporter Name:
                                  </label>
                                  <input
                                    type="text"
                                    value={cur.transporterName || ''}
                                    placeholder="e.g. VRL Logistics Ltd"
                                    onChange={e =>
                                      handleUpdateField(order.id, 'transporterName', e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-[#DACBAA] rounded bg-[#FAF6EE] text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-[#766A57] font-semibold">
                                    Docket / LR No:
                                  </label>
                                  <input
                                    type="text"
                                    value={cur.docketNumber || ''}
                                    placeholder="e.g. VRL-98214"
                                    onChange={e =>
                                      handleUpdateField(order.id, 'docketNumber', e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-[#DACBAA] rounded bg-[#FAF6EE] font-mono text-xs"
                                  />
                                </div>
                              </div>

                              {/* Editable Items sub-table */}
                              <div className="overflow-x-auto border border-[#DACBAA] rounded-lg">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-[#E7DAC0] text-[#2C2417] font-bold">
                                    <tr>
                                      <th className="p-1.5">Fabric Item / Description</th>
                                      <th className="p-1.5">HSN Code</th>
                                      <th className="p-1.5 text-right">Qty (m)</th>
                                      <th className="p-1.5 text-right">DPL Rate (₹)</th>
                                      <th className="p-1.5 text-right">Discount %</th>
                                      <th className="p-1.5 text-right">Net Taxable (₹)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#DACBAA]/40 bg-[#FFFFFF]">
                                    {cur.items.map((it, idx) => (
                                      <tr key={idx}>
                                        <td className="p-1.5 font-medium">
                                          <input
                                            type="text"
                                            value={it.catalogueName}
                                            onChange={e =>
                                              handleUpdateItem(order.id, idx, 'catalogueName', e.target.value)
                                            }
                                            className="w-full px-1.5 py-0.5 border border-[#DACBAA]/60 rounded text-[11px]"
                                          />
                                        </td>
                                        <td className="p-1.5">
                                          <input
                                            type="text"
                                            value={it.hsnCode || '5407'}
                                            onChange={e =>
                                              handleUpdateItem(order.id, idx, 'hsnCode', e.target.value)
                                            }
                                            className="w-16 px-1.5 py-0.5 border border-[#DACBAA]/60 rounded font-mono text-[11px]"
                                          />
                                        </td>
                                        <td className="p-1.5 text-right">
                                          <input
                                            type="number"
                                            step="0.5"
                                            value={it.quantityMeters}
                                            onChange={e =>
                                              handleUpdateItem(order.id, idx, 'quantityMeters', e.target.value)
                                            }
                                            className="w-16 px-1.5 py-0.5 border border-[#DACBAA]/60 rounded text-right font-mono text-[11px]"
                                          />
                                        </td>
                                        <td className="p-1.5 text-right">
                                          <input
                                            type="number"
                                            value={it.ratePerMeter}
                                            onChange={e =>
                                              handleUpdateItem(order.id, idx, 'ratePerMeter', e.target.value)
                                            }
                                            className="w-16 px-1.5 py-0.5 border border-[#DACBAA]/60 rounded text-right font-mono text-[11px]"
                                          />
                                        </td>
                                        <td className="p-1.5 text-right">
                                          <input
                                            type="number"
                                            value={it.discountPercentage}
                                            onChange={e =>
                                              handleUpdateItem(order.id, idx, 'discountPercentage', e.target.value)
                                            }
                                            className="w-14 px-1.5 py-0.5 border border-[#DACBAA]/60 rounded text-right font-mono text-[11px]"
                                          />
                                        </td>
                                        <td className="p-1.5 text-right font-mono font-bold">
                                          ₹{it.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SINGLE MULTI-PAGE PDF PREVIEW (Also shown during window.print()) */}
          <div
            className={`${
              activeTab === 'preview' ? 'block' : 'hidden print:block'
            } space-y-8`}
          >
            {/* Action Bar inside Preview Tab (hidden in print) */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#DACBAA] flex flex-wrap items-center justify-between gap-2 no-print">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#5F6B4A]" />
                <span className="text-xs text-[#2C2417] font-bold">
                  Consolidated Bulk Tax Invoice Document — {exportOrders.length} Invoices Compiled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('configure')}
                  className="px-3 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] text-[#2C2417] text-xs font-semibold hover:bg-[#E7DAC0]"
                >
                  Back to Filters & Editing
                </button>
                <button
                  onClick={handlePrintAll}
                  className="px-4 py-1.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print All as Single PDF</span>
                </button>
              </div>
            </div>

            {/* Invoices rendered one by one with clean print page-breaks */}
            {exportOrders.map((order, index) => {
              const invoiceNumber =
                order.invoiceNumber || `TFH/26-27/0${order.id.split('-').pop()}`;
              const invoiceDate =
                order.invoiceDate || order.orderDate.split('T')[0];

              return (
                <div
                  key={order.id}
                  className="bg-white p-6 sm:p-8 rounded-xl border border-[#DACBAA] text-[#1E1E1E] shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:break-after-page print:page-break-after-always"
                >
                  {/* Single Invoice Page Header */}
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h1 className="font-display font-bold text-2xl tracking-tight text-[#8B5A3C]">
                        {FAB_HOUSE_CONTACT.businessName}
                      </h1>
                      <p className="text-xs text-gray-600 font-medium">
                        {FAB_HOUSE_CONTACT.tagline}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 max-w-sm">
                        {FAB_HOUSE_CONTACT.centralDepot}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        <strong>GSTIN:</strong> {FAB_HOUSE_CONTACT.gstin} |{' '}
                        <strong>State:</strong> 27 - Maharashtra
                      </p>
                      <p className="text-xs text-gray-700">
                        <strong>Contact:</strong> {FAB_HOUSE_CONTACT.ownerName} (
                        {FAB_HOUSE_CONTACT.whatsappDisplay}) | <strong>Email:</strong> {FAB_HOUSE_CONTACT.email}
                      </p>
                    </div>

                    <div className="text-right space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                        Tax Invoice ({index + 1} of {exportOrders.length})
                      </span>
                      <p className="text-xs font-semibold text-gray-800">
                        Invoice No: <span className="font-mono">{invoiceNumber}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Invoice Date: <strong>{invoiceDate}</strong>
                      </p>
                      <p className="text-xs text-gray-600">
                        Order Ref: <span className="font-mono">{order.id}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Transporter:{' '}
                        <strong>
                          {order.transporterName || 'VRL Logistics Ltd'}
                        </strong>
                      </p>
                      {order.docketNumber && (
                        <p className="text-xs text-gray-600">
                          Docket No:{' '}
                          <span className="font-mono font-semibold">
                            {order.docketNumber}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Billed To & Shipped To */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                      <p className="font-bold text-gray-700 uppercase tracking-wide text-[10px]">
                        Billed To (Buyer):
                      </p>
                      <p className="font-bold text-sm text-gray-900">
                        {businessProfile.companyName}
                      </p>
                      <p className="text-gray-700">
                        Dealer Code: <strong>{businessProfile.dealerCode}</strong>
                      </p>
                      <p className="text-gray-700">
                        {order.shippingAddress.addressLine1},{' '}
                        {order.shippingAddress.addressLine2}
                      </p>
                      <p className="text-gray-700">
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} -{' '}
                        {order.shippingAddress.pincode}
                      </p>
                      <p className="text-gray-800 pt-1">
                        <strong>GSTIN / UIN:</strong>{' '}
                        {order.shippingAddress.gstin || businessProfile.gstin}
                      </p>
                      <p className="text-gray-700">
                        Contact: {order.shippingAddress.contactPerson} (
                        {order.shippingAddress.phone})
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                      <p className="font-bold text-gray-700 uppercase tracking-wide text-[10px]">
                        Ship To (Delivery Site):
                      </p>
                      <p className="font-bold text-sm text-gray-900">
                        {order.shippingAddress.title}
                      </p>
                      <p className="text-gray-700">
                        {order.shippingAddress.addressLine1}
                      </p>
                      <p className="text-gray-700">
                        {order.shippingAddress.addressLine2}
                      </p>
                      <p className="text-gray-700">
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} -{' '}
                        {order.shippingAddress.pincode}
                      </p>
                      <p className="text-gray-700 pt-1">
                        Shipping Mode: <strong>{order.shippingMode} Logistics</strong>
                      </p>
                      <p className="text-gray-700">
                        Depot Hub: {businessProfile.depotCode}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#2C2417] text-[#FBF7EE]">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">SKU / Item Description</th>
                          <th className="py-2.5 px-2">HSN</th>
                          <th className="py-2.5 px-2 text-right">Qty (m)</th>
                          <th className="py-2.5 px-2 text-right">DPL Rate</th>
                          <th className="py-2.5 px-2 text-right">Discount</th>
                          <th className="py-2.5 px-3 text-right">Taxable Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-800">
                        {order.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-gray-900">
                                {item.catalogueName} (Shade {item.shadeNo})
                              </p>
                              <span className="text-[11px] text-gray-500 font-mono">
                                SKU: {item.sku} · Category: {item.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 font-mono text-gray-600">
                              {item.hsnCode || '5407'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-semibold">
                              {Number(item.quantityMeters || 0).toFixed(1)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono">
                              ₹{item.ratePerMeter}
                            </td>
                            <td className="py-2.5 px-2 text-right text-[#5F6B4A] font-semibold">
                              {item.discountPercentage > 0
                                ? `${item.discountPercentage}% Disc`
                                : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold">
                              ₹
                              {item.totalAmount.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tax Breakdown & Totals */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                    <div className="text-xs text-gray-600 space-y-1.5 max-w-sm">
                      <p className="font-bold text-gray-800">GST Tax Rates Note:</p>
                      <p>
                        CGST: 2.5% on Taxable Value (₹
                        {(order.taxableAmount * 0.025).toFixed(2)})
                      </p>
                      <p>
                        SGST: 2.5% on Taxable Value (₹
                        {(order.taxableAmount * 0.025).toFixed(2)})
                      </p>
                      <p className="text-[11px] text-gray-500 pt-1">
                        HSN Code 5407: Woven fabrics of synthetic filament yarn.
                        Consolidated under Rule 48(4) of CGST Rules.
                      </p>
                    </div>

                    <div className="w-full sm:w-72 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal (DPL):</span>
                        <span className="font-mono">
                          ₹
                          {order.subtotalDpl.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {order.totalRollDiscount > 0 && (
                        <div className="flex justify-between text-[#5F6B4A] font-medium">
                          <span>Total Discount:</span>
                          <span className="font-mono">
                            -₹
                            {order.totalRollDiscount.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-800 font-semibold pt-1 border-t">
                        <span>Taxable Amount:</span>
                        <span className="font-mono">
                          ₹
                          {order.taxableAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>GST (5% Total):</span>
                        <span className="font-mono">
                          ₹
                          {order.gstAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Freight & Handling:</span>
                        <span className="font-mono">
                          ₹{order.shippingCharge.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-300 font-display">
                        <span>Total Invoice Value:</span>
                        <span className="font-mono text-[#8B5A3C]">
                          ₹
                          {order.grandTotal.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="pt-1 text-[11px] text-gray-500 text-right">
                        Payment:{' '}
                        <strong className="text-gray-800">
                          {order.paymentMethod}
                        </strong>{' '}
                        ({order.paymentStatus})
                      </div>
                    </div>
                  </div>

                  {/* Declaration & Signature */}
                  <div className="border-t pt-4 text-[10px] text-gray-500 flex justify-between items-end">
                    <div>
                      <p className="font-semibold text-gray-700">Declaration:</p>
                      <p>
                        We declare that this invoice shows the actual price of the
                        goods described and that all particulars are true and correct.
                      </p>
                      <p className="mt-1">
                        Subject to Pune Jurisdiction. Dispatched rolls must be
                        inspected within 48 hours of receipt.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">For THE FAB HOUSE</p>
                      <div className="h-10 flex items-center justify-end font-serif italic text-gray-400">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER (hidden in print) */}
        <div className="px-5 py-3 bg-[#E7DAC0] border-t border-[#DACBAA] flex items-center justify-between no-print">
          <div className="text-xs text-[#766A57]">
            Showing <strong>{exportOrders.length}</strong> invoices selected for export. Total Taxable Value: ₹{exportOrders.reduce((acc, o) => acc + o.taxableAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] text-[#2C2417] text-xs font-semibold hover:bg-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrintAll}
              disabled={exportOrders.length === 0}
              className="px-4 py-1.5 rounded-lg bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Single PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
