import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  BusinessProfile,
  PhysicalCatalogueDispatch,
  LedgerEntry,
  ComplaintTicket,
  AppUserRole,
  BusinessAddress,
  FabricCategory,
  EmailNotification,
  AdminAuthUser,
  StockBucket,
  DealerAccount,
  DealerApprovalStatus,
  DealerPermissions,
  DealerInvoice,
  DealerPayment,
  DealerFinancials,
  OrderItem,
  LedgerTransactionType,
} from '../types';
import { ALL_PRODUCTS } from '../data/mockProducts';
import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_ORDERS,
  INITIAL_CATALOGUE_DISPATCHES,
  INITIAL_LEDGER,
  INITIAL_COMPLAINTS,
  FAB_HOUSE_CONTACT,
} from '../data/mockBusiness';
import {
  INITIAL_DEALERS,
  INITIAL_DEALER_INVOICES,
  INITIAL_DEALER_PAYMENTS,
} from '../data/mockDealers';
import {
  calculateDealerFinancials,
  generateUniqueDealerCode,
  formatCreditTerms,
  getDepotForLocation,
} from '../utils/dealerFinancials';
import {
  DEFAULT_OWNER_EMAIL,
  generateOrderConfirmationEmail,
  generateDispatchStatusEmail,
  generateClaimAlertEmail,
} from '../services/emailNotificationService';
import {
  PRIMARY_OWNER_EMAIL,
  PRIMARY_OWNER_NAME,
  SECONDARY_OWNER_EMAIL,
  SECONDARY_OWNER_NAME,
  isEmailAuthorized,
  verifyAdminOnServer,
} from '../services/adminAuthService';
import { sendAdminLoginAlert } from '../services/adminNotificationService';

export type ActiveView =
  | 'dashboard'
  | 'place-order'
  | 'stock-check'
  | 'cart'
  | 'checkout'
  | 'track-orders'
  | 'admin-fulfillment'
  | 'admin-fabrics'
  | 'admin-dealers'
  | 'mill-portal'
  | 'performance'
  | 'reports'
  | 'catalogue-order'
  | 'complaints'
  | 'downloads'
  | 'feedback'
  | 'contact'
  | 'profile';

