import React, { useState } from 'react';
import {
  Mail,
  X,
  Copy,
  Check,
  ExternalLink,
  Search,
  Clock,
  ShieldCheck,
  Send,
  Eye,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmailNotification } from '../types';

interface EmailOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailOutboxModal: React.FC<EmailOutboxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    emailNotifications,
    ownerNotificationEmail,
    setOwnerNotificationEmail,
    setActiveEmailModal,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(ownerNotificationEmail);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      showToast('Please enter a valid owner email');
      return;
    }
    setOwnerNotificationEmail(emailInput.trim());
    setIsEditingEmail(false);
    showToast(`Owner notification email updated to: ${emailInput.trim()}`);
  };

  const handleCopyBody = (notif: EmailNotification) => {
    navigator.clipboard.writeText(`Subject: ${notif.subject}\n\nTo: ${notif.recipientEmail}\n\n${notif.body}`);
    setCopiedId(notif.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = emailNotifications.filter(n => {
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        n.subject.toLowerCase().includes(q) ||
        (n.relatedOrderId && n.relatedOrderId.toLowerCase().includes(q)) ||
        n.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C2417]/70 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close background" />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-3xl w-full shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8B5A3C] text-white rounded-xl shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-[#2C2417]">
                  Owner Email Notifications Gateway
                </h3>
                <span className="text-[10px] bg-[#E3E7D8] text-[#5F6B4A] px-2 py-0.5 rounded-full font-bold">
                  {emailNotifications.length} Dispatched
                </span>
              </div>
              <p className="text-[11px] text-[#766A57]">
                Automated order confirmation and dispatch alerts to the business owner
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Owner Target Email Banner */}
        <div className="px-6 py-3 bg-[#F3EBDA] border-b border-[#DACBAA]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5F6B4A] shrink-0" />
            <span className="text-[11px] text-[#766A57]">
              Current Owner Recipient:
            </span>
            {isEditingEmail ? (
              <form onSubmit={handleSaveEmail} className="flex items-center gap-1.5">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#DACBAA] text-xs font-mono text-[#2C2417]"
                  placeholder="owner@example.com"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-md bg-[#8B5A3C] text-white text-xs font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput(ownerNotificationEmail);
                    setIsEditingEmail(false);
                  }}
                  className="px-2 py-1 text-xs text-[#766A57]"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span className="font-mono font-bold text-[#2C2417] bg-[#E7DAC0] px-2 py-0.5 rounded-md">
                {ownerNotificationEmail}
              </span>
            )}
          </div>

          {!isEditingEmail && (
            <button
              onClick={() => setIsEditingEmail(true)}
              className="text-[11px] text-[#8B5A3C] hover:underline font-semibold flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Change Destination Email</span>
            </button>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="px-6 py-3 bg-[#FAF5EC] border-b border-[#DACBAA]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#766A57]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID or subject..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#DACBAA] text-xs text-[#2C2417]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['ALL', 'ORDER_CONFIRMATION', 'DISPATCH_UPDATE', 'CLAIM_ALERT'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  filterType === t
                    ? 'bg-[#8B5A3C] text-white shadow-xs'
                    : 'bg-[#F3EBDA] text-[#766A57] hover:bg-[#E7DAC0]'
                }`}
              >
                {t === 'ALL'
                  ? 'All Alerts'
                  : t === 'ORDER_CONFIRMATION'
                  ? 'Orders'
                  : t === 'DISPATCH_UPDATE'
                  ? 'Dispatches'
                  : 'Claims'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#766A57] space-y-2">
              <Mail className="w-8 h-8 text-[#DACBAA] mx-auto" />
              <p className="font-semibold">No email notifications recorded yet.</p>
              <p className="text-[11px] text-[#A79876]">
                When an order is confirmed or marked dispatched, automated email notices will appear here.
              </p>
            </div>
          ) : (
            filtered.map(notif => (
              <div
                key={notif.id}
                className="p-4 bg-white border border-[#DACBAA] rounded-xl hover:border-[#8B5A3C] transition-all shadow-xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        notif.type === 'ORDER_CONFIRMATION'
                          ? 'bg-[#E9D9C5] text-[#8B5A3C]'
                          : notif.type === 'DISPATCH_UPDATE'
                          ? 'bg-[#E3E7D8] text-[#5F6B4A]'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {notif.type.replace('_', ' ')}
                    </span>
                    {notif.relatedOrderId && (
                      <span className="font-mono font-bold text-xs text-[#2C2417]">
                        #{notif.relatedOrderId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#766A57]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#2C2417] leading-snug">
                    {notif.subject}
                  </h4>
                  <p className="text-[11px] text-[#766A57] line-clamp-2 mt-1 font-mono">
                    {notif.body.slice(0, 140)}...
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#DACBAA]/40 text-xs">
                  <span className="text-[11px] text-[#766A57]">
                    Recipient: <strong className="text-[#2C2417]">{notif.recipientEmail}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyBody(notif)}
                      className="px-2.5 py-1 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] hover:bg-white text-[#2C2417] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedId === notif.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#5F6B4A]" />
                          <span className="text-[#5F6B4A]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveEmailModal(notif)}
                      className="px-3 py-1 rounded-lg bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-[#8B5A3C]" />
                      <span>Full Preview</span>
                    </button>

                    <a
                      href={notif.mailtoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-[#8B5A3C] hover:bg-[#72482E] text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Launch Mail</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#E7DAC0] border-t border-[#DACBAA] flex items-center justify-between">
          <span className="text-[11px] text-[#766A57]">
            Standard RFC mailto integration enabled for instant Gmail / Outlook dispatch.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold text-xs transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
