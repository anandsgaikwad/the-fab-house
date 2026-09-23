import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  User,
  Plus,
  ExternalLink,
  Landmark,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Heart,
  ShoppingCart,
  ArrowRight,
  Eye,
  Package,
  Sparkles,
  Trash2,
  Layers,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONTACT, openWhatsAppChat } from '../config/businessContact';
import { BusinessAddress, Product } from '../types';
import { HighResFabricPatternCanvas } from './FullScreenFabricGalleryModal';
import { QuickViewModal } from './QuickViewModal';

export const MyProfileView: React.FC = () => {
  const {
    businessProfile,
    activeDealer,
    activeDealerFinancials,
    openDealerSwitcherModal,
    openDealerRegistrationModal,
    addBusinessAddress,
    showToast,
    wishlist,
    toggleWishlist,
    products,
    setSelectedProduct,
    setSearchQuery,
    setActiveView,
    addToCart,
    setVisualizeProduct,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Resolved wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleReorder = (prod: Product) => {
    setSelectedProduct(prod);
    setSearchQuery(prod.sku);
    setActiveView('place-order');
    showToast(`Loaded ${prod.catalogueName} for ordering!`);
  };

  const handleQuickAddRoll = (prod: Product) => {
    addToCart(prod, 50, 'Surface');
    showToast(`Added 50m roll of ${prod.catalogueName} to cart!`);
  };

  const [title, setTitle] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !addressLine1 || !city || !pincode) return;

    addBusinessAddress({
      title,
      addressLine1,
      addressLine2,
      city,
      state: 'Maharashtra',
      pincode,
      contactPerson: contactPerson || businessProfile.contactPerson,
      phone: phone || businessProfile.contactPhone,
      gstin: businessProfile.gstin,
      isDefault: false,
    });

    setShowAddModal(false);
    setTitle('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setPincode('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Business Profile & Dealership
          </h1>
          <p className="text-xs text-[#766A57]">
            Verified corporate credentials, billing GSTIN, credit limits, and delivery locations
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#E3E7D8] text-[#5F6B4A] px-3.5 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto border border-[#5F6B4A]/20">
          <ShieldCheck className="w-4 h-4" />
          <span>GSTIN Verified Dealer</span>
        </div>
      </div>

      {/* Main Corporate Details Card */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#DACBAA]/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E9D9C5] text-[#8B5A3C]">
                {activeDealer.businessType || 'Dealership Business'}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                activeDealer.status === 'approved'
                  ? 'bg-[#E3E7D8] text-[#5F6B4A]'
                  : activeDealer.status === 'pending'
                  ? 'bg-[#FFF8E6] text-[#785412]'
                  : 'bg-red-100 text-red-700'
              }`}>
                {activeDealer.status}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-[#2C2417]">
              {activeDealer.companyName}
            </h2>
            <p className="text-xs text-[#766A57]">
              Dealer Code: <strong className="font-mono text-[#2C2417]">{activeDealer.dealerCode}</strong> · Tier: Platinum Wholesale
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
            <div>
              <span className="text-[#766A57] block text-[11px]">Parent Depot Hub</span>
              <strong className="font-mono text-sm text-[#8B5A3C]">{activeDealer.depotCode}</strong>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={openDealerSwitcherModal}
                className="px-2.5 py-1 rounded-lg bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-[11px] font-semibold transition-colors"
              >
                Switch Dealer
              </button>
              <button
                onClick={openDealerRegistrationModal}
                className="px-2.5 py-1 rounded-lg bg-[#8B5A3C] hover:bg-[#6D4227] text-white text-[11px] font-semibold transition-colors"
              >
                + Register New
              </button>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[11px]">GSTIN / UIN</span>
            <strong className="font-mono text-[#2C2417] text-xs">{activeDealer.gstin || 'Unregistered'}</strong>
          </div>

          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[11px]">Permanent PAN</span>
            <strong className="font-mono text-[#2C2417] text-xs">{activeDealer.pan || 'N/A'}</strong>
          </div>

          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[11px]">Primary Contact</span>
            <strong className="text-[#2C2417] text-xs">{activeDealer.contactPerson}</strong>
          </div>

          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[11px]">Registered Mobile</span>
            <strong className="font-mono text-[#2C2417] text-xs">{activeDealer.contactPhone || activeDealer.phone}</strong>
          </div>
        </div>
      </div>

      {/* Credit & Terms Card */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DACBAA]/60 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#8B5A3C]" />
            <h3 className="font-display font-bold text-base text-[#2C2417]">
              Credit Facility Terms & Limits
            </h3>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            activeDealerFinancials.overdueAmount > 0
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-[#E3E7D8] text-[#5F6B4A] border-[#5F6B4A]/20'
          }`}>
            {activeDealerFinancials.overdueAmount > 0
              ? `Attention: ₹${(activeDealerFinancials.overdueAmount || 0).toLocaleString('en-IN')} Overdue`
              : 'Account Status: In Good Standing (0 Overdue)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#E7DAC0] rounded-xl border border-[#DACBAA]">
            <span className="text-[#766A57] block text-[11px]">Approved Credit Limit</span>
            <p className="font-display font-bold text-base text-[#2C2417] mt-0.5">
              ₹{(activeDealerFinancials.approvedCreditLimit ?? activeDealerFinancials.creditLimit ?? 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#5F6B4A]">{activeDealer.creditTermsLabel || 'Regular 45 Days Credit'}</span>
          </div>

          <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[11px]">Current Outstanding</span>
            <p className="font-display font-bold text-base text-[#8B5A3C] mt-0.5">
              ₹{(activeDealerFinancials.netOutstanding || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#766A57]">Across active fabric dispatches</span>
          </div>

          <div className="p-3 bg-[#E3E7D8] rounded-xl border border-[#5F6B4A]/30">
            <span className="text-[#5F6B4A] block text-[11px]">Available Credit Balance</span>
            <p className="font-display font-bold text-base text-[#5F6B4A] mt-0.5">
              ₹{(activeDealerFinancials.availableCredit || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#5F6B4A]">Ready for immediate roll booking</span>
          </div>
        </div>

        {/* 45-Day Payment Ageing Schedule */}
        <div className="p-3.5 bg-[#FAF5EC] rounded-xl border border-[#DACBAA]/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#2C2417]">
              <Clock className="w-3.5 h-3.5 text-[#8B5A3C]" />
              <span>45-Day Credit Ageing Breakdown</span>
            </div>
            <span className="text-[10px] text-[#766A57]">Updated Daily at 00:00 IST</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 bg-white rounded-lg border border-[#DACBAA]/50">
              <span className="text-[#766A57] block text-[10px]">0 - 37 Days (Current)</span>
              <strong className="text-xs text-[#2C2417]">
                ₹{Math.max(0, (activeDealerFinancials.netOutstanding || 0) - (activeDealerFinancials.dueIn7Days || 0) - (activeDealerFinancials.overdueAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <span className="block text-[9px] text-[#5F6B4A] font-medium">Within Credit Term</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#DACBAA]/50">
              <span className="text-[#766A57] block text-[10px]">Due in Next 7 Days</span>
              <strong className="text-xs text-[#8B5A3C]">
                ₹{(activeDealerFinancials.dueIn7Days || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <span className="block text-[9px] text-[#8B5A3C] font-medium">Payment Upcoming</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#DACBAA]/50">
              <span className="text-[#766A57] block text-[10px]">&gt; 45 Days (Overdue)</span>
              <strong className={`text-xs ${(activeDealerFinancials.overdueAmount || 0) > 0 ? 'text-[#9C4630]' : 'text-[#5F6B4A]'}`}>
                ₹{(activeDealerFinancials.overdueAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <span className={`block text-[9px] font-medium ${(activeDealerFinancials.overdueAmount || 0) > 0 ? 'text-[#9C4630]' : 'text-[#5F6B4A]'}`}>
                {(activeDealerFinancials.overdueAmount || 0) > 0 ? 'Payment Required' : 'Nil Overdue Amount'}
              </span>
            </div>
          </div>
        </div>

        {/* THE FAB HOUSE Official Bank Remittance Details */}
        <div className="p-3.5 bg-[#E7DAC0] rounded-xl border border-[#DACBAA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#2C2417]">
              <Landmark className="w-4 h-4 text-[#8B5A3C]" />
              <span>Official Bank Remittance Account (NEFT / RTGS / IMPS)</span>
            </div>
            <div className="text-[11px] text-[#766A57] space-y-0.5 font-mono">
              <p>Beneficiary: <strong className="text-[#2C2417]">THE FAB HOUSE</strong> (Prop. Anand Sachin Gaikwad)</p>
              <p>Bank: <strong className="text-[#2C2417]">HDFC Bank Ltd</strong> · Branch: Ring Road Textile Market, Surat</p>
              <p>Current A/c: <strong className="text-[#2C2417]">50200084920194</strong> · IFSC Code: <strong className="text-[#2C2417]">HDFC0001024</strong></p>
              <p>UPI ID: <strong className="text-[#8B5A3C]">9370150563@hdfcbank</strong></p>
            </div>
          </div>

          <button
            onClick={() => {
              const bankDetails = `THE FAB HOUSE Bank Remittance Details:\nBeneficiary: THE FAB HOUSE (Anand Sachin Gaikwad)\nBank: HDFC Bank Ltd\nA/c No: 50200084920194\nIFSC: HDFC0001024\nBranch: Surat Textile Market\nUPI: 9370150563@hdfcbank`;
              navigator.clipboard.writeText(bankDetails);
              setCopiedBank(true);
              showToast('Bank remittance details copied to clipboard!');
              setTimeout(() => setCopiedBank(false), 2500);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            {copiedBank ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#D7E2C7]" />
                <span>Copied Details</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Bank Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SAVED PATTERNS & WISHLIST SECTION */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DACBAA]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-2xs">
              <Heart className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#2C2417] flex items-center gap-2">
                <span>Saved Patterns Wishlist</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#E9D9C5] text-[#8B5A3C] font-semibold">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Pattern' : 'Patterns'}
                </span>
              </h3>
              <p className="text-[11px] text-[#766A57]">
                Favorite fabric patterns saved for fast one-click re-ordering and live warehouse inventory checks
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('place-order')}
            className="text-xs font-semibold text-[#8B5A3C] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF5EC] rounded-xl border border-dashed border-[#DACBAA] space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-sm text-[#2C2417]">
                Your Wishlist is currently empty
              </h4>
              <p className="text-xs text-[#766A57] max-w-sm mx-auto">
                Click the Heart icon on any fabric card in Place Order to save your staple blackout, dimout, and solar shading patterns here for quick re-ordering.
              </p>
            </div>
            <button
              onClick={() => setActiveView('place-order')}
              className="mt-2 px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              Browse Fabric Patterns
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlistProducts.map(p => (
              <div
                key={p.id}
                className="bg-white border border-[#DACBAA] hover:border-[#8B5A3C] rounded-xl p-3.5 transition-all shadow-2xs flex flex-col justify-between gap-3 relative group"
              >
                {/* Remove from wishlist button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors z-10 shadow-2xs border border-[#DACBAA]/60"
                  title="Remove from saved patterns"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex gap-3">
                  {/* Swatch Image */}
                  <div
                    onClick={() => setQuickViewProduct(p)}
                    className="w-20 h-20 rounded-lg border border-[#DACBAA] shrink-0 overflow-hidden relative cursor-pointer group-hover:shadow-md transition-shadow"
                  >
                    <HighResFabricPatternCanvas
                      product={p}
                      zoomLevel={1}
                      lightingMode="neutral"
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-[#2C2417]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold bg-[#2C2417]/80 text-[#FBF7EE] px-1 rounded">
                      {p.shadeNo}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#E9D9C5] text-[#8B5A3C]">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#766A57]">
                        {p.sku}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#2C2417] truncate">
                      {p.catalogueName}
                    </h4>
                    <p className="text-[11px] text-[#766A57] truncate">
                      Shade {p.shadeNo} · {p.colorName}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5 text-[10px] text-[#766A57]">
                      <span>GSM: <strong>{p.gsm}</strong></span>
                      <span>•</span>
                      <span>Width: <strong>{p.width}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Stock & Price Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#DACBAA]/60 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-[#5F6B4A] font-semibold bg-[#E3E7D8] px-2 py-0.5 rounded-md">
                    <Package className="w-3 h-3" />
                    <span>{(p.totalStockMeters || 0).toLocaleString('en-IN')}m in stock</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[#8B5A3C] text-sm">
                      ₹{(p.dpl || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#766A57] font-normal"> /m</span>
                  </div>
                </div>

                {/* Re-order & Quick Add Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAddRoll(p)}
                    className="py-1.5 px-2 rounded-lg bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-[#DACBAA]"
                    title="Add standard 50m roll directly to cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-[#8B5A3C]" />
                    <span>+50m to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReorder(p)}
                    className="py-1.5 px-2 rounded-lg bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                  >
                    <span>Re-order Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registered Delivery Sites */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8B5A3C]" />
            <h3 className="font-display font-bold text-base text-[#2C2417]">
              Registered Shipping & Delivery Sites ({businessProfile.addresses.length})
            </h3>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold text-[#8B5A3C] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Site</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {businessProfile.addresses.map(addr => (
            <div
              key={addr.id}
              className="p-3.5 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]/60 space-y-1.5 relative"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C2417] text-sm">{addr.title}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold bg-[#8B5A3C] text-white px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-[#766A57]">
                {addr.addressLine1}, {addr.addressLine2}
              </p>
              <p className="text-[#766A57]">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-[11px] text-[#766A57] pt-1 border-t border-[#DACBAA]/40">
                Contact: <strong>{addr.contactPerson}</strong> ({addr.phone})
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Account Executive Card */}
      <div className="bg-[#E9D9C5] border border-[#8B5A3C]/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8B5A3C] text-white flex items-center justify-center font-bold text-sm">
            AG
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#766A57]">
              Assigned Depot Account Manager
            </span>
            <p className="font-bold text-sm text-[#2C2417]">{BUSINESS_CONTACT.ownerName}</p>
            <p className="text-[#766A57]">{BUSINESS_CONTACT.businessName} · Pune Central Depot</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              openWhatsAppChat(
                `Hello ${BUSINESS_CONTACT.ownerName}, I am contacting you from my dealer account at THE FAB HOUSE.`
              )
            }
            className="px-3.5 py-2 rounded-xl bg-[#DCF8C6] hover:bg-[#cbf1af] text-[#075E54] border border-[#25D366]/40 font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp ({BUSINESS_CONTACT.whatsAppDisplay})</span>
          </button>

          <a
            href={`tel:${BUSINESS_CONTACT.contactPhone}`}
            className="px-3.5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2C2417]/60 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />

          <form
            onSubmit={handleAdd}
            className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-md w-full p-5 shadow-2xl z-10 space-y-3 text-xs"
          >
            <h3 className="font-display font-bold text-base text-[#2C2417] border-b border-[#DACBAA]/60 pb-2">
              Register New Shipping Destination
            </h3>

            <div>
              <label className="font-bold text-[#2C2417] block mb-1">Location Title</label>
              <input
                type="text"
                placeholder="e.g. Chakan Warehouse Bay 2"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]"
                required
              />
            </div>

            <div>
              <label className="font-bold text-[#2C2417] block mb-1">Address Line 1</label>
              <input
                type="text"
                placeholder="Plot / Street / Industrial Area"
                value={addressLine1}
                onChange={e => setAddressLine1(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#2C2417] block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-[#2C2417] block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#2C2417] block mb-1">Site Incharge</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]"
                />
              </div>
              <div>
                <label className="font-bold text-[#2C2417] block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DACBAA]/60">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-[#DACBAA] font-semibold text-[#766A57]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold transition-colors shadow-xs"
              >
                Save Site
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick View Modal for Fabric Patterns */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onSelectForOrder={handleReorder}
      />
    </div>
  );
};
