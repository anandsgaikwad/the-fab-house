export type FabricCategory = 'Blackout' | 'Dimout' | 'Solar Shading' | 'Curtains';

export interface StockBucket {
  range: 'Less than 5m' | '5m to 15m' | '15m to 30m' | 'More than 30m';
  quantityMeters: number;
  piecesCount: number;
}

export interface Product {
  id: string;
  serialNo: number;
  sku: string; // Fabric Code / SKU e.g. AMH0011
  catalogueName: string; // Fabric Name e.g. Onyx Dimout 801
  shadeNo: string; // e.g. 801
  category: FabricCategory; // Category: Blackout, Dimout, Solar Shading, Curtains
  collection: string; // e.g. Onyx Dimout, Chelmsford, Solis View
  colorName: string; // Color e.g. Slate Grey, Warm Taupe, Sand Dune
  colorHex: string; // approximate color hex for swatch rendering
  textureType: 'woven' | 'dimout' | 'solar' | 'curtain';
  gsm: string; // GSM e.g. "265+2%"
  width: string; // Width e.g. "54\"" or "118\""
  composition: string; // Material / Composition e.g. "100% Polyester"
  dpl: number; // Dealer Price per metre in INR (e.g. 704)
  dealerPriceList?: number; // alias for dpl
  mrp: number; // Reference Retail Price per metre in INR (e.g. 1295)
  rollDiscountThreshold: number; // e.g. 50 meters
  rollDiscountPercentage: number; // e.g. 10%
  stockBuckets: StockBucket[];
  totalStockMeters: number; // Stock / Available Quantity in metres
  totalPieces: number;
  defaultShippingMode: 'Surface' | 'Express';
  hsnCode: string; // 5407 for woven polyester fabrics
  gstRate?: number; // 5%, 12%, 18% (defaults to 5)

  // Extended Admin Fabric Management Fields
  fabricType?: string; // Fabric Type: Dimout, Blackout, Sheer, Drapery, Roller Screen, Velvet, Jacquard, etc.
  patternDesign?: string; // Pattern / Design: Plain, Textured Slub, Jacquard, Geometric, Stripe, etc.
  supplier?: string; // Supplier / Mill e.g. "The Fab House Surat Mill", "Vardhman", etc.
  description?: string; // Description & performance specs
  shadeDescription?: string; // alias for description
  sampleImages?: string[]; // Multiple sample photos (Data URLs or hosted links)
  primarySampleImage?: string; // Main display sample image
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantityMeters: number;
  appliedDiscountPercentage: number;
  lineDplTotal: number;
  lineMrpTotal: number;
  shippingMode: 'Surface' | 'Express';
}

export interface BusinessAddress {
  id: string;
  title: string; // e.g. "Main Fabrication Unit & Warehouse"
  contactPerson: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  isDefault: boolean;
}

export type DealerApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'blocked';

export interface DealerPermissions {
  canPurchaseProducts: boolean;
  canUseCreditFacility: boolean;
  canViewOutstanding: boolean;
  canViewInvoices: boolean;
  canDownloadInvoices: boolean;
  canViewPaymentHistory: boolean;
  canViewOrderHistory: boolean;
  canViewCatalogue: boolean;
  canRequestQuotations: boolean;
  canRequestSamples: boolean;
}

export interface BusinessProfile {
  id: string;
  companyName: string; // "EUREKA FURNISHINGS LLP"
  dealerCode: string; // "0000596919"
  territoryCode: string; // "MH-PUN-01"
  depotCode: string; // "PUN-CENTRAL"
  contactPerson: string; // "Vikram Patil"
  contactPhone: string; // "+91 98220 14852"
  phone?: string; // alias for contactPhone
  contactEmail: string; // "orders@eurekafurnishings.in"
  gstin: string; // "27AAAFE1234F1Z8"
  pan?: string; // Permanent Account Number
  businessType: string; // "LLP" | "Private Limited" | "Partnership" | "Sole Proprietorship" | "Retail Studio" | "Contractor"
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  status: DealerApprovalStatus;
  registeredAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;

  // Credit configuration (controlled exclusively by Admin)
  creditFacilityEnabled: boolean;
  creditLimit: number; // 500000
  creditPeriodDays: number; // 45
  creditTermsLabel: string; // "Regular 45 Days Credit"
  overdueAmount: number; // Dynamically computed or fallback
  dueIn7Days: number; // Dynamically computed or fallback
  netOutstanding: number; // Dynamically computed or fallback

  // Granular Permissions (controlled exclusively by Admin)
  permissions: DealerPermissions;

  addresses: BusinessAddress[];
}

