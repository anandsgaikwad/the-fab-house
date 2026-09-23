import { DealerAccount, DealerInvoice, DealerPayment, DealerFinancials } from '../types';

export const DEPOT_OPTIONS = [
  { code: 'PUN-CENTRAL', name: 'Pune Central Hub (Hadapsar)', state: 'Maharashtra', city: 'Pune' },
  { code: 'MUM-BHIWANDI', name: 'Mumbai Bhiwandi Mega Depot', state: 'Maharashtra', city: 'Mumbai' },
  { code: 'DEL-NORTH', name: 'Delhi NCR North Depot (Okhla)', state: 'Delhi', city: 'New Delhi' },
  { code: 'BLR-SOUTH', name: 'Bangalore South Hub (Peenya)', state: 'Karnataka', city: 'Bengaluru' },
  { code: 'SUR-TEXTILE', name: 'Surat Textile Park Depot', state: 'Gujarat', city: 'Surat' },
  { code: 'CHN-CENTRAL', name: 'Chennai Central Depot (Ambattur)', state: 'Tamil Nadu', city: 'Chennai' },
  { code: 'HYD-WEST', name: 'Hyderabad West Hub (Sanathnagar)', state: 'Telangana', city: 'Hyderabad' },
  { code: 'KOL-EAST', name: 'Kolkata East Depot (Dhulagarh)', state: 'West Bengal', city: 'Kolkata' },
];

/**
 * Intelligent depot assignment based on dealer city / state
 */
export function getDepotForLocation(city: string, state: string): string {
  const c = (city || '').trim().toLowerCase();
  const s = (state || '').trim().toLowerCase();

  if (c.includes('pune') || c.includes('satara') || c.includes('kolhapur') || c.includes('pimpri') || c.includes('chakan')) {
    return 'PUN-CENTRAL';
  }
  if (c.includes('mumbai') || c.includes('thane') || c.includes('bhiwandi') || c.includes('navi mumbai') || c.includes('nashik')) {
    return 'MUM-BHIWANDI';
  }
  if (
    c.includes('delhi') ||
    c.includes('noida') ||
    c.includes('gurgaon') ||
    c.includes('gurugram') ||
    c.includes('faridabad') ||
    c.includes('ghaziabad') ||
    s.includes('delhi') ||
    s.includes('haryana') ||
    s.includes('punjab')
  ) {
    return 'DEL-NORTH';
  }
  if (c.includes('bangalore') || c.includes('bengaluru') || c.includes('mysore') || s.includes('karnataka')) {
    return 'BLR-SOUTH';
  }
  if (c.includes('surat') || c.includes('ahmedabad') || c.includes('vadodara') || c.includes('rajkot') || s.includes('gujarat')) {
    return 'SUR-TEXTILE';
  }
  if (c.includes('chennai') || c.includes('coimbatore') || c.includes('madurai') || s.includes('tamil nadu')) {
    return 'CHN-CENTRAL';
  }
  if (c.includes('hyderabad') || c.includes('secunderabad') || s.includes('telangana') || s.includes('andhra')) {
    return 'HYD-WEST';
  }
  if (c.includes('kolkata') || c.includes('howrah') || s.includes('bengal') || s.includes('odisha') || s.includes('assam')) {
    return 'KOL-EAST';
  }

  // If Maharashtra default to PUN-CENTRAL
  if (s.includes('maharashtra')) {
    return 'PUN-CENTRAL';
  }

  return 'PUN-CENTRAL';
}

/**
 * Generate a unique 10-digit random Dealer / Business Code (e.g. 0000596919)
 */
export function generateUniqueDealerCode(existingCodes: string[] = []): string {
  let code = '';
  let attempts = 0;
  do {
    // 0000 prefix followed by 6 random digits
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    code = `0000${randomSixDigits}`;
    attempts++;
  } while (existingCodes.includes(code) && attempts < 100);

  return code;
}

/**
 * Format credit terms label
 */
export function formatCreditTerms(days: number): string {
  if (!days || days <= 0) return 'Immediate Advance / Pre-paid';
  return `Regular ${days} Days Credit`;
}

/**
 * Calculate dynamic overdue, due in 7 days, and net outstanding from real invoices and payments
 */
export function calculateDealerFinancials(
  dealer: DealerAccount,
  invoices: DealerInvoice[],
  payments: DealerPayment[] = []
): DealerFinancials {
  const dealerInvoices = invoices.filter(inv => inv.dealerId === dealer.id || inv.dealerCode === dealer.dealerCode);
  const dealerPayments = payments.filter(p => p.dealerId === dealer.id || p.dealerCode === dealer.dealerCode);

  // Today reference (supports current date in real-time)
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const sevenDaysLater = new Date(now.getTime() + 7 * 86400000);
  sevenDaysLater.setHours(23, 59, 59, 999);

  let totalBilled = 0;
  let totalPaid = dealerPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  let netOutstanding = 0;
  let overdueAmount = 0;
  let dueIn7Days = 0;
  let dueAfter7Days = 0;
  let unpaidCount = 0;
  let overdueCount = 0;

  dealerInvoices.forEach(inv => {
    const total = Number(inv.totalAmount) || 0;
    const paid = Number(inv.paidAmount) || 0;
    const balance = Math.max(0, Number(inv.balanceAmount) || total - paid);

    totalBilled += total;

    if (balance > 0) {
      unpaidCount++;
      netOutstanding += balance;

      // Parse due date
      const dueDate = new Date(inv.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate.getTime() < now.getTime()) {
        // Due date has passed! Overdue!
        overdueAmount += balance;
        overdueCount++;
      } else if (dueDate.getTime() <= sevenDaysLater.getTime()) {
        // Due within 7 days!
        dueIn7Days += balance;
      } else {
        // Due after 7 days
        dueAfter7Days += balance;
      }
    }
  });

  // If no detailed invoices were registered yet, fallback cleanly to dealer's recorded baseline or 0
  if (dealerInvoices.length === 0) {
    netOutstanding = Number(dealer.netOutstanding) || 0;
    overdueAmount = Number(dealer.overdueAmount) || 0;
    dueIn7Days = Number(dealer.dueIn7Days) || 0;
  }

  const creditLimit = dealer.creditFacilityEnabled ? Number(dealer.creditLimit) || 0 : 0;
  const availableCredit = dealer.creditFacilityEnabled ? Math.max(0, creditLimit - netOutstanding) : 0;
  const utilizationPercentage = creditLimit > 0 ? Math.min(100, Math.round((netOutstanding / creditLimit) * 100)) : 0;

  return {
    approvedCreditLimit: creditLimit,
    creditLimit: creditLimit,
    creditFacilityEnabled: dealer.creditFacilityEnabled,
    creditPeriodDays: dealer.creditPeriodDays || 45,
    creditTermsLabel: dealer.creditTermsLabel || formatCreditTerms(dealer.creditPeriodDays || 45),
    totalBilled: Number(totalBilled.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    netOutstanding: Number(netOutstanding.toFixed(2)),
    overdueAmount: Number(overdueAmount.toFixed(2)),
    dueIn7Days: Number(dueIn7Days.toFixed(2)),
    dueAfter7Days: Number(dueAfter7Days.toFixed(2)),
    availableCredit: Number(availableCredit.toFixed(2)),
    utilizationPercentage,
    unpaidInvoicesCount: unpaidCount,
    overdueInvoicesCount: overdueCount,
  };
}
