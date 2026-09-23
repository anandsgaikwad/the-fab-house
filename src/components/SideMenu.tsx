import React, { useState } from 'react';
import {
  X,
  Home,
  Layers,
  Search,
  Truck,
  FileText,
  AlertCircle,
  BookOpen,
  LogOut,
  ChevronDown,
  ChevronRight,
  Shield,
  Factory,
  Calculator,
  Lock,
  ShieldCheck,
  Heart,
  User,
  Building2,
  UserPlus,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { useApp, ActiveView } from '../context/AppContext';
import { LegalTermsModal, LegalDocType } from './LegalTermsModal';
import { BUSINESS_CONTACT, openWhatsAppChat } from '../config/businessContact';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const {
    activeView,
    setActiveView,
    businessProfile,
    dealers,
    activeDealer,
    openDealerSwitcherModal,
    openDealerRegistrationModal,
    wishlist,
    products,
    role,
    setRole,
    isAdminAuthenticated,
    setIsAdminAuthModalOpen,
    setIsCalculatorModalOpen,
    logoutAdmin,
  } = useApp();

  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [complaintsExpanded, setComplaintsExpanded] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalDocType | null>(null);

  if (!isOpen) return null;

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    onClose();
  };

  const pendingDealersCount = dealers.filter(d => d.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2C2417]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <div className="relative w-80 max-w-[85vw] bg-[#FBF7EE] text-[#2C2417] h-full shadow-2xl flex flex-col z-10 border-r border-[#DACBAA]">
        {/* Profile Card Header */}
        <div className="p-4 bg-[#E7DAC0] border-b border-[#DACBAA] space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#8B5A3C] text-[#FBF7EE] flex items-center justify-center font-display font-bold text-lg shadow-sm">
                TFH
              </div>
              <div>
                <h3 className="font-display font-bold text-base leading-tight text-[#2C2417]">
                  THE FAB HOUSE
                </h3>
                <span className="text-[11px] text-[#766A57]">B2B Wholesale Portal</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Dealer Info Box */}
          <div
            onClick={() => navigateTo('profile')}
            className="p-2.5 bg-[#FBF7EE] hover:bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60 text-xs cursor-pointer transition-colors group"
            title="View Dealership Profile & Saved Wishlist"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#2C2417] truncate group-hover:text-[#8B5A3C]">
                {activeDealer?.companyName || businessProfile.companyName}
              </p>
              <ChevronRight className="w-3.5 h-3.5 text-[#766A57] group-hover:text-[#8B5A3C] transition-colors" />
            </div>
            <div className="flex items-center justify-between text-[#766A57] mt-1 text-[11px]">
              <span>Dealer: <strong className="text-[#2C2417]">{activeDealer?.dealerCode || businessProfile.dealerCode}</strong></span>
              <span>Status: <strong className="text-[#8B5A3C] uppercase">{activeDealer?.status || 'approved'}</strong></span>
            </div>
          </div>

          {/* Dealer Switcher & Registration Quick Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => {
                onClose();
                openDealerSwitcherModal();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#FBF7EE] hover:bg-[#F3EBDA] rounded-lg border border-[#DACBAA] text-[11px] font-semibold text-[#2C2417] transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#8B5A3C]" />
              <span>Switch Account</span>
            </button>
            <button
              onClick={() => {
                onClose();
                openDealerRegistrationModal();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#8B5A3C] hover:bg-[#6D4227] text-white rounded-lg text-[11px] font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Dealer</span>
            </button>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* Homepage */}
          <button
            onClick={() => navigateTo('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-[#E9D9C5] text-[#8B5A3C] font-semibold'
                : 'text-[#2C2417] hover:bg-[#E7DAC0]'
            }`}
          >
            <Home className="w-4 h-4 text-[#8B5A3C]" />
            <span>Homepage</span>
          </button>

          {/* Dealership Profile & Wishlist */}
          <button
            onClick={() => navigateTo('profile')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'profile'
                ? 'bg-[#E9D9C5] text-[#8B5A3C] font-semibold'
                : 'text-[#2C2417] hover:bg-[#E7DAC0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#8B5A3C]" />
              <span>Profile &amp; Wishlist</span>
            </div>
            {wishlist.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                <Heart className="w-3 h-3 fill-white" />
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Stock Check */}
          <button
            onClick={() => navigateTo('stock-check')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'stock-check'
                ? 'bg-[#E9D9C5] text-[#8B5A3C] font-semibold'
                : 'text-[#2C2417] hover:bg-[#E7DAC0]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#8B5A3C]" />
            <span>Stock Check</span>
          </button>

          {/* Place Order */}
          <button
            onClick={() => navigateTo('place-order')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'place-order'
                ? 'bg-[#E9D9C5] text-[#8B5A3C] font-semibold'
                : 'text-[#2C2417] hover:bg-[#E7DAC0]'
            }`}
          >
            <Search className="w-4 h-4 text-[#8B5A3C]" />
            <div className="flex items-center justify-between w-full">
              <span>Place Order</span>
              <span className="text-[10px] bg-[#5F6B4A] text-white px-1.5 py-0.5 rounded-full font-sans">
                Live Rolls
              </span>
            </div>
          </button>

          {/* Track Orders */}
          <button
            onClick={() => navigateTo('track-orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'track-orders'
                ? 'bg-[#E9D9C5] text-[#8B5A3C] font-semibold'
                : 'text-[#2C2417] hover:bg-[#E7DAC0]'
            }`}
          >
            <Truck className="w-4 h-4 text-[#8B5A3C]" />
            <span>Track Orders</span>
          </button>

          {/* Catalogue Ordering */}
          <button
            onClick={() => navigateTo('catalogue-order')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'catalogue-order'
                ? 'bg-[#E9D9C5] text-[#8B5A3C] font-semibold'
                : 'text-[#2C2417] hover:bg-[#E7DAC0]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8B5A3C]" />
            <span>Order Catalogues</span>
          </button>

          {/* Reports (Expandable) */}
          <div>
            <button
              onClick={() => setReportsExpanded(!reportsExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2C2417] hover:bg-[#E7DAC0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#8B5A3C]" />
                <span>Reports</span>
              </div>
              {reportsExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#766A57]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#766A57]" />
              )}
            </button>
            {reportsExpanded && (
              <div className="pl-10 pr-2 py-1 space-y-1 bg-[#F3EBDA]/60 rounded-lg my-1">
                <button
                  onClick={() => navigateTo('reports')}
                  className="w-full text-left py-1.5 px-2 text-xs text-[#2C2417] hover:text-[#8B5A3C] font-medium"
                >
                  • Outstanding Ledger
                </button>
                <button
                  onClick={() => navigateTo('reports')}
                  className="w-full text-left py-1.5 px-2 text-xs text-[#2C2417] hover:text-[#8B5A3C] font-medium"
                >
                  • GST Invoices Repository
                </button>
                <button
                  onClick={() => navigateTo('reports')}
                  className="w-full text-left py-1.5 px-2 text-xs text-[#2C2417] hover:text-[#8B5A3C] font-medium"
                >
                  • Order History Statement
                </button>
              </div>
            )}
          </div>

          {/* Complaints (Expandable) */}
          <div>
            <button
              onClick={() => setComplaintsExpanded(!complaintsExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2C2417] hover:bg-[#E7DAC0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-[#8B5A3C]" />
                <span>Complaints & Claims</span>
              </div>
              {complaintsExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#766A57]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#766A57]" />
              )}
            </button>
            {complaintsExpanded && (
              <div className="pl-10 pr-2 py-1 space-y-1 bg-[#F3EBDA]/60 rounded-lg my-1">
                <button
                  onClick={() => navigateTo('complaints')}
                  className="w-full text-left py-1.5 px-2 text-xs text-[#2C2417] hover:text-[#8B5A3C] font-medium"
                >
                  • Raise New Complaint
                </button>
                <button
                  onClick={() => navigateTo('complaints')}
                  className="w-full text-left py-1.5 px-2 text-xs text-[#2C2417] hover:text-[#8B5A3C] font-medium"
                >
                  • Ticket Status Tracker
                </button>
              </div>
            )}
          </div>

          {/* THE FAB HOUSE Direct Contact & Support */}
          <div className="pt-2 border-t border-[#DACBAA]/60 my-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#766A57] mb-1.5">
              Contact & Support
            </p>
            <button
              onClick={() => openWhatsAppChat('Hello THE FAB HOUSE, I am inquiring regarding wholesale fabric orders.')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#DCF8C6]/80 hover:bg-[#DCF8C6] text-[#075E54] border border-[#25D366]/40 transition-colors shadow-2xs mb-1.5 cursor-pointer"
              title="Chat directly with THE FAB HOUSE on WhatsApp"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp: {BUSINESS_CONTACT.whatsAppDisplay}</span>
              </div>
              <span className="text-[10px] bg-[#25D366] text-white px-1.5 py-0.5 rounded font-bold">
                Chat
              </span>
            </button>

            <a
              href={`mailto:${BUSINESS_CONTACT.businessEmail}?subject=${encodeURIComponent('THE FAB HOUSE - Wholesale Inquiry')}`}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#2C2417] hover:bg-[#E7DAC0] transition-colors"
              title="Email THE FAB HOUSE Official Business Inbox"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Mail className="w-4 h-4 text-[#8B5A3C] shrink-0" />
                <span className="truncate">{BUSINESS_CONTACT.businessEmail}</span>
              </div>
            </a>
          </div>

          {/* Curtain Fabric Calculator */}
          <button
            onClick={() => {
              setIsCalculatorModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium bg-[#F3EBDA] hover:bg-[#E7DAC0] text-[#2C2417] transition-colors border border-[#DACBAA]/60"
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-4 h-4 text-[#8B5A3C]" />
              <span>Curtain Fabric Calculator</span>
            </div>
            <span className="text-[10px] bg-[#8B5A3C] text-white px-1.5 py-0.5 rounded-md font-bold">
              Tool
            </span>
          </button>

          {/* Divider for Back Office / Role Management */}
          <div className="pt-2 border-t border-[#DACBAA]/60 my-2">
            <div className="px-3 flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#766A57]">
                Internal Portals
              </p>
              {isAdminAuthenticated ? (
                <span className="flex items-center gap-1 text-[10px] text-[#5F6B4A] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Unlocked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-[#8B5A3C] font-medium">
                  <Lock className="w-3 h-3" />
                  Restricted
                </span>
              )}
            </div>

            <button
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setIsAdminAuthModalOpen(true);
                  onClose();
                } else {
                  setRole('admin');
                  navigateTo('admin-fulfillment');
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeView === 'admin-fulfillment'
                  ? 'bg-[#8B5A3C] text-white font-semibold'
                  : 'text-[#2C2417] hover:bg-[#E7DAC0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span>Back Office Admin (Fulfillment)</span>
              </div>
              {!isAdminAuthenticated && <Lock className="w-3 h-3 text-[#766A57]" />}
            </button>

            <button
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setIsAdminAuthModalOpen(true);
                  onClose();
                } else {
                  setRole('admin');
                  navigateTo('admin-fabrics');
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeView === 'admin-fabrics'
                  ? 'bg-[#8B5A3C] text-white font-semibold'
                  : 'text-[#2C2417] hover:bg-[#E7DAC0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Fabric Inventory &amp; Samples</span>
              </div>
              {!isAdminAuthenticated ? (
                <Lock className="w-3 h-3 text-[#766A57]" />
              ) : (
                <span className="text-[10px] bg-[#5F6B4A] text-white px-1.5 py-0.5 rounded font-bold">
                  {products.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setIsAdminAuthModalOpen(true);
                  onClose();
                } else {
                  setRole('admin');
                  navigateTo('admin-dealers');
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeView === 'admin-dealers'
                  ? 'bg-[#8B5A3C] text-white font-semibold'
                  : 'text-[#2C2417] hover:bg-[#E7DAC0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>Dealer Approvals &amp; Credit</span>
              </div>
              {!isAdminAuthenticated ? (
                <Lock className="w-3 h-3 text-[#766A57]" />
              ) : pendingDealersCount > 0 ? (
                <span className="text-[10px] bg-[#C0392B] text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {pendingDealersCount} pending
                </span>
              ) : (
                <span className="text-[10px] bg-[#8B5A3C] text-white px-1.5 py-0.5 rounded font-bold">
                  {dealers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!isAdminAuthenticated) {
                  setIsAdminAuthModalOpen(true);
                  onClose();
                } else {
                  setRole('mill');
                  navigateTo('mill-portal');
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                role === 'mill'
                  ? 'bg-[#8B5A3C] text-white font-semibold'
                  : 'text-[#2C2417] hover:bg-[#E7DAC0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Factory className="w-4 h-4" />
                <span>Mill Procurement Portal</span>
              </div>
              {!isAdminAuthenticated && <Lock className="w-3 h-3 text-[#766A57]" />}
            </button>

            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  logoutAdmin();
                  onClose();
                }}
                className="w-full mt-1.5 flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[11px] text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Lock Admin (Sign Out Google)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 bg-[#F3EBDA] border-t border-[#DACBAA] text-xs space-y-2">
          <div className="flex items-center justify-between text-[#766A57]">
            <button
              onClick={() => {
                setRole('buyer');
                navigateTo('dashboard');
              }}
              className="flex items-center gap-1.5 text-xs text-[#9C4630] font-medium hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>
            <span className="text-[11px] text-[#A79876]">Version v2.4.1</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#766A57] pt-1">
            <button
              onClick={() => setLegalModalTab('terms')}
              className="hover:underline hover:text-[#8B5A3C] transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>·</span>
            <button
              onClick={() => setLegalModalTab('disclaimer')}
              className="hover:underline hover:text-[#8B5A3C] transition-colors cursor-pointer"
            >
              Disclaimer
            </button>
            <span>·</span>
            <button
              onClick={() => setLegalModalTab('privacy')}
              className="hover:underline hover:text-[#8B5A3C] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
          <p className="text-[10px] text-[#A79876] pt-1">
            Owner: {BUSINESS_CONTACT.ownerName} · {BUSINESS_CONTACT.whatsAppDisplay}
          </p>
        </div>
      </div>

      {/* Commercial & Legal Terms Modal */}
      <LegalTermsModal
        isOpen={legalModalTab !== null}
        initialTab={legalModalTab || 'terms'}
        onClose={() => setLegalModalTab(null)}
      />
    </div>
  );
};
