import React, { useState } from 'react';
import {
  Mail,
  X,
  ExternalLink,
  Copy,
  Check,
  Send,
  Building2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { EmailNotification } from '../services/emailNotificationService';

interface EmailNotificationModalProps {
  notification: EmailNotification | null;
  onClose: () => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  notification,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!notification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Subject: ${notification.subject}\n\nTo: ${notification.recipientEmail}\n\n${notification.body}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenClient = () => {
    window.location.href = notification.mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C2417]/65 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close background"
      />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-2xl w-full shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#8B5A3C] text-white rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B5A3C] block">
                Notification Dispatch Preview (mailto: Client Ready)
              </span>
              <h3 className="font-display font-bold text-sm text-[#2C2417]">
                {notification.type === 'ORDER_CONFIRMATION'
                  ? 'New Order Notification Dispatch'
                  : notification.type === 'DISPATCH_UPDATE'
                  ? 'Logistics & Consignment Dispatch Alert'
                  : 'Quality Claim Escalation Alert'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient & Metadata Panel */}
        <div className="px-5 py-3 bg-[#F3EBDA] border-b border-[#DACBAA]/60 space-y-1.5 text-xs text-[#766A57]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#2C2417]">To:</span>
              <span className="font-mono bg-[#E7DAC0] px-2 py-0.5 rounded-md text-[#2C2417] font-semibold">
                {notification.recipientEmail}
              </span>
              <span className="text-[11px] text-[#8B5A3C]">
                ({notification.recipientName})
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#5F6B4A] bg-[#E3E7D8] px-2.5 py-0.5 rounded-full font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Service Status: Auto-Delivered</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-[#2C2417]">Subject:</span>{' '}
            <span className="text-[#2C2417] font-semibold">{notification.subject}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#766A57]">
            <Clock className="w-3 h-3" />
            <span>
              Generated at {new Date(notification.timestamp).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Email Body Preview */}
        <div className="p-5 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#2C2417] bg-[#FAF5EC] whitespace-pre-wrap select-text border-b border-[#DACBAA]/60">
          {notification.body}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[#766A57] text-center sm:text-left">
            Standard <code className="text-[#8B5A3C] font-bold">mailto:</code> protocol configured for instant dispatch to the business owner.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-[#FBF7EE] hover:bg-white text-[#2C2417] border border-[#DACBAA] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#5F6B4A]" />
                  <span className="text-[#5F6B4A]">Copied Body!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Body</span>
                </>
              )}
            </button>

            <a
              href={notification.mailtoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Mail Client</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
