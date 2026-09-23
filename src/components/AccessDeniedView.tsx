import React from 'react';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AccessDeniedViewProps {
  attemptedEmail?: string | null;
  message?: string | null;
  onRetryLogin?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  attemptedEmail,
  message,
  onRetryLogin,
}) => {
  const { setActiveView, setRole, setIsAdminAuthModalOpen } = useApp();

  const handleReturnToDashboard = () => {
    setRole('buyer');
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FBF7EE] border-2 border-red-300 rounded-2xl shadow-xl overflow-hidden text-center p-6 sm:p-8 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-100 text-red-800">
            403 Forbidden
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#2C2417]">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-[#766A57] leading-relaxed">
            {message ||
              'Access to Back Office, Dealer Credit Management, Fabric Inventory, and Mill Procurement is strictly restricted to verified owner Google accounts.'}
          </p>
        </div>

        {attemptedEmail && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs space-y-1">
            <p className="text-[11px] font-semibold text-red-800 uppercase tracking-wide">
              Attempted Account:
            </p>
            <p className="font-mono text-xs text-red-900 break-all font-semibold">
              {attemptedEmail}
            </p>
            <p className="text-[11px] text-red-700 pt-1 border-t border-red-200/60 mt-1">
              This account is not authorized as an owner of THE FAB HOUSE.
            </p>
          </div>
        )}

        <div className="pt-2 space-y-2">
          <button
            onClick={() => {
              if (onRetryLogin) {
                onRetryLogin();
              } else {
                setIsAdminAuthModalOpen(true);
              }
            }}
            className="w-full py-2.5 px-4 bg-[#8B5A3C] hover:bg-[#6D4227] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Authorized Owner Account</span>
          </button>

          <button
            onClick={handleReturnToDashboard}
            className="w-full py-2.5 px-4 bg-[#EDE3D0] hover:bg-[#DACBAA] text-[#2C2417] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Buyer Dealer Catalog</span>
          </button>
        </div>
      </div>
    </div>
  );
};
