import React, { useState } from 'react';
import {
  X,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LedgerTransactionType } from '../types';

interface RecordLedgerAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDealerId?: string;
}

export const RecordLedgerAdjustmentModal: React.FC<RecordLedgerAdjustmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDealerId,
}) => {
  const { dealers, recordLedgerAdjustment, showToast } = useApp();

  const [dealerId, setDealerId] = useState(preselectedDealerId || dealers[0]?.id || '');
  const [type, setType] = useState<LedgerTransactionType>('Credit Note');
  const [referenceNo, setReferenceNo] = useState(
    `CN-26-27-0${Math.floor(100 + Math.random() * 900)}`
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [particulars, setParticulars] = useState('');

  if (!isOpen) return null;

  const targetDealer = dealers.find(d => d.id === dealerId) || dealers[0];

  const handleTypeChange = (newType: LedgerTransactionType) => {
    setType(newType);
    const rnd = Math.floor(100 + Math.random() * 900);
    if (newType === 'Credit Note') setReferenceNo(`CN-26-27-0${rnd}`);
    else if (newType === 'Debit Note') setReferenceNo(`DN-26-27-0${rnd}`);
    else if (newType === 'Refund') setReferenceNo(`REF-26-27-0${rnd}`);
    else setReferenceNo(`ADJ-26-27-0${rnd}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDealer) return;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid amount');
      return;
    }

    recordLedgerAdjustment({
      dealerId: targetDealer.id,
      type,
      referenceNo: referenceNo.trim(),
      date,
      amount: numAmount,
      particulars: particulars.trim() || `${type} issued for ${targetDealer.companyName}`,
    });

    showToast(`${type} of ₹${numAmount.toLocaleString('en-IN')} posted to ${targetDealer.companyName} ledger!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#2C2417]/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white text-[#2C2417] rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DACBAA]/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F3EBDA] text-[#8B5A3C]">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-[#2C2417]">
                Record Ledger Adjustment
              </h3>
              <p className="text-xs text-[#766A57]">
                Issue Credit Notes, Debit Notes, Adjustments, or Refunds
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-[#2C2417]">Dealer Account</label>
            <select
              value={dealerId}
              onChange={e => setDealerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-[#FAF5EC] text-xs font-semibold focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
              required
            >
              {dealers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.companyName} ({d.dealerCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-[#2C2417]">Transaction Type</label>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs font-bold focus:ring-1 focus:ring-[#8B5A3C] focus:outline-none"
              >
                <option value="Credit Note">Credit Note (Credit to Dealer)</option>
                <option value="Debit Note">Debit Note (Debit to Dealer)</option>
                <option value="Adjustment">Adjustment Entry</option>
                <option value="Refund">Refund / Reversal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#2C2417]">Reference / Note No.</label>
              <input
                type="text"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white font-mono font-bold text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-[#2C2417]">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white font-mono font-bold text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#2C2417]">Transaction Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#2C2417]">Particulars / Reason</label>
            <input
              type="text"
              value={particulars}
              onChange={e => setParticulars(e.target.value)}
              placeholder="e.g. Rate difference credit on Onyx Dimout roll 801"
              className="w-full p-2.5 rounded-xl border border-[#DACBAA] bg-white text-xs"
              required
            />
          </div>

          <div className="p-3 bg-[#F3EBDA] rounded-xl text-[11px] text-[#766A57]">
            {type === 'Credit Note' && (
              <p>
                <strong>Accounting Impact:</strong> Credits dealer account by ₹{amount || '0'}, reducing their net outstanding balance.
              </p>
            )}
            {type === 'Debit Note' && (
              <p>
                <strong>Accounting Impact:</strong> Debits dealer account by ₹{amount || '0'}, increasing their net outstanding balance.
              </p>
            )}
            {type === 'Adjustment' && (
              <p>
                <strong>Accounting Impact:</strong> Posts balancing entry to dealer general ledger.
              </p>
            )}
            {type === 'Refund' && (
              <p>
                <strong>Accounting Impact:</strong> Records excess payment remittance refund to dealer.
              </p>
            )}
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
              <span>Post to Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
