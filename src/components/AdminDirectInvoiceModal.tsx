import React, { useState } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Printer,
  Download,
  Calendar,
  Building,
  Truck,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, OrderItem, BusinessAddress } from '../types';
import { FAB_HOUSE_CONTACT } from '../data/mockBusiness';
import { determineGstSplit, downloadGSTInvoicePDF } from '../utils/pdfAndExportService';
import { amountToIndianWords } from '../utils/indianCurrencyWords';

interface AdminDirectInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDealerId?: string;
}

interface InvoiceFormItem {
  productId?: string;
  sku: string;
  catalogueName: string;
  shadeNo: string;
  category: string;
  quantityMeters: number;
  ratePerMeter: number;
  discountPercentage: number;
  hsnCode: string;
}

export const AdminDirectInvoiceModal: React.FC<AdminDirectInvoiceModalProps> = ({
  isOpen,
  onClose,
  preselectedDealerId,
}) => {
  const {
    dealers,
    products,
    createDirectGSTInvoice,
    showToast,
    setInvoiceToView,
  } = useApp();

  const [selectedDealerId, setSelectedDealerId] = useState<string>(
    preselectedDealerId || dealers[0]?.id || ''
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `TFH/26-27/0${Math.floor(500 + Math.random() * 450)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transporterName, setTransporterName] = useState('VRL Logistics Ltd');
  const [docketNumber, setDocketNumber] = useState(
    `VRL-PUN-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [shippingMode, setShippingMode] = useState<'Surface' | 'Express'>('Surface');
  const [shippingCharge, setShippingCharge] = useState<number>(650);
  const [paymentMethod, setPaymentMethod] = useState<
    'Credit Limit' | 'NEFT' | 'RTGS' | 'UPI' | 'Net Banking'
  >('Credit Limit');

  const selectedDealer = dealers.find(d => d.id === selectedDealerId) || dealers[0];
  const creditDays = selectedDealer?.creditPeriodDays || 45;
  const dueDate = new Date(
    new Date(invoiceDate).getTime() + creditDays * 86400000
  )
    .toISOString()
    .split('T')[0];

  // Items in invoice
  const [items, setItems] = useState<InvoiceFormItem[]>([
    {
      productId: products[0]?.id,
      sku: products[0]?.sku || 'AMH0011',
      catalogueName: products[0]?.catalogueName || 'Onyx Dimout 801',
      shadeNo: products[0]?.shadeNo || '801',
      category: products[0]?.category || 'Dimout',
      quantityMeters: 60,
      ratePerMeter: products[0]?.dpl || 704,
      discountPercentage: 10,
      hsnCode: products[0]?.hsnCode || '5407',
    },
  ]);

  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleProductSelect = (idx: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const newItems = [...items];
    newItems[idx] = {
      ...newItems[idx],
      productId: prod.id,
      sku: prod.sku,
      catalogueName: prod.catalogueName,
      shadeNo: prod.shadeNo,
      category: prod.category,
      ratePerMeter: prod.dpl,
      hsnCode: prod.hsnCode || '5407',
      discountPercentage: newItems[idx].quantityMeters >= prod.rollDiscountThreshold ? prod.rollDiscountPercentage : 0,
    };
    setItems(newItems);
  };

  const handleItemChange = (idx: number, field: keyof InvoiceFormItem, val: any) => {
    const newItems = [...items];
    const target = { ...newItems[idx], [field]: val };
    if (field === 'quantityMeters') {
      const prod = products.find(p => p.id === target.productId);
      if (prod && Number(val) >= prod.rollDiscountThreshold) {
        target.discountPercentage = prod.rollDiscountPercentage;
      }
    }
    newItems[idx] = target;
    setItems(newItems);
  };

  const addItemRow = () => {
    const nextProd = products[items.length % products.length] || products[0];
    setItems(prev => [
      ...prev,
      {
        productId: nextProd?.id,
        sku: nextProd?.sku || `FAB-${Date.now().toString().slice(-4)}`,
        catalogueName: nextProd?.catalogueName || 'Select Fabric',
        shadeNo: nextProd?.shadeNo || '01',
        category: nextProd?.category || 'Dimout',
        quantityMeters: 50,
        ratePerMeter: nextProd?.dpl || 750,
        discountPercentage: 10,
        hsnCode: '5407',
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) {
      showToast('Invoice must contain at least one fabric item');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const grossSubtotal = items.reduce(
    (acc, it) => acc + (Number(it.ratePerMeter) || 0) * (Number(it.quantityMeters) || 0),
    0
  );
  const totalDiscount = items.reduce((acc, it) => {
    const gross = (Number(it.ratePerMeter) || 0) * (Number(it.quantityMeters) || 0);
    return acc + (gross * (Number(it.discountPercentage) || 0)) / 100;
  }, 0);
  const taxableAmount = grossSubtotal - totalDiscount;

  const buyerState = selectedDealer?.state || 'Maharashtra';
  const buyerGstin = selectedDealer?.gstin || '27';
  const gstSplit = determineGstSplit(buyerState, buyerGstin, 5);
  const gstAmount = Number((taxableAmount * 0.05).toFixed(2));
  const grandTotal = Number((taxableAmount + gstAmount + (Number(shippingCharge) || 0)).toFixed(2));
  const words = amountToIndianWords(grandTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer) return;

    if (items.length === 0) {
      showToast('Please add at least one line item');
      return;
    }

    const orderItems: OrderItem[] = items.map(it => {
      const net = Number((it.ratePerMeter * (1 - it.discountPercentage / 100)).toFixed(2));
      return {
        sku: it.sku,
        catalogueName: it.catalogueName,
        shadeNo: it.shadeNo,
        category: it.category as any,
        quantityMeters: Number(it.quantityMeters),
        ratePerMeter: Number(it.ratePerMeter),
        mrpPerMeter: Math.round(Number(it.ratePerMeter) * 1.7),
        discountPercentage: Number(it.discountPercentage),
        netRatePerMeter: net,
        totalAmount: Number((net * Number(it.quantityMeters)).toFixed(2)),
        hsnCode: it.hsnCode || '5407',
      };
    });

    const shippingAddress: BusinessAddress = selectedDealer.addresses?.[0] || {
      id: `addr-${selectedDealer.id}-1`,
      title: selectedDealer.companyName,
      contactPerson: selectedDealer.contactPerson,
      phone: selectedDealer.contactPhone,
      addressLine1: selectedDealer.addressLine1,
      addressLine2: selectedDealer.addressLine2 || '',
      city: selectedDealer.city,
      state: selectedDealer.state,
      pincode: selectedDealer.pincode,
      gstin: selectedDealer.gstin,
      isDefault: true,
    };

    const newOrder = createDirectGSTInvoice({
      dealerId: selectedDealer.id,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      dueDate,
      items: orderItems,
      shippingAddress,
      shippingMode,
      shippingCharge: Number(shippingCharge) || 0,
      paymentMethod,
      transporterName,
      docketNumber,
    });

    setCreatedOrder(newOrder);
    showToast(`GST Tax Invoice ${newOrder.invoiceNumber} created and posted to Ledger!`);
  };

  const handleDownloadPDF = () => {
    if (!createdOrder || !selectedDealer) return;
    downloadGSTInvoicePDF(createdOrder, selectedDealer);
  };

  const handlePrint = () => {
    if (createdOrder) {
      setInvoiceToView(createdOrder);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="fixed inset-0 bg-[#2C2417]/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white text-[#2C2417] rounded-2xl max-w-4xl w-full p-6 shadow-2xl z-10 space-y-5 max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DACBAA]/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8B5A3C] text-white">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-[#2C2417]">
                Create GST Commercial Tax Invoice
              </h3>
              <p className="text-xs text-[#766A57]">
                Official GST Rule 48(4) commercial invoice generation connected directly to ledger &amp; dealer account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdOrder ? (
          <div className="space-y-5 py-4 text-center">
            <div className="w-16 h-16 bg-[#E3E7D8] text-[#5F6B4A] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-bold text-2xl text-[#2C2417]">
                Invoice {createdOrder.invoiceNumber} Generated!
              </h4>
              <p className="text-xs text-[#766A57]">
                Tax Invoice successfully posted to Database, Dealer Ledger, Outstanding, and Reports.
              </p>
              <p className="text-sm font-bold text-[#8B5A3C] pt-1">
                Grand Total: ₹{createdOrder.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs italic text-gray-500 max-w-md mx-auto">
                {words}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Official GST Invoice PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F3EBDA] hover:bg-[#E7DAC0] border border-[#DACBAA] text-[#2C2417] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>View &amp; Print</span>
              </button>
            </div>

            <button
              onClick={() => {
                setCreatedOrder(null);
                setInvoiceNumber(`TFH/26-27/0${Math.floor(500 + Math.random() * 450)}`);
              }}
              className="text-xs text-[#8B5A3C] font-semibold hover:underline block mx-auto pt-2"
            >
              Create Another Invoice
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Seller & Buyer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seller */}
              <div className="p-3.5 bg-[#FAF5EC] rounded-xl border border-[#DACBAA] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A3C] block">
                  Supplier / Seller:
                </span>
                <p className="font-bold text-sm text-[#2C2417]">{FAB_HOUSE_CONTACT.businessName}</p>
                <p className="text-gray-600">GSTIN: <strong className="font-mono text-[#2C2417]">{FAB_HOUSE_CONTACT.gstin}</strong> (State: 27 - MH)</p>
                <p className="text-gray-600">{FAB_HOUSE_CONTACT.centralDepot}</p>
                <p className="text-gray-600">Proprietor: {FAB_HOUSE_CONTACT.ownerName} ({FAB_HOUSE_CONTACT.whatsappDisplay}) | Email: {FAB_HOUSE_CONTACT.email}</p>
              </div>

              {/* Buyer Selector */}
              <div className="p-3.5 bg-[#FAF5EC] rounded-xl border border-[#DACBAA] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A3C] block">
                  Billed To / Buyer:
                </span>
                <select
                  value={selectedDealerId}
                  onChange={e => setSelectedDealerId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-white text-xs font-bold focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
                  required
                >
                  {dealers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} ({d.dealerCode}) — {d.city}, {d.state}
                    </option>
                  ))}
                </select>

                {selectedDealer && (
                  <div className="text-[11px] text-gray-600 space-y-0.5 pt-1">
                    <p>Dealer Code: <strong className="font-mono text-[#2C2417]">{selectedDealer.dealerCode}</strong> · Depot: <strong>{selectedDealer.depotCode}</strong></p>
                    <p>GSTIN: <strong className="font-mono text-[#2C2417]">{selectedDealer.gstin || 'Unregistered'}</strong> · State: <strong>{selectedDealer.state}</strong></p>
                    <p>Credit Facility: <strong>{selectedDealer.creditTermsLabel}</strong> (Approved Limit: ₹{selectedDealer.creditLimit.toLocaleString('en-IN')})</p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F3EBDA]/50 p-3 rounded-xl border border-[#DACBAA]/60">
              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-white font-mono font-bold text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">Due Date (Credit Terms)</label>
                <input
                  type="text"
                  value={`${dueDate} (${creditDays}d)`}
                  readOnly
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-gray-50 text-xs font-semibold text-[#8B5A3C]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-white text-xs"
                >
                  <option value="Credit Limit">Credit Limit (Ledger)</option>
                  <option value="NEFT">NEFT / Direct Bank Transfer</option>
                  <option value="RTGS">RTGS</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </div>

            {/* Transporter & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">Transporter Name</label>
                <input
                  type="text"
                  value={transporterName}
                  onChange={e => setTransporterName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">Docket / LR Number</label>
                <input
                  type="text"
                  value={docketNumber}
                  onChange={e => setDocketNumber(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">Shipping Charge (₹)</label>
                <input
                  type="number"
                  value={shippingCharge}
                  onChange={e => setShippingCharge(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DACBAA] bg-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#2C2417] text-sm">
                  Invoice Line Items (Fabrics &amp; Materials)
                </h4>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-3 py-1.5 rounded-lg bg-[#5F6B4A] hover:bg-[#4d573c] text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="border border-[#DACBAA] rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#2C2417] text-[#FBF7EE]">
                    <tr>
                      <th className="py-2.5 px-3">Fabric Selection</th>
                      <th className="py-2.5 px-2">HSN</th>
                      <th className="py-2.5 px-2 text-right">Qty (m)</th>
                      <th className="py-2.5 px-2 text-right">DPL Rate (₹)</th>
                      <th className="py-2.5 px-2 text-right">Disc %</th>
                      <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                      <th className="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DACBAA]/40 text-[#2C2417]">
                    {items.map((it, idx) => {
                      const gross = (Number(it.ratePerMeter) || 0) * (Number(it.quantityMeters) || 0);
                      const disc = (gross * (Number(it.discountPercentage) || 0)) / 100;
                      const taxable = gross - disc;

                      return (
                        <tr key={idx} className="hover:bg-[#FAF5EC]">
                          <td className="py-2 px-3 min-w-[200px]">
                            <select
                              value={it.productId || ''}
                              onChange={e => handleProductSelect(idx, e.target.value)}
                              className="w-full p-1.5 border border-[#DACBAA] rounded bg-white text-xs font-semibold mb-1"
                            >
                              <option value="">-- Custom Fabric / SKU --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.catalogueName} ({p.sku}) — ₹{p.dpl}/m
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={it.catalogueName}
                              onChange={e => handleItemChange(idx, 'catalogueName', e.target.value)}
                              placeholder="Catalogue / Name"
                              className="w-full p-1 border border-gray-200 rounded text-[11px]"
                            />
                          </td>
                          <td className="py-2 px-2 w-20">
                            <input
                              type="text"
                              value={it.hsnCode}
                              onChange={e => handleItemChange(idx, 'hsnCode', e.target.value)}
                              className="w-full p-1.5 border border-[#DACBAA] rounded text-xs font-mono text-center"
                            />
                          </td>
                          <td className="py-2 px-2 w-24">
                            <input
                              type="number"
                              step="0.5"
                              value={it.quantityMeters}
                              onChange={e => handleItemChange(idx, 'quantityMeters', Number(e.target.value))}
                              className="w-full p-1.5 border border-[#DACBAA] rounded text-xs font-mono text-right"
                            />
                          </td>
                          <td className="py-2 px-2 w-24">
                            <input
                              type="number"
                              value={it.ratePerMeter}
                              onChange={e => handleItemChange(idx, 'ratePerMeter', Number(e.target.value))}
                              className="w-full p-1.5 border border-[#DACBAA] rounded text-xs font-mono text-right"
                            />
                          </td>
                          <td className="py-2 px-2 w-20">
                            <input
                              type="number"
                              value={it.discountPercentage}
                              onChange={e => handleItemChange(idx, 'discountPercentage', Number(e.target.value))}
                              className="w-full p-1.5 border border-[#DACBAA] rounded text-xs font-mono text-right text-[#5F6B4A] font-bold"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#8B5A3C] whitespace-nowrap">
                            ₹{taxable.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic GST and Totals Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#FAF5EC] rounded-xl border border-[#DACBAA] space-y-2 text-xs">
                <span className="font-bold text-[#2C2417] block">
                  Dynamic GST State Split Verification:
                </span>
                <p className="text-gray-700">
                  Seller State: <strong>27 - Maharashtra</strong>
                </p>
                <p className="text-gray-700">
                  Buyer State: <strong>{buyerState}</strong> ({buyerGstin ? `GSTIN: ${buyerGstin}` : 'Unregistered'})
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-[#DACBAA]/60">
                  <span className="font-bold text-[#5F6B4A] block">
                    {gstSplit.label} Applicable:
                  </span>
                  {gstSplit.isIntrastate ? (
                    <p className="text-[11px] text-gray-600">
                      Intrastate Trade: CGST @ 2.5% (₹{(taxableAmount * 0.025).toFixed(2)}) + SGST @ 2.5% (₹{(taxableAmount * 0.025).toFixed(2)})
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-600">
                      Interstate Trade: IGST @ 5.0% (₹{(taxableAmount * 0.05).toFixed(2)})
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 italic">
                  <strong>In Words:</strong> {words}
                </p>
              </div>

              <div className="p-4 bg-[#FAF5EC] rounded-xl border border-[#DACBAA] space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono">₹{grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-[#5F6B4A] font-semibold">
                    <span>Roll Discount:</span>
                    <span className="font-mono">-₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-800 font-semibold border-t pt-1">
                  <span>Taxable Amount:</span>
                  <span className="font-mono">₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{gstSplit.label}:</span>
                  <span className="font-mono">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Freight &amp; Handling:</span>
                  <span className="font-mono">₹{Number(shippingCharge).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#8B5A3C] border-t border-[#DACBAA] pt-2 font-display">
                  <span>Grand Total (₹):</span>
                  <span className="font-mono">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#DACBAA]/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[#766A57] hover:bg-gray-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Issue &amp; Save GST Invoice</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
