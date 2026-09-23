import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Printer,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  Building,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FAB_HOUSE_CONTACT } from '../data/mockBusiness';
import { BulkInvoiceExportModal } from './BulkInvoiceExportModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { RecordLedgerAdjustmentModal } from './RecordLedgerAdjustmentModal';
import {
  downloadAccountStatementPDF,
  exportToExcel,
  exportToCSV,
} from '../utils/pdfAndExportService';

export const ReportsView: React.FC = () => {
  const {
    activeDealer,
    dealers,
    setActiveDealer,
    activeDealerFinancials,
    ledger,
    setInvoiceToView,
    orders,
    role,
    activeDealerId,
    dealerInvoices,
    openDealerSwitcherModal,
    isAdminAuthenticated,
    setIsAdminAuthModalOpen,
  } = useApp();

  const [isBulkExportModalOpen, setIsBulkExportModalOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Invoice' | 'Payment' | 'Credit Note' | 'Adjustment'>('All');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'this_month' | 'last_30_days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  const isValidDateString = (str: string) => {
    if (!str) return true;
    const d = new Date(str);
    return !isNaN(d.getTime());
  };

  const validateDateRange = (start: string, end: string) => {
    if (start && !isValidDateString(start)) {
      setDateError('Invalid start date.');
      return false;
    }
    if (end && !isValidDateString(end)) {
      setDateError('Invalid end date.');
      return false;
    }
    if (start && end && start > end) {
      setDateError('Start date must be before or equal to end date.');
      return false;
    }
    setDateError(null);
    return true;
  };

  const handleStartDateChange = (val: string) => {
    setCustomStartDate(val);
    validateDateRange(val, customEndDate);
  };

  const handleEndDateChange = (val: string) => {
    setCustomEndDate(val);
    validateDateRange(customStartDate, val);
  };

  // Isolate dealer orders
  const dealerOrders =
    role === 'buyer'
      ? orders.filter(
          ord =>
            !ord.dealerId ||
            ord.dealerId === activeDealerId ||
            ord.dealerCode === activeDealer.dealerCode
        )
      : orders;

  // Pending GST tax invoices
  const pendingOrders = dealerOrders.filter(
    o => o.status !== 'Delivered' && o.status !== 'Cancelled'
  );
  const totalPendingTax = pendingOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      // Dealer filter: only show entries for active dealer (or generic if dealerId not populated)
      if (
        entry.dealerId &&
        entry.dealerId !== activeDealer.id &&
        entry.dealerCode !== activeDealer.dealerCode
      ) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'All') {
        if (typeFilter === 'Invoice' && entry.type !== 'Invoice') return false;
        if (typeFilter === 'Payment' && entry.type !== 'Payment') return false;
        if (typeFilter === 'Credit Note' && entry.type !== 'Credit Note') return false;
        if (
          typeFilter === 'Adjustment' &&
          entry.type !== 'Adjustment' &&
          entry.type !== 'Debit Note' &&
          entry.type !== 'Refund'
        )
          return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRef = entry.referenceNo?.toLowerCase().includes(q);
        const matchDesc = entry.particulars?.toLowerCase().includes(q);
        const matchDebit = entry.debit?.toString().includes(q);
        const matchCredit = entry.credit?.toString().includes(q);
        if (!matchRef && !matchDesc && !matchDebit && !matchCredit) return false;
      }

      // Date filter
      if (dateRangePreset === 'this_month') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (!entry.date.startsWith(currentMonth)) return false;
      } else if (dateRangePreset === 'last_30_days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
          .toISOString()
          .split('T')[0];
        if (entry.date < thirtyDaysAgo) return false;
      } else if (dateRangePreset === 'custom') {
        // Do not apply custom date filter while range has validation errors
        if (dateError) return true;
        if (customStartDate && entry.date < customStartDate) return false;
        if (customEndDate && entry.date > customEndDate) return false;
      }

      return true;
    });
  }, [ledger, activeDealer, typeFilter, searchQuery, dateRangePreset, customStartDate, customEndDate, dateError]);

  // Aging Analysis Calculations from actual dealer invoices
  const agingAnalysis = useMemo(() => {
    const today = new Date().getTime();
    let current0to30 = 0;
    let maturing31to45 = 0;
    let overdueAbove45 = 0;

    const invoices = dealerInvoices.filter(
      inv =>
        (inv.dealerId === activeDealer.id || inv.dealerCode === activeDealer.dealerCode) &&
        inv.balanceAmount > 0
    );

    invoices.forEach(inv => {
      const invTime = new Date(inv.invoiceDate).getTime();
      const ageDays = Math.max(0, Math.floor((today - invTime) / 86400000));
      const dueTime = new Date(inv.dueDate).getTime();
      const isPastDue = today > dueTime;

      if (isPastDue || ageDays > 45) {
        overdueAbove45 += inv.balanceAmount;
      } else if (ageDays > 30) {
        maturing31to45 += inv.balanceAmount;
      } else {
        current0to30 += inv.balanceAmount;
      }
    });

    return {
      current0to30: Number(current0to30.toFixed(2)),
      maturing31to45: Number(maturing31to45.toFixed(2)),
      overdueAbove45: Number(overdueAbove45.toFixed(2)),
    };
  }, [dealerInvoices, activeDealer]);

  // EXPORT HANDLERS
  const handleDownloadStatementPDF = () => {
    const periodStr =
      dateRangePreset === 'custom' && customStartDate && customEndDate
        ? `${customStartDate} to ${customEndDate}`
        : dateRangePreset === 'this_month'
        ? 'Current Month'
        : dateRangePreset === 'last_30_days'
        ? 'Last 30 Days'
        : 'Financial Year 2026-2027';
    downloadAccountStatementPDF(activeDealer, activeDealerFinancials, filteredLedger, periodStr);
  };

  const handleExportExcel = () => {
    const data = filteredLedger.map(l => ({
      'Date': l.date,
      'Reference No': l.referenceNo,
      'Transaction Type': l.type || 'Transaction',
      'Particulars': l.particulars,
      'Debit (INR)': l.debit || 0,
      'Credit (INR)': l.credit || 0,
      'Running Balance (INR)': l.balance,
    }));
    exportToExcel(`TFH_Statement_${activeDealer.dealerCode}`, 'Statement', data);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Reference No', 'Transaction Type', 'Particulars', 'Debit (INR)', 'Credit (INR)', 'Running Balance (INR)'];
    const rows = filteredLedger.map(l => [
      l.date,
      l.referenceNo,
      l.type || 'Transaction',
      l.particulars,
      l.debit || 0,
      l.credit || 0,
      l.balance,
    ]);
    exportToCSV(`TFH_Ledger_${activeDealer.dealerCode}`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24 print:p-0">
      {/* Bulk GST Invoices Export Modal */}
      <BulkInvoiceExportModal
        isOpen={isBulkExportModalOpen}
        onClose={() => setIsBulkExportModalOpen(false)}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        preselectedDealerId={activeDealer.id}
      />

      {/* Record Ledger Adjustment / Notes Modal */}
      <RecordLedgerAdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        preselectedDealerId={activeDealer.id}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Ledger & Financial Statements
          </h1>
          <p className="text-xs text-[#766A57]">
            Audited account statement, commercial invoices, payments, and credit facility
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Record Payment Button */}
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#5F6B4A] hover:bg-[#4E593D] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Record payment received from dealer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          {/* Admin Adjustment Note Button */}
          {role === 'admin' && (
            <button
              onClick={() => setIsAdjustmentOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#F3EBDA] hover:bg-[#E7DAC0] border border-[#DACBAA] text-[#2C2417] text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Issue Credit Note / Debit Note / Ledger Adjustment"
            >
              <PlusCircle className="w-4 h-4 text-[#8B5A3C]" />
              <span>Credit / Debit Note</span>
            </button>
          )}

          {/* BULK DOWNLOAD / EXPORT GST INVOICES BUTTON */}
          <button
            onClick={() => setIsBulkExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export all pending GST invoices for a date range into a single editable PDF"
          >
            <FileText className="w-4 h-4 text-[#DACBAA]" />
            <span>Bulk Invoices (PDF)</span>
            <span className="bg-[#5F6B4A] text-[10px] text-white font-mono px-1.5 py-0.2 rounded-full ml-1">
              {pendingOrders.length}
            </span>
          </button>

          {/* REAL STATEMENT PDF EXPORT */}
          <button
            onClick={handleDownloadStatementPDF}
            className="px-3 py-2 rounded-xl bg-[#2C2417] hover:bg-[#3D3222] text-[#FBF7EE] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Download full Statement of Account as PDF"
          >
            <Download className="w-4 h-4 text-[#DACBAA]" />
            <span>Statement PDF</span>
          </button>

          {/* REAL EXCEL EXPORT */}
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-[#E3E7D8] hover:bg-[#D4DDD0] text-[#5F6B4A] text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Export full ledger statement to Excel (.xls)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>

          {/* REAL CSV EXPORT */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-[#8B5A3C]" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-[#F3EBDA] hover:bg-[#E7DAC0] border border-[#DACBAA] text-[#2C2417] text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Print statement"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ADMIN DEALER SELECTOR (If Admin role) */}
      {role === 'admin' && (
        <div className="bg-[#FAF5EC] border border-[#DACBAA] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#8B5A3C]" />
            <span className="font-bold text-[#2C2417]">Viewing Ledger for Dealer:</span>
            <select
              value={activeDealer.id}
              onChange={e => setActiveDealer(e.target.value)}
              className="bg-white border border-[#DACBAA] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#2C2417]"
            >
              {dealers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.companyName} ({d.dealerCode} · {d.city})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#766A57]">
            <span>Total Dealers: <strong>{dealers.length}</strong></span>
            <button
              onClick={openDealerSwitcherModal}
              className="px-2.5 py-1 rounded bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] font-semibold transition-colors"
            >
              Switch Hub
            </button>
          </div>
        </div>
      )}

      {/* Printable Statement Header */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-4 print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-[#DACBAA]/60 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B5A3C] tracking-wider">
              Account Statement for Dealer
            </span>
            <h2 className="font-display font-bold text-xl text-[#2C2417]">
              {activeDealer.companyName}
            </h2>
            <p className="text-xs text-[#766A57]">
              Dealer Code: <strong className="font-mono text-[#2C2417]">{activeDealer.dealerCode}</strong> · GSTIN: <strong className="font-mono text-[#2C2417]">{activeDealer.gstin || 'Unregistered'}</strong>
            </p>
            <p className="text-xs text-[#766A57]">
              Depot: {activeDealer.depotCode} · Contact: {activeDealer.contactPerson} ({activeDealer.contactPhone || activeDealer.phone})
            </p>
            <p className="text-xs text-[#766A57]">
              Address: {activeDealer.addressLine1}, {activeDealer.city}, {activeDealer.state} - {activeDealer.pincode}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-[#766A57] space-y-1">
            <p className="font-bold text-[#2C2417]">{FAB_HOUSE_CONTACT.businessName}</p>
            <p>Owner: {FAB_HOUSE_CONTACT.ownerName} ({FAB_HOUSE_CONTACT.whatsappDisplay})</p>
            <p>Email: {FAB_HOUSE_CONTACT.email}</p>
            <p>Statement Date: <strong>{new Date().toISOString().split('T')[0]}</strong></p>
            <p>
              Credit Terms: <strong>{activeDealer.creditTermsLabel || `${activeDealer.creditPeriodDays} Days`}</strong>
            </p>
          </div>
        </div>

        {/* 4 Financial KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[11px]">Approved Credit Limit</span>
            <p className="font-display font-bold text-base text-[#2C2417] mt-0.5">
              ₹{(activeDealerFinancials.approvedCreditLimit ?? activeDealerFinancials.creditLimit ?? 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3 bg-[#E7DAC0] rounded-xl border border-[#DACBAA]">
            <span className="text-[#766A57] block text-[11px]">Current Net Outstanding</span>
            <p className="font-display font-bold text-base text-[#8B5A3C] mt-0.5">
              ₹{(activeDealerFinancials.netOutstanding || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3 bg-[#E3E7D8] rounded-xl border border-[#5F6B4A]/30">
            <span className="text-[#5F6B4A] block text-[11px]">Available Credit Headroom</span>
            <p className="font-display font-bold text-base text-[#5F6B4A] mt-0.5">
              ₹{(activeDealerFinancials.availableCredit || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3 bg-[#9C4630]/10 rounded-xl border border-[#9C4630]/30">
            <span className="text-[#9C4630] block text-[11px] font-semibold">Overdue Balance</span>
            <p className="font-display font-bold text-base text-[#9C4630] mt-0.5">
              ₹{(activeDealerFinancials.overdueAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-[#FAF5EC] border border-[#DACBAA] rounded-2xl p-4 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Reference No, Particulars, or Amount..."
              className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-[#DACBAA] text-xs text-[#2C2417] focus:outline-none focus:ring-1 focus:ring-[#8B5A3C]"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['All', 'Invoice', 'Payment', 'Credit Note', 'Adjustment'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  typeFilter === type
                    ? 'bg-[#8B5A3C] text-white shadow-xs'
                    : 'bg-white text-[#766A57] border border-[#DACBAA] hover:bg-[#F3EBDA]'
                }`}
              >
                {type === 'All' ? 'All Transactions' : `${type}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#DACBAA]/40 text-xs">
          <span className="text-[#766A57] font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#8B5A3C]" />
            <span>Date Filter:</span>
          </span>

          <button
            onClick={() => setDateRangePreset('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              dateRangePreset === 'all'
                ? 'bg-[#2C2417] text-white font-bold'
                : 'bg-white border border-[#DACBAA] text-[#766A57] hover:bg-[#F3EBDA]'
            }`}
          >
            All History
          </button>
          <button
            onClick={() => setDateRangePreset('this_month')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              dateRangePreset === 'this_month'
                ? 'bg-[#2C2417] text-white font-bold'
                : 'bg-white border border-[#DACBAA] text-[#766A57] hover:bg-[#F3EBDA]'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRangePreset('last_30_days')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              dateRangePreset === 'last_30_days'
                ? 'bg-[#2C2417] text-white font-bold'
                : 'bg-white border border-[#DACBAA] text-[#766A57] hover:bg-[#F3EBDA]'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRangePreset('custom')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              dateRangePreset === 'custom'
                ? 'bg-[#2C2417] text-white font-bold'
                : 'bg-white border border-[#DACBAA] text-[#766A57] hover:bg-[#F3EBDA]'
            }`}
          >
            Custom Dates
          </button>

          {dateRangePreset === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 ml-auto">
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => handleStartDateChange(e.target.value)}
                  className="bg-white border border-[#DACBAA] px-2 py-0.5 rounded text-xs text-[#2C2417]"
                />
                <span className="text-[#766A57]">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => handleEndDateChange(e.target.value)}
                  className="bg-white border border-[#DACBAA] px-2 py-0.5 rounded text-xs text-[#2C2417]"
                />
              </div>
              {dateError && (
                <span className="text-[11px] text-[#9C4630] font-semibold">{dateError}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LEDGER TRANSACTIONS TABLE */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-[#2C2417]">
            Statement of Account (Running Ledger)
          </h3>
          <div className="flex items-center gap-3 text-xs text-[#766A57]">
            <span>Showing <strong>{filteredLedger.length}</strong> entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DACBAA] text-[#766A57] bg-[#F3EBDA]/60">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-3">Reference No</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-4">Particulars / Description</th>
                <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
                <th className="py-2.5 px-4 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DACBAA]/40 text-[#2C2417]">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No ledger entries match the current search or date filters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(entry => {
                  const linkedOrder = orders.find(
                    o =>
                      o.invoiceNumber === entry.referenceNo ||
                      entry.referenceNo?.includes(o.id) ||
                      entry.particulars?.includes(o.id)
                  );

                  return (
                    <tr key={entry.id} className="hover:bg-[#F3EBDA]/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#766A57] whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#8B5A3C] whitespace-nowrap">
                        {linkedOrder ? (
                          <button
                            onClick={() => setInvoiceToView(linkedOrder)}
                            className="underline hover:text-[#72482E] flex items-center gap-1 text-left"
                            title="Click to view & edit GST Tax Invoice"
                          >
                            <span>{entry.referenceNo}</span>
                            <span className="text-[9px] bg-[#8B5A3C]/15 px-1 py-0.2 rounded font-sans font-bold no-underline">
                              GST
                            </span>
                          </button>
                        ) : (
                          entry.referenceNo
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            entry.type === 'Invoice'
                              ? 'bg-amber-100 text-amber-800'
                              : entry.type === 'Payment'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.type === 'Credit Note'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {entry.type || 'Entry'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#2C2417]">{entry.particulars}</p>
                        {entry.dueDate && (
                          <p className="text-[10px] text-gray-500">Due Date: {entry.dueDate}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-800">
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#5F6B4A] font-bold">
                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#2C2417]">
                        ₹{entry.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Dr
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Deposit Instructions & Dynamic Aging */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:mt-6">
        <div className="bg-[#FBF7EE] p-4.5 rounded-2xl border border-[#DACBAA] space-y-2">
          <span className="font-bold text-[#2C2417] block text-sm">
            NEFT / RTGS Bank Remittance Details:
          </span>
          <p className="text-[#766A57]">Account Name: <strong>THE FAB HOUSE</strong></p>
          <p className="text-[#766A57]">Bank: <strong>HDFC Bank Ltd, Senapati Bapat Road Branch, Pune</strong></p>
          <p className="text-[#766A57]">A/C No: <span className="font-mono text-[#2C2417] font-bold">50200084920194</span></p>
          <p className="text-[#766A57]">IFSC Code: <span className="font-mono text-[#2C2417] font-bold">HDFC0000039</span></p>
          <p className="text-[11px] text-gray-500 pt-1">
            * Please mention Dealer Code <strong>{activeDealer.dealerCode}</strong> in the payment narration.
          </p>
        </div>

        <div className="bg-[#FBF7EE] p-4.5 rounded-2xl border border-[#DACBAA] space-y-2.5">
          <span className="font-bold text-[#2C2417] block text-sm">
            Dynamic Aging Analysis (Active Receivables):
          </span>
          <div className="flex justify-between py-1 border-b border-[#DACBAA]/40 text-[#766A57]">
            <span>0 to 30 Days (Current / Within Terms):</span>
            <span className="font-mono font-bold text-[#2C2417]">
              ₹{agingAnalysis.current0to30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#DACBAA]/40 text-[#766A57]">
            <span>31 to 45 Days (Maturing Soon):</span>
            <span className="font-mono font-bold text-[#8B5A3C]">
              ₹{agingAnalysis.maturing31to45.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between py-1 text-[#9C4630] font-semibold">
            <span>&gt; 45 Days (Past Due / Overdue):</span>
            <span className="font-mono font-bold text-red-600">
              ₹{agingAnalysis.overdueAbove45.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 pt-1">
            Calculated dynamically against {activeDealer.companyName}'s unpaid commercial invoices.
          </p>
        </div>
      </div>
    </div>
  );
};
