import React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  X,
  CreditCard,
  ExternalLink,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DealerAccount } from '../types';

interface DealerSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DealerSwitcherModal: React.FC<DealerSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    dealers,
    activeDealer,
    setActiveDealer,
    openDealerRegistrationModal,
    getDealerFinancials,
    showToast,
    isAdminAuthenticated,
    setActiveView,
  } = useApp();

  if (!isOpen) return null;

  const handleSelectDealer = (dealer: DealerAccount) => {
    setActiveDealer(dealer.id);
    showToast(`Switched active business to ${dealer.companyName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#E7DAC0] px-5 py-4 border-b border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8B5A3C] text-white rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#2C2417]">
                Switch Active Business Account
              </h2>
              <p className="text-xs text-[#766A57]">
                Select which registered B2B dealer workspace you are currently logged into
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#766A57] hover:bg-[#DACBAA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dealers list */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {dealers.map(dealer => {
            const isSelected = dealer.id === activeDealer.id;
            const fin = getDealerFinancials(dealer.id);
            const isPending = dealer.status === 'pending';

            return (
              <div
                key={dealer.id}
                onClick={() => handleSelectDealer(dealer)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] ring-2 ring-[#8B5A3C]/30 shadow-xs'
                    : 'bg-[#F3EBDA] border-[#DACBAA]/80 hover:bg-[#E7DAC0]/70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-[#2C2417]">
                      {dealer.companyName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        dealer.status === 'approved'
                          ? 'bg-[#E3E7D8] text-[#5F6B4A] border-[#5F6B4A]/30'
                          : dealer.status === 'pending'
                          ? 'bg-[#FFF8E6] text-[#785412] border-[#E5C374]'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {dealer.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#766A57]">
                    <span>
                      Code: <strong className="font-mono text-[#2C2417]">{dealer.dealerCode}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Depot: <strong className="font-mono text-[#8B5A3C]">{dealer.depotCode}</strong>
                    </span>
                    <span>·</span>
                    <span>{dealer.city}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] pt-0.5">
                    <span className="font-semibold text-[#2C2417]">
                      Limit: ₹{(fin.approvedCreditLimit || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[#8B5A3C]">
                      Outstanding: ₹{(fin.netOutstanding || 0).toLocaleString('en-IN')}
                    </span>
                    {(fin.overdueAmount || 0) > 0 && (
                      <span className="text-[#9C4630] font-bold">
                        Overdue: ₹{(fin.overdueAmount || 0).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isSelected ? (
                    <span className="text-xs font-bold text-[#8B5A3C] bg-[#8B5A3C]/10 px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#766A57]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Register button */}
        <div className="bg-[#E7DAC0] px-5 py-3.5 border-t border-[#DACBAA] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              openDealerRegistrationModal();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#8B5A3C] hover:text-[#72482E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register New Business / Dealer</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#F3EBDA] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
