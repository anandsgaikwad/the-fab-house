import React, { useState } from 'react';
import {
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  X,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export type LegalDocType = 'terms' | 'disclaimer' | 'privacy';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalDocType;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C2417]/65 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close background" />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-3xl w-full shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-4 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8B5A3C] text-white rounded-xl shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B5A3C] block">
                Wholesale Legal & Commercial Framework
              </span>
              <h3 className="font-display font-bold text-base text-[#2C2417]">
                THE FAB HOUSE · Commercial Policies
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
              title="Print Policy"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-5 py-2.5 bg-[#F3EBDA] border-b border-[#DACBAA]/60 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'terms'
                ? 'bg-[#8B5A3C] text-white shadow-xs'
                : 'bg-white text-[#766A57] border border-[#DACBAA] hover:bg-[#E7DAC0]'
            }`}
          >
            Terms & Conditions (B2B)
          </button>
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'disclaimer'
                ? 'bg-[#8B5A3C] text-white shadow-xs'
                : 'bg-white text-[#766A57] border border-[#DACBAA] hover:bg-[#E7DAC0]'
            }`}
          >
            Commercial Disclaimer
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'privacy'
                ? 'bg-[#8B5A3C] text-white shadow-xs'
                : 'bg-white text-[#766A57] border border-[#DACBAA] hover:bg-[#E7DAC0]'
            }`}
          >
            Privacy & Data Policy
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-[#2C2417] leading-relaxed select-text">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="border-b border-[#DACBAA]/60 pb-2">
                <h4 className="font-bold text-sm text-[#2C2417]">1. Wholesale Dealer Agreement & Eligibility</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  Access to THE FAB HOUSE dealer trade portal is granted solely to registered furnishing retail showrooms, interior contractors, and commercial drapery fabricators holding a valid GSTIN.
                </p>
              </div>

              <div className="border-b border-[#DACBAA]/60 pb-2">
                <h4 className="font-bold text-sm text-[#2C2417]">2. Minimum Cut Lengths & Order Increments</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  Minimum cut length for standard roll cuts is 1.00 running metre. Roll orders eligible for special wholesale tier discounts must meet the indicated roll piece thresholds (typically 50m+ full pieces).
                </p>
              </div>

              <div className="border-b border-[#DACBAA]/60 pb-2">
                <h4 className="font-bold text-sm text-[#2C2417]">3. Commercial Credit Facility & Settlement</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  Credit limits and payment cycles (e.g. 30, 45, or 60 days) are granted subject to proprietor approval and past repayment track record. Interest at 18% per annum will apply on balances overdue beyond sanctioned credit periods.
                </p>
              </div>

              <div className="border-b border-[#DACBAA]/60 pb-2">
                <h4 className="font-bold text-sm text-[#2C2417]">4. Claims, Defect Inspection & Returns</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  All fabric lengths must be inspected before cutting or stitching. Once cut by the fabricator, goods cannot be returned. Any weave flaws or dye shading discrepancies exceeding commercial 4-point standards must be registered via the Claims Portal within 7 calendar days of delivery.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#2C2417]">5. Jurisdiction</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  All disputes and commercial claims arising under transactions through this portal are strictly subject to Pune / Maharashtra jurisdiction.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FAF5EC] border border-[#DACBAA] rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#8B5A3C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[#2C2417]">Fabric Color & Dye Lot Variance Notice</h4>
                  <p className="text-xs text-[#766A57]">
                    Slight shade variations are inherent across separate dye-lot production runs. While fabrics are calibrated under standard D65 daylight simulators, screen representations, swatches, and physical production lots may vary within standard ±3% delta-E commercial tolerances.
                  </p>
                </div>
              </div>

              <div className="border-b border-[#DACBAA]/60 pb-2">
                <h4 className="font-bold text-sm text-[#2C2417]">Inventory Allocation & Lead Times</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  Stock displayed reflects central depot reserves and live mill procurement pipelines. In high-demand scenarios, order confirmation reserves yardage sequentially. Production items sourced from partner mills in Ichalkaranji and Surat carry estimated manufacturing cycles of 7 to 14 business days.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#2C2417]">Transporter & Transit Risks</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  Goods are dispatched via designated surface or express road logistics (e.g. VRL Logistics, TCI Express). Consignment transit insurance is the responsibility of the registered dealer unless explicitly billed as insured consignment.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="border-b border-[#DACBAA]/60 pb-2">
                <h4 className="font-bold text-sm text-[#2C2417]">B2B Confidentiality & Commercial Data</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  Wholesale dealer price lists (DPL), dealer discount matrices, credit limits, and purchase volumes are proprietary trade secrets of THE FAB HOUSE and registered trade partners.
                </p>
              </div>

              <div className="border-b border-[#DACBAA]/60 pb-2">
                <h4 className="font-bold text-sm text-[#2C2417]">Storage & Local Workflows</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  This dealer preview portal stores active cart drafts, preference filters, and session records locally in browser storage for instant, offline-resilient access. No unauthorized third-party tracking cookies or advertising pixels are deployed.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#2C2417]">Communications & Dispatch Alerts</h4>
                <p className="text-xs text-[#766A57] mt-1">
                  Contact details supplied during dealer onboarding and order checkout are utilized strictly for transaction fulfillment, GST tax invoices, LR docket tracking, and owner dispatch notifications.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-t border-[#DACBAA] flex items-center justify-between">
          <span className="text-[11px] text-[#766A57]">
            THE FAB HOUSE · Anand Sachin Gaikwad · Registered Dealer Terms
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
