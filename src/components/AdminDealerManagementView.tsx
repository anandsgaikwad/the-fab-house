import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  CreditCard,
  Edit,
  Eye,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Ban,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DealerAccount, DealerApprovalStatus, DealerPermissions } from '../types';
import { DEPOT_OPTIONS, formatCreditTerms } from '../utils/dealerFinancials';
import { AdminDirectInvoiceModal } from './AdminDirectInvoiceModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { RecordLedgerAdjustmentModal } from './RecordLedgerAdjustmentModal';

export const AdminDealerManagementView: React.FC = () => {
  const {
    dealers,
    approveDealer,
    rejectDealer,
    updateDealerStatus,
    updateDealerCredit,
    updateDealerPermissions,
    updateDealerDepot,
    getDealerFinancials,
    recordDealerPayment,
    setActiveDealer,
    setActiveView,
    openDealerRegistrationModal,
    showToast,
    adminUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealerApprovalStatus | 'all'>('all');
  const [selectedDealer, setSelectedDealer] = useState<DealerAccount | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'credit' | 'permissions' | 'payment'>('details');

  // Edit fields for drawer/modal
  const [editLimit, setEditLimit] = useState<number>(0);
  const [editCreditEnabled, setEditCreditEnabled] = useState<boolean>(true);
  const [editDays, setEditDays] = useState<number>(45);
  const [editCustomDays, setEditCustomDays] = useState<string>('');
  const [editDepot, setEditDepot] = useState<string>('PUN-CENTRAL');
  const [editStatus, setEditStatus] = useState<DealerApprovalStatus>('approved');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editPermissions, setEditPermissions] = useState<DealerPermissions>({
    canPurchaseProducts: true,
    canUseCreditFacility: true,
    canViewOutstanding: true,
    canViewInvoices: true,
    canDownloadInvoices: true,
    canViewPaymentHistory: true,
    canViewOrderHistory: true,
    canViewCatalogue: true,
    canRequestQuotations: true,
    canRequestSamples: true,
  });

  // Record payment form
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMode, setPayMode] = useState<'NEFT' | 'RTGS' | 'Cheque' | 'UPI' | 'Net Banking' | 'Adjustment'>('NEFT');
  const [payRef, setPayRef] = useState<string>('');
  const [payParticulars, setPayParticulars] = useState<string>('');

  // Quick Approval modal state
  const [quickApproveDealer, setQuickApproveDealer] = useState<DealerAccount | null>(null);
  const [quickLimit, setQuickLimit] = useState<number>(300000);
  const [quickDays, setQuickDays] = useState<number>(45);
  const [quickDepot, setQuickDepot] = useState<string>('PUN-CENTRAL');

  // Quick Reject modal state
  const [rejectingDealer, setRejectingDealer] = useState<DealerAccount | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // GST Invoice, Payment, and Adjustment modal states
  const [isDirectInvoiceModalOpen, setIsDirectInvoiceModalOpen] = useState(false);
  const [invoiceModalDealerId, setInvoiceModalDealerId] = useState<string | undefined>(undefined);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentModalDealerId, setPaymentModalDealerId] = useState<string | undefined>(undefined);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentModalDealerId, setAdjustmentModalDealerId] = useState<string | undefined>(undefined);

  // Filtered dealers
  const filteredDealers = dealers.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.companyName.toLowerCase().includes(q) ||
      d.dealerCode.toLowerCase().includes(q) ||
      d.contactPerson.toLowerCase().includes(q) ||
      d.contactEmail.toLowerCase().includes(q) ||
      d.contactPhone.toLowerCase().includes(q) ||
      d.gstin.toLowerCase().includes(q) ||
      d.depotCode.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q)
    );
  });

  const pendingCount = dealers.filter(d => d.status === 'pending').length;
  const approvedCount = dealers.filter(d => d.status === 'approved').length;

  const handleOpenDetails = (dealer: DealerAccount) => {
    setSelectedDealer(dealer);
    setEditLimit(dealer.creditLimit);
    setEditCreditEnabled(dealer.creditFacilityEnabled);
    setEditDays(dealer.creditPeriodDays || 45);
    setEditDepot(dealer.depotCode);
    setEditStatus(dealer.status);
    setEditNotes(dealer.adminNotes || '');
    setEditPermissions({ ...dealer.permissions });
    setActiveDetailTab('details');
  };

  const handleSaveDealerProfile = () => {
    if (!selectedDealer) return;

    const daysToSet = editDays === -1 ? Number(editCustomDays) || 45 : editDays;

    updateDealerCredit(selectedDealer.id, editLimit, daysToSet, editCreditEnabled);
    updateDealerPermissions(selectedDealer.id, editPermissions);
    updateDealerDepot(selectedDealer.id, editDepot);
    if (editStatus !== selectedDealer.status) {
      updateDealerStatus(selectedDealer.id, editStatus, editNotes);
    }

    showToast(`Updated profile and permissions for ${selectedDealer.companyName}`);
    setSelectedDealer(null);
  };

  const handleQuickApproveSubmit = () => {
    if (!quickApproveDealer) return;
    approveDealer(quickApproveDealer.id, quickLimit, quickDays, quickDepot);
    setQuickApproveDealer(null);
  };

  const handleQuickRejectSubmit = () => {
    if (!rejectingDealer) return;
    rejectDealer(rejectingDealer.id, rejectReason || 'Documentation / GST verification incomplete');
    setRejectingDealer(null);
    setRejectReason('');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer) return;
    const num = Number(payAmount);
    if (!num || num <= 0) {
      showToast('Please enter a valid payment amount in ₹');
      return;
    }

    recordDealerPayment(
      selectedDealer.id,
      num,
      payMode,
      payRef.trim() || `REC-${Date.now().toString().slice(-6)}`,
      payParticulars.trim() || `Payment received via ${payMode} for account clearance`
    );

    setPayAmount('');
    setPayRef('');
    setPayParticulars('');
    showToast(`Recorded payment of ₹${num.toLocaleString('en-IN')} for ${selectedDealer.companyName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="bg-[#2C2417] text-[#FBF7EE] p-5 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#8B5A3C] text-white">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="font-display font-bold text-xl sm:text-2xl">
              Dealer Approvals &amp; B2B Directory
            </h1>
          </div>
          <p className="text-xs text-[#E7DAC0]">
            Authoritative admin control: verify dealerships, assign depots, configure credit limits, set credit terms, and manage business permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setInvoiceModalDealerId(undefined);
              setIsDirectInvoiceModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#5F6B4A] hover:bg-[#4E593D] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            title="Create a direct GST Tax Invoice for any dealer"
          >
            <FileText className="w-4 h-4" />
            <span>+ GST Invoice</span>
          </button>
          <button
            onClick={() => {
              setPaymentModalDealerId(undefined);
              setIsRecordPaymentModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#3D3222] hover:bg-[#50412D] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 border border-[#8B5A3C]/40"
            title="Record payment from any dealer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => setActiveView('admin-fulfillment')}
            className="px-3.5 py-2 rounded-xl bg-[#4A3B2C] hover:bg-[#5C4A38] text-white text-xs font-semibold transition-colors"
          >
            ← Fulfillment
          </button>
          <button
            onClick={() => setActiveView('admin-fabrics')}
            className="px-3.5 py-2 rounded-xl bg-[#4A3B2C] hover:bg-[#5C4A38] text-white text-xs font-semibold transition-colors"
          >
            Fabrics
          </button>
          <button
            onClick={openDealerRegistrationModal}
            className="px-3.5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Dealer</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pending Approvals */}
        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'pending'
              ? 'bg-[#FFF8E6] border-[#E5C374] ring-2 ring-[#785412]'
              : 'bg-[#FBF7EE] border-[#DACBAA] hover:bg-[#F3EBDA]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#785412]">Pending Approvals</span>
            <Clock className="w-4 h-4 text-[#785412]" />
          </div>
          <p className="font-display font-bold text-2xl text-[#785412] mt-1">
            {pendingCount}
          </p>
          <span className="text-[10px] text-[#785412] block mt-0.5">
            Require verification &amp; credit setup
          </span>
        </div>

        {/* Approved Active Dealers */}
        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'approved'
              ? 'bg-[#E3E7D8] border-[#5F6B4A] ring-2 ring-[#5F6B4A]'
              : 'bg-[#FBF7EE] border-[#DACBAA] hover:bg-[#F3EBDA]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6B4A]">Active Dealers</span>
            <CheckCircle2 className="w-4 h-4 text-[#5F6B4A]" />
          </div>
          <p className="font-display font-bold text-2xl text-[#2C2417] mt-1">
            {approvedCount}
          </p>
          <span className="text-[10px] text-[#5F6B4A] block mt-0.5">
            Credit facilities active
          </span>
        </div>

        {/* Total Registered */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-[#E9D9C5] border-[#8B5A3C] ring-2 ring-[#8B5A3C]'
              : 'bg-[#FBF7EE] border-[#DACBAA] hover:bg-[#F3EBDA]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B5A3C]">Total B2B Accounts</span>
            <Building2 className="w-4 h-4 text-[#8B5A3C]" />
          </div>
          <p className="font-display font-bold text-2xl text-[#2C2417] mt-1">
            {dealers.length}
          </p>
          <span className="text-[10px] text-[#766A57] block mt-0.5">
            Full dealership directory
          </span>
        </div>

        {/* Total Credit Exposure */}
        <div className="p-4 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#766A57]">Total Credit Sanctioned</span>
            <CreditCard className="w-4 h-4 text-[#8B5A3C]" />
          </div>
          <p className="font-display font-bold text-xl text-[#2C2417] mt-1">
            ₹
            {dealers
              .filter(d => d.creditFacilityEnabled)
              .reduce((sum, d) => sum + d.creditLimit, 0)
              .toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#5F6B4A] font-semibold block mt-0.5">
            Admin authorized limits
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#766A57]" />
          <input
            type="text"
            placeholder="Search by Business Name, Dealer Code (e.g. 0000596919), GST, Contact, Depot, City..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[#766A57] font-semibold whitespace-nowrap">Filter Status:</span>
          {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#8B5A3C] text-white'
                  : 'bg-[#F3EBDA] text-[#766A57] hover:bg-[#E7DAC0]'
              }`}
            >
              {st === 'all' ? 'All Dealers' : st}
              {st === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-[#9C4630] text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* DEALERS DIRECTORY TABLE */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#DACBAA]/60 flex items-center justify-between bg-[#E7DAC0]/40">
          <span className="text-xs font-bold text-[#2C2417]">
            Registered Businesses ({filteredDealers.length})
          </span>
          <span className="text-[11px] text-[#766A57]">
            Click any dealer row to inspect full profile, ledger, and grant credit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DACBAA] bg-[#F3EBDA] text-[#766A57]">
                <th className="py-3 px-4 font-semibold">Business Name &amp; Code</th>
                <th className="py-3 px-3 font-semibold">Contact Person &amp; GST</th>
                <th className="py-3 px-3 font-semibold">Depot Hub</th>
                <th className="py-3 px-3 font-semibold">Credit Facility</th>
                <th className="py-3 px-3 font-semibold">Net Outstanding</th>
                <th className="py-3 px-3 font-semibold">Overdue (₹)</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DACBAA]/60">
              {filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#766A57]">
                    No dealer accounts found matching your query.
                  </td>
                </tr>
              ) : (
                filteredDealers.map(dealer => {
                  const fin = getDealerFinancials(dealer.id);
                  const isPending = dealer.status === 'pending';

                  return (
                    <tr
                      key={dealer.id}
                      className={`hover:bg-[#F3EBDA]/70 transition-colors ${
                        isPending ? 'bg-[#FFFBF0]' : ''
                      }`}
                    >
                      {/* Business Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2C2417] text-sm flex items-center gap-1.5">
                          <span>{dealer.companyName}</span>
                          {isPending && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#766A57] mt-0.5">
                          <span className="font-mono bg-[#E9D9C5] px-1.5 py-0.5 rounded text-[#2C2417] font-semibold">
                            Code: {dealer.dealerCode}
                          </span>
                          <span>·</span>
                          <span>{dealer.businessType}</span>
                        </div>
                      </td>

                      {/* Contact Person & GST */}
                      <td className="py-3.5 px-3">
                        <div className="text-[#2C2417] font-medium">{dealer.contactPerson}</div>
                        <div className="text-[11px] text-[#766A57] flex flex-col mt-0.5">
                          <span>{dealer.contactPhone}</span>
                          <span className="font-mono text-[10px] text-[#8B5A3C]">
                            GST: {dealer.gstin}
                          </span>
                        </div>
                      </td>

                      {/* Depot */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-[#8B5A3C] bg-[#E9D9C5]/80 px-2 py-0.5 rounded-md">
                          {dealer.depotCode}
                        </span>
                        <span className="block text-[10px] text-[#766A57] mt-0.5">
                          {dealer.city}, {dealer.state}
                        </span>
                      </td>

                      {/* Credit Facility */}
                      <td className="py-3.5 px-3">
                        {dealer.creditFacilityEnabled ? (
                          <div>
                            <span className="font-display font-bold text-sm text-[#2C2417]">
                              ₹{(fin.approvedCreditLimit || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="block text-[10px] text-[#5F6B4A] font-semibold">
                              {fin.creditTermsLabel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#766A57] italic">
                            Disabled / Pre-paid
                          </span>
                        )}
                      </td>

                      {/* Net Outstanding */}
                      <td className="py-3.5 px-3">
                        <span className="font-display font-bold text-sm text-[#8B5A3C]">
                          ₹{(fin.netOutstanding || 0).toLocaleString('en-IN')}
                        </span>
                        <div className="w-16 bg-[#DACBAA] h-1 rounded-full mt-1">
                          <div
                            className="bg-[#8B5A3C] h-full rounded-full"
                            style={{ width: `${Math.min(100, fin.utilizationPercentage || 0)}%` }}
                          />
                        </div>
                      </td>

                      {/* Overdue */}
                      <td className="py-3.5 px-3">
                        {(fin.overdueAmount || 0) > 0 ? (
                          <span className="font-display font-bold text-sm text-[#9C4630] bg-[#9C4630]/10 px-1.5 py-0.5 rounded">
                            ₹{(fin.overdueAmount || 0).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#5F6B4A]">₹0 (Clear)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            dealer.status === 'approved'
                              ? 'bg-[#E3E7D8] text-[#5F6B4A] border-[#5F6B4A]/30'
                              : dealer.status === 'pending'
                              ? 'bg-[#FFF8E6] text-[#785412] border-[#E5C374]'
                              : dealer.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-stone-200 text-stone-700 border-stone-300'
                          }`}
                        >
                          {dealer.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {dealer.status === 'pending' && <Clock className="w-3 h-3" />}
                          {dealer.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          <span>{dealer.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => {
                                  setQuickApproveDealer(dealer);
                                  setQuickLimit(300000);
                                  setQuickDays(45);
                                  setQuickDepot(dealer.depotCode);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#5F6B4A] hover:bg-[#4E593D] text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors"
                                title="Approve dealer and configure credit limit"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingDealer(dealer);
                                  setRejectReason('');
                                }}
                                className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-semibold transition-colors"
                                title="Reject dealer application"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : null}

                          <button
                            onClick={() => {
                              setInvoiceModalDealerId(dealer.id);
                              setIsDirectInvoiceModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#F3EBDA] hover:bg-[#E7DAC0] border border-[#DACBAA] text-[#8B5A3C] text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title={`Create direct GST tax invoice for ${dealer.companyName}`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>

                          <button
                            onClick={() => {
                              setPaymentModalDealerId(dealer.id);
                              setIsRecordPaymentModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#E3E7D8] hover:bg-[#D4DDD0] text-[#5F6B4A] text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title={`Record payment from ${dealer.companyName}`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Payment</span>
                          </button>

                          <button
                            onClick={() => handleOpenDetails(dealer)}
                            className="px-2.5 py-1 rounded-lg bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="View complete dealer profile, configure credit & permissions"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#8B5A3C]" />
                            <span>Manage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK APPROVE MODAL */}
      {quickApproveDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-3">
              <div className="flex items-center gap-2 text-[#5F6B4A]">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-[#2C2417]">
                  Approve Dealership Application
                </h3>
              </div>
              <button
                onClick={() => setQuickApproveDealer(null)}
                className="text-[#766A57] hover:text-[#2C2417]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#E7DAC0]/50 text-xs space-y-1">
              <p className="font-bold text-[#2C2417]">{quickApproveDealer.companyName}</p>
              <p className="text-[#766A57]">
                Dealer Code: <strong className="font-mono text-[#2C2417]">{quickApproveDealer.dealerCode}</strong> · GST: {quickApproveDealer.gstin}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                  Assign Parent Depot *
                </label>
                <select
                  value={quickDepot}
                  onChange={e => setQuickDepot(e.target.value)}
                  className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] font-semibold"
                >
                  {DEPOT_OPTIONS.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                  Approved Credit Limit (INR ₹) *
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={quickLimit}
                  onChange={e => setQuickLimit(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                  Approved Credit Period (Days) *
                </label>
                <select
                  value={quickDays}
                  onChange={e => setQuickDays(Number(e.target.value))}
                  className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] font-semibold"
                >
                  <option value={15}>15 Days Credit</option>
                  <option value={30}>30 Days Credit (Regular 30 Days)</option>
                  <option value={45}>45 Days Credit (Regular 45 Days)</option>
                  <option value={60}>60 Days Credit</option>
                  <option value={90}>90 Days Credit</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DACBAA]/60">
              <button
                onClick={() => setQuickApproveDealer(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#E7DAC0] text-xs font-semibold text-[#2C2417]"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickApproveSubmit}
                className="px-4 py-2 rounded-xl bg-[#5F6B4A] hover:bg-[#4E593D] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Confirm Approval &amp; Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK REJECT MODAL */}
      {rejectingDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-3 text-red-700">
              <h3 className="font-display font-bold text-base">Reject Dealership Application</h3>
              <button onClick={() => setRejectingDealer(null)}>
                <X className="w-5 h-5 text-[#766A57]" />
              </button>
            </div>

            <p className="text-xs text-[#766A57]">
              Are you sure you want to reject <strong>{rejectingDealer.companyName}</strong> (Dealer Code: {rejectingDealer.dealerCode})?
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                Reason for Rejection:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Invalid GST registration, outside servicing territory, unverified contact..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl p-2.5 text-xs text-[#2C2417]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingDealer(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#E7DAC0] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickRejectSubmit}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL DEALER PROFILE & MANAGEMENT MODAL / DRAWER */}
      {selectedDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-[#E7DAC0] px-5 py-4 border-b border-[#DACBAA] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#8B5A3C] text-white">
                    Master Admin Control
                  </span>
                  <span className="font-mono text-xs font-bold text-[#2C2417]">
                    Code: {selectedDealer.dealerCode}
                  </span>
                </div>
                <h2 className="font-display font-bold text-xl text-[#2C2417] mt-0.5">
                  {selectedDealer.companyName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedDealer(null)}
                className="p-1.5 rounded-full text-[#766A57] hover:bg-[#DACBAA] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header Navigation Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#DACBAA]/60 bg-[#F3EBDA]">
              <button
                onClick={() => setActiveDetailTab('details')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeDetailTab === 'details'
                    ? 'border-[#8B5A3C] text-[#8B5A3C]'
                    : 'border-transparent text-[#766A57] hover:text-[#2C2417]'
                }`}
              >
                1. Business Info &amp; Depot
              </button>
              <button
                onClick={() => setActiveDetailTab('credit')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeDetailTab === 'credit'
                    ? 'border-[#8B5A3C] text-[#8B5A3C]'
                    : 'border-transparent text-[#766A57] hover:text-[#2C2417]'
                }`}
              >
                2. Credit Limit &amp; Terms
              </button>
              <button
                onClick={() => setActiveDetailTab('permissions')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeDetailTab === 'permissions'
                    ? 'border-[#8B5A3C] text-[#8B5A3C]'
                    : 'border-transparent text-[#766A57] hover:text-[#2C2417]'
                }`}
              >
                3. Dealer Permissions
              </button>
              <button
                onClick={() => setActiveDetailTab('payment')}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeDetailTab === 'payment'
                    ? 'border-[#8B5A3C] text-[#8B5A3C]'
                    : 'border-transparent text-[#766A57] hover:text-[#2C2417]'
                }`}
              >
                4. Record Payment / Settle
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
              {/* TAB 1: BUSINESS INFO */}
              {activeDetailTab === 'details' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Unique Dealer Code (Read-Only for Dealer)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedDealer.dealerCode}
                        className="w-full bg-[#E9D9C5] border border-[#DACBAA] rounded-xl px-3 py-2 font-mono font-bold text-[#8B5A3C]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Admin Assigned Depot Hub *
                      </label>
                      <select
                        value={editDepot}
                        onChange={e => setEditDepot(e.target.value)}
                        className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] font-semibold"
                      >
                        {DEPOT_OPTIONS.map(d => (
                          <option key={d.code} value={d.code}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Dealership Status *
                      </label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as DealerApprovalStatus)}
                        className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] font-bold capitalize"
                      >
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved &amp; Active</option>
                        <option value="suspended">Suspended (Temporary Hold)</option>
                        <option value="blocked">Blocked</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedDealer.gstin}
                        className="w-full bg-[#E9D9C5] border border-[#DACBAA] rounded-xl px-3 py-2 font-mono text-[#2C2417]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Authorized Contact Person
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedDealer.contactPerson}
                        className="w-full bg-[#E9D9C5] border border-[#DACBAA] rounded-xl px-3 py-2 text-[#2C2417]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Contact Mobile &amp; Email
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${selectedDealer.contactPhone} · ${selectedDealer.contactEmail}`}
                        className="w-full bg-[#E9D9C5] border border-[#DACBAA] rounded-xl px-3 py-2 text-[#2C2417]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Registered Business Address
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${selectedDealer.addressLine1}, ${selectedDealer.city}, ${selectedDealer.state} - ${selectedDealer.pincode}`}
                        className="w-full bg-[#E9D9C5] border border-[#DACBAA] rounded-xl px-3 py-2 text-[#2C2417]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Admin Internal Review Notes / Rejection Reason
                      </label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        placeholder="Notes regarding credit appraisal, site verification, or terms..."
                        className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl p-2.5 text-xs text-[#2C2417]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT LIMIT & TERMS */}
              {activeDetailTab === 'credit' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#E7DAC0]/50 border border-[#DACBAA] rounded-xl text-xs space-y-1">
                    <p className="font-bold text-[#2C2417]">
                      Admin Credit Facility Configuration
                    </p>
                    <p className="text-[#766A57]">
                      Dealers can only view approved credit. They have no permission to adjust limits or periods.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]">
                    <div>
                      <span className="font-bold text-sm text-[#2C2417] block">
                        Credit Facility Toggle
                      </span>
                      <span className="text-[11px] text-[#766A57]">
                        Enable or disable credit purchasing for this dealer
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCreditEnabled}
                        onChange={e => setEditCreditEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5F6B4A]"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Approved Credit Limit (INR ₹)
                      </label>
                      <input
                        type="number"
                        step="50000"
                        min="0"
                        disabled={!editCreditEnabled}
                        value={editLimit}
                        onChange={e => setEditLimit(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#F3EBDA] disabled:opacity-50 border border-[#DACBAA] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2C2417]"
                      />
                      <span className="text-[10px] text-[#766A57] block mt-1">
                        e.g. ₹5,00,000 for Platinum wholesale tier
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                        Credit Period Terms
                      </label>
                      <select
                        disabled={!editCreditEnabled}
                        value={editDays}
                        onChange={e => setEditDays(Number(e.target.value))}
                        className="w-full bg-[#F3EBDA] disabled:opacity-50 border border-[#DACBAA] rounded-xl px-3 py-2 text-xs font-semibold text-[#2C2417]"
                      >
                        <option value={15}>15 Days (Regular 15 Days Credit)</option>
                        <option value={30}>30 Days (Regular 30 Days Credit)</option>
                        <option value={45}>45 Days (Regular 45 Days Credit)</option>
                        <option value={60}>60 Days (Regular 60 Days Credit)</option>
                        <option value={90}>90 Days (Regular 90 Days Credit)</option>
                        <option value={-1}>Custom Days...</option>
                      </select>
                      {editDays === -1 && (
                        <input
                          type="number"
                          placeholder="Enter custom number of days"
                          value={editCustomDays}
                          onChange={e => setEditCustomDays(e.target.value)}
                          className="w-full mt-2 bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {/* Financial calculation review */}
                  {(() => {
                    const fin = getDealerFinancials(selectedDealer.id);
                    return (
                      <div className="bg-[#E7DAC0]/40 border border-[#DACBAA] rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-[#766A57] block">Net Outstanding</span>
                          <strong className="text-sm text-[#8B5A3C]">
                            ₹{(fin.netOutstanding || 0).toLocaleString('en-IN')}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#766A57] block">Overdue Amount</span>
                          <strong
                            className={`text-sm ${
                              (fin.overdueAmount || 0) > 0 ? 'text-[#9C4630]' : 'text-[#5F6B4A]'
                            }`}
                          >
                            ₹{(fin.overdueAmount || 0).toLocaleString('en-IN')}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#766A57] block">Due in 7 Days</span>
                          <strong className="text-sm text-[#2C2417]">
                            ₹{(fin.dueIn7Days || 0).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: DEALER PERMISSIONS */}
              {activeDetailTab === 'permissions' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-2">
                    <div>
                      <h4 className="font-bold text-[#2C2417]">Granular Dealer Capabilities</h4>
                      <p className="text-[11px] text-[#766A57]">
                        Controlled exclusively by Admin. Uncheck to restrict dealer operations.
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setEditPermissions({
                            canPurchaseProducts: true,
                            canUseCreditFacility: true,
                            canViewOutstanding: true,
                            canViewInvoices: true,
                            canDownloadInvoices: true,
                            canViewPaymentHistory: true,
                            canViewOrderHistory: true,
                            canViewCatalogue: true,
                            canRequestQuotations: true,
                            canRequestSamples: true,
                          })
                        }
                        className="px-2 py-1 bg-[#E7DAC0] rounded-lg text-[10px] font-bold text-[#8B5A3C]"
                      >
                        Grant All
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditPermissions(prev => ({
                            ...prev,
                            canUseCreditFacility: false,
                          }))
                        }
                        className="px-2 py-1 bg-[#E7DAC0] rounded-lg text-[10px] font-bold text-[#766A57]"
                      >
                        Cash/Pre-paid Only
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      { key: 'canPurchaseProducts', label: 'Purchase Products & Place Orders' },
                      { key: 'canUseCreditFacility', label: 'Purchase on Credit Limit' },
                      { key: 'canViewOutstanding', label: 'View Account Summary & Outstanding Balance' },
                      { key: 'canViewInvoices', label: 'View GST Commercial Invoices' },
                      { key: 'canDownloadInvoices', label: 'Download Commercial Invoices & PDFs' },
                      { key: 'canViewPaymentHistory', label: 'View Payment & Ledger Receipts' },
                      { key: 'canViewOrderHistory', label: 'View Historical Order Log' },
                      { key: 'canViewCatalogue', label: 'Browse Wholesale Fabric Catalogues' },
                      { key: 'canRequestQuotations', label: 'Request Special Project Quotations' },
                      { key: 'canRequestSamples', label: 'Order Physical Sample Binders' },
                    ].map(({ key, label }) => {
                      const k = key as keyof DealerPermissions;
                      return (
                        <label
                          key={key}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]/60 cursor-pointer hover:bg-[#E7DAC0]/60 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(editPermissions[k])}
                            onChange={e =>
                              setEditPermissions(prev => ({
                                ...prev,
                                [k]: e.target.checked,
                              }))
                            }
                            className="rounded text-[#8B5A3C] focus:ring-[#8B5A3C] w-4 h-4"
                          />
                          <span className="font-semibold text-[#2C2417] text-[11px]">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: RECORD PAYMENT */}
              {activeDetailTab === 'payment' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#E3E7D8] border border-[#5F6B4A]/30 rounded-xl text-xs space-y-1 text-[#2C2417]">
                    <p className="font-bold flex items-center gap-1.5 text-[#5F6B4A]">
                      <DollarSign className="w-4 h-4" />
                      <span>Record Payment Receipt Against Dealer</span>
                    </p>
                    <p className="text-[#766A57]">
                      Recording an NEFT, RTGS, or Cheque payment automatically applies credit to the oldest unpaid invoices, clearing Overdue amounts and reducing Net Outstanding immediately.
                    </p>
                  </div>

                  <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                          Payment Amount Received (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 50000"
                          value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                          className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2C2417]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                          Payment Mode *
                        </label>
                        <select
                          value={payMode}
                          onChange={e => setPayMode(e.target.value as any)}
                          className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs font-semibold text-[#2C2417]"
                        >
                          <option value="NEFT">NEFT Bank Transfer</option>
                          <option value="RTGS">RTGS Cleared</option>
                          <option value="Cheque">Bank Cheque</option>
                          <option value="UPI">UPI / Instant QR</option>
                          <option value="Net Banking">Net Banking</option>
                          <option value="Adjustment">Ledger Credit Note / Adjustment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                          Bank Reference / UTR Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. HDFC-NEFT-992148"
                          value={payRef}
                          onChange={e => setPayRef(e.target.value)}
                          className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs font-mono text-[#2C2417]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                          Particulars / Ledger Description
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Payment cleared against July invoices"
                          value={payParticulars}
                          onChange={e => setPayParticulars(e.target.value)}
                          className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#5F6B4A] hover:bg-[#4E593D] text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Post Payment to Ledger &amp; Update Outstandings
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#E7DAC0] px-5 py-3 border-t border-[#DACBAA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveDealer(selectedDealer.id);
                  setActiveView('dashboard');
                  setSelectedDealer(null);
                  showToast(`Viewing dashboard as ${selectedDealer.companyName}`);
                }}
                className="text-xs font-bold text-[#8B5A3C] hover:underline flex items-center gap-1"
              >
                <span>View Dashboard as this Dealer</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDealer(null)}
                  className="px-4 py-2 rounded-xl bg-[#F3EBDA] text-[#2C2417] text-xs font-semibold hover:bg-[#DACBAA]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveDealerProfile}
                  className="px-5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Direct GST Tax Invoice Modal */}
      <AdminDirectInvoiceModal
        isOpen={isDirectInvoiceModalOpen}
        onClose={() => {
          setIsDirectInvoiceModalOpen(false);
          setInvoiceModalDealerId(undefined);
        }}
        preselectedDealerId={invoiceModalDealerId}
      />

      {/* Record Dealer Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => {
          setIsRecordPaymentModalOpen(false);
          setPaymentModalDealerId(undefined);
        }}
        preselectedDealerId={paymentModalDealerId}
      />

      {/* Record Ledger Adjustment / Notes Modal */}
      <RecordLedgerAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false);
          setAdjustmentModalDealerId(undefined);
        }}
        preselectedDealerId={adjustmentModalDealerId}
      />
    </div>
  );
};