interface AppContextType {
  role: AppUserRole;
  setRole: (role: AppUserRole) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addFabric: (fabricData: Partial<Product>) => { success: boolean; product?: Product; error?: string };
  updateFabric: (fabric: Product) => { success: boolean; error?: string };
  deleteFabric: (id: string) => { success: boolean; error?: string };
  uploadFabricSample: (productId: string, sampleDataUrl: string) => { success: boolean; error?: string };
  removeFabricSample: (productId: string, index: number) => { success: boolean; error?: string };
  setPrimaryFabricSample: (productId: string, index: number) => { success: boolean; error?: string };
  importFabricsFromDataset: (imported: Partial<Product>[], mode: 'merge' | 'replace') => { count: number; message: string };
  resetFabricsToDefault: () => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: FabricCategory | 'All';
  setSelectedCategory: (cat: FabricCategory | 'All') => void;
  cart: CartItem[];
  cartCount: number;
  cartSubtotalDpl: number;
  cartTotalDiscount: number;
  cartGrandTotal: number;
  addToCart: (product: Product, quantityMeters: number, shippingMode?: 'Surface' | 'Express') => void;
  updateCartQuantity: (itemId: string, quantityMeters: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (
    address: BusinessAddress,
    shippingMode: 'Surface' | 'Express',
    paymentMethod: 'Credit Limit' | 'UPI' | 'Net Banking' | 'Card'
  ) => Order;
  adminRaiseMillProcurement: (orderId: string) => void;
  adminGenerateInvoice: (orderId: string) => string;
  adminDispatchOrder: (orderId: string, transporterName: string, docketNumber: string) => void;
  adminDeliverOrder: (orderId: string) => void;
  millUpdateStatus: (orderId: string, millStatus: 'Stock Received at Warehouse' | 'Mill Order Placed') => void;

  // Multi-Dealer Architecture
  dealers: DealerAccount[];
  activeDealerId: string;
  activeDealer: DealerAccount;
  businessProfile: BusinessProfile; // Aliased to activeDealer for 100% backwards compatibility
  activeDealerFinancials: DealerFinancials;
  getDealerFinancials: (dealerId: string) => DealerFinancials;
  registerDealer: (data: {
    companyName: string;
    businessType: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    gstin: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    depotCode?: string;
  }) => DealerAccount;
  approveDealer: (
    dealerId: string,
    creditLimit: number,
    creditPeriodDays: number,
    depotCode: string,
    permissions?: Partial<DealerPermissions>
  ) => void;
  rejectDealer: (dealerId: string, reason: string) => void;
  updateDealerStatus: (dealerId: string, status: DealerApprovalStatus, notes?: string) => void;
  updateDealerCredit: (
    dealerId: string,
    creditLimit: number,
    creditPeriodDays: number,
    creditFacilityEnabled: boolean
  ) => void;
  updateDealerPermissions: (dealerId: string, permissions: DealerPermissions) => void;
  updateDealerDepot: (dealerId: string, depotCode: string) => void;
  recordDealerPayment: (
    dealerId: string,
    amount: number,
    paymentMode: DealerPayment['paymentMode'],
    referenceNo: string,
    particulars: string,
    targetInvoiceId?: string
  ) => void;
  createDirectGSTInvoice: (invoiceData: {
    dealerId: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    items: OrderItem[];
    shippingAddress?: BusinessAddress;
    shippingMode?: 'Surface' | 'Express';
    shippingCharge?: number;
    paymentMethod?: string;
    transporterName?: string;
    docketNumber?: string;
  }) => Order;
  recordLedgerAdjustment: (data: {
    dealerId: string;
    type: LedgerTransactionType;
    referenceNo: string;
    particulars: string;
    amount: number;
    date?: string;
  }) => void;
  setActiveDealer: (dealerId: string) => void;
  dealerInvoices: DealerInvoice[];
  dealerPayments: DealerPayment[];
  isDealerSwitcherOpen: boolean;
  setIsDealerSwitcherOpen: (open: boolean) => void;
  openDealerSwitcherModal: () => void;
  closeDealerSwitcherModal: () => void;
  isDealerRegistrationOpen: boolean;
  setIsDealerRegistrationOpen: (open: boolean) => void;
  openDealerRegistrationModal: () => void;
  closeDealerRegistrationModal: () => void;

  updateBusinessAddress: (address: BusinessAddress) => void;
  addBusinessAddress: (address: Omit<BusinessAddress, 'id'>) => void;
  catalogueDispatches: PhysicalCatalogueDispatch[];
  requestCatalogue: (catalogueName: string, category: FabricCategory | 'Comprehensive', quantity: number) => void;
  ledger: LedgerEntry[];
  complaints: ComplaintTicket[];
  raiseComplaint: (orderId: string, sku: string, type: ComplaintTicket['type'], description: string) => void;
  visualizeProduct: Product | null;
  setVisualizeProduct: (product: Product | null) => void;
  invoiceToView: Order | null;
  setInvoiceToView: (order: Order | null) => void;
  updateOrder: (order: Order) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  ownerNotificationEmail: string;
  setOwnerNotificationEmail: (email: string) => void;
  emailNotifications: EmailNotification[];
  activeEmailModal: EmailNotification | null;
  setActiveEmailModal: (notification: EmailNotification | null) => void;
  sendOrderEmail: (order: Order) => EmailNotification;
  sendDispatchEmail: (order: Order, transporterName?: string, docketNumber?: string) => EmailNotification;
  adminUser: AdminAuthUser | null;
  isAdminAuthenticated: boolean;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  loginAdminWithGoogle: (
    email: string,
    name?: string,
    options?: { skipAlert?: boolean }
  ) => { success: boolean; message: string };
  logoutAdmin: () => void;
  isCalculatorModalOpen: boolean;
  setIsCalculatorModalOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRawRole] = useState<AppUserRole>('buyer');
  const [activeView, setRawActiveView] = useState<ActiveView>('dashboard');
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_fabrics_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading fabrics from localStorage', e);
    }
    return ALL_PRODUCTS;
  });

  // Sync products inventory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tfh_fabrics_inventory', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to sync fabrics to localStorage', e);
    }
  }, [products]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => products[0] || ALL_PRODUCTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('AMH0011');
  const [selectedCategory, setSelectedCategory] = useState<FabricCategory | 'All'>('All');
  const [visualizeProduct, setVisualizeProduct] = useState<Product | null>(null);
  const [invoiceToView, setInvoiceToView] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState<boolean>(false);

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tfh_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to sync wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Admin Google Authentication state: In-memory verified authenticated session
  // Do NOT rely on localStorage as proof of authorization
  const [adminUser, setAdminUser] = useState<AdminAuthUser | null>(null);

  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const isAdminAuthenticated = Boolean(adminUser && isEmailAuthorized(adminUser.email));

  const loginAdminWithGoogle = (
    email: string,
    name: string = 'Authorized Admin',
    options?: { skipAlert?: boolean }
  ): { success: boolean; message: string } => {
    const trimmed = email.trim().toLowerCase();
    if (!isEmailAuthorized(trimmed)) {
      return {
        success: false,
        message: `Unauthorized Google Account (${trimmed}). Access to THE FAB HOUSE Admin Back Office & Mill portal is strictly restricted to verified owners (${PRIMARY_OWNER_EMAIL}, ${SECONDARY_OWNER_EMAIL}).`,
      };
    }

    const verifiedName = name || (trimmed === PRIMARY_OWNER_EMAIL ? PRIMARY_OWNER_NAME : SECONDARY_OWNER_NAME);

    const user: AdminAuthUser = {
      email: trimmed,
      name: verifiedName,
      verifiedAt: new Date().toISOString(),
      role: 'owner_admin',
    };

    setAdminUser(user);
    setRawRole('admin');
    setRawActiveView('admin-fulfillment');
    showToast(`Google Sign-In verified for ${user.email}`);

    // Trigger login notification to BOTH authorized owner accounts if not already invoked by caller
    if (!options?.skipAlert) {
      sendAdminLoginAlert(user.email, user.name);
    }

    return {
      success: true,
      message: `Welcome back, ${user.name}! Admin session unlocked.`,
    };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setRawRole('buyer');
    setRawActiveView('dashboard');
    showToast('Admin session terminated. Switched to Dealer view.');
  };

  const setRole = (newRole: AppUserRole) => {
    if ((newRole === 'admin' || newRole === 'mill') && !isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Admin authentication required. Sign in with owner Google account.');
      return;
    }
    setRawRole(newRole);
  };

  const setActiveView = (newView: ActiveView) => {
    const adminViews: ActiveView[] = ['admin-fulfillment', 'admin-fabrics', 'admin-dealers', 'mill-portal'];
    if (adminViews.includes(newView) && !isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Admin authentication required to access restricted internal portals.');
      return;
    }
    setRawActiveView(newView);
  };
  const [ownerNotificationEmail, setOwnerNotificationEmail] = useState<string>(() => {
    return localStorage.getItem('tfh_owner_email') || DEFAULT_OWNER_EMAIL;
  });
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_email_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeEmailModal, setActiveEmailModal] = useState<EmailNotification | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_owner_email', ownerNotificationEmail);
    } catch (e) {
      console.warn('Failed to save owner email to localStorage', e);
    }
  }, [ownerNotificationEmail]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_email_notifications', JSON.stringify(emailNotifications));
    } catch (e) {
      console.warn('Failed to save email notifications to localStorage', e);
    }
  }, [emailNotifications]);

  // Cart state persisted
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders state persisted
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Multi-Dealer Architecture State
  const [dealers, setDealers] = useState<DealerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_dealers_directory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_DEALERS;
    } catch {
      return INITIAL_DEALERS;
    }
  });

  const [activeDealerId, setActiveDealerId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tfh_active_dealer_id');
      return saved || INITIAL_DEALERS[0].id;
    } catch {
      return INITIAL_DEALERS[0].id;
    }
  });

  const [dealerInvoices, setDealerInvoices] = useState<DealerInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_dealer_invoices');
      return saved ? JSON.parse(saved) : INITIAL_DEALER_INVOICES;
    } catch {
      return INITIAL_DEALER_INVOICES;
    }
  });

  const [dealerPayments, setDealerPayments] = useState<DealerPayment[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_dealer_payments');
      return saved ? JSON.parse(saved) : INITIAL_DEALER_PAYMENTS;
    } catch {
      return INITIAL_DEALER_PAYMENTS;
    }
  });

  const [isDealerSwitcherOpen, setIsDealerSwitcherOpen] = useState(false);
  const [isDealerRegistrationOpen, setIsDealerRegistrationOpen] = useState(false);

  // Active Dealer Reference & Computed Financials
  const activeDealer: DealerAccount =
    dealers.find(d => d.id === activeDealerId) || dealers[0] || INITIAL_DEALERS[0];

  // Business profile backwards compatibility: dynamically maps to activeDealer
  const businessProfile: BusinessProfile = activeDealer;

  // Dynamically calculated financials from real transactions, invoices, and payment data
  const activeDealerFinancials: DealerFinancials = calculateDealerFinancials(
    activeDealer,
    dealerInvoices,
    dealerPayments
  );

  const getDealerFinancials = (dealerId: string): DealerFinancials => {
    const target = dealers.find(d => d.id === dealerId) || activeDealer;
    return calculateDealerFinancials(target, dealerInvoices, dealerPayments);
  };

  // Dealer Registration
  const registerDealer = (data: {
    companyName: string;
    businessType: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    gstin: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    depotCode?: string;
  }): DealerAccount => {
    const existingCodes = dealers.map(d => d.dealerCode);
    const uniqueCode = generateUniqueDealerCode(existingCodes);
    const assignedDepot = data.depotCode || getDepotForLocation(data.city, data.state);

    const newDealer: DealerAccount = {
      id: `dealer-${uniqueCode}`,
      companyName: data.companyName,
      dealerCode: uniqueCode,
      territoryCode: `${data.state.slice(0, 2).toUpperCase()}-${data.city.slice(0, 3).toUpperCase()}-01`,
      depotCode: assignedDepot,
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      gstin: data.gstin || 'UNREGISTERED/IN-PROCESS',
      businessType: data.businessType,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      status: 'pending', // Pending Admin Approval
      registeredAt: new Date().toISOString(),
      adminNotes: 'Online business registration submitted. Pending GST & verification review.',

      creditFacilityEnabled: false,
      creditLimit: 0,
      creditPeriodDays: 30,
      creditTermsLabel: 'Pending Admin Assessment',
      overdueAmount: 0,
      dueIn7Days: 0,
      netOutstanding: 0,

      permissions: {
        canPurchaseProducts: false, // Locked until Admin approval
        canUseCreditFacility: false, // Locked until Admin approval
        canViewOutstanding: true,
        canViewInvoices: false,
        canDownloadInvoices: false,
        canViewPaymentHistory: false,
        canViewOrderHistory: false,
        canViewCatalogue: true,
        canRequestQuotations: true,
        canRequestSamples: true,
      },

      addresses: [
        {
          id: `addr-${uniqueCode}-1`,
          title: 'Registered Business Premises',
          contactPerson: data.contactPerson,
          phone: data.contactPhone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || '',
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          gstin: data.gstin || 'UNREGISTERED',
          isDefault: true,
        },
      ],
    };

    setDealers(prev => [newDealer, ...prev]);
    return newDealer;
  };

  // Admin Dealer Approval
  const approveDealer = (
    dealerId: string,
    creditLimit: number,
    creditPeriodDays: number,
    depotCode: string,
    permissions?: Partial<DealerPermissions>
  ) => {
    setDealers(prev =>
      prev.map(d => {
        if (d.id === dealerId) {
          const defaultApprovedPermissions: DealerPermissions = {
            canPurchaseProducts: true,
            canUseCreditFacility: creditLimit > 0,
            canViewOutstanding: true,
            canViewInvoices: true,
            canDownloadInvoices: true,
            canViewPaymentHistory: true,
            canViewOrderHistory: true,
            canViewCatalogue: true,
            canRequestQuotations: true,
            canRequestSamples: true,
            ...(permissions || {}),
          };

          return {
            ...d,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            depotCode,
            creditFacilityEnabled: creditLimit > 0,
            creditLimit,
            creditPeriodDays,
            creditTermsLabel: formatCreditTerms(creditPeriodDays),
            permissions: defaultApprovedPermissions,
            adminNotes: `Approved by Admin with ₹${creditLimit.toLocaleString('en-IN')} credit limit (${creditPeriodDays} days).`,
          };
        }
        return d;
      })
    );

    const target = dealers.find(d => d.id === dealerId);
    showToast(`Approved dealership for "${target?.companyName || dealerId}" with ₹${creditLimit.toLocaleString('en-IN')} limit!`);
  };

  // Admin Dealer Rejection
  const rejectDealer = (dealerId: string, reason: string) => {
    setDealers(prev =>
      prev.map(d => {
        if (d.id === dealerId) {
          return {
            ...d,
            status: 'rejected',
            rejectionReason: reason,
            creditFacilityEnabled: false,
            adminNotes: `Application rejected: ${reason}`,
          };
        }
        return d;
      })
    );

    const target = dealers.find(d => d.id === dealerId);
    showToast(`Rejected dealership for "${target?.companyName || dealerId}".`);
  };

  // Update Dealer Status
  const updateDealerStatus = (dealerId: string, status: DealerApprovalStatus, notes?: string) => {
    setDealers(prev =>
      prev.map(d => {
        if (d.id === dealerId) {
          return {
            ...d,
            status,
            adminNotes: notes !== undefined ? notes : d.adminNotes,
          };
        }
        return d;
      })
    );
  };

  // Update Dealer Credit Configuration
  const updateDealerCredit = (
    dealerId: string,
    creditLimit: number,
    creditPeriodDays: number,
    creditFacilityEnabled: boolean
  ) => {
    setDealers(prev =>
      prev.map(d => {
        if (d.id === dealerId) {
          return {
            ...d,
            creditLimit,
            creditPeriodDays,
            creditFacilityEnabled,
            creditTermsLabel: formatCreditTerms(creditPeriodDays),
            permissions: {
              ...d.permissions,
              canUseCreditFacility: creditFacilityEnabled && creditLimit > 0,
            },
          };
        }
        return d;
      })
    );
  };

  // Update Dealer Permissions
  const updateDealerPermissions = (dealerId: string, permissions: DealerPermissions) => {
    setDealers(prev =>
      prev.map(d => {
        if (d.id === dealerId) {
          return {
            ...d,
            permissions,
          };
        }
        return d;
      })
    );
  };

  // Update Dealer Depot Hub
  const updateDealerDepot = (dealerId: string, depotCode: string) => {
    setDealers(prev =>
      prev.map(d => {
        if (d.id === dealerId) {
          return {
            ...d,
            depotCode,
          };
        }
        return d;
      })
    );
  };

  // Record Payment Received from Dealer
  const recordDealerPayment = (
    dealerId: string,
    amount: number,
    paymentMode: DealerPayment['paymentMode'],
    referenceNo: string,
    particulars: string,
    targetInvoiceId?: string
  ) => {
    const targetDealer = dealers.find(d => d.id === dealerId);
    if (!targetDealer) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const newPayment: DealerPayment = {
      id: `pay-${Date.now()}`,
      dealerId: targetDealer.id,
      dealerCode: targetDealer.dealerCode,
      paymentDate: todayStr,
      amount,
      paymentMode,
      referenceNo,
      particulars,
      appliedToInvoices: targetInvoiceId && targetInvoiceId !== 'fifo' ? [targetInvoiceId] : undefined,
    };

    setDealerPayments(prev => [newPayment, ...prev]);

    // Apply payment to target invoice or oldest unpaid invoices
    let remainingPayment = amount;
    setDealerInvoices(prev => {
      // First pass: if targetInvoiceId specified, apply to that invoice
      let updated = prev;
      if (targetInvoiceId && targetInvoiceId !== 'fifo') {
        updated = updated.map(inv => {
          if (inv.id === targetInvoiceId && remainingPayment > 0 && inv.balanceAmount > 0) {
            const applied = Math.min(remainingPayment, inv.balanceAmount);
            remainingPayment -= applied;
            const newBalance = Number((inv.balanceAmount - applied).toFixed(2));
            return {
              ...inv,
              paidAmount: Number((inv.paidAmount + applied).toFixed(2)),
              balanceAmount: newBalance,
              status: newBalance <= 0 ? 'Paid' : 'Partially Paid',
            };
          }
          return inv;
        });
      }

      // Second pass: FIFO across remaining unpaid invoices for this dealer
      return updated.map(inv => {
        if (
          (inv.dealerId === targetDealer.id || inv.dealerCode === targetDealer.dealerCode) &&
          remainingPayment > 0 &&
          inv.balanceAmount > 0
        ) {
          const applied = Math.min(remainingPayment, inv.balanceAmount);
          remainingPayment -= applied;
          const newBalance = Number((inv.balanceAmount - applied).toFixed(2));
          return {
            ...inv,
            paidAmount: Number((inv.paidAmount + applied).toFixed(2)),
            balanceAmount: newBalance,
            status: newBalance <= 0 ? 'Paid' : 'Partially Paid',
          };
        }
        return inv;
      });
    });

    const fin = calculateDealerFinancials(targetDealer, dealerInvoices, [newPayment, ...dealerPayments]);

    // Add entry to General Ledger
    const newLedgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      dealerId: targetDealer.id,
      dealerCode: targetDealer.dealerCode,
      date: todayStr,
      referenceNo,
      type: 'Payment',
      particulars: `Payment Received [${paymentMode}]: ${particulars}`,
      debit: 0,
      credit: amount,
      balance: fin.netOutstanding,
      status: 'Cleared',
    };
    setLedger(prev => [newLedgerEntry, ...prev]);
  };

  // Record Credit Note, Debit Note, Adjustment or Refund
  const recordLedgerAdjustment = (data: {
    dealerId: string;
    type: LedgerTransactionType;
    referenceNo: string;
    particulars: string;
    amount: number;
    date?: string;
  }) => {
    const targetDealer = dealers.find(d => d.id === data.dealerId) || activeDealer;
    const transDate = data.date || new Date().toISOString().split('T')[0];

    let debit = 0;
    let credit = 0;

    if (data.type === 'Credit Note') {
      credit = data.amount;
    } else if (data.type === 'Debit Note') {
      debit = data.amount;
    } else if (data.type === 'Refund') {
      debit = data.amount;
    } else {
      credit = data.amount;
    }

    const currentBalance = ledger.find(l => l.dealerId === targetDealer.id || l.dealerCode === targetDealer.dealerCode)?.balance || activeDealerFinancials.netOutstanding;
    const newBalance = Math.max(0, currentBalance + debit - credit);

    const newLedgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      dealerId: targetDealer.id,
      dealerCode: targetDealer.dealerCode,
      date: transDate,
      referenceNo: data.referenceNo,
      type: data.type,
      particulars: `${data.type}: ${data.particulars}`,
      debit,
      credit,
      balance: newBalance,
      status: 'Adjusted',
    };

    setLedger(prev => [newLedgerEntry, ...prev]);

    // Also record a payment or invoice adjustment if Credit Note
    if (data.type === 'Credit Note') {
      const adjustmentPayment: DealerPayment = {
        id: `pay-cn-${Date.now()}`,
        dealerId: targetDealer.id,
        dealerCode: targetDealer.dealerCode,
        paymentDate: transDate,
        amount: data.amount,
        paymentMode: 'Adjustment',
        referenceNo: data.referenceNo,
        particulars: `Credit Note Issued: ${data.particulars}`,
      };
      setDealerPayments(prev => [adjustmentPayment, ...prev]);

      // Apply credit note to oldest unpaid invoices
      let remaining = data.amount;
      setDealerInvoices(prev =>
        prev.map(inv => {
          if ((inv.dealerId === targetDealer.id || inv.dealerCode === targetDealer.dealerCode) && remaining > 0 && inv.balanceAmount > 0) {
            const applied = Math.min(remaining, inv.balanceAmount);
            remaining -= applied;
            const newBal = Number((inv.balanceAmount - applied).toFixed(2));
            return {
              ...inv,
              paidAmount: Number((inv.paidAmount + applied).toFixed(2)),
              balanceAmount: newBal,
              status: newBal <= 0 ? 'Paid' : 'Partially Paid',
            };
          }
          return inv;
        })
      );
    }
  };

  const setActiveDealer = (dealerId: string) => {
    const found = dealers.find(d => d.id === dealerId);
    if (found) {
      setActiveDealerId(dealerId);
    }
  };

  // Dispatches state
  const [catalogueDispatches, setCatalogueDispatches] = useState<PhysicalCatalogueDispatch[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_catalogues');
      return saved ? JSON.parse(saved) : INITIAL_CATALOGUE_DISPATCHES;
    } catch {
      return INITIAL_CATALOGUE_DISPATCHES;
    }
  });

  // Ledger state
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_ledger');
      return saved ? JSON.parse(saved) : INITIAL_LEDGER;
    } catch {
      return INITIAL_LEDGER;
    }
  });

  // Complaints state
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    try {
      const saved = localStorage.getItem('tfh_complaints');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch {
      return INITIAL_COMPLAINTS;
    }
  });

  // Sync states to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tfh_dealers_directory', JSON.stringify(dealers));
    } catch (e) {
      console.warn('Failed to save dealers directory to localStorage', e);
    }
  }, [dealers]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_active_dealer_id', activeDealerId);
    } catch (e) {
      console.warn('Failed to save active dealer ID to localStorage', e);
    }
  }, [activeDealerId]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_dealer_invoices', JSON.stringify(dealerInvoices));
    } catch (e) {
      console.warn('Failed to save dealer invoices to localStorage', e);
    }
  }, [dealerInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_dealer_payments', JSON.stringify(dealerPayments));
    } catch (e) {
      console.warn('Failed to save dealer payments to localStorage', e);
    }
  }, [dealerPayments]);

  // Sync states to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tfh_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_profile', JSON.stringify(businessProfile));
    } catch (e) {
      console.warn('Failed to save business profile to localStorage', e);
    }
  }, [businessProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_catalogues', JSON.stringify(catalogueDispatches));
    } catch (e) {
      console.warn('Failed to save catalogues to localStorage', e);
    }
  }, [catalogueDispatches]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_ledger', JSON.stringify(ledger));
    } catch (e) {
      console.warn('Failed to save ledger to localStorage', e);
    }
  }, [ledger]);

  useEffect(() => {
    try {
      localStorage.setItem('tfh_complaints', JSON.stringify(complaints));
    } catch (e) {
      console.warn('Failed to save complaints to localStorage', e);
    }
  }, [complaints]);

  // Wishlist / Saved Patterns State for quick re-ordering
  // Fabric Management CRUD Operations (Admin-Protected)
  const addFabric = (fabricData: Partial<Product>): { success: boolean; product?: Product; error?: string } => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Authentication required. Only verified Admin can create fabric records.');
      return { success: false, error: 'Unauthorized' };
    }

    if (!fabricData.catalogueName?.trim() || !fabricData.sku?.trim()) {
      showToast('Fabric Name and Code / SKU are mandatory.');
      return { success: false, error: 'Name and SKU required' };
    }

    const cleanSku = fabricData.sku.trim().toUpperCase();
    const existingIndex = products.findIndex(p => p.sku.trim().toUpperCase() === cleanSku);
    if (existingIndex >= 0) {
      showToast(`A fabric with Code / SKU "${cleanSku}" already exists.`);
      return { success: false, error: 'Duplicate SKU' };
    }

    const newSerial = products.length + 1;
    const stockMeters = Math.max(0, Number(fabricData.totalStockMeters) || 0);
    const stockBuckets: StockBucket[] = fabricData.stockBuckets && fabricData.stockBuckets.length > 0
      ? fabricData.stockBuckets
      : [
          { range: 'Less than 5m', quantityMeters: Number((stockMeters * 0.08).toFixed(1)), piecesCount: Math.max(1, Math.round(stockMeters * 0.08 / 3)) },
          { range: '5m to 15m', quantityMeters: Number((stockMeters * 0.12).toFixed(1)), piecesCount: Math.max(1, Math.round(stockMeters * 0.12 / 10)) },
          { range: '15m to 30m', quantityMeters: Number((stockMeters * 0.25).toFixed(1)), piecesCount: Math.max(1, Math.round(stockMeters * 0.25 / 22)) },
          { range: 'More than 30m', quantityMeters: Number((stockMeters * 0.55).toFixed(1)), piecesCount: Math.max(1, Math.round(stockMeters * 0.55 / 45)) },
        ];

    const category = fabricData.category || 'Dimout';
    const sampleImages = Array.isArray(fabricData.sampleImages) ? fabricData.sampleImages : [];
    const primarySampleImage = fabricData.primarySampleImage || sampleImages[0] || undefined;

    const newProduct: Product = {
      id: `prod-admin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serialNo: newSerial,
      sku: cleanSku,
      catalogueName: fabricData.catalogueName.trim(),
      shadeNo: fabricData.shadeNo?.trim() || String(newSerial),
      category,
      collection: fabricData.collection?.trim() || fabricData.catalogueName.trim(),
      colorName: fabricData.colorName?.trim() || 'Custom Color',
      colorHex: fabricData.colorHex?.trim() || '#C5B59C',
      textureType: fabricData.textureType || (category === 'Solar Shading' ? 'solar' : category === 'Dimout' ? 'dimout' : category === 'Curtains' ? 'curtain' : 'woven'),
      gsm: fabricData.gsm?.trim() || '280+2%',
      width: fabricData.width?.trim() || '54"',
      composition: fabricData.composition?.trim() || '100% Polyester',
      dpl: Math.max(1, Number(fabricData.dpl) || 750),
      mrp: Math.max(1, Number(fabricData.mrp) || Math.round((Number(fabricData.dpl) || 750) * 1.75)),
      rollDiscountThreshold: Number(fabricData.rollDiscountThreshold) || 50,
      rollDiscountPercentage: Number(fabricData.rollDiscountPercentage) || 10,
      stockBuckets,
      totalStockMeters: stockMeters,
      totalPieces: stockBuckets.reduce((a, b) => a + b.piecesCount, 0),
      defaultShippingMode: fabricData.defaultShippingMode || 'Surface',
      hsnCode: fabricData.hsnCode?.trim() || '5407',
      fabricType: fabricData.fabricType?.trim() || `${category} Weave`,
      patternDesign: fabricData.patternDesign?.trim() || 'Plain Weave',
      supplier: fabricData.supplier?.trim() || 'The Fab House Partner Mill',
      description: fabricData.description?.trim() || '',
      sampleImages,
      primarySampleImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);
    showToast(`Fabric "${newProduct.catalogueName}" (${newProduct.sku}) added to inventory!`);
    return { success: true, product: newProduct };
  };

  const updateFabric = (updated: Product): { success: boolean; error?: string } => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Authentication required. Only verified Admin can modify fabric details.');
      return { success: false, error: 'Unauthorized' };
    }

    const payload: Product = {
      ...updated,
      sku: updated.sku.trim().toUpperCase(),
      updatedAt: new Date().toISOString(),
      primarySampleImage: updated.primarySampleImage || updated.sampleImages?.[0] || undefined,
    };

    setProducts(prev => prev.map(p => (p.id === updated.id ? payload : p)));
    if (selectedProduct?.id === updated.id) {
      setSelectedProduct(payload);
    }
    showToast(`Fabric "${updated.catalogueName}" updated successfully.`);
    return { success: true };
  };

  const deleteFabric = (id: string): { success: boolean; error?: string } => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Authentication required. Only verified Admin can delete fabrics.');
      return { success: false, error: 'Unauthorized' };
    }

    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      const remaining = products.filter(p => p.id !== id);
      setSelectedProduct(remaining.length > 0 ? remaining[0] : null);
    }
    showToast(`Fabric "${target?.catalogueName || id}" removed from inventory.`);
    return { success: true };
  };

  const uploadFabricSample = (productId: string, sampleDataUrl: string): { success: boolean; error?: string } => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Authentication required. Only verified Admin can upload fabric samples.');
      return { success: false, error: 'Unauthorized' };
    }

    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        const currentSamples = p.sampleImages ? [...p.sampleImages] : [];
        currentSamples.push(sampleDataUrl);
        return {
          ...p,
          sampleImages: currentSamples,
          primarySampleImage: p.primarySampleImage || sampleDataUrl,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showToast('Fabric sample image uploaded and attached.');
    return { success: true };
  };

  const removeFabricSample = (productId: string, index: number): { success: boolean; error?: string } => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Authentication required to modify sample images.');
      return { success: false, error: 'Unauthorized' };
    }

    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        const currentSamples = p.sampleImages ? [...p.sampleImages] : [];
        currentSamples.splice(index, 1);
        const newPrimary = currentSamples.length > 0 ? currentSamples[0] : undefined;
        return {
          ...p,
          sampleImages: currentSamples,
          primarySampleImage: newPrimary,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showToast('Sample image removed.');
    return { success: true };
  };

  const setPrimaryFabricSample = (productId: string, index: number): { success: boolean; error?: string } => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      return { success: false, error: 'Unauthorized' };
    }

    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId || !p.sampleImages || !p.sampleImages[index]) return p;
        return {
          ...p,
          primarySampleImage: p.sampleImages[index],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showToast('Primary sample image updated.');
    return { success: true };
  };

  const importFabricsFromDataset = (
    imported: Partial<Product>[],
    mode: 'merge' | 'replace'
  ): { count: number; message: string } => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Authentication required. Only verified Admin can import fabrics.');
      return { count: 0, message: 'Unauthorized' };
    }

    if (!imported || imported.length === 0) {
      return { count: 0, message: 'No fabric records found to import.' };
    }

    let finalProducts: Product[] = [];

    if (mode === 'replace') {
      finalProducts = imported.map((item, idx) => {
        const stockM = Math.max(0, Number(item.totalStockMeters) || 120);
        const sBuckets = item.stockBuckets && item.stockBuckets.length > 0
          ? item.stockBuckets
          : [
              { range: 'Less than 5m' as const, quantityMeters: Number((stockM * 0.08).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.08 / 3)) },
              { range: '5m to 15m' as const, quantityMeters: Number((stockM * 0.12).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.12 / 10)) },
              { range: '15m to 30m' as const, quantityMeters: Number((stockM * 0.25).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.25 / 22)) },
              { range: 'More than 30m' as const, quantityMeters: Number((stockM * 0.55).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.55 / 45)) },
            ];

        return {
          id: item.id || `prod-import-${Date.now()}-${idx}`,
          serialNo: idx + 1,
          sku: item.sku?.toUpperCase() || `SKU${1000 + idx}`,
          catalogueName: item.catalogueName || `Imported Fabric ${idx + 1}`,
          shadeNo: item.shadeNo || String(idx + 1),
          category: item.category || 'Dimout',
          collection: item.collection || item.catalogueName || 'Imported Collection',
          colorName: item.colorName || 'Neutral',
          colorHex: item.colorHex || '#C5B59C',
          textureType: item.textureType || 'woven',
          gsm: item.gsm || '280+2%',
          width: item.width || '54"',
          composition: item.composition || '100% Polyester',
          dpl: Number(item.dpl) || 750,
          mrp: Number(item.mrp) || 1350,
          rollDiscountThreshold: Number(item.rollDiscountThreshold) || 50,
          rollDiscountPercentage: Number(item.rollDiscountPercentage) || 10,
          stockBuckets: sBuckets,
          totalStockMeters: stockM,
          totalPieces: sBuckets.reduce((a, b) => a + b.piecesCount, 0),
          defaultShippingMode: item.defaultShippingMode || 'Surface',
          hsnCode: item.hsnCode || '5407',
          fabricType: item.fabricType || `${item.category || 'Dimout'} Weave`,
          patternDesign: item.patternDesign || 'Plain',
          supplier: item.supplier || 'The Fab House Partner Mill',
          description: item.description || '',
          sampleImages: item.sampleImages || [],
          primarySampleImage: item.primarySampleImage || item.sampleImages?.[0] || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    } else {
      // Merge mode
      const currentMap = new Map<string, Product>();
      products.forEach(p => currentMap.set(p.sku.toUpperCase(), p));

      imported.forEach((item, idx) => {
        const skuKey = (item.sku || `IMP${1000 + idx}`).toUpperCase();
        const existing = currentMap.get(skuKey);
        const stockM = item.totalStockMeters !== undefined ? Math.max(0, Number(item.totalStockMeters)) : existing?.totalStockMeters || 120;
        const sBuckets = item.stockBuckets && item.stockBuckets.length > 0
          ? item.stockBuckets
          : existing?.stockBuckets || [
              { range: 'Less than 5m' as const, quantityMeters: Number((stockM * 0.08).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.08 / 3)) },
              { range: '5m to 15m' as const, quantityMeters: Number((stockM * 0.12).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.12 / 10)) },
              { range: '15m to 30m' as const, quantityMeters: Number((stockM * 0.25).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.25 / 22)) },
              { range: 'More than 30m' as const, quantityMeters: Number((stockM * 0.55).toFixed(1)), piecesCount: Math.max(1, Math.round(stockM * 0.55 / 45)) },
            ];

        const merged: Product = {
          id: existing?.id || `prod-import-${Date.now()}-${idx}`,
          serialNo: existing?.serialNo || (products.length + idx + 1),
          sku: skuKey,
          catalogueName: item.catalogueName || existing?.catalogueName || `Imported Fabric ${idx + 1}`,
          shadeNo: item.shadeNo || existing?.shadeNo || String(idx + 1),
          category: item.category || existing?.category || 'Dimout',
          collection: item.collection || existing?.collection || 'Exclusive Collection',
          colorName: item.colorName || existing?.colorName || 'Neutral',
          colorHex: item.colorHex || existing?.colorHex || '#C5B59C',
          textureType: item.textureType || existing?.textureType || 'woven',
          gsm: item.gsm || existing?.gsm || '280+2%',
          width: item.width || existing?.width || '54"',
          composition: item.composition || existing?.composition || '100% Polyester',
          dpl: Number(item.dpl) || existing?.dpl || 750,
          mrp: Number(item.mrp) || existing?.mrp || 1350,
          rollDiscountThreshold: Number(item.rollDiscountThreshold) || existing?.rollDiscountThreshold || 50,
          rollDiscountPercentage: Number(item.rollDiscountPercentage) || existing?.rollDiscountPercentage || 10,
          stockBuckets: sBuckets,
          totalStockMeters: stockM,
          totalPieces: sBuckets.reduce((a, b) => a + b.piecesCount, 0),
          defaultShippingMode: item.defaultShippingMode || existing?.defaultShippingMode || 'Surface',
          hsnCode: item.hsnCode || existing?.hsnCode || '5407',
          fabricType: item.fabricType || existing?.fabricType || `${item.category || 'Dimout'} Weave`,
          patternDesign: item.patternDesign || existing?.patternDesign || 'Plain',
          supplier: item.supplier || existing?.supplier || 'The Fab House Partner Mill',
          description: item.description || existing?.description || '',
          sampleImages: item.sampleImages && item.sampleImages.length > 0 ? item.sampleImages : (existing?.sampleImages || []),
          primarySampleImage: item.primarySampleImage || existing?.primarySampleImage,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        currentMap.set(skuKey, merged);
      });

      finalProducts = Array.from(currentMap.values());
    }

    setProducts(finalProducts);
    const count = imported.length;
    const msg = `Successfully imported ${count} fabric records (${mode === 'replace' ? 'replaced existing inventory' : 'merged with existing inventory'}).`;
    showToast(msg);
    return { count, message: msg };
  };

  const resetFabricsToDefault = () => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      showToast('Authentication required to reset inventory.');
      return;
    }
    setProducts(ALL_PRODUCTS);
    setSelectedProduct(ALL_PRODUCTS[0]);
    try {
      localStorage.removeItem('tfh_fabrics_inventory');
    } catch (e) {
      console.error(e);
    }
    showToast(`Inventory reset to initial ${ALL_PRODUCTS.length} standard fabrics.`);
  };

  const toggleWishlist = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(prod ? `Removed "${prod.catalogueName}" from Wishlist` : 'Removed from Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast(prod ? `Saved "${prod.catalogueName}" to Wishlist!` : 'Saved to Wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Cart calculations
  const cartCount = cart.length;
  const cartSubtotalDpl = cart.reduce((acc, item) => acc + item.product.dpl * item.quantityMeters, 0);
  const cartTotalDiscount = cart.reduce((acc, item) => {
    if (item.appliedDiscountPercentage > 0) {
      const gross = item.product.dpl * item.quantityMeters;
      return acc + (gross * item.appliedDiscountPercentage) / 100;
    }
    return acc;
  }, 0);
  const taxableSubtotal = cartSubtotalDpl - cartTotalDiscount;
  const cartGst = Number((taxableSubtotal * 0.05).toFixed(2));
  const cartShippingEstimate = cart.length > 0 ? (cart.some(i => i.shippingMode === 'Express') ? 1200 : 650) : 0;
  const cartGrandTotal = Number((taxableSubtotal + cartGst + cartShippingEstimate).toFixed(2));

  const addToCart = (product: Product, quantityMeters: number, shippingMode: 'Surface' | 'Express' = 'Surface') => {
    const isDiscountApplicable = quantityMeters >= product.rollDiscountThreshold;
    const discountPct = isDiscountApplicable ? product.rollDiscountPercentage : 0;
    const grossDpl = product.dpl * quantityMeters;
    const netDpl = grossDpl * (1 - discountPct / 100);
    const lineMrp = product.mrp * quantityMeters;

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantityMeters + quantityMeters;
        const newDiscount = newQty >= product.rollDiscountThreshold ? product.rollDiscountPercentage : 0;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantityMeters: newQty,
          appliedDiscountPercentage: newDiscount,
          lineDplTotal: Number((product.dpl * newQty * (1 - newDiscount / 100)).toFixed(2)),
          lineMrpTotal: product.mrp * newQty,
          shippingMode,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product,
          quantityMeters,
          appliedDiscountPercentage: discountPct,
          lineDplTotal: Number(netDpl.toFixed(2)),
          lineMrpTotal: lineMrp,
          shippingMode,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added ${quantityMeters}m of ${product.catalogueName} to cart`);
  };

  const updateCartQuantity = (itemId: string, quantityMeters: number) => {
    if (quantityMeters <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const discountPct =
            quantityMeters >= item.product.rollDiscountThreshold ? item.product.rollDiscountPercentage : 0;
          return {
            ...item,
            quantityMeters,
            appliedDiscountPercentage: discountPct,
            lineDplTotal: Number((item.product.dpl * quantityMeters * (1 - discountPct / 100)).toFixed(2)),
            lineMrpTotal: item.product.mrp * quantityMeters,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (
    address: BusinessAddress,
    shippingMode: 'Surface' | 'Express',
    paymentMethod: 'Credit Limit' | 'UPI' | 'Net Banking' | 'Card'
  ): Order => {
    const orderItems = cart.map(item => {
      const netRate = Number(
        (item.product.dpl * (1 - item.appliedDiscountPercentage / 100)).toFixed(2)
      );
      return {
        sku: item.product.sku,
        catalogueName: item.product.catalogueName,
        shadeNo: item.product.shadeNo,
        category: item.product.category,
        quantityMeters: item.quantityMeters,
        ratePerMeter: item.product.dpl,
        mrpPerMeter: item.product.mrp,
        discountPercentage: item.appliedDiscountPercentage,
        netRatePerMeter: netRate,
        totalAmount: item.lineDplTotal,
        hsnCode: item.product.hsnCode,
      };
    });

    const subtotal = cartSubtotalDpl;
    const discount = cartTotalDiscount;
    const taxable = subtotal - discount;
    const gst = Number((taxable * 0.05).toFixed(2));
    const shipping = shippingMode === 'Express' ? 1200 : 650;
    const total = Number((taxable + gst + shipping).toFixed(2));

    const orderId = `TFH-2026-0${Math.floor(850 + Math.random() * 150)}`;
    const newOrder: Order = {
      id: orderId,
      dealerId: activeDealer.id,
      dealerCode: activeDealer.dealerCode,
      orderDate: new Date().toISOString(),
      status: 'Confirmed',
      items: orderItems,
      shippingAddress: address,
      shippingMode,
      subtotalDpl: subtotal,
      totalRollDiscount: discount,
      taxableAmount: taxable,
      gstAmount: gst,
      gstPercentage: 5,
      shippingCharge: shipping,
      grandTotal: total,
      paymentMethod,
      paymentStatus: paymentMethod === 'Credit Limit' ? 'Credit Approved' : 'Paid',
      millProcurementRaised: false,
      millProcurementStatus: 'Pending',
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update dynamic dealer invoices and ledger if on credit
    if (paymentMethod === 'Credit Limit') {
      const todayStr = new Date().toISOString().split('T')[0];
      const creditDays = activeDealer.creditPeriodDays || 45;
      const dueDate = new Date(Date.now() + creditDays * 86400000).toISOString().split('T')[0];
      const generatedInvoiceNumber = `TFH/26-27/0${Math.floor(500 + Math.random() * 400)}`;

      const newDealerInvoice: DealerInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: generatedInvoiceNumber,
        orderId,
        dealerId: activeDealer.id,
        dealerCode: activeDealer.dealerCode,
        invoiceDate: todayStr,
        dueDate,
        totalAmount: total,
        paidAmount: 0,
        balanceAmount: total,
        status: 'Unpaid',
        itemsSummary: `${orderItems.length} items (${orderItems.slice(0, 2).map(i => i.catalogueName).join(', ')}${orderItems.length > 2 ? '...' : ''})`,
        paymentMethod: 'Credit Limit',
      };

      setDealerInvoices(prev => [newDealerInvoice, ...prev]);

      const newLedgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        date: todayStr,
        referenceNo: orderId,
        type: 'Invoice',
        particulars: `Credit Order Placed: ${orderItems.map(i => `${i.catalogueName} (${i.quantityMeters}m)`).join(', ')}`,
        debit: total,
        credit: 0,
        balance: activeDealerFinancials.netOutstanding + total,
      };
      setLedger(prev => [newLedgerEntry, ...prev]);
    }

    // Auto-generate Owner Order Confirmation Email Notification
    const orderNotif = generateOrderConfirmationEmail(
      newOrder,
      businessProfile,
      ownerNotificationEmail
    );
    setEmailNotifications(prev => [orderNotif, ...prev]);
    setActiveEmailModal(orderNotif);

    clearCart();
    showToast(`Order #${orderId} confirmed! Email alert dispatched to owner.`);
    return newOrder;
  };

  const adminRaiseMillProcurement = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'Procurement in Progress',
            millProcurementRaised: true,
            millProcurementStatus: 'Mill Order Placed',
          };
        }
        return ord;
      })
    );
    showToast(`Mill procurement requisition raised for Order #${orderId}`);
  };

  const adminGenerateInvoice = (orderId: string): string => {
    const invoiceNumber = `TFH/26-27/0${Math.floor(400 + Math.random() * 100)}`;
    const today = new Date().toISOString().split('T')[0];

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            invoiceNumber,
            invoiceDate: today,
          };
        }
        return ord;
      })
    );

    // Add entry to Ledger
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      const newLedgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        date: today,
        referenceNo: invoiceNumber,
        type: 'Invoice',
        particulars: `Tax Invoice: ${targetOrder.items.map(i => `${i.catalogueName} (${i.quantityMeters}m)`).join(', ')}`,
        debit: targetOrder.grandTotal,
        credit: 0,
        balance: activeDealerFinancials.netOutstanding + targetOrder.grandTotal,
      };
      setLedger(prev => [newLedgerEntry, ...prev]);
    }

    showToast(`Generated GST Tax Invoice ${invoiceNumber}`);
    return invoiceNumber;
  };

  const adminDispatchOrder = (orderId: string, transporterName: string, docketNumber: string) => {
    const today = new Date().toISOString().split('T')[0];
    const expDelivery = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];

    let dispatchedOrder: Order | undefined;

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          dispatchedOrder = {
            ...ord,
            status: 'Dispatched',
            transporterName,
            docketNumber,
            dispatchedDate: today,
            expectedDeliveryDate: expDelivery,
          };
          return dispatchedOrder;
        }
        return ord;
      })
    );

    // Auto-generate Dispatch Status Email for Owner & Buyer
    if (dispatchedOrder) {
      const dispatchNotif = generateDispatchStatusEmail(
        dispatchedOrder,
        businessProfile,
        transporterName,
        docketNumber,
        ownerNotificationEmail
      );
      setEmailNotifications(prev => [dispatchNotif, ...prev]);
      setActiveEmailModal(dispatchNotif);
    }

    showToast(`Order #${orderId} dispatched! Email alert generated for owner.`);
  };

  const adminDeliverOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'Delivered',
          };
        }
        return ord;
      })
    );
    showToast(`Order #${orderId} marked as Delivered!`);
  };

  const millUpdateStatus = (
    orderId: string,
    millStatus: 'Stock Received at Warehouse' | 'Mill Order Placed'
  ) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            millProcurementStatus: millStatus,
            status: millStatus === 'Stock Received at Warehouse' ? 'Confirmed' : ord.status,
          };
        }
        return ord;
      })
    );
    showToast(`Mill status updated: ${millStatus}`);
  };

  const createDirectGSTInvoice = (invoiceData: {
    dealerId: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    items: OrderItem[];
    shippingAddress?: BusinessAddress;
    shippingMode?: 'Surface' | 'Express';
    shippingCharge?: number;
    paymentMethod?: string;
    transporterName?: string;
    docketNumber?: string;
  }): Order => {
    const targetDealer = dealers.find(d => d.id === invoiceData.dealerId) || activeDealer;
    const invNo =
      invoiceData.invoiceNumber?.trim() ||
      `TFH/26-27/0${Math.floor(500 + Math.random() * 450)}`;
    const invDate = invoiceData.invoiceDate || new Date().toISOString().split('T')[0];
    const creditDays = targetDealer.creditPeriodDays || 45;
    const calcDueDate =
      invoiceData.dueDate ||
      new Date(new Date(invDate).getTime() + creditDays * 86400000)
        .toISOString()
        .split('T')[0];
    const shipMode = invoiceData.shippingMode || 'Surface';
    const shipCharge =
      invoiceData.shippingCharge !== undefined
        ? invoiceData.shippingCharge
        : shipMode === 'Express'
        ? 1200
        : 650;
    const payMethod = (invoiceData.paymentMethod as any) || 'Credit Limit';

    const subtotal = invoiceData.items.reduce(
      (s, it) => s + it.ratePerMeter * it.quantityMeters,
      0
    );
    const totalRollDiscount = invoiceData.items.reduce((s, it) => {
      const gross = it.ratePerMeter * it.quantityMeters;
      return s + (gross * (it.discountPercentage || 0)) / 100;
    }, 0);
    const taxableAmount = subtotal - totalRollDiscount;
    const gstAmount = Number((taxableAmount * 0.05).toFixed(2));
    const grandTotal = Number((taxableAmount + gstAmount + shipCharge).toFixed(2));

    const orderId = `TFH-2026-0${Math.floor(880 + Math.random() * 120)}`;
    const shippingAddress =
      invoiceData.shippingAddress ||
      targetDealer.addresses?.[0] || {
        id: `addr-${targetDealer.id}-1`,
        title: targetDealer.companyName,
        contactPerson: targetDealer.contactPerson,
        phone: targetDealer.contactPhone,
        addressLine1: targetDealer.addressLine1,
        addressLine2: targetDealer.addressLine2,
        city: targetDealer.city,
        state: targetDealer.state,
        pincode: targetDealer.pincode,
        gstin: targetDealer.gstin,
        isDefault: true,
      };

    const newOrder: Order = {
      id: orderId,
      dealerId: targetDealer.id,
      dealerCode: targetDealer.dealerCode,
      orderDate: new Date().toISOString(),
      status: 'Confirmed',
      items: invoiceData.items,
      shippingAddress,
      shippingMode: shipMode,
      subtotalDpl: subtotal,
      totalRollDiscount,
      taxableAmount,
      gstAmount,
      gstPercentage: 5,
      shippingCharge: shipCharge,
      grandTotal,
      paymentMethod: payMethod,
      paymentStatus: payMethod === 'Credit Limit' ? 'Credit Approved' : 'Paid',
      invoiceNumber: invNo,
      invoiceDate: invDate,
      dueDate: calcDueDate,
      transporterName: invoiceData.transporterName || 'VRL Logistics Ltd',
      docketNumber:
        invoiceData.docketNumber ||
        `VRL-PUN-${Math.floor(100000 + Math.random() * 900000)}`,
      millProcurementRaised: false,
      millProcurementStatus: 'Pending',
    };

    setOrders(prev => [newOrder, ...prev]);

    // Create DealerInvoice
    const newDealerInvoice: DealerInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNo,
      orderId,
      dealerId: targetDealer.id,
      dealerCode: targetDealer.dealerCode,
      invoiceDate: invDate,
      dueDate: calcDueDate,
      totalAmount: grandTotal,
      paidAmount: 0,
      balanceAmount: grandTotal,
      status: 'Unpaid',
      itemsSummary: `${invoiceData.items.length} items (${invoiceData.items
        .slice(0, 2)
        .map(i => i.catalogueName)
        .join(', ')}${invoiceData.items.length > 2 ? '...' : ''})`,
      paymentMethod: payMethod,
    };

    setDealerInvoices(prev => [newDealerInvoice, ...prev]);

    // Add entry to General Ledger
    const targetDealerFinancials = calculateDealerFinancials(
      targetDealer,
      [newDealerInvoice, ...dealerInvoices],
      dealerPayments
    );
    const newLedgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      dealerId: targetDealer.id,
      dealerCode: targetDealer.dealerCode,
      date: invDate,
      referenceNo: invNo,
      type: 'Invoice',
      particulars: `Tax Invoice: ${invoiceData.items
        .map(i => `${i.catalogueName} (${i.quantityMeters}m)`)
        .join(', ')}`,
      debit: grandTotal,
      credit: 0,
      balance: targetDealerFinancials.netOutstanding,
      dueDate: calcDueDate,
      status: 'Unpaid',
    };

    setLedger(prev => [newLedgerEntry, ...prev]);

    return newOrder;
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    if (invoiceToView && invoiceToView.id === updatedOrder.id) {
      setInvoiceToView(updatedOrder);
    }
    // Also sync dealer invoice and ledger entry if invoiceNumber or grandTotal changed
    if (updatedOrder.invoiceNumber) {
      setDealerInvoices(prev =>
        prev.map(inv => {
          if (
            inv.orderId === updatedOrder.id ||
            inv.invoiceNumber === updatedOrder.invoiceNumber
          ) {
            return {
              ...inv,
              invoiceNumber: updatedOrder.invoiceNumber || inv.invoiceNumber,
              invoiceDate: updatedOrder.invoiceDate || inv.invoiceDate,
              dueDate: updatedOrder.dueDate || inv.dueDate,
              totalAmount: updatedOrder.grandTotal,
              balanceAmount: Math.max(0, updatedOrder.grandTotal - inv.paidAmount),
            };
          }
          return inv;
        })
      );
      setLedger(prev =>
        prev.map(led => {
          if (
            led.referenceNo === updatedOrder.id ||
            led.referenceNo === updatedOrder.invoiceNumber
          ) {
            return {
              ...led,
              referenceNo: updatedOrder.invoiceNumber || led.referenceNo,
              date: updatedOrder.invoiceDate || led.date,
              dueDate: updatedOrder.dueDate || led.dueDate,
              debit: updatedOrder.grandTotal,
            };
          }
          return led;
        })
      );
    }
    showToast(`Order #${updatedOrder.id} invoice details updated successfully`);
  };

  const updateBusinessAddress = (address: BusinessAddress) => {
    setDealers(prev =>
      prev.map(d => {
        if (d.id === activeDealer.id) {
          return {
            ...d,
            addresses: d.addresses.map(a => (a.id === address.id ? address : a)),
          };
        }
        return d;
      })
    );
    showToast('Shipping address updated');
  };

  const addBusinessAddress = (newAddr: Omit<BusinessAddress, 'id'>) => {
    const address: BusinessAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    setDealers(prev =>
      prev.map(d => {
        if (d.id === activeDealer.id) {
          return {
            ...d,
            addresses: [...d.addresses, address],
          };
        }
        return d;
      })
    );
    showToast('New shipping address added');
  };

  const requestCatalogue = (
    catalogueName: string,
    category: FabricCategory | 'Comprehensive',
    quantity: number
  ) => {
    const newDispatch: PhysicalCatalogueDispatch = {
      id: `cat-disp-${Date.now()}`,
      catalogueName,
      catalogueCode: `CAT-${category.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`,
      status: 'Requested',
      invoiceNo: `TFH-CAT/26-${Math.floor(100 + Math.random() * 50)}`,
      quantity,
      transporter: 'Pending Dispatch Assignment',
      dispatchedDate: 'Scheduled for Tomorrow',
      docketNumber: 'Pending',
      category,
    };
    setCatalogueDispatches(prev => [newDispatch, ...prev]);
    showToast(`Physical catalogue request for "${catalogueName}" submitted!`);
  };

  const raiseComplaint = (
    orderId: string,
    sku: string,
    type: ComplaintTicket['type'],
    description: string
  ) => {
    const newTicket: ComplaintTicket = {
      id: `TKT-2026-0${Math.floor(50 + Math.random() * 50)}`,
      orderId,
      sku,
      type,
      description,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      resolutionNote: 'Assigned to Support Executive. Reviewing mill batch inspection report.',
    };
    setComplaints(prev => [newTicket, ...prev]);

    // Send Claim Alert Email
    const targetOrder = orders.find(o => o.id === orderId);
    const claimNotif = generateClaimAlertEmail(newTicket, targetOrder, businessProfile, ownerNotificationEmail);
    setEmailNotifications(prev => [claimNotif, ...prev]);

    showToast(`Complaint ticket #${newTicket.id} registered`);
  };

  const sendOrderEmail = (order: Order): EmailNotification => {
    const notif = generateOrderConfirmationEmail(order, businessProfile, ownerNotificationEmail);
    setEmailNotifications(prev => [notif, ...prev.filter(e => e.id !== notif.id)]);
    setActiveEmailModal(notif);
    showToast(`Order confirmation email prepared for ${ownerNotificationEmail}`);
    return notif;
  };

  const sendDispatchEmail = (
    order: Order,
    transporterName: string = order.transporterName || 'VRL Logistics',
    docketNumber: string = order.docketNumber || 'VRL-PUN-001'
  ): EmailNotification => {
    const notif = generateDispatchStatusEmail(
      order,
      businessProfile,
      transporterName,
      docketNumber,
      ownerNotificationEmail
    );
    setEmailNotifications(prev => [notif, ...prev.filter(e => e.id !== notif.id)]);
    setActiveEmailModal(notif);
    showToast(`Dispatch status email prepared for ${ownerNotificationEmail}`);
    return notif;
  };

  const openDealerSwitcherModal = () => setIsDealerSwitcherOpen(true);
  const closeDealerSwitcherModal = () => setIsDealerSwitcherOpen(false);
  const openDealerRegistrationModal = () => setIsDealerRegistrationOpen(true);
  const closeDealerRegistrationModal = () => setIsDealerRegistrationOpen(false);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeView,
        setActiveView,
        products,
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        cart,
        cartCount,
        cartSubtotalDpl,
        cartTotalDiscount,
        cartGrandTotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        orders,
        placeOrder,
        adminRaiseMillProcurement,
        adminGenerateInvoice,
        adminDispatchOrder,
        adminDeliverOrder,
        millUpdateStatus,
        dealers,
        activeDealerId,
        activeDealer,
        businessProfile,
        activeDealerFinancials,
        getDealerFinancials,
        registerDealer,
        approveDealer,
        rejectDealer,
        updateDealerStatus,
        updateDealerCredit,
        updateDealerPermissions,
        updateDealerDepot,
        recordDealerPayment,
        createDirectGSTInvoice,
        recordLedgerAdjustment,
        setActiveDealer,
        dealerInvoices,
        dealerPayments,
        isDealerSwitcherOpen,
        setIsDealerSwitcherOpen,
        openDealerSwitcherModal,
        closeDealerSwitcherModal,
        isDealerRegistrationOpen,
        setIsDealerRegistrationOpen,
        openDealerRegistrationModal,
        closeDealerRegistrationModal,
        updateBusinessAddress,
        addBusinessAddress,
        catalogueDispatches,
        requestCatalogue,
        ledger,
        complaints,
        raiseComplaint,
        visualizeProduct,
        setVisualizeProduct,
        invoiceToView,
        setInvoiceToView,
        updateOrder,
        toastMessage,
        showToast,
        ownerNotificationEmail,
        setOwnerNotificationEmail,
        emailNotifications,
        activeEmailModal,
        setActiveEmailModal,
        sendOrderEmail,
        sendDispatchEmail,
        adminUser,
        isAdminAuthenticated,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        loginAdminWithGoogle,
        logoutAdmin,
        isCalculatorModalOpen,
        setIsCalculatorModalOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        setProducts,
        addFabric,
        updateFabric,
        deleteFabric,
        uploadFabricSample,
        removeFabricSample,
        setPrimaryFabricSample,
        importFabricsFromDataset,
        resetFabricsToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
