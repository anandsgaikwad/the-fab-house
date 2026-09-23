import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle,
  Building,
  Truck,
  Hash,
  Calendar,
  Download,
} from 'lucide-react';
import { Order, OrderItem } from '../types';
import { FAB_HOUSE_CONTACT } from '../data/mockBusiness';
import { useApp } from '../context/AppContext';
import { downloadGSTInvoicePDF, determineGstSplit } from '../utils/pdfAndExportService';
import { amountToIndianWords } from '../utils/indianCurrencyWords';

interface GSTInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const GSTInvoiceModal: React.FC<GSTInvoiceModalProps> = ({ order, onClose }) => {
  const { dealers, activeDealer, updateOrder, role, isAdminAuthenticated } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(order);

  // Sync state when order prop changes
  React.useEffect(() => {
    if (order) {
      setEditedOrder({
        ...order,
        invoiceNumber: order.invoiceNumber || `TFH/26-27/0${order.id.split('-').pop()}`,
        invoiceDate:
          order.invoiceDate ||
          (order.orderDate
            ? order.orderDate.split('T')[0]
            : new Date().toISOString().split('T')[0]),
      });
      setIsEditing(false);
    }
  }, [order]);

  if (!order || !editedOrder) return null;

  const currentOrder = editedOrder;

  // Resolve buyer details accurately from multi-dealer directory
  const buyer =
    dealers.find(
      d =>
        d.id === currentOrder.dealerId ||
        d.dealerCode === currentOrder.dealerCode ||
        (currentOrder.shippingAddress?.gstin &&
          d.gstin === currentOrder.shippingAddress.gstin)
    ) || activeDealer;

  const invoiceNumber =
    currentOrder.invoiceNumber || `TFH/26-27/0${currentOrder.id.split('-').pop()}`;
  const invoiceDate =
    currentOrder.invoiceDate || currentOrder.orderDate.split('T')[0];

  const creditDays = buyer.creditPeriodDays || 45;
  const dueDate =
    currentOrder.dueDate ||
    new Date(new Date(invoiceDate).getTime() + creditDays * 86400000)
      .toISOString()
      .split('T')[0];

  // Dynamic GST Split based on Buyer State / GSTIN
  const gstSplit = determineGstSplit(
    currentOrder.shippingAddress?.state || buyer.state,
    currentOrder.shippingAddress?.gstin || buyer.gstin,
    5
  );

  const amountInWords = amountToIndianWords(currentOrder.grandTotal);

  const handlePrint = () => {
    if (isEditing) {
      updateOrder(currentOrder);
      setIsEditing(false);
    }
    window.print();
  };

  const handleDownloadPDF = () => {
    if (isEditing) {
      updateOrder(currentOrder);
      setIsEditing(false);
    }
    downloadGSTInvoicePDF(currentOrder, buyer);
  };

  const handleSaveEdits = () => {
    updateOrder(currentOrder);
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof Order, val: any) => {
    setEditedOrder(prev => (prev ? { ...prev, [field]: val } : null));
  };

