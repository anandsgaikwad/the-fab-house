import React from 'react';
import {
  Menu,
  ShoppingCart,
  UserCheck,
  Shield,
  Factory,
  ChevronRight,
  Calculator,
  Lock,
  ShieldCheck,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONTACT, openWhatsAppChat } from '../config/businessContact';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const {
    role,
    setRole,
    businessProfile,
    activeDealer,
    cartCount,
    wishlist,
    setActiveView,
    isAdminAuthenticated,
    setIsAdminAuthModalOpen,
    setIsCalculatorModalOpen,
    adminUser,
    openDealerSwitcherModal,
    openDealerRegistrationModal,
  } = useApp();

  const handleAdminClick = () => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
    } else {
      setRole('admin');
      setActiveView('admin-fulfillment');
    }
  };

  const handleMillClick = () => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
    } else {
      setRole('mill');
      setActiveView('mill-portal');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7EE] border-b border-[#DACBAA] shadow-xs">
      {/* Top Banner: Multi-Dealer Business Profile & Switcher Bar */}
      <div className="bg-[#E7DAC0] px-3.5 py-1.5 border-b border-[#DACBAA]/60 flex items-center justify-between text-xs text-[#2C2417]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={openDealerSwitcherModal}
            className="flex items-center gap-1.5 hover:bg-[#DACBAA] px-2 py-0.5 rounded-lg transition-colors text-left group cursor-pointer"
            title="Click to Switch Dealer Account or View Other Businesses"
          >
            <span className="w-5 h-5 rounded-full bg-[#8B5A3C] text-[#FBF7EE] font-display font-semibold flex items-center justify-center text-[10px] shrink-0 group-hover:scale-105 transition-transform">
              {(activeDealer?.companyName || 'TF').slice(0, 2).toUpperCase()}
            </span>
            <span className="font-semibold truncate max-w-[130px] sm:max-w-[200px] text-[#2C2417] group-hover:text-[#8B5A3C]">
              {activeDealer?.companyName || businessProfile.companyName}
            </span>
            <span className="text-[10px] bg-[#DACBAA]/80 text-[#5F462B] px-1 rounded font-bold">
              ⇄ Switch
            </span>
          </button>

          <span className="text-[#DACBAA] hidden sm:inline">|</span>
          <span className="text-[#766A57] hidden sm:inline whitespace-nowrap">
            Code: <strong className="text-[#2C2417] font-mono">{activeDealer?.dealerCode || businessProfile.dealerCode}</strong>
          </span>
          <span className="text-[#DACBAA] hidden md:inline">|</span>
          <span className="text-[#766A57] hidden md:inline whitespace-nowrap">
            Depot: <strong className="text-[#2C2417]">{activeDealer?.depotCode || businessProfile.depotCode}</strong>
          </span>

          <button
            onClick={openDealerRegistrationModal}
            className="hidden sm:inline-flex items-center text-[10px] font-semibold text-[#8B5A3C] hover:underline bg-[#FBF7EE]/60 px-2 py-0.5 rounded-full border border-[#DACBAA]"
          >
            + Register Dealer
          </button>
        </div>

        {/* Role Switcher Pills */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] text-[#766A57] mr-1 hidden lg:inline">View as:</span>
          <button
            onClick={() => setRole('buyer')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1 ${
              role === 'buyer'
                ? 'bg-[#8B5A3C] text-white shadow-xs'
                : 'bg-[#FBF7EE] text-[#766A57] hover:bg-[#F3EBDA]'
            }`}
            title="Switch to Buyer Dealer mode"
          >
            <UserCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Dealer</span>
          </button>
          <button
            onClick={handleAdminClick}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1 ${
              role === 'admin'
                ? 'bg-[#8B5A3C] text-white shadow-xs'
                : 'bg-[#FBF7EE] text-[#766A57] hover:bg-[#F3EBDA]'
            }`}
            title={
              isAdminAuthenticated
                ? `Admin: Google Verified (${adminUser?.email})`
                : 'Restricted: Sign in with Owner Google account'
            }
          >
            {isAdminAuthenticated ? (
              <ShieldCheck className="w-3 h-3 text-[#A3C088]" />
            ) : (
              <Lock className="w-3 h-3 text-[#8B5A3C]" />
            )}
            <span>Admin</span>
          </button>
          <button
            onClick={handleMillClick}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1 ${
              role === 'mill'
                ? 'bg-[#8B5A3C] text-white shadow-xs'
                : 'bg-[#FBF7EE] text-[#766A57] hover:bg-[#F3EBDA]'
            }`}
            title={
              isAdminAuthenticated
                ? 'Mill Procurement View'
                : 'Restricted: Sign in with Owner Google account'
            }
          >
            <Factory className="w-3 h-3" />
            <span className="hidden sm:inline">Mill</span>
          </button>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-4 py-3 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="p-2 -ml-1 text-[#2C2417] hover:bg-[#E7DAC0] rounded-lg transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className="text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#2C2417] group-hover:text-[#8B5A3C] transition-colors">
                THE FAB HOUSE
              </span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E9D9C5] text-[#8B5A3C] font-semibold font-sans hidden sm:inline-block">
                B2B Portal
              </span>
            </div>
            <p className="text-[11px] text-[#766A57] font-sans -mt-0.5 hidden sm:block">
              Blackout · Dimout · Solar Shading · Curtains
            </p>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Centralized WhatsApp Contact Button */}
          <button
            onClick={() => openWhatsAppChat('Hello THE FAB HOUSE, I would like to inquire about fabrics.')}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-[#DCF8C6] hover:bg-[#cbf1af] text-[#075E54] border border-[#25D366]/40 transition-colors shadow-2xs cursor-pointer"
            title={`Chat directly with THE FAB HOUSE on WhatsApp (${BUSINESS_CONTACT.whatsAppDisplay})`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Fabric Meterage Calculator Quick Action */}
          <button
            onClick={() => setIsCalculatorModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] transition-colors border border-[#DACBAA]/80 shadow-2xs"
            title="Calculate Fabric Metres from Window Dimensions"
          >
            <Calculator className="w-3.5 h-3.5 text-[#8B5A3C]" />
            <span className="hidden sm:inline">Calculator</span>
          </button>

          <button
            onClick={() => setActiveView('place-order')}
            className="hidden md:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] transition-colors"
          >
            Browse Catalogue
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Wishlist in Profile Shortcut */}
          <button
            onClick={() => setActiveView('profile')}
            className="relative p-2.5 rounded-full bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] transition-all flex items-center justify-center focus:outline-hidden"
            title={`Saved Patterns Wishlist in Profile (${wishlist.length})`}
            aria-label="Wishlist in Profile"
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-rose-600 fill-rose-600' : 'text-[#766A57]'}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('cart')}
            className="relative p-2.5 rounded-full bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] transition-all flex items-center justify-center focus:outline-hidden"
            aria-label={`Shopping Cart with ${cartCount} items`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8B5A3C] text-[#FBF7EE] text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
