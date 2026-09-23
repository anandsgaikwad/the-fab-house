import { Order, BusinessProfile, ComplaintTicket } from '../types';
import { FAB_HOUSE_CONTACT } from '../data/mockBusiness';

export interface EmailNotification {
  id: string;
  type: 'ORDER_CONFIRMATION' | 'DISPATCH_UPDATE' | 'CLAIM_ALERT';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'SENT' | 'PENDING';
  relatedOrderId?: string;
  mailtoUrl: string;
}

// Default owner notification target
export const DEFAULT_OWNER_EMAIL = 'bhaktikakade055@gmail.com';

/**
 * Builds standard mailto URL safely encoded for email clients
 */
export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams();
  params.append('subject', subject);
  params.append('body', body);
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`;
}

/**
 * Generates an Order Confirmation email notification to the business owner
 */
export function generateOrderConfirmationEmail(
  order: Order,
  buyer: BusinessProfile,
  ownerEmail: string = DEFAULT_OWNER_EMAIL
): EmailNotification {
  const subject = `[NEW ORDER] Order #${order.id} - ${buyer.companyName} (₹${order.grandTotal.toLocaleString('en-IN')}) - THE FAB HOUSE`;

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. SKU: ${item.sku} | ${item.catalogueName} (Shade ${item.shadeNo})\n` +
        `   Qty: ${Number(item.quantityMeters || 0).toFixed(1)} metres @ ₹${item.ratePerMeter}/m\n` +
        `   Discount: ${item.discountPercentage > 0 ? `${item.discountPercentage}% Wholesale Roll Discount` : 'Nil'}\n` +
        `   Net Taxable Value: ₹${item.totalAmount.toLocaleString('en-IN')}`
    )
    .join('\n\n');

  const body = 
`Respected Anand Gaikwad / THE FAB HOUSE Back Office,

A new commercial B2B fabric order has been submitted on THE FAB HOUSE ordering platform.