  const handleItemChange = (idx: number, field: keyof OrderItem, val: any) => {
    setEditedOrder(prev => {
      if (!prev) return null;
      const newItems = [...prev.items];
      const target = { ...newItems[idx], [field]: val };

      if (
        field === 'quantityMeters' ||
        field === 'ratePerMeter' ||
        field === 'discountPercentage'
      ) {
        const qty =
          Number(field === 'quantityMeters' ? val : target.quantityMeters) || 0;
        const rate =
          Number(field === 'ratePerMeter' ? val : target.ratePerMeter) || 0;
        const disc =
          Number(field === 'discountPercentage' ? val : target.discountPercentage) || 0;
        const netRate = Number((rate * (1 - disc / 100)).toFixed(2));
        target.quantityMeters = qty;
        target.ratePerMeter = rate;
        target.discountPercentage = disc;
        target.netRatePerMeter = netRate;
        target.totalAmount = Number((netRate * qty).toFixed(2));
      }

      newItems[idx] = target;

      const subtotal = newItems.reduce(
        (acc, it) => acc + (Number(it.ratePerMeter) || 0) * (Number(it.quantityMeters) || 0),
        0
      );
      const discount = newItems.reduce(
        (acc, it) =>
          acc +
          ((Number(it.ratePerMeter) || 0) *
            ((Number(it.discountPercentage) || 0) / 100)) *
            (Number(it.quantityMeters) || 0),
        0
      );
      const taxable = subtotal - discount;
      const gst = Number((taxable * 0.05).toFixed(2));
      const total = Number((taxable + gst + prev.shippingCharge).toFixed(2));

      return {
        ...prev,
        items: newItems,
        subtotalDpl: subtotal,
        totalRollDiscount: discount,
        taxableAmount: taxable,
        gstAmount: gst,
        grandTotal: total,
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="fixed inset-0 bg-[#2C2417]/70 backdrop-blur-xs no-print" onClick={onClose} />

      <div className="relative bg-[#FFFFFF] text-[#1E1E1E] rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto print:p-0 print:shadow-none print:max-h-full print:rounded-none">
        {/* Action Bar (hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-200 gap-2 no-print">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#E3E7D8] text-[#5F6B4A] rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-[#2C2417]">
                GST Tax Invoice — {invoiceNumber}
              </h3>
              <p className="text-xs text-gray-500">
                Official B2B Commercial Fabric Invoice for Order #{currentOrder.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Editable Mode Button */}
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveEdits();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-[#5F6B4A] text-white hover:bg-[#4d573c]'
                  : 'bg-[#F3EBDA] text-[#2C2417] border border-[#DACBAA] hover:bg-[#E7DAC0]'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Edits</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-[#8B5A3C]" />
                  <span>Edit Invoice Fields</span>
                </>
              )}
            </button>

            {/* REAL PDF DOWNLOAD */}
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-lg bg-[#8B5A3C] text-white text-xs font-bold hover:bg-[#72482E] transition-colors flex items-center gap-1.5 shadow-xs"
              title="Download official PDF copy"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            {/* REAL PRINT */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#F3EBDA] hover:bg-[#E7DAC0] border border-[#DACBAA] text-[#2C2417] text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Print via browser dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editable Banner when edit mode is active */}
        {isEditing && (
          <div className="bg-[#FAF5EC] border border-[#8B5A3C]/40 p-3 rounded-lg flex items-center justify-between text-xs text-[#8B5A3C] no-print">
            <span className="font-medium">
              ✏️ <strong>Admin Edit Mode Active:</strong> You can edit the Invoice Number, Invoice Date, Due Date, Transporter, Docket LR, and Item Quantities/Rates below before saving or printing to PDF.
            </span>
            <button
              onClick={() => {
                setEditedOrder(order);
                setIsEditing(false);
              }}
              className="text-xs text-neutral-600 underline hover:text-neutral-900 ml-2"
            >
              Discard Changes
            </button>
          </div>
        )}

        {/* PRINTABLE GST INVOICE LAYOUT */}
        <div className="space-y-6 text-sm font-sans" id="printable-tax-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tight text-[#8B5A3C]">
                {FAB_HOUSE_CONTACT.businessName}
              </h1>
              <p className="text-xs text-gray-600 font-medium">{FAB_HOUSE_CONTACT.tagline}</p>
              <p className="text-xs text-gray-600 mt-1 max-w-sm">
                {FAB_HOUSE_CONTACT.centralDepot}
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>GSTIN:</strong> {FAB_HOUSE_CONTACT.gstin} | <strong>State:</strong> 27 - Maharashtra
              </p>
              <p className="text-xs text-gray-700">
                <strong>Contact:</strong> {FAB_HOUSE_CONTACT.ownerName} ({FAB_HOUSE_CONTACT.whatsappDisplay}) | <strong>Email:</strong> {FAB_HOUSE_CONTACT.email}
              </p>
            </div>

            <div className="text-right space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Tax Invoice
              </span>

              <div className="text-xs font-semibold text-gray-800 flex items-center justify-end gap-1">
                <span>Invoice No:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => handleFieldChange('invoiceNumber', e.target.value)}
                    className="font-mono text-xs px-1.5 py-0.5 border border-gray-300 rounded bg-white w-32 text-right"
                  />
                ) : (
                  <span className="font-mono">{invoiceNumber}</span>
                )}
              </div>

              <div className="text-xs text-gray-600 flex items-center justify-end gap-1">
                <span>Invoice Date:</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={e => handleFieldChange('invoiceDate', e.target.value)}
                    className="text-xs px-1.5 py-0.5 border border-gray-300 rounded bg-white"
                  />
                ) : (
                  <strong>{invoiceDate}</strong>
                )}
              </div>

              <div className="text-xs text-gray-600 flex items-center justify-end gap-1">
                <span>Due Date:</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => handleFieldChange('dueDate', e.target.value)}
                    className="text-xs px-1.5 py-0.5 border border-gray-300 rounded bg-white"
                  />
                ) : (
                  <strong className="text-[#8B5A3C]">{dueDate} ({buyer.creditTermsLabel})</strong>
                )}
              </div>

              <p className="text-xs text-gray-600">
                Order Ref: <span className="font-mono">{currentOrder.id}</span>
              </p>

              <div className="text-xs text-gray-600 flex items-center justify-end gap-1">
                <span>Transporter:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentOrder.transporterName || ''}
                    placeholder="Transporter Name"
                    onChange={e => handleFieldChange('transporterName', e.target.value)}
                    className="text-xs px-1.5 py-0.5 border border-gray-300 rounded bg-white w-32 text-right"
                  />
                ) : (
                  <strong>{currentOrder.transporterName || 'Surface Logistics (Pending)'}</strong>
                )}
              </div>

              <div className="text-xs text-gray-600 flex items-center justify-end gap-1">
                <span>Docket / LR:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentOrder.docketNumber || ''}
                    placeholder="Docket / LR Number"
                    onChange={e => handleFieldChange('docketNumber', e.target.value)}
                    className="font-mono text-xs px-1.5 py-0.5 border border-gray-300 rounded bg-white w-32 text-right font-semibold"
                  />
                ) : (
                  <span className="font-mono font-semibold">
                    {currentOrder.docketNumber || 'Under Generation'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Billed To & Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
              <p className="font-bold text-gray-700 uppercase tracking-wide text-[10px]">
                Billed To (Buyer):
              </p>
              <p className="font-bold text-sm text-gray-900">{buyer.companyName}</p>
              <p className="text-gray-700">Dealer Code: <strong>{buyer.dealerCode}</strong> · Depot: <strong>{buyer.depotCode}</strong></p>
              <p className="text-gray-700">
                {currentOrder.shippingAddress?.addressLine1 || buyer.addressLine1}
                {currentOrder.shippingAddress?.addressLine2 ? `, ${currentOrder.shippingAddress.addressLine2}` : ''}
              </p>
              <p className="text-gray-700">
                {currentOrder.shippingAddress?.city || buyer.city}, {currentOrder.shippingAddress?.state || buyer.state} - {currentOrder.shippingAddress?.pincode || buyer.pincode}
              </p>
              <p className="text-gray-800 pt-1">
                <strong>GSTIN / UIN:</strong> {currentOrder.shippingAddress?.gstin || buyer.gstin || 'Unregistered'}
              </p>
              <p className="text-gray-700">Contact: {buyer.contactPerson} ({buyer.contactPhone})</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
              <p className="font-bold text-gray-700 uppercase tracking-wide text-[10px]">
                Ship To (Delivery Site):
              </p>
              <p className="font-bold text-sm text-gray-900">
                {currentOrder.shippingAddress?.title || buyer.companyName}
              </p>
              <p className="text-gray-700">{currentOrder.shippingAddress?.addressLine1 || buyer.addressLine1}</p>
              {currentOrder.shippingAddress?.addressLine2 && (
                <p className="text-gray-700">{currentOrder.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-700">
                {currentOrder.shippingAddress?.city || buyer.city}, {currentOrder.shippingAddress?.state || buyer.state} - {currentOrder.shippingAddress?.pincode || buyer.pincode}
              </p>
              <p className="text-gray-700 pt-1">
                Shipping Mode: <strong>{currentOrder.shippingMode} Logistics</strong>
              </p>
              <p className="text-gray-700">Central Depot: <strong>{buyer.depotCode}</strong></p>
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
                {currentOrder.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.catalogueName}
                          onChange={e => handleItemChange(idx, 'catalogueName', e.target.value)}
                          className="font-semibold text-gray-900 px-1 py-0.5 border border-gray-300 rounded text-xs w-full mb-1"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">{item.catalogueName} (Shade {item.shadeNo})</p>
                      )}
                      <span className="text-[11px] text-gray-500 font-mono">SKU: {item.sku} · Category: {item.category}</span>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-gray-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.hsnCode || '5407'}
                          onChange={e => handleItemChange(idx, 'hsnCode', e.target.value)}
                          className="font-mono text-xs px-1 py-0.5 border border-gray-300 rounded w-14"
                        />
                      ) : (
                        item.hsnCode || '5407'
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={item.quantityMeters}
                          onChange={e => handleItemChange(idx, 'quantityMeters', e.target.value)}
                          className="text-right font-mono text-xs px-1 py-0.5 border border-gray-300 rounded w-16"
                        />
                      ) : (
                        Number(item.quantityMeters || 0).toFixed(1)
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.ratePerMeter}
                          onChange={e => handleItemChange(idx, 'ratePerMeter', e.target.value)}
                          className="text-right font-mono text-xs px-1 py-0.5 border border-gray-300 rounded w-16"
                        />
                      ) : (
                        `₹${item.ratePerMeter}`
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#5F6B4A] font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.discountPercentage}
                          onChange={e => handleItemChange(idx, 'discountPercentage', e.target.value)}
                          className="text-right font-mono text-xs px-1 py-0.5 border border-gray-300 rounded w-12"
                        />
                      ) : (
                        item.discountPercentage > 0 ? `${item.discountPercentage}% Disc` : '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      ₹{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-gray-600 space-y-2 max-w-sm">
              <p className="font-bold text-gray-800">Dynamic GST Tax Verification:</p>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-bold text-[#5F6B4A] block">{gstSplit.label} Applicable:</span>
                {gstSplit.isIntrastate ? (
                  <div className="space-y-0.5 pt-1 text-[11px]">
                    <p>CGST @ 2.5%: ₹{(currentOrder.taxableAmount * 0.025).toFixed(2)}</p>
                    <p>SGST @ 2.5%: ₹{(currentOrder.taxableAmount * 0.025).toFixed(2)}</p>
                    <p className="text-gray-500">Supplier: Maharashtra (27) · Buyer: Maharashtra (27)</p>
                  </div>
                ) : (
                  <div className="space-y-0.5 pt-1 text-[11px]">
                    <p>IGST @ 5.0%: ₹{(currentOrder.taxableAmount * 0.05).toFixed(2)}</p>
                    <p className="text-gray-500">Interstate Supply to {buyer.state}</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                HSN Code 5407: Woven fabrics of synthetic filament yarn. Generated under Rule 48(4) of CGST Rules.
              </p>
            </div>

            <div className="w-full sm:w-80 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (DPL):</span>
                <span className="font-mono">₹{currentOrder.subtotalDpl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {currentOrder.totalRollDiscount > 0 && (
                <div className="flex justify-between text-[#5F6B4A] font-medium">
                  <span>Total Roll Discount:</span>
                  <span className="font-mono">-₹{currentOrder.totalRollDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-800 font-semibold pt-1 border-t">
                <span>Taxable Amount:</span>
                <span className="font-mono">₹{currentOrder.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{gstSplit.label}:</span>
                <span className="font-mono">₹{currentOrder.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Freight & Handling:</span>
                <span className="font-mono">₹{currentOrder.shippingCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-300 font-display">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-[#8B5A3C]">₹{currentOrder.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Amount in Words */}
              <div className="p-2 bg-white rounded border border-gray-200 text-[11px] text-gray-700 italic">
                <strong>Amount in Words:</strong> {amountInWords}
              </div>

              <div className="pt-1 text-[11px] text-gray-500 text-right">
                Payment: <strong className="text-gray-800">{currentOrder.paymentMethod}</strong> ({currentOrder.paymentStatus})
              </div>
            </div>
          </div>

          {/* Footer terms */}
          <div className="border-t pt-4 text-[10px] text-gray-500 flex justify-between items-end">
            <div>
              <p className="font-semibold text-gray-700">Declaration:</p>
              <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
              <p className="mt-1">Subject to Pune Jurisdiction. Dispatched rolls must be inspected within 48 hours of receipt.</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">For THE FAB HOUSE</p>
              <div className="h-10 flex items-center justify-end font-serif italic text-gray-400">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
