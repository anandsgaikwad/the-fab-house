import React from 'react';
import {
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AccountSummaryCard: React.FC = () => {
  const {
    activeDealer,
    activeDealerFinancials,
    setActiveView,
    role,
    openDealerSwitcherModal,
    openDealerRegistrationModal,
  } = useApp();

  const isPending = activeDealer.status === 'pending';
  const isSuspended = activeDealer.status === 'suspended' || activeDealer.status === 'blocked';
  const isRejected = activeDealer.status === 'rejected';

  return (
    <div className="space-y-4">
      {/* STATUS BANNER IF NOT APPROVED */}
      {isPending && (
        <div className="bg-[#FFF8E6] border border-[#E5C374] rounded-2xl p-4 text-[#785412] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#F3D794] rounded-xl text-[#785412] shrink-0 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3D794] px-2 py-0.5 rounded-full text-[#5E3F08]">
                  Application Under Review
                </span>
                <span className="text-xs font-mono font-bold">Code: {activeDealer.dealerCode}</span>
              </div>
              <h3 className="font-display font-bold text-base text-[#462F06] mt-0.5">
                Pending Admin Dealership Verification
              </h3>
              <p className="text-xs text-[#785412] mt-0.5">
                Your business registration is currently pending verification by THE FAB HOUSE Back Office.
                Credit facilities, roll purchasing, and commercial invoicing will be activated upon Admin approval.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('contact')}
            className="px-3.5 py-1.5 rounded-xl bg-[#785412] text-white text-xs font-semibold hover:bg-[#5E3F08] transition-colors shrink-0"
          >
            Contact Admin Desk
          </button>
        </div>
      )}

      {isSuspended && (
        <div className="bg-[#FDEDEC] border border-[#F5B7B1] rounded-2xl p-4 text-[#78281F] shadow-xs flex items-center gap-3">
          <Ban className="w-6 h-6 text-[#C0392B] shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-sm text-[#78281F]">Dealership Account On Hold</h4>
            <p>
              This account status is currently <strong>{activeDealer.status.toUpperCase()}</strong>. Ordering and credit facilities are temporarily halted. Please contact account admin.
            </p>
          </div>
        </div>
      )}

      {/* MAIN ACCOUNT SUMMARY CARD (Visual layout matching reference screenshot) */}
      <section className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Top Header Row with Business Name, Dealer Code, Depot, and Ledger Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DACBAA]/60 pb-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-[#E9D9C5] rounded-xl text-[#8B5A3C] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#2C2417] leading-tight">
                  {activeDealer.companyName}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activeDealer.status === 'approved'
                      ? 'bg-[#E3E7D8] text-[#5F6B4A] border-[#5F6B4A]/30'
                      : activeDealer.status === 'pending'
                      ? 'bg-[#FFF8E6] text-[#785412] border-[#E5C374]'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {activeDealer.status.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#766A57] mt-0.5 font-medium">
                <span>
                  Business Code: <strong className="font-mono text-[#2C2417]">{activeDealer.dealerCode}</strong>
                </span>
                <span className="text-[#DACBAA]">|</span>
                <span>
                  Depot: <strong className="font-mono text-[#8B5A3C]">{activeDealer.depotCode}</strong>
                </span>
                <span className="text-[#DACBAA]">|</span>
                <span className="text-[#5F6B4A] font-semibold">
                  {activeDealer.creditFacilityEnabled ? activeDealerFinancials.creditTermsLabel : 'No Credit Facility'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveView('reports')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#8B5A3C] hover:text-[#72482E] hover:underline bg-[#F3EBDA] px-3 py-1.5 rounded-xl border border-[#DACBAA]/80 transition-colors"
              title="View full account statement, GST invoices, and payments"
            >
              <span>See More / Full Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Approved Credit Limit */}
          <div className="p-3.5 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#766A57] font-medium block">Approved Credit Limit</span>
                <CreditCard className="w-3.5 h-3.5 text-[#8B5A3C]" />
              </div>
              <p className="font-display font-bold text-lg sm:text-xl text-[#2C2417] mt-0.5">
                {activeDealer.creditFacilityEnabled
                  ? `₹${(activeDealerFinancials.approvedCreditLimit || 0).toLocaleString('en-IN')}`
                  : '₹0 (Disabled)'}
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#DACBAA]/40 flex items-center justify-between text-[10px]">
              <span className="text-[#5F6B4A] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5F6B4A]"></span>
                {activeDealerFinancials.creditTermsLabel}
              </span>
              <span className="text-[#766A57] font-mono">
                Avail: ₹{(activeDealerFinancials.availableCredit || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* 2. Overdue Amount (Rust Highlight with Alert Triangle) */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              activeDealerFinancials.overdueAmount > 0
                ? 'bg-[#9C4630]/10 border-[#9C4630]/30'
                : 'bg-[#F3EBDA] border-[#DACBAA]/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold ${
                    activeDealerFinancials.overdueAmount > 0 ? 'text-[#9C4630]' : 'text-[#766A57]'
                  }`}
                >
                  Overdue Amount
                </span>
                <AlertTriangle
                  className={`w-3.5 h-3.5 ${
                    activeDealerFinancials.overdueAmount > 0 ? 'text-[#9C4630]' : 'text-[#766A57]'
                  }`}
                />
              </div>
              <p
                className={`font-display font-bold text-lg sm:text-xl mt-0.5 ${
                  activeDealerFinancials.overdueAmount > 0 ? 'text-[#9C4630]' : 'text-[#2C2417]'
                }`}
              >
                ₹{(activeDealerFinancials.overdueAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-black/5">
              <span
                className={`text-[10px] font-medium block ${
                  activeDealerFinancials.overdueAmount > 0 ? 'text-[#9C4630]' : 'text-[#5F6B4A]'
                }`}
              >
                {activeDealerFinancials.overdueAmount > 0
                  ? 'Due for Immediate Clearance'
                  : 'No overdue payments'}
              </span>
            </div>
          </div>

          {/* 3. Due in 7 Days */}
          <div className="p-3.5 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#766A57] font-medium">Due in 7 Days</span>
                <Clock className="w-3.5 h-3.5 text-[#8B5A3C]" />
              </div>
              <p className="font-display font-bold text-lg sm:text-xl text-[#2C2417] mt-0.5">
                ₹{(activeDealerFinancials.dueIn7Days || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-2 pt-1 border-t border-[#DACBAA]/40">
              <span className="text-[10px] text-[#766A57] block">Next maturity cycle</span>
            </div>
          </div>

          {/* 4. Net Outstanding */}
          <div className="p-3.5 rounded-xl bg-[#E7DAC0] border border-[#DACBAA] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#766A57] font-medium block">Net Outstanding</span>
                <span className="text-[10px] font-mono text-[#8B5A3C] font-semibold">
                  {activeDealerFinancials.utilizationPercentage}% used
                </span>
              </div>
              <p className="font-display font-bold text-lg sm:text-xl text-[#8B5A3C] mt-0.5">
                ₹{(activeDealerFinancials.netOutstanding || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mt-2 space-y-1">
              <div className="w-full bg-[#DACBAA] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeDealerFinancials.utilizationPercentage > 85
                      ? 'bg-[#9C4630]'
                      : 'bg-[#8B5A3C]'
                  }`}
                  style={{
                    width: `${Math.min(100, activeDealerFinancials.utilizationPercentage)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-[#766A57] block text-right">
                Billed: ₹{(activeDealerFinancials.totalBilled || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
