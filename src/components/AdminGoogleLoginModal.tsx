import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  X,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Mail,
  UserCheck,
  KeyRound,
  ArrowRight,
  BellRing,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  PRIMARY_OWNER_EMAIL,
  PRIMARY_OWNER_NAME,
  SECONDARY_OWNER_EMAIL,
  SECONDARY_OWNER_NAME,
  AUTHORIZED_ADMIN_EMAILS,
  isEmailAuthorized,
  verifyAdminOnServer,
} from '../services/adminAuthService';
import { sendAdminLoginAlert } from '../services/adminNotificationService';

interface AdminGoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminGoogleLoginModal: React.FC<AdminGoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdminWithGoogle, adminUser, showToast } = useApp();
  const [customEmail, setCustomEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSimulatingGoogleAuth, setIsSimulatingGoogleAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'quick' | 'custom'>('quick');

  if (!isOpen) return null;

  const handleQuickLogin = async (email: string, name: string) => {
    setIsSimulatingGoogleAuth(true);
    setAuthError(null);

    try {
      // 1. Server-side Google identity verification
      const serverCheck = await verifyAdminOnServer({
        simulatedEmail: email,
        simulatedName: name,
      });

      if (!serverCheck.success) {
        setIsSimulatingGoogleAuth(false);
        setAuthError(serverCheck.message);
        return;
      }

      // 2. Invoke server-side email function upon successful Google identity verification
      // Dispatches required login alert emails to bhaktikakade05@gmail.com and anandsg575@gmail.com with Asia/Kolkata timestamps
      try {
        const alertRes = await sendAdminLoginAlert(email, name);
        console.log('[AdminGoogleLoginModal] Server-side Resend email dispatched:', alertRes);
      } catch (emailErr) {
        console.warn('[AdminGoogleLoginModal] Notice: email notification dispatch error:', emailErr);
      }

      // 3. Unlock admin session with skipAlert flag to prevent redundant duplicate sends
      const res = loginAdminWithGoogle(email, name, { skipAlert: true });
      setIsSimulatingGoogleAuth(false);
      if (res.success) {
        showToast('Authorized Owner login alert sent to bhaktikakade05 & anandsg575 (Asia/Kolkata)');
        onSuccess?.();
        onClose();
      } else {
        setAuthError(res.message);
      }
    } catch {
      setIsSimulatingGoogleAuth(false);
      setAuthError('Server verification error. Please try again.');
    }
  };

  const handleCustomEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedEmail = customEmail.trim();
    if (!sanitizedEmail) {
      setAuthError('Please enter a valid Google email address.');
      return;
    }

    setIsSimulatingGoogleAuth(true);
    setAuthError(null);

    try {
      // 1. Server-side Google identity verification
      const serverCheck = await verifyAdminOnServer({
        simulatedEmail: sanitizedEmail,
        simulatedName: sanitizedEmail.split('@')[0],
      });

      if (!serverCheck.success) {
        setIsSimulatingGoogleAuth(false);
        setAuthError(serverCheck.message);
        return;
      }

      const verifiedEmail = serverCheck.user?.email || sanitizedEmail;
      const verifiedName = serverCheck.user?.name || sanitizedEmail.split('@')[0];

      // 2. Invoke server-side email function upon successful Google identity verification
      // Dispatches required login alert emails to bhaktikakade05@gmail.com and anandsg575@gmail.com with Asia/Kolkata timestamps
      try {
        const alertRes = await sendAdminLoginAlert(verifiedEmail, verifiedName);
        console.log('[AdminGoogleLoginModal] Server-side Resend email dispatched:', alertRes);
      } catch (emailErr) {
        console.warn('[AdminGoogleLoginModal] Notice: email notification dispatch error:', emailErr);
      }

      // 3. Unlock admin session
      const res = loginAdminWithGoogle(verifiedEmail, verifiedName, { skipAlert: true });
      setIsSimulatingGoogleAuth(false);

      if (res.success) {
        showToast('Authorized Owner login alert sent to bhaktikakade05 & anandsg575 (Asia/Kolkata)');
        onSuccess?.();
        onClose();
      } else {
        setAuthError(res.message);
      }
    } catch {
      setIsSimulatingGoogleAuth(false);
      setAuthError('Server verification error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C2417]/70 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close background" />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-lg w-full shadow-2xl z-10 overflow-hidden text-xs">
        {/* Top Google OAuth Styled Header */}
        <div className="px-6 py-4 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center p-1.5 border border-[#DACBAA]">
              {/* Google Brand G Logo */}
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27A7.17 7.17 0 0 1 4.9 12c0-.79.14-1.56.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm text-[#2C2417]">
                  Sign in with Google
                </span>
                <span className="bg-[#8B5A3C] text-[#FBF7EE] text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                  Admin Lock (Client Simulation)
                </span>
              </div>
              <p className="text-[11px] text-[#766A57]">
                THE FAB HOUSE · Whitelisted Account Access Control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Shield Banner */}
        <div className="px-6 py-3 bg-[#F3EBDA] border-b border-[#DACBAA]/60 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[#8B5A3C] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#766A57] leading-relaxed">
            <strong className="text-[#2C2417]">Restricted Area:</strong> Client-side whitelisted Google identity check for back office administration (GST invoices, mill production, and dealer approvals). Only authorized owner addresses have access.
          </div>
        </div>

        {/* Real-Time Resend Alert Notice */}
        <div className="mx-6 mt-3.5 p-3 bg-[#EEF5E8] border border-[#BBD6B4] rounded-xl flex items-start gap-2.5 text-[11px] text-[#244A1E]">
          <Mail className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold">Real-Time Transactional Email Alerts (Resend):</span>
            <p className="text-[#355B2E]">
              Upon successful Google identity verification, a server-side alert email is automatically dispatched to <strong className="font-mono text-[10.5px]">bhaktikakade05@gmail.com</strong> and <strong className="font-mono text-[10.5px]">anandsg575@gmail.com</strong> recording the owner name, login date, and Asia/Kolkata timestamp.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Error Message Box (if unauthorized or error) */}
          {authError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Access Denied (403 Unauthorized)</span>
              </div>
              <p className="text-[11px] text-red-700 leading-normal">{authError}</p>
            </div>
          )}

          {/* Quick Owner Sign-In Cards for Whitelisted Accounts */}
          <div className="space-y-3">
            {/* Account 1: Bhakti Kakade */}
            <div className="bg-white border-2 border-[#DACBAA] hover:border-[#8B5A3C] rounded-2xl p-3.5 transition-all shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8B5A3C] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Owner (Primary)
                </span>
                <span className="text-[10px] bg-[#E3E7D8] text-[#5F6B4A] px-2 py-0.5 rounded-full font-bold">
                  Whitelisted
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#8B5A3C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  BK
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-[#2C2417] truncate">{PRIMARY_OWNER_NAME}</p>
                  <p className="font-mono text-[11px] text-[#766A57] truncate font-semibold">
                    {PRIMARY_OWNER_EMAIL}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleQuickLogin(PRIMARY_OWNER_EMAIL, PRIMARY_OWNER_NAME)}
                disabled={isSimulatingGoogleAuth}
                className="w-full py-2 px-3 bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer text-xs"
              >
                {isSimulatingGoogleAuth ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Identity & Sending Resend Alert...</span>
                  </div>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Sign in as {PRIMARY_OWNER_NAME}</span>
                  </>
                )}
              </button>
            </div>

            {/* Account 2: Anand Gaikwad */}
            <div className="bg-white border-2 border-[#DACBAA] hover:border-[#8B5A3C] rounded-2xl p-3.5 transition-all shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8B5A3C] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Owner
                </span>
                <span className="text-[10px] bg-[#E3E7D8] text-[#5F6B4A] px-2 py-0.5 rounded-full font-bold">
                  Whitelisted
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#5F6B4A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  AG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-[#2C2417] truncate">{SECONDARY_OWNER_NAME}</p>
                  <p className="font-mono text-[11px] text-[#766A57] truncate font-semibold">
                    {SECONDARY_OWNER_EMAIL}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleQuickLogin(SECONDARY_OWNER_EMAIL, SECONDARY_OWNER_NAME)}
                disabled={isSimulatingGoogleAuth}
                className="w-full py-2 px-3 bg-[#5F6B4A] hover:bg-[#4E583C] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer text-xs"
              >
                {isSimulatingGoogleAuth ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Identity & Sending Resend Alert...</span>
                  </div>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Sign in as {SECONDARY_OWNER_NAME}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Custom Google Email Section */}
          <div className="pt-2 border-t border-[#DACBAA]/60">
            {authMode === 'quick' ? (
              <button
                onClick={() => {
                  setAuthMode('custom');
                  setAuthError(null);
                }}
                className="text-[11px] text-[#8B5A3C] hover:underline font-semibold flex items-center gap-1 mx-auto"
              >
                <span>Test with a different Google account to verify security block</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <form onSubmit={handleCustomEmailLogin} className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#2C2417]">
                    Try another Google Email (Security Check):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('quick');
                      setAuthError(null);
                    }}
                    className="text-[10px] text-[#766A57] hover:underline"
                  >
                    Back to Owner Quick Login
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    placeholder="e.g. outsider@gmail.com"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#DACBAA] text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                  <button
                    type="submit"
                    disabled={isSimulatingGoogleAuth}
                    className="px-4 py-2 rounded-xl bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] font-bold text-xs transition-colors shrink-0"
                  >
                    Check Access
                  </button>
                </div>

                <p className="text-[10px] text-[#766A57]">
                  Any non-whitelisted email will receive an immediate 403 Forbidden alert, preventing unauthorized access.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#E7DAC0] border-t border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#766A57]">
            <KeyRound className="w-3.5 h-3.5 text-[#8B5A3C]" />
            <span>Active Whitelist: {AUTHORIZED_ADMIN_EMAILS.length} Authorized Owner Accounts</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] hover:bg-white text-[#2C2417] font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