==================================================
ORDER IDENTIFICATION
==================================================
Order Reference ID: ${order.id}
Date & Time: ${new Date(order.orderDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Status: ${order.status}
Payment Terms: ${order.paymentMethod} (${order.paymentStatus})

==================================================
REGISTERED BUYER & BILLING DETAILS
==================================================
Company: ${buyer.companyName}
Dealer Code: ${buyer.dealerCode}
GSTIN / UIN: ${buyer.gstin}
Primary Contact: ${buyer.contactPerson} (${buyer.contactPhone})
Email: ${buyer.contactEmail}
Approved Credit Limit: ₹${buyer.creditLimit.toLocaleString('en-IN')}
Net Outstanding: ₹${buyer.netOutstanding.toLocaleString('en-IN')}

==================================================
SHIPPING & DISPATCH DESTINATION
==================================================
Destination Site: ${order.shippingAddress.title}
Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ''}
City / State: ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
Site Incharge: ${order.shippingAddress.contactPerson} (${order.shippingAddress.phone})
Logistics Mode: ${order.shippingMode} Transportation

==================================================
ORDERED FABRIC LINE ITEMS
==================================================
${itemsList}

==================================================
FINANCIAL SUMMARY (HSN 5407)
==================================================
Subtotal (DPL Gross): ₹${order.subtotalDpl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Total Roll Discounts: -₹${order.totalRollDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Taxable Fabric Value: ₹${order.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
GST (5% Fabric Tax - 2.5% CGST + 2.5% SGST): ₹${order.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Logistics & Handling (${order.shippingMode}): ₹${order.shippingCharge.toFixed(2)}
--------------------------------------------------
GRAND TOTAL PAYABLE: ₹${order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
--------------------------------------------------

NEXT ACTIONS REQUIRED:
1. Verify ready stock in Pune depot bays.
2. If rolls require weaving/dyeing, trigger Mill Procurement via back office.
3. Prepare electronic GST Invoice under Rule 48(4).

Sent automatically via THE FAB HOUSE Ordering Gateway.
Central Depot: ${FAB_HOUSE_CONTACT.centralDepot}
Owner: ${FAB_HOUSE_CONTACT.ownerName} (${FAB_HOUSE_CONTACT.contactPhone})`;

  const mailtoUrl = buildMailtoUrl(ownerEmail, subject, body);

  return {
    id: `email-ord-${Date.now()}`,
    type: 'ORDER_CONFIRMATION',
    recipientEmail: ownerEmail,
    recipientName: FAB_HOUSE_CONTACT.ownerName,
    subject,
    body,
    timestamp: new Date().toISOString(),
    status: 'SENT',
    relatedOrderId: order.id,
    mailtoUrl,
  };
}

/**
 * Generates a Dispatch Status Update email notification
 */
export function generateDispatchStatusEmail(
  order: Order,
  buyer: BusinessProfile,
  transporterName: string,
  docketNumber: string,
  ownerEmail: string = DEFAULT_OWNER_EMAIL
): EmailNotification {
  const subject = `[DISPATCH UPDATE] Order #${order.id} Dispatched via ${transporterName} (Docket: ${docketNumber}) - THE FAB HOUSE`;

  const body = 
`Dear ${buyer.companyName} / Anand Gaikwad,

Fabric rolls for Order #${order.id} have been officially packed, labeled, and dispatched from THE FAB HOUSE Central Depot in Pune.

==================================================
CONSIGNMENT & LOGISTICS TRACKING
==================================================
Order Reference ID: ${order.id}
Logistics Partner: ${transporterName}
Docket / Waybill / LR Number: ${docketNumber}
Dispatch Date: ${order.dispatchedDate || new Date().toISOString().split('T')[0]}
Estimated Delivery: ${order.expectedDeliveryDate || '3-4 Business Days'}
Mode of Transport: ${order.shippingMode} Transportation

==================================================
DELIVERY DESTINATION
==================================================
Delivery Site: ${order.shippingAddress.title}
Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}
Contact Person: ${order.shippingAddress.contactPerson} (${order.shippingAddress.phone})

==================================================
DISPATCHED ITEMS SUMMARY
==================================================
${order.items.map(i => `• ${i.catalogueName} (Shade ${i.shadeNo}) - ${Number(i.quantityMeters || 0).toFixed(1)} metres [SKU: ${i.sku}]`).join('\n')}

GST Tax Invoice Ref: ${order.invoiceNumber || 'Auto-generated on portal'}
Total Consignment Value: ₹${order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

RECEIVING ADVISORY:
• Please inspect roll seals upon delivery from the transporter.
• Physical piece measurements and shade matching should be completed within 48 hours of delivery.
• In case of any discrepancy or transit damage, log a claim directly on THE FAB HOUSE portal or call Anand Sachin Gaikwad at ${FAB_HOUSE_CONTACT.contactPhone}.

Warm regards,
Logistics Team
THE FAB HOUSE (Pune Central Depot)
Phone: ${FAB_HOUSE_CONTACT.contactPhone}
Email: ${FAB_HOUSE_CONTACT.email}`;

  const mailtoUrl = buildMailtoUrl(ownerEmail, subject, body);

  return {
    id: `email-disp-${Date.now()}`,
    type: 'DISPATCH_UPDATE',
    recipientEmail: ownerEmail,
    recipientName: `${FAB_HOUSE_CONTACT.ownerName} & ${buyer.companyName}`,
    subject,
    body,
    timestamp: new Date().toISOString(),
    status: 'SENT',
    relatedOrderId: order.id,
    mailtoUrl,
  };
}

/**
 * Generates a Quality Claim email notification
 */
export function generateClaimAlertEmail(
  ticket: ComplaintTicket,
  order: Order | undefined,
  buyer: BusinessProfile,
  ownerEmail: string = DEFAULT_OWNER_EMAIL
): EmailNotification {
  const subject = `[URGENT CLAIM] Ticket #${ticket.id} - Order #${ticket.orderId} (${ticket.type}) - THE FAB HOUSE`;

  const body = 
`URGENT: Discrepancy Claim Raised on THE FAB HOUSE Portal

Dealer: ${buyer.companyName} (${buyer.dealerCode})
Contact: ${buyer.contactPerson} (${buyer.contactPhone})
Order Ref: ${ticket.orderId}
Affected SKU: ${ticket.sku}
Claim Classification: ${ticket.type}
Date Logged: ${ticket.createdAt}

ISSUE DESCRIPTION:
"${ticket.description}"

RESOLUTION ACTION REQUIRED:
• Review mill batch inspection archive and cutting bay dispatch log.
• Contact dealer within 24 hours SLA at ${buyer.contactPhone}.

THE FAB HOUSE Escalation Helpline: Anand Sachin Gaikwad (${FAB_HOUSE_CONTACT.contactPhone})`;

  const mailtoUrl = buildMailtoUrl(ownerEmail, subject, body);

  return {
    id: `email-claim-${Date.now()}`,
    type: 'CLAIM_ALERT',
    recipientEmail: ownerEmail,
    recipientName: FAB_HOUSE_CONTACT.ownerName,
    subject,
    body,
    timestamp: new Date().toISOString(),
    status: 'SENT',
    relatedOrderId: ticket.orderId,
    mailtoUrl,
  };
}
