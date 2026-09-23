/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { DashboardView } from './components/DashboardView';
import { PlaceOrderView } from './components/PlaceOrderView';
import { StockCheckView } from './components/StockCheckView';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { TrackOrdersView } from './components/TrackOrdersView';
import { CatalogueOrderView } from './components/CatalogueOrderView';
import { ComplaintsView } from './components/ComplaintsView';
import { ReportsView } from './components/ReportsView';
import { MyProfileView } from './components/MyProfileView';
import { AdminFulfillmentView } from './components/AdminFulfillmentView';
import { AdminFabricManagementView } from './components/AdminFabricManagementView';
import { AdminDealerManagementView } from './components/AdminDealerManagementView';
import { MillPortalView } from './components/MillPortalView';
import { GSTInvoiceModal } from './components/GSTInvoiceModal';
import { FabricVisualizerModal } from './components/FabricVisualizerModal';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import { AdminGoogleLoginModal } from './components/AdminGoogleLoginModal';
import { CurtainFabricCalculatorModal } from './components/CurtainFabricCalculatorModal';
import { DealerSwitcherModal } from './components/DealerSwitcherModal';
import { DealerRegistrationModal } from './components/DealerRegistrationModal';
import { AccessDeniedView } from './components/AccessDeniedView';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  Home,
  Layers,
  Search,
  ShoppingCart,
  Truck,
  Menu,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    invoiceToView,
    setInvoiceToView,
    visualizeProduct,
    setVisualizeProduct,
    cartCount,
    toastMessage,
    activeEmailModal,
    setActiveEmailModal,
    isAdminAuthModalOpen,
    setIsAdminAuthModalOpen,
    isCalculatorModalOpen,
    setIsCalculatorModalOpen,
    isDealerSwitcherOpen,
    closeDealerSwitcherModal,
    isDealerRegistrationOpen,
    closeDealerRegistrationModal,
    isAdminAuthenticated,
    adminUser,
  } = useApp();

  const [isSideMenuOpen, setIsSideMenuOpen] = React.useState(false);

  const renderActiveView = () => {
    // Admin & Mill internal portals: strict 403 guard
    const isAdminOnlyView =
      activeView === 'admin-fulfillment' ||
      activeView === 'admin-fabrics' ||
      activeView === 'admin-dealers' ||
      activeView === 'mill-portal';

    if (isAdminOnlyView && !isAdminAuthenticated) {
      return (
        <AccessDeniedView
          attemptedEmail={adminUser?.email || null}
          message="Access to THE FAB HOUSE Back Office, Fabric Management, GST Invoicing, and Mill Procurement is strictly restricted to verified owner Google accounts."
          onRetryLogin={() => setIsAdminAuthModalOpen(true)}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'place-order':
        return <PlaceOrderView />;
      case 'stock-check':
        return <StockCheckView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'track-orders':
        return <TrackOrdersView />;
      case 'catalogue-order':
        return <CatalogueOrderView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <MyProfileView />;
      case 'admin-fulfillment':
        return <AdminFulfillmentView />;
      case 'admin-fabrics':
        return <AdminFabricManagementView />;
      case 'admin-dealers':
        return <AdminDealerManagementView />;
      case 'mill-portal':
        return <MillPortalView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE3D0] text-[#2C2417] flex flex-col font-sans selection:bg-[#8B5A3C] selection:text-white">
      {/* Persistent Navigation Header */}
      <Header onOpenMenu={() => setIsSideMenuOpen(true)} />

      {/* Slide-in Navigation Drawer */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Mobile Bottom Navigation Bar (App-like ergonomics) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-[#FBF7EE] border-t border-[#DACBAA] z-40 px-2 py-1.5 flex items-center justify-around text-[10px] font-semibold text-[#766A57]">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            activeView === 'dashboard' ? 'text-[#8B5A3C]' : 'hover:text-[#2C2417]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveView('place-order')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            activeView === 'place-order' ? 'text-[#8B5A3C]' : 'hover:text-[#2C2417]'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Order</span>
        </button>

        <button
          onClick={() => setActiveView('stock-check')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            activeView === 'stock-check' ? 'text-[#8B5A3C]' : 'hover:text-[#2C2417]'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Stock</span>
        </button>

        <button
          onClick={() => setActiveView('cart')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg relative transition-colors ${
            activeView === 'cart' ? 'text-[#8B5A3C]' : 'hover:text-[#2C2417]'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#8B5A3C] text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsSideMenuOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg hover:text-[#2C2417] transition-colors"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Global Modals */}
      {invoiceToView && (
        <GSTInvoiceModal
          order={invoiceToView}
          onClose={() => setInvoiceToView(null)}
        />
      )}

      {visualizeProduct && (
        <FabricVisualizerModal
          product={visualizeProduct}
          onClose={() => setVisualizeProduct(null)}
        />
      )}

      {activeEmailModal && (
        <EmailNotificationModal
          notification={activeEmailModal}
          onClose={() => setActiveEmailModal(null)}
        />
      )}

      <AdminGoogleLoginModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
      />

      <CurtainFabricCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
      />

      {/* Multi-Dealer Account Modals */}
      <DealerSwitcherModal
        isOpen={isDealerSwitcherOpen}
        onClose={closeDealerSwitcherModal}
      />

      <DealerRegistrationModal
        isOpen={isDealerRegistrationOpen}
        onClose={closeDealerRegistrationModal}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#2C2417] text-[#FBF7EE] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-[#8B5A3C] transition-all flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5F6B4A]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

