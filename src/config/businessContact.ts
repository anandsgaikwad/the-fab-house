/**
 * THE FAB HOUSE - Centralized Business Contact Configuration
 * 
 * IMPORTANT:
 * - This file is the SINGLE SOURCE OF TRUTH for THE FAB HOUSE business contact info.
 * - Changing the WhatsApp number or email here automatically updates all contact
 *   actions across the entire application.
 * - DO NOT confuse these business contact coordinates with Admin Authentication emails:
 *     Admin Authentication: bhaktikakade055@gmail.com, anandsg7575@gmail.com
 *     Business Contact: the.fab.house01@gmail.com
 *     Business WhatsApp: +91 9370150563
 */

export const BUSINESS_CONTACT = Object.freeze({
  businessName: 'THE FAB HOUSE',
  tagline: 'Wholesale B2B Fabricators & Mill Shading Partner',
  ownerName: 'Anand Sachin Gaikwad',

  // Centralized Business WhatsApp
  // Formatted for display: +91 9370150563
  whatsAppDisplay: '+91 9370150563',
  // Digits with country code (919370150563) for WhatsApp API links
  whatsAppNumber: '919370150563',
  // Local 10-digit number
  contactPhone: '9370150563',

  // Centralized Business Email
  businessEmail: 'the.fab.house01@gmail.com',

  // Centralized Depot & Operational Coordinates
  centralDepot: 'Depot #14, Textile Park Phase 2, Hadapsar, Pune - 411028, Maharashtra',
  gstin: '27AABCT9981Q1Z4',
  supportHours: 'Mon - Sat: 9:30 AM – 7:30 PM',
});

/**
 * Generates a clean, universally compatible WhatsApp web/mobile URL.
 * Works seamlessly across both desktop browsers and mobile devices.
 * 
 * @param customMessage Optional pre-filled text message
 * @param customPhone Optional recipient phone (defaults to THE FAB HOUSE business WhatsApp)
 */
export function getWhatsAppUrl(customMessage?: string, customPhone?: string): string {
  const targetPhone = (customPhone || BUSINESS_CONTACT.whatsAppNumber).replace(/\D/g, '');
  // Ensure country code 91 if a 10 digit Indian number was passed
  const formattedPhone = (targetPhone.length === 10 && !targetPhone.startsWith('91'))
    ? `91${targetPhone}`
    : targetPhone;

  if (customMessage) {
    const encoded = encodeURIComponent(customMessage);
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?phone=${formattedPhone}`;
}

/**
 * Directly opens WhatsApp chat with THE FAB HOUSE business number.
 * Opens in a safe, new browsing context.
 */
export function openWhatsAppChat(customMessage?: string, customPhone?: string): void {
  const url = getWhatsAppUrl(customMessage, customPhone);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
