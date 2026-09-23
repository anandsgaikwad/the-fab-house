import React, { useState } from 'react';
import {
  AlertCircle,
  Plus,
  CheckCircle,
  Phone,
  Clock,
  UploadCloud,
  FileText,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComplaintTicket } from '../types';
import { BUSINESS_CONTACT, openWhatsAppChat } from '../config/businessContact';

export const ComplaintsView: React.FC = () => {
  const { complaints, raiseComplaint, orders } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [orderId, setOrderId] = useState(orders[0]?.id || 'TFH-2026-0891');
  const [sku, setSku] = useState('AMH0011');
  const [claimType, setClaimType] = useState<ComplaintTicket['type']>('Short Quantity');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    raiseComplaint(orderId, sku, claimType, description);

    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Quality Claims & Discrepancies
          </h1>
          <p className="text-xs text-[#766A57]">
            Log roll shortages, shade variations, or transit damages for immediate depot inspection
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Claim</span>
        </button>
      </div>

      {/* Escalation Helpline Banner */}
      <div className="bg-[#E9D9C5] border border-[#8B5A3C]/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FBF7EE] rounded-xl text-[#8B5A3C] shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-[#2C2417]">Direct Owner Helpline & Dispute Escalation</p>
            <p className="text-[#766A57]">
              Need immediate resolution? Speak directly with {BUSINESS_CONTACT.ownerName} at{' '}
              <a href={`tel:${BUSINESS_CONTACT.contactPhone}`} className="font-bold text-[#8B5A3C] underline">
                {BUSINESS_CONTACT.whatsAppDisplay}
              </a>
              {' '}or email{' '}
              <a href={`mailto:${BUSINESS_CONTACT.businessEmail}`} className="font-bold text-[#8B5A3C] underline">
                {BUSINESS_CONTACT.businessEmail}
              </a>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() =>
              openWhatsAppChat(
                `Hello ${BUSINESS_CONTACT.ownerName}, I need assistance with an order escalation/claim on THE FAB HOUSE.`
              )
            }
            className="px-3 py-1.5 rounded-xl bg-[#DCF8C6] hover:bg-[#cbf1af] text-[#075E54] border border-[#25D366]/40 font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Chat with Owner on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Support</span>
          </button>
          <span className="text-[11px] font-semibold text-[#5F6B4A] bg-[#E3E7D8] px-3 py-1.5 rounded-xl">
            SLA: 24h
          </span>
        </div>
      </div>

      {/* NEW CLAIM FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-sm space-y-4 text-xs"
        >
          <h2 className="font-display font-bold text-base text-[#2C2417] border-b border-[#DACBAA]/60 pb-2">
            Submit Fabric Claim Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#2C2417] block mb-1">Related Order Ref</label>
              <select
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs text-[#2C2417]"
              >
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#2C2417] block mb-1">Affected SKU / Shade</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. AMH0011 / Shade 801"
                className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs text-[#2C2417]"
                required
              />
            </div>

            <div>
              <label className="font-bold text-[#2C2417] block mb-1">Claim Type</label>
              <select
                value={claimType}
                onChange={e => setClaimType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs text-[#2C2417]"
              >
                <option value="Short Quantity">Short Quantity / Roll Length Shortage</option>
                <option value="Color Mismatch">Color Mismatch / Shade Variation</option>
                <option value="Damaged Goods">Damaged Goods / Weaving Defect</option>
                <option value="Wrong SKU Shipped">Wrong SKU Shipped</option>
                <option value="Delayed Dispatch">Delayed Dispatch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#2C2417] block mb-1">Description of Issue</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide exact measurements, roll tag details, or description of the defect..."
              className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs text-[#2C2417]"
              required
            />
          </div>

          <div className="p-3 bg-[#E7DAC0]/50 rounded-xl border border-dashed border-[#DACBAA] flex items-center justify-between text-[#766A57]">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#8B5A3C]" />
              <span>Attach Photos / Inspection Video / Roll Tag</span>
            </div>
            <span className="text-[11px] font-semibold bg-[#E7DAC0] px-2.5 py-1 rounded-md text-[#2C2417]">
              Browse Files
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-[#DACBAA] font-semibold text-[#766A57]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold transition-colors shadow-xs"
            >
              Submit Discrepancy Claim
            </button>
          </div>
        </form>
      )}

      {/* COMPLAINTS HISTORY LIST */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#766A57]">
          Logged Claims ({complaints.length})
        </h2>

        {complaints.map(claim => (
          <div
            key={claim.id}
            className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DACBAA]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#8B5A3C]">{claim.id}</span>
                <span className="font-bold text-[#2C2417]">Order #{claim.orderId}</span>
                <span className="text-[10px] font-mono text-[#766A57]">({claim.sku})</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    claim.status === 'Resolved'
                      ? 'bg-[#E3E7D8] text-[#5F6B4A]'
                      : claim.status === 'Credit Note Issued'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {claim.status}
                </span>
                <span className="text-[#766A57] text-[11px]">{claim.createdAt}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#2C2417] block">{claim.type}</span>
              <p className="text-[#766A57] leading-relaxed">{claim.description}</p>
            </div>

            {claim.resolutionNote && (
              <div className="p-3 bg-[#E3E7D8] border border-[#5F6B4A]/20 rounded-xl text-[#5F6B4A] space-y-0.5">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolution from Back Office:
                </span>
                <p className="text-[11px]">{claim.resolutionNote}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
