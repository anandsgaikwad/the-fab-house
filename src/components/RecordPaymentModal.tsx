import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  CheckCircle,
  FileText,
  Printer,
  Download,
  DollarSign,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DealerAccount, DealerInvoice, DealerPayment } from '../types';
import { downloadPaymentReceiptPDF } from '../utils/pdfAndExportService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDealerId?: string;
  preselectedInvoiceId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedDealerId,
  preselectedInvoiceId,
}) => {
  const {
    dealers,
    dealerInvoices,
    recordDealerPayment,
    showToast,
    getDealerFinancials,
  } = useApp();

  const [selectedDealerId, setSelectedDealerId] = useState<string>(
    preselectedDealerId || dealers[0]?.id || ''
  );
  const [targetInvoiceId, setTargetInvoiceId] = useState<string>(
    preselectedInvoiceId || 'fifo'
  );
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMode, setPaymentMode] = useState<DealerPayment['paymentMode']>('NEFT');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [particulars, setParticulars] = useState<string>('');
  const [recordedReceipt, setRecordedReceipt] = useState<{
    payment: DealerPayment;
    dealer: DealerAccount;
    settledInvoices: DealerInvoice[];
  } | null>(null);

  useEffect(() => {
    if (preselectedDealerId) {
      setSelectedDealerId(preselectedDealerId);
    }
  }, [preselectedDealerId]);

  useEffect(() => {
    if (preselectedInvoiceId) {
      setTargetInvoiceId(preselectedInvoiceId);
      const inv = dealerInvoices.find(i => i.id === preselectedInvoiceId);
      if (inv) {
        setAmount(String(inv.balanceAmount || inv.totalAmount));
      }
    }
  }, [preselectedInvoiceId, dealerInvoices]);

  if (!isOpen) return null;

  const currentDealer = dealers.find(d => d.id === selectedDealerId) || dealers[0];
  const dealerInvs = dealerInvoices.filter(
    inv =>
      (inv.dealerId === currentDealer?.id || inv.dealerCode === currentDealer?.dealerCode) &&
      inv.balanceAmount > 0
  );
  const financials = currentDealer ? getDealerFinancials(currentDealer.id) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDealer) return;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please specify a valid payment amount');
      return;
    }

    const ref =
      referenceNo.trim() ||
      `${paymentMode}-PUN-${Date.now().toString().slice(-6)}`;
    const part =
      particulars.trim() ||
      `Settlement received via ${paymentMode} for account of ${currentDealer.companyName}`;

    // Record payment
    recordDealerPayment(
      currentDealer.id,
      numAmount,
      paymentMode,
      ref,
      part,
      targetInvoiceId !== 'fifo' ? targetInvoiceId : undefined
    );

    const createdPayment: DealerPayment = {
      id: `pay-${Date.now()}`,
      dealerId: currentDealer.id,
      dealerCode: currentDealer.dealerCode,
      paymentDate,
      amount: numAmount,
      paymentMode,
      referenceNo: ref,
      particulars: part,
    };

    const settled = dealerInvs.filter(inv =>
      targetInvoiceId === 'fifo' ? true : inv.id === targetInvoiceId
    );

    setRecordedReceipt({
      payment: createdPayment,
      dealer: currentDealer,
      settledInvoices: settled,
    });

    showToast(`Payment of ₹${numAmount.toLocaleString('en-IN')} recorded successfully!`);
  };

  const handleDownloadPDF = () => {
    if (!recordedReceipt) return;
    downloadPaymentReceiptPDF(
      recordedReceipt.payment,
      recordedReceipt.dealer,
      recordedReceipt.settledInvoices
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#2C2417]/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white text-[#2C2417] rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#DACBAA]/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E3E7D8] text-[#5F6B4A]">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-[#2C2417]">
                Record Dealer Payment
              </h3>
              <p className="text-xs text-[#766A57]">
                Settle outstanding balance, update ledger, and issue official receipt
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

        {recordedReceipt ? (
          <div className="space-y-5 text-center py-3">
            <div className="w-14 h-14 bg-[#E3E7D8] text-[#5F6B4A] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-bold text-xl text-[#2C2417]">
                Payment Recorded &amp; Cleared
              </h4>
              <p className="text-xs text-[#766A57]">
                ₹{recordedReceipt.payment.amount.toLocaleString('en-IN')} received from{' '}
                <strong>{recordedReceipt.dealer.companyName}</strong>
              </p>
              <p className="text-xs font-mono text-[#8B5A3C]">
                Ref No: {recordedReceipt.payment.referenceNo} · {recordedReceipt.payment.paymentMode}
              </p>
            </div>

            <div className="bg-[#FAF5EC] p-4 rounded-xl border border-[#DACBAA] text-left text-xs space-y-2">
              <div className="flex justify-between text-[#766A57]">
                <span>Dealer Code:</span>
                <span className="font-bold text-[#2C2417]">{recordedReceipt.dealer.dealerCode}</span>
              </div>
              <div className="flex justify-between text-[#766A57]">
                <span>Ledger Update:</span>
                <span className="font-bold text-[#5F6B4A]">Credit (Cr) Posted</span>
              </div>
              <div className="flex justify-between text-[#766A57]">
                <span>New Outstanding:</span>
                <span className="font-bold text-[#2C2417]">
                  ₹{(financials?.netOutstanding ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#F3EBDA] hover:bg-[#E7DAC0] border border-[#DACBAA] text-[#2C2417] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>

            <button
              onClick={() => {
                setRecordedReceipt(null);
                setAmount('');
                setReferenceNo('');
                setParticulars('');
              }}
              className="text-xs text-[#8B5A3C] font-semibold hover:underline block mx-auto"
            >
              Record Another Payment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Dealer Selector */}
            <div className="space-y-1">
              <label className="block font-bold text-[#2C2417]">
                Select Dealer Account <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDealerId}
                onChange={e => setSelectedDealerId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-[#FAF5EC] text-xs focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
                required
              >
                {dealers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.companyName} ({d.dealerCode}) — {d.city}, {d.state}
                  </option>
                ))}
              </select>
            </div>

            {/* Financial Overview Callout */}
            {financials && (
              <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#766A57] block">Current Net Outstanding:</span>
                  <span className="font-display font-bold text-sm text-[#8B5A3C]">
                    ₹{(financials.netOutstanding || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#766A57] block">Overdue Amount:</span>
                  <span className={`font-display font-bold text-sm ${financials.overdueAmount > 0 ? 'text-[#9C4630]' : 'text-[#5F6B4A]'}`}>
                    ₹{(financials.overdueAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {/* Target Invoice Selector */}
            <div className="space-y-1">
              <label className="block font-bold text-[#2C2417]">
                Target Invoice Allocation
              </label>
              <select
                value={targetInvoiceId}
                onChange={e => {
                  setTargetInvoiceId(e.target.value);
                  if (e.target.value !== 'fifo') {
                    const inv = dealerInvs.find(i => i.id === e.target.value);
                    if (inv) setAmount(String(inv.balanceAmount));
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-[#FAF5EC] text-xs focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
              >
                <option value="fifo">Automatic FIFO (Oldest unpaid invoices first)</option>
                {dealerInvs.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} (Due: {inv.dueDate}) — Bal: ₹{inv.balanceAmount.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs font-mono font-bold focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Mode & Reference */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
                >
                  <option value="NEFT">NEFT Bank Transfer</option>
                  <option value="RTGS">RTGS High-Value Transfer</option>
                  <option value="UPI">UPI / Instant QR</option>
                  <option value="Net Banking">Net Banking (IMPS)</option>
                  <option value="Cheque">Bank Cheque / DD</option>
                  <option value="Adjustment">Ledger Adjustment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C2417]">
                  Bank Reference / UTR No.
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  placeholder="e.g. CMS982104921"
                  className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs font-mono focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
                />
              </div>
            </div>

            {/* Particulars */}
            <div className="space-y-1">
              <label className="block font-bold text-[#2C2417]">
                Narration / Ledger Description
              </label>
              <input
                type="text"
                value={particulars}
                onChange={e => setParticulars(e.target.value)}
                placeholder="e.g. Account settlement for August-September billing"
                className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
              />
            </div>

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
                <span>Confirm &amp; Post Payment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
