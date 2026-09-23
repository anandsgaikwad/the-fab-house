import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Warehouse,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDepotForLocation, DEPOT_OPTIONS } from '../utils/dealerFinancials';
import { DealerAccount } from '../types';

interface DealerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DealerRegistrationModal: React.FC<DealerRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { registerDealer, setActiveDealer, showToast } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('LLP');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [customDepot, setCustomDepot] = useState('');

  const [registeredDealer, setRegisteredDealer] = useState<DealerAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-calculated depot
  const suggestedDepot = customDepot || getDepotForLocation(city, state);
  const suggestedDepotObj = DEPOT_OPTIONS.find(d => d.code === suggestedDepot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      showToast('Please enter your business or company name');
      return;
    }
    if (!contactPerson.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      showToast('Please provide contact person details');
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !pincode.trim()) {
      showToast('Please fill in complete business address');
      return;
    }

    setIsSubmitting(true);

    try {
      const newDealer = registerDealer({
        companyName: companyName.trim(),
        businessType,
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        gstin: gstin.trim().toUpperCase() || 'UNREGISTERED/IN-PROCESS',
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        depotCode: suggestedDepot,
      });

      setRegisteredDealer(newDealer);
      showToast(`Business "${newDealer.companyName}" registered! Awaiting Admin approval.`);
    } catch (err: any) {
      showToast(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchToNewAccount = () => {
    if (registeredDealer) {
      setActiveDealer(registeredDealer.id);
      showToast(`Switched to ${registeredDealer.companyName}`);
    }
    handleClose();
  };

  const handleClose = () => {
    setRegisteredDealer(null);
    setCompanyName('');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setGstin('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setPincode('');
    setCustomDepot('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#E7DAC0] px-5 py-4 border-b border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8B5A3C] text-white rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#2C2417]">
                Dealer &amp; Business Registration
              </h2>
              <p className="text-xs text-[#766A57]">
                Apply for authorized B2B wholesale dealership and fabric roll facilities
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#766A57] hover:bg-[#DACBAA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {registeredDealer ? (
          /* SUCCESS / PENDING APPROVAL CONFIRMATION */
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF8E6] border-2 border-[#E5C374] text-[#785412] mx-auto flex items-center justify-center shadow-xs">
              <Clock className="w-9 h-9 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#FFF8E6] text-[#785412] border border-[#E5C374]">
                Status: Pending Admin Approval
              </span>
              <h3 className="font-display font-bold text-2xl text-[#2C2417] mt-2">
                Application Submitted Successfully!
              </h3>
              <p className="text-xs text-[#766A57] max-w-md mx-auto">
                Your business dealership profile has been submitted. It is now awaiting review by <strong>THE FAB HOUSE</strong> administrative team.
              </p>
            </div>

            {/* Allocated Dealer Badge Card */}
            <div className="bg-[#F3EBDA] border border-[#DACBAA] rounded-2xl p-4 text-left max-w-lg mx-auto space-y-3">
              <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-2.5">
                <div>
                  <span className="text-[10px] text-[#766A57] block">Business Name</span>
                  <strong className="font-display text-base text-[#2C2417]">
                    {registeredDealer.companyName}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#766A57] block">Unique Dealer Code</span>
                  <strong className="font-mono text-base text-[#8B5A3C] tracking-wide">
                    {registeredDealer.dealerCode}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#766A57] block">Allocated Depot</span>
                  <span className="font-mono font-semibold text-[#2C2417]">
                    {registeredDealer.depotCode}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#766A57] block">Business Type</span>
                  <span className="font-semibold text-[#2C2417]">{registeredDealer.businessType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#766A57] block">GSTIN</span>
                  <span className="font-mono text-[#2C2417]">{registeredDealer.gstin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#766A57] block">Contact Person</span>
                  <span className="text-[#2C2417]">{registeredDealer.contactPerson}</span>
                </div>
              </div>

              <div className="bg-[#FFF8E6] border border-[#E5C374]/60 rounded-xl p-2.5 text-[11px] text-[#785412] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#785412] mt-0.5" />
                <div>
                  <strong>Admin Authorization Workflow:</strong> Admin will review your GSTIN, assign your <strong>Credit Limit</strong>, and configure your <strong>Credit Period (e.g. Regular 45 Days Credit)</strong>. Once approved, all purchasing and credit features unlock instantly.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSwitchToNewAccount}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>View Dashboard as this Dealer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Step 1: Business Identity */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-[#2C2417] flex items-center gap-2 border-b border-[#DACBAA]/60 pb-1">
                <Building2 className="w-4 h-4 text-[#8B5A3C]" />
                <span>1. Business &amp; Company Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Business / Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EUREKA FURNISHINGS LLP, ABC INTERIORS PVT LTD"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Business Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  >
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Private Limited">Private Limited Company</option>
                    <option value="Partnership">Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Retail Studio">Retail Furnishing Studio / Showroom</option>
                    <option value="Contractor">Interior Contractor / Architect Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    GST Number (GSTIN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAFE1234F1Z8"
                    value={gstin}
                    onChange={e => setGstin(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C] font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Contact Person */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-[#2C2417] flex items-center gap-2 border-b border-[#DACBAA]/60 pb-1">
                <User className="w-4 h-4 text-[#8B5A3C]" />
                <span>2. Authorized Contact Person</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Patil"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98220 14852"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Business Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. orders@company.in"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Address & Location */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm text-[#2C2417] flex items-center gap-2 border-b border-[#DACBAA]/60 pb-1">
                <MapPin className="w-4 h-4 text-[#8B5A3C]" />
                <span>3. Business Location &amp; Depot Mapping</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Registered Workshop / Office Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Plot / Gala / Street address"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Industrial Area, Landmark, Phase"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune, Mumbai, Delhi, Bengaluru"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi / NCR</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 410501"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#766A57] mb-1">
                    Assigned Parent Depot Hub (Auto-Detected)
                  </label>
                  <div className="w-full bg-[#E9D9C5] border border-[#DACBAA] rounded-xl px-3 py-2 text-xs text-[#2C2417] flex items-center justify-between font-mono font-bold">
                    <span className="text-[#8B5A3C]">{suggestedDepot}</span>
                    <span className="text-[10px] font-sans text-[#766A57] font-normal">
                      {suggestedDepotObj?.city || 'Central Hub'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note regarding Admin authority & random code */}
            <div className="bg-[#E7DAC0]/50 border border-[#DACBAA] rounded-xl p-3 text-[11px] text-[#766A57] space-y-1">
              <p className="font-semibold text-[#2C2417]">
                Automatic Security &amp; Approval Guarantee:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>A unique 10-digit random Dealer Code (e.g. <code>0000xxxxxx</code>) will be generated automatically.</li>
                <li>Your account will be created with status <strong>Pending Approval</strong>.</li>
                <li>Credit limit and credit payment terms are determined and approved exclusively by Admin.</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
              >
                <span>Submit Dealer Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
