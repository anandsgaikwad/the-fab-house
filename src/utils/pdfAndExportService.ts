import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Order,
  DealerAccount,
  BusinessProfile,
  DealerFinancials,
  LedgerEntry,
  DealerPayment,
  DealerInvoice,
  Product,
} from '../types';
import { FAB_HOUSE_CONTACT } from '../data/mockBusiness';
import { amountToIndianWords } from './indianCurrencyWords';

// Helper to determine if transaction is interstate or intrastate
export function determineGstSplit(
  buyerState: string = 'Maharashtra',
  buyerGstin: string = '27',
  gstRate: number = 5
) {
  const isIntrastate =
    buyerState.toLowerCase().includes('maharashtra') ||
    buyerGstin.trim().startsWith('27');

  if (isIntrastate) {
    const halfRate = gstRate / 2;
    return {
      isIntrastate: true,
      cgstRate: halfRate,
      sgstRate: halfRate,
      igstRate: 0,
      label: `CGST (${halfRate}%) + SGST (${halfRate}%)`,
    };
  } else {
    return {
      isIntrastate: false,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      label: `IGST (${gstRate}%)`,
    };
  }
}

/**
 * 1. Download GST Invoice PDF
 */
export function downloadGSTInvoicePDF(
  order: Order,
  buyer: DealerAccount | BusinessProfile
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const invoiceNo =
    order.invoiceNumber || `TFH/26-27/0${order.id.split('-').pop()}`;
  const invoiceDate =
    order.invoiceDate ||
    (order.orderDate
      ? order.orderDate.split('T')[0]
      : new Date().toISOString().split('T')[0]);
  const creditDays = buyer.creditPeriodDays || 45;
  const dueDate =
    order.dueDate ||
    new Date(
      new Date(invoiceDate).getTime() + creditDays * 86400000
    )
      .toISOString()
      .split('T')[0];

  const buyerState =
    order.shippingAddress?.state || buyer.state || 'Maharashtra';
  const buyerGstin = order.shippingAddress?.gstin || buyer.gstin || 'Unregistered';
  const gstSplit = determineGstSplit(
    buyerState,
    buyerGstin,
    order.gstPercentage || 5
  );

  // Top Header Banner
  doc.setFillColor(44, 36, 23); // #2C2417 Dark Coffee
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(FAB_HOUSE_CONTACT.businessName, 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(FAB_HOUSE_CONTACT.tagline, 14, 16);
  doc.text(
    `TAX INVOICE · RULE 48(4) CGST RULES · GSTIN: ${FAB_HOUSE_CONTACT.gstin}`,
    14,
    20
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GST TAX INVOICE', 196, 12, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Original for Recipient`, 196, 18, { align: 'right' });

  // Reset text color
  doc.setTextColor(44, 36, 23);

  // Invoice & Dealer Metadata Box
  doc.setFillColor(250, 245, 236);
  doc.rect(14, 28, 182, 34, 'F');
  doc.setDrawColor(218, 203, 170);
  doc.rect(14, 28, 182, 34, 'S');

  // Left Column: Supplier / Seller Details
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SUPPLIER / SELLER:', 18, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(FAB_HOUSE_CONTACT.businessName, 18, 38);
  doc.text(`Prop: ${FAB_HOUSE_CONTACT.ownerName}`, 18, 42);
  doc.text(
    `${FAB_HOUSE_CONTACT.centralDepot.slice(0, 48)}...`,
    18,
    46
  );
  doc.text(`State: Maharashtra (Code: 27)`, 18, 50);
  doc.text(
    `GSTIN: ${FAB_HOUSE_CONTACT.gstin} | WA: ${FAB_HOUSE_CONTACT.whatsappDisplay}`,
    18,
    54
  );
  doc.text(`Email: ${FAB_HOUSE_CONTACT.email}`, 18, 58);

  // Vertical Divider
  doc.line(105, 28, 105, 62);

  // Right Column: Invoice & Shipping Details
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE & DISPATCH DETAILS:', 110, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: `, 110, 38);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceNo, 135, 38);

  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date: ${invoiceDate}`, 110, 42);
  doc.text(`Order Ref: #${order.id}`, 110, 46);
  doc.text(`Due Date: ${dueDate} (${buyer.creditTermsLabel || `${creditDays} Days Credit`})`, 110, 50);
  doc.text(
    `Transporter: ${order.transporterName || 'Surface Freight (VRL/Safexpress)'}`,
    110,
    54
  );
  doc.text(
    `Docket No: ${order.docketNumber || 'Scheduled for Manifest'}`,
    110,
    58
  );

  // Buyer / Bill To & Ship To Box
  doc.setFillColor(255, 255, 255);
  doc.rect(14, 66, 182, 28, 'F');
  doc.rect(14, 66, 182, 28, 'S');

  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO (BUYER):', 18, 71);
  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'bold');
  doc.text(buyer.companyName, 18, 76);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Dealer Code: ${buyer.dealerCode} | Depot: ${buyer.depotCode}`,
    18,
    80
  );
  doc.text(
    `GSTIN: ${buyerGstin} | State: ${buyerState}`,
    18,
    84
  );
  doc.text(
    `Attn: ${buyer.contactPerson} (${buyer.contactPhone || buyer.contactEmail})`,
    18,
    88
  );

  doc.line(105, 66, 105, 94);

  doc.setFont('helvetica', 'bold');
  doc.text('SHIPPED TO (DELIVERY ADDRESS):', 110, 71);
  doc.setFont('helvetica', 'normal');
  const shipAddr = order.shippingAddress || buyer.addresses?.[0];
  doc.text(
    `${shipAddr?.title || buyer.companyName}`,
    110,
    76
  );
  doc.text(
    `${shipAddr?.addressLine1 || buyer.addressLine1}${shipAddr?.addressLine2 ? `, ${shipAddr.addressLine2}` : ''}`,
    110,
    80
  );
  doc.text(
    `${shipAddr?.city || buyer.city}, ${shipAddr?.state || buyer.state} - ${shipAddr?.pincode || buyer.pincode}`,
    110,
    84
  );
  doc.text(
    `Delivery Mode: ${order.shippingMode || 'Surface Transport'}`,
    110,
    88
  );

  // Line items table using autoTable
  const tableData = order.items.map((item, idx) => {
    const rate = Number(item.ratePerMeter) || 0;
    const qty = Number(item.quantityMeters) || 0;
    const discPct = Number(item.discountPercentage) || 0;
    const gross = rate * qty;
    const discAmount = gross * (discPct / 100);
    const taxable = gross - discAmount;

    return [
      idx + 1,
      `${item.catalogueName}\n(SKU: ${item.sku} | Shade: ${item.shadeNo})`,
      item.hsnCode || '5407',
      `${qty} m`,
      `INR ${rate.toFixed(2)}`,
      discPct > 0 ? `${discPct}% (INR ${discAmount.toFixed(2)})` : '0%',
      `INR ${taxable.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: 97,
    head: [
      [
        '#',
        'Fabric Description / SKU',
        'HSN',
        'Qty (Mtrs)',
        'DPL Rate (INR)',
        'Discount',
        'Taxable Value (INR)',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 90, 60], // #8B5A3C Warm Terracotta
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [44, 36, 23],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 58 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 22 },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', cellWidth: 26 },
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate Tax Summary
  const finalY = (doc as any).lastAutoTable.finalY + 4;
  const taxable = order.taxableAmount;
  const freight = order.shippingCharge || 0;
  const grandTotal = order.grandTotal;

  // Amount in Words
  const amountWords = amountToIndianWords(grandTotal);

  // Summary box
  doc.setFillColor(250, 245, 236);
  doc.rect(14, finalY, 110, 48, 'F');
  doc.rect(14, finalY, 110, 48, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AMOUNT IN WORDS (INR):', 18, finalY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(doc.splitTextToSize(amountWords, 102), 18, finalY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BANK REMITTANCE & NEFT DETAILS:', 18, finalY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Bank: HDFC Bank Ltd, Senapati Bapat Road, Pune', 18, finalY + 27);
  doc.text('A/C Name: THE FAB HOUSE | A/C No: 50200084920194', 18, finalY + 31);
  doc.text('IFSC Code: HDFC0000039 | Branch Code: 0039', 18, finalY + 35);
  doc.text(`Payment Terms: ${buyer.creditTermsLabel || '45 Days Credit'}`, 18, finalY + 39);
  doc.text(`Payment Status: ${order.paymentStatus} (${order.paymentMethod})`, 18, finalY + 43);

  // Right Totals Table
  const rightX = 128;
  const rightWidth = 68;
  doc.setFillColor(255, 255, 255);
  doc.rect(rightX, finalY, rightWidth, 48, 'F');
  doc.rect(rightX, finalY, rightWidth, 48, 'S');

  doc.setFontSize(8);
  doc.text('Gross Subtotal:', rightX + 4, finalY + 6);
  doc.text(`INR ${order.subtotalDpl.toFixed(2)}`, rightX + rightWidth - 4, finalY + 6, {
    align: 'right',
  });

  if (order.totalRollDiscount > 0) {
    doc.setTextColor(95, 107, 74);
    doc.text('Roll Discount:', rightX + 4, finalY + 12);
    doc.text(
      `- INR ${order.totalRollDiscount.toFixed(2)}`,
      rightX + rightWidth - 4,
      finalY + 12,
      { align: 'right' }
    );
    doc.setTextColor(44, 36, 23);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Taxable Value:', rightX + 4, finalY + 18);
  doc.text(`INR ${taxable.toFixed(2)}`, rightX + rightWidth - 4, finalY + 18, {
    align: 'right',
  });
  doc.setFont('helvetica', 'normal');

  let taxY = finalY + 24;
  if (gstSplit.isIntrastate) {
    const cgstVal = taxable * (gstSplit.cgstRate / 100);
    const sgstVal = taxable * (gstSplit.sgstRate / 100);

    doc.text(`CGST (${gstSplit.cgstRate}%):`, rightX + 4, taxY);
    doc.text(`INR ${cgstVal.toFixed(2)}`, rightX + rightWidth - 4, taxY, {
      align: 'right',
    });

    taxY += 5;
    doc.text(`SGST (${gstSplit.sgstRate}%):`, rightX + 4, taxY);
    doc.text(`INR ${sgstVal.toFixed(2)}`, rightX + rightWidth - 4, taxY, {
      align: 'right',
    });
  } else {
    const igstVal = taxable * (gstSplit.igstRate / 100);
    doc.text(`IGST (${gstSplit.igstRate}%):`, rightX + 4, taxY);
    doc.text(`INR ${igstVal.toFixed(2)}`, rightX + rightWidth - 4, taxY, {
      align: 'right',
    });
  }

  taxY += 5;
  doc.text('Freight & Handling:', rightX + 4, taxY);
  doc.text(`INR ${freight.toFixed(2)}`, rightX + rightWidth - 4, taxY, {
    align: 'right',
  });

  // Grand Total highlight row
  doc.setFillColor(243, 235, 218);
  doc.rect(rightX, finalY + 38, rightWidth, 10, 'F');
  doc.rect(rightX, finalY + 38, rightWidth, 10, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(139, 90, 60);
  doc.text('GRAND TOTAL:', rightX + 4, finalY + 44);
  doc.text(
    `INR ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    rightX + rightWidth - 4,
    finalY + 44,
    { align: 'right' }
  );

  // Footer Declaration & Signature
  const footerY = finalY + 54;
  doc.setTextColor(118, 106, 87);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'DECLARATION: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
    14,
    footerY
  );
  doc.text(
    'Subject to Pune Jurisdiction. Cut goods or processed rolls cannot be returned. Claims must be made within 48 hours.',
    14,
    footerY + 4
  );

  doc.setTextColor(44, 36, 23);
  doc.setFont('helvetica', 'bold');
  doc.text('For THE FAB HOUSE', 196, footerY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', 196, footerY + 12, { align: 'right' });

  // Save the real PDF
  const sanitizedInv = invoiceNo.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`GST_Invoice_${sanitizedInv}_${buyer.dealerCode}.pdf`);
}

/**
 * 2. Download Account Statement & Ledger PDF
 */
export function downloadAccountStatementPDF(
  dealer: DealerAccount,
  financials: DealerFinancials,
  ledgerEntries: LedgerEntry[],
  period: string = 'Financial Year 2026-2027'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top Bar
  doc.setFillColor(44, 36, 23);
  doc.rect(0, 0, 210, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(FAB_HOUSE_CONTACT.businessName, 14, 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `ACCOUNT STATEMENT & FINANCIAL LEDGER · ${FAB_HOUSE_CONTACT.gstin}`,
    14,
    15
  );
  doc.text(
    `Generated On: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`,
    14,
    19
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('STATEMENT OF ACCOUNT', 196, 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${period}`, 196, 18, { align: 'right' });

  // Dealer Header Card
  doc.setTextColor(44, 36, 23);
  doc.setFillColor(250, 245, 236);
  doc.rect(14, 26, 182, 28, 'F');
  doc.setDrawColor(218, 203, 170);
  doc.rect(14, 26, 182, 28, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DEALER / ACCOUNT DETAILS:', 18, 31);
  doc.setFontSize(10);
  doc.text(dealer.companyName, 18, 36);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Dealer Code: ${dealer.dealerCode} | Territory: ${dealer.territoryCode} | Depot: ${dealer.depotCode}`,
    18,
    41
  );
  doc.text(
    `GSTIN: ${dealer.gstin || 'Unregistered'} | State: ${dealer.state}`,
    18,
    45
  );
  doc.text(
    `Contact: ${dealer.contactPerson} (${dealer.contactPhone || dealer.contactEmail})`,
    18,
    49
  );

  // Financial Summary Cards
  const kpiY = 58;
  const colW = 43;

  // Card 1: Credit Limit
  doc.setFillColor(243, 235, 218);
  doc.rect(14, kpiY, colW, 18, 'F');
  doc.rect(14, kpiY, colW, 18, 'S');
  doc.setFontSize(7);
  doc.text('Approved Credit Limit', 17, kpiY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `INR ${(financials.approvedCreditLimit || 0).toLocaleString('en-IN')}`,
    17,
    kpiY + 11
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(financials.creditTermsLabel, 17, kpiY + 15);

  // Card 2: Net Outstanding
  doc.setFillColor(231, 218, 192);
  doc.rect(14 + colW + 3, kpiY, colW, 18, 'F');
  doc.rect(14 + colW + 3, kpiY, colW, 18, 'S');
  doc.setFontSize(7);
  doc.text('Net Outstanding', 17 + colW + 3, kpiY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `INR ${(financials.netOutstanding || 0).toLocaleString('en-IN')}`,
    17 + colW + 3,
    kpiY + 11
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    `Utilization: ${financials.utilizationPercentage || 0}%`,
    17 + colW + 3,
    kpiY + 15
  );

  // Card 3: Available Credit
  doc.setFillColor(227, 231, 216);
  doc.rect(14 + (colW + 3) * 2, kpiY, colW, 18, 'F');
  doc.rect(14 + (colW + 3) * 2, kpiY, colW, 18, 'S');
  doc.setFontSize(7);
  doc.text('Available Headroom', 17 + (colW + 3) * 2, kpiY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `INR ${(financials.availableCredit || 0).toLocaleString('en-IN')}`,
    17 + (colW + 3) * 2,
    kpiY + 11
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Real-time Headroom', 17 + (colW + 3) * 2, kpiY + 15);

  // Card 4: Overdue
  const overdueBg = financials.overdueAmount > 0 ? [253, 237, 234] : [243, 235, 218];
  doc.setFillColor(overdueBg[0], overdueBg[1], overdueBg[2]);
  doc.rect(14 + (colW + 3) * 3, kpiY, colW, 18, 'F');
  doc.rect(14 + (colW + 3) * 3, kpiY, colW, 18, 'S');
  doc.setFontSize(7);
  doc.text('Overdue Amount', 17 + (colW + 3) * 3, kpiY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  if (financials.overdueAmount > 0) {
    doc.setTextColor(156, 70, 48);
  }
  doc.text(
    `INR ${(financials.overdueAmount || 0).toLocaleString('en-IN')}`,
    17 + (colW + 3) * 3,
    kpiY + 11
  );
  doc.setTextColor(44, 36, 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    financials.overdueAmount > 0
      ? `${financials.overdueInvoicesCount} Overdue Invoices`
      : 'All Invoices in Good Standing',
    17 + (colW + 3) * 3,
    kpiY + 15
  );

  // Table of transactions
  const rows = ledgerEntries.map(e => [
    e.date,
    (e as any).type || (e.debit > 0 ? 'Invoice' : 'Payment'),
    e.referenceNo,
    e.particulars,
    e.debit > 0 ? `INR ${e.debit.toLocaleString('en-IN')}` : '—',
    e.credit > 0 ? `INR ${e.credit.toLocaleString('en-IN')}` : '—',
    `INR ${e.balance.toLocaleString('en-IN')} Dr`,
  ]);

  autoTable(doc, {
    startY: 81,
    head: [
      [
        'Date',
        'Type',
        'Reference No',
        'Particulars / Description',
        'Debit (Dr)',
        'Credit (Cr)',
        'Balance',
      ],
    ],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [139, 90, 60],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [44, 36, 23],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 26 },
      3: { cellWidth: 54 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'right', cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(7.5);
  doc.setTextColor(118, 106, 87);
  doc.text(
    'This is a computer-generated financial statement and requires no manual stamp. Remittances should be made directly to HDFC Bank A/C 50200084920194 (IFSC: HDFC0000039).',
    14,
    finalY
  );

  doc.save(`Account_Statement_${dealer.dealerCode}_${period.replace(/\s+/g, '_')}.pdf`);
}

/**
 * 3. Download Payment Receipt PDF
 */
export function downloadPaymentReceiptPDF(
  payment: DealerPayment,
  dealer: DealerAccount,
  appliedInvoices: DealerInvoice[] = []
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(44, 36, 23);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(FAB_HOUSE_CONTACT.businessName, 14, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL B2B PAYMENT RECEIPT & SETTLEMENT ADVICE', 14, 16);
  doc.text(`GSTIN: ${FAB_HOUSE_CONTACT.gstin} · Pune Central Depot`, 14, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PAYMENT RECEIPT', 196, 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: REC-${payment.id.split('-').pop()}`, 196, 18, {
    align: 'right',
  });

  // Receipt Details Card
  doc.setTextColor(44, 36, 23);
  doc.setFillColor(250, 245, 236);
  doc.rect(14, 30, 182, 45, 'F');
  doc.setDrawColor(218, 203, 170);
  doc.rect(14, 30, 182, 45, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT PARTICULARS:', 18, 36);

  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Date: ${payment.paymentDate}`, 18, 42);
  doc.text(`Received From: `, 18, 47);
  doc.setFont('helvetica', 'bold');
  doc.text(dealer.companyName, 44, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dealer Code: ${dealer.dealerCode} | GSTIN: ${dealer.gstin || 'Unregistered'}`, 18, 52);
  doc.text(`Mode of Payment: ${payment.paymentMode}`, 18, 57);
  doc.text(`Bank Ref / UTR / Cheque No: ${payment.referenceNo}`, 18, 62);
  doc.text(`Particulars: ${payment.particulars}`, 18, 67);

  // Big Amount Box
  doc.setFillColor(231, 218, 192);
  doc.rect(125, 36, 65, 33, 'F');
  doc.rect(125, 36, 65, 33, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AMOUNT RECEIVED:', 130, 43);
  doc.setFontSize(14);
  doc.setTextColor(139, 90, 60);
  doc.text(
    `INR ${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    130,
    52
  );
  doc.setTextColor(44, 36, 23);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const words = amountToIndianWords(Number(payment.amount));
  doc.text(doc.splitTextToSize(words, 58), 130, 58);

  // Invoices Settled / Applied Section
  if (appliedInvoices && appliedInvoices.length > 0) {
    const invData = appliedInvoices.map((inv, i) => [
      i + 1,
      inv.invoiceNumber,
      inv.invoiceDate,
      `INR ${inv.totalAmount.toLocaleString('en-IN')}`,
      `INR ${inv.paidAmount.toLocaleString('en-IN')}`,
      `INR ${inv.balanceAmount.toLocaleString('en-IN')}`,
      inv.status,
    ]);

    autoTable(doc, {
      startY: 80,
      head: [
        [
          '#',
          'Invoice Number',
          'Invoice Date',
          'Total Bill',
          'Amount Paid',
          'Balance Remaining',
          'Status',
        ],
      ],
      body: invData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 90, 60],
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
      },
    });
  }

  const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 12 : 90;

  doc.setFontSize(7.5);
  doc.setTextColor(118, 106, 87);
  doc.text(
    'Received with thanks. Payments subject to bank realization. This voucher serves as official accounting credit entry.',
    14,
    finalY
  );

  doc.setTextColor(44, 36, 23);
  doc.setFont('helvetica', 'bold');
  doc.text('For THE FAB HOUSE', 196, finalY + 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Cashier / Accountant', 196, finalY + 20, {
    align: 'right',
  });

  doc.save(`Payment_Receipt_${payment.referenceNo.replace(/[^a-zA-Z0-9_-]/g, '_')}_${dealer.dealerCode}.pdf`);
}

/**
 * 4. Export any data to Excel (.xlsx) using SheetJS
 */
export function exportToExcel(
  fileName: string,
  sheetName: string,
  data: Record<string, any>[]
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `${fileName.replace(/\.xlsx$/i, '')}.xlsx`);
}

/**
 * 5. Export any table data to CSV (.csv)
 */
export function exportToCSV(
  fileName: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          const str = String(cell ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${fileName.replace(/\.csv$/i, '')}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 6. Generic tabular report PDF generator
 */
export function downloadGenericReportPDF(
  reportTitle: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  fileName: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Top bar
  doc.setFillColor(44, 36, 23);
  doc.rect(0, 0, 297, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(FAB_HOUSE_CONTACT.businessName, 14, 9);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `B2B MANAGEMENT REPORT · GSTIN: ${FAB_HOUSE_CONTACT.gstin}`,
    14,
    14
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(reportTitle.toUpperCase(), 283, 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 283, 15, { align: 'right' });

  autoTable(doc, {
    startY: 25,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 90, 60],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [44, 36, 23],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(7);
  doc.setTextColor(118, 106, 87);
  doc.text(
    `Total records: ${rows.length} | Generated: ${new Date().toLocaleString('en-IN')} | THE FAB HOUSE Back-Office`,
    14,
    finalY
  );

  doc.save(`${fileName.replace(/\.pdf$/i, '')}.pdf`);
}
