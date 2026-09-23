import { Order } from '../types';
import { BUSINESS_CONTACT, getWhatsAppUrl } from '../config/businessContact';

export function generateWhatsAppOrderMessage(order: Order, _customPhone?: string): string {
  const totalMeters = order.items.reduce((acc, it) => acc + it.quantityMeters, 0);
  const itemsList = order.items
    .map(
      it =>
        `• *${it.catalogueName}* (Shade ${it.shadeNo}) - ${it.quantityMeters}m @ ₹${it.netRatePerMeter.toFixed(2)}/m`
    )
    .join('\n');

  const statusText =
    order.status === 'Dispatched'
      ? `🚀 *DISPATCHED* via ${order.transporterName || 'VRL Logistics'}\n*Docket / LR No:* ${order.docketNumber || 'Under Generation'}`
      : `⏳ *Status:* ${order.status}`;

  const message = `*THE FAB HOUSE - Fabric Order Update*
---------------------------------------
*Order ID:* #${order.id}
*Date:* ${new Date(order.orderDate).toLocaleDateString('en-IN')}

${statusText}

*Items Ordered:*
${itemsList}

*Total Fabric:* ${totalMeters} Metres
*Invoice Total:* ₹${order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (GST Included)

*Consignee:* ${order.shippingAddress.title}
*Destination:* ${order.shippingAddress.city}, ${order.shippingAddress.state}

---------------------------------------
*Parent Depot:* ${BUSINESS_CONTACT.businessName} Central Depot, Surat
*Owner Contact:* ${BUSINESS_CONTACT.ownerName} (${BUSINESS_CONTACT.whatsAppDisplay})
_Thank you for your business!_`;

  return message;
}

export function openWhatsAppShare(order: Order, phone?: string): void {
  const message = generateWhatsAppOrderMessage(order, phone);
  const targetPhone = phone || BUSINESS_CONTACT.whatsAppNumber;
  const url = getWhatsAppUrl(message, targetPhone);

  window.open(url, '_blank', 'noopener,noreferrer');
}
