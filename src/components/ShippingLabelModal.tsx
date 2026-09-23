import React, { useRef } from 'react';
import {
  Printer,
  X,
  Package,
  Truck,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Order } from '../types';

interface ShippingLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalMeters = order.items.reduce((sum, item) => sum + item.quantityMeters, 0);
  const totalBales = Math.max(1, Math.ceil(totalMeters / 45)); // ~40-50m per roll bale
  const estimatedKg = Math.round(totalMeters * 0.42); // avg 420gsm

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C2417]/70 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close background" />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-lg w-full shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#8B5A3C] text-white rounded-lg">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B5A3C] block">
                Standard 4" × 6" Logistics Label
              </span>
              <h3 className="font-display font-bold text-sm text-[#2C2417]">
                Parcel Packaging Slip #{order.id}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Label Area */}
        <div className="p-5 overflow-y-auto flex-1 bg-neutral-100 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-md bg-white border-2 border-dashed border-neutral-800 p-4 shadow-sm text-[#111] space-y-3 font-sans print:border-solid print:max-w-none print:shadow-none"
          >
            {/* Top Bar: Consignor & QR */}
            <div className="flex items-start justify-between border-b-2 border-black pb-2.5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block">
                  CONSIGNOR (SENDER)
                </span>
                <h2 className="font-serif font-black text-sm tracking-tight text-black leading-tight">
                  THE FAB HOUSE
                </h2>
                <p className="text-[10px] font-bold text-neutral-800 leading-tight">
                  Anand Sachin Gaikwad · Mob: 9370150563
                </p>
                <p className="text-[9px] text-neutral-600 leading-tight">
                  Central Mill Depot: GIDC Textile Hub, Surat, Gujarat - 394230
                </p>
                <p className="text-[9px] font-mono font-semibold text-neutral-700">
                  GSTIN: 24AABCT1234F1Z5
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="w-14 h-14 bg-neutral-900 text-white p-1 rounded-sm flex items-center justify-center">
                  <QrCode className="w-full h-full text-white" />
                </div>
                <span className="text-[8px] font-mono uppercase mt-0.5 text-neutral-600">
                  {order.id}
                </span>
              </div>
            </div>

            {/* Transport & Docket strip */}
            <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-2 text-[10px]">
              <div>
                <span className="text-[9px] font-bold text-neutral-500 uppercase block">
                  TRANSPORTER / CARRIER
                </span>
                <strong className="text-xs uppercase font-black text-black block">
                  {order.transporterName || 'VRL Logistics Ltd'}
                </strong>
                <span className="text-[9px] text-neutral-700 font-medium">
                  Road Express Surface Cargo
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-bold text-neutral-500 uppercase block">
                  DOCKET / LR NUMBER
                </span>
                <strong className="text-xs font-mono font-black text-black block bg-neutral-100 px-1 py-0.5 border border-neutral-400 inline-block">
                  {order.docketNumber || 'LR-PENDING'}
                </strong>
                <span className="text-[9px] text-neutral-700 block">
                  Date: {new Date(order.orderDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* Consignee (Deliver To) */}
            <div className="border-b-2 border-black pb-3 space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block">
                CONSIGNEE (DELIVER TO)
              </span>
              <h3 className="font-black text-sm uppercase text-black leading-tight">
                {order.shippingAddress.title}
              </h3>
              <p className="text-[10px] text-neutral-800 leading-snug">
                {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}
              </p>
              <p className="text-[11px] font-black uppercase text-black">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-800">
                <span>
                  Attn: <strong>{order.shippingAddress.contactPerson}</strong>
                </span>
                <span className="font-mono font-bold">
                  Ph: {order.shippingAddress.phone}
                </span>
              </div>
            </div>

            {/* Fabric Roll & Bale Breakdown */}
            <div className="border-b-2 border-black pb-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1 bg-neutral-100 p-1 border border-neutral-300">
                <span>ITEM / SHADE</span>
                <span>PANNA</span>
                <span>METRES</span>
              </div>

              <div className="space-y-1 text-[10px]">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-neutral-200 pb-0.5">
                    <div>
                      <strong className="text-black">{it.catalogueName}</strong>
                      <span className="text-neutral-600 block text-[9px]">SKU: {it.sku} · Shade {it.shadeNo}</span>
                    </div>
                    <span className="font-mono text-neutral-700">54" (137cm)</span>
                    <strong className="font-mono text-black">{it.quantityMeters}m</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Bale Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center border-b-2 border-black pb-2 text-[10px]">
              <div className="p-1.5 bg-neutral-100 border border-neutral-300 rounded-xs">
                <span className="text-[8px] uppercase font-bold text-neutral-600 block">NO. OF BALES</span>
                <strong className="text-sm font-black text-black">{totalBales} ROLL(S)</strong>
              </div>
              <div className="p-1.5 bg-neutral-100 border border-neutral-300 rounded-xs">
                <span className="text-[8px] uppercase font-bold text-neutral-600 block">TOTAL FABRIC</span>
                <strong className="text-sm font-black text-black">{totalMeters} METRES</strong>
              </div>
              <div className="p-1.5 bg-neutral-100 border border-neutral-300 rounded-xs">
                <span className="text-[8px] uppercase font-bold text-neutral-600 block">APPROX WEIGHT</span>
                <strong className="text-sm font-black text-black">~{estimatedKg} KG</strong>
              </div>
            </div>

            {/* Caution & Barcode Strip */}
            <div className="flex items-center justify-between text-[9px] pt-1">
              <div className="flex items-center gap-1.5 text-neutral-800 font-bold uppercase">
                <AlertTriangle className="w-3.5 h-3.5 text-black shrink-0" />
                <span>FRAGILE TEXTILE · KEEP DRY · NO HOOKS</span>
              </div>
              <span className="font-mono font-bold text-neutral-700">
                DEPOT: MH-PUN-01
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#E7DAC0] border-t border-[#DACBAA] flex items-center justify-between no-print">
          <span className="text-[11px] text-[#766A57]">
            Direct peel-and-stick shipping label for bales and fabric roll cartons.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#DACBAA] bg-[#FBF7EE] hover:bg-white text-[#2C2417] font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