export type DealerAccount = BusinessProfile;

export interface DealerInvoice {
  id: string;
  invoiceNumber: string; // e.g. "TFH/26-27/0388"
  orderId?: string;
  dealerId: string;
  dealerCode: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD (calculated from invoiceDate + creditPeriodDays)
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';
  itemsSummary: string;
  paymentMethod?: string;
}

export interface DealerPayment {
  id: string;
  dealerId: string;
  dealerCode: string;
  paymentDate: string;
  amount: number;
  paymentMode: 'NEFT' | 'RTGS' | 'Cheque' | 'UPI' | 'Net Banking' | 'Adjustment';
  referenceNo: string;
  particulars: string;
  notes?: string;
  appliedToInvoices?: string[];
}

export interface DealerFinancials {
  approvedCreditLimit: number;
  creditLimit: number;
  creditFacilityEnabled: boolean;
  creditPeriodDays: number;
  creditTermsLabel: string;
  totalBilled: number;
  totalPaid: number;
  netOutstanding: number;
  overdueAmount: number;
  dueIn7Days: number;
  dueAfter7Days: number;
  availableCredit: number;
  utilizationPercentage: number;
  unpaidInvoicesCount: number;
  overdueInvoicesCount: number;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Procurement in Progress'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  sku: string;
  catalogueName: string;
  shadeNo: string;
  category: FabricCategory;
  quantityMeters: number;
  ratePerMeter: number;
  mrpPerMeter: number;
  discountPercentage: number;
  netRatePerMeter: number;
  totalAmount: number;
  hsnCode: string;
}

export interface Order {
  id: string; // e.g. "TFH-2026-0891"
  dealerId?: string; // e.g. "dealer-0000596919"
  dealerCode?: string; // e.g. "0000596919"
  orderDate: string; // ISO date string
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: BusinessAddress;
  shippingMode: 'Surface' | 'Express';
  subtotalDpl: number;
  totalRollDiscount: number;
  taxableAmount: number;
  gstAmount: number;
  gstPercentage: 5;
  shippingCharge: number;
  grandTotal: number;
  paymentMethod: 'Credit Limit' | 'UPI' | 'Net Banking' | 'Card';
  paymentStatus: 'Paid' | 'Credit Approved' | 'Pending';
  invoiceNumber?: string; // e.g. "TFH/26-27/0412"
  invoiceDate?: string;
  dueDate?: string;
  paidAmount?: number;
  balanceAmount?: number;
  transporterName?: string; // e.g. "VRL Logistics"
  docketNumber?: string; // e.g. "VRL-PUN-982148"
  dispatchedDate?: string;
  expectedDeliveryDate?: string;
  millProcurementRaised: boolean;
  millProcurementStatus?: 'Pending' | 'Mill Order Placed' | 'Stock Received at Warehouse';
}

export interface PhysicalCatalogueDispatch {
  id: string;
  catalogueName: string; // e.g. "Onyx Dimout 800 Series Volume 1"
  catalogueCode: string; // e.g. "CAT-ONYX-2026"
  status: 'Requested' | 'Dispatched' | 'Delivered';
  invoiceNo: string;
  quantity: number;
  transporter: string;
  dispatchedDate: string;
  docketNumber: string;
  category: FabricCategory | 'Comprehensive';
}

export type LedgerTransactionType =
  | 'Invoice'
  | 'Payment'
  | 'Credit Note'
  | 'Debit Note'
  | 'Adjustment'
  | 'Refund';

export interface LedgerEntry {
  id: string;
  dealerId?: string;
  dealerCode?: string;
  date: string;
  referenceNo: string; // Invoice No or Payment Receipt No
  type: LedgerTransactionType;
  particulars: string;
  debit: number; // amounts billed/debited to dealer
  credit: number; // amounts paid/credited by dealer
  balance: number; // cumulative balance
  dueDate?: string;
  status?: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue' | 'Cleared' | 'Adjusted';
}

export interface ComplaintTicket {
  id: string;
  orderId: string;
  sku: string;
  type: 'Damaged Goods' | 'Wrong SKU Shipped' | 'Short Quantity' | 'Delayed Dispatch' | 'Color Mismatch';
  description: string;
  status: 'Open' | 'Under Investigation' | 'Credit Note Issued' | 'Resolved';
  createdAt: string;
  resolutionNote?: string;
}

export type AppUserRole = 'buyer' | 'admin' | 'mill';

export interface AdminAuthUser {
  email: string;
  name: string;
  picture?: string;
  verifiedAt: string;
  role: 'owner_admin' | 'staff';
}

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
