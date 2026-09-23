import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Truck,
  Building,
  PackageCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FabricCategory } from '../types';

interface CatalogueBook {
  id: string;
  name: string;
  code: string;
  category: FabricCategory;
  swatchCount: number;
  description: string;
  price: number;
  coverColor: string;
}

const SAMPLE_CATALOGUES: CatalogueBook[] = [
  {
    id: 'cat-1',
    name: 'Onyx Dimout 800 Master Binder',
    code: 'CAT-DIMOUT-2026',
    category: 'Dimout',
    swatchCount: 27,
    description: 'Complete ring-binder swatch book containing all 27 shades of 265 GSM 100% Polyester Dimout fabrics with drape waterfall swatches.',
    price: 0,
    coverColor: '#524336',
  },
  {
    id: 'cat-2',
    name: 'Solar Shading Architectural Box Set',
    code: 'CAT-SOLAR-26',
    category: 'Solar Shading',
    swatchCount: 16,
    description: 'High-performance solar screen swatch collection featuring 3%, 5%, and 10% openness factors with thermal dissipation ratings.',
    price: 0,
    coverColor: '#7A6B5D',
  },
  {
    id: 'cat-3',
    name: 'Chelmsford Blackout Luxury Portfolio',
    code: 'CAT-BLACKOUT-26',
    category: 'Blackout',
    swatchCount: 18,
    description: 'Zero-light transmission 3-pass blackout swatch cards, tactile textured jacquard surfaces, and flame-retardant test certificates.',
    price: 0,
    coverColor: '#3B332A',
  },
  {
    id: 'cat-4',
    name: 'Linen Luxe Sheer & Drapery Book',
    code: 'CAT-CURTAINS-26',
    category: 'Curtains',
    swatchCount: 22,
    description: 'Natural slub textured curtain drapes and translucent voiles designed for modern residences and boutique hospitality.',
    price: 0,
    coverColor: '#8B5A3C',
  },
];

export const CatalogueOrderView: React.FC = () => {
  const { businessProfile, requestCatalogue, catalogueDispatches, setActiveView } = useApp();
  const [selectedCatalogue, setSelectedCatalogue] = useState<CatalogueBook | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(
    businessProfile.addresses[0]?.id || ''
  );
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalogue) return;
    requestCatalogue(selectedCatalogue.name, selectedCatalogue.category, qty);
    setOrderSuccess(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Physical Catalogue & Swatch Book Requests
          </h1>
          <p className="text-xs text-[#766A57]">
            Equip your showroom and sales team with authentic fabric swatch binders and waterfall sample boards
          </p>
        </div>
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-xs font-semibold text-[#8B5A3C] hover:underline"
        >
          View Dispatched Catalogues in Dashboard
        </button>
      </div>

      {/* Available Catalogue Binders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SAMPLE_CATALOGUES.map(book => (
          <div
            key={book.id}
            className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="w-14 h-16 rounded-xl border border-[#DACBAA] shadow-md flex items-center justify-center text-[#FBF7EE] shrink-0"
                  style={{ backgroundColor: book.coverColor }}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E9D9C5] text-[#8B5A3C]">
                    {book.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#2C2417]">
                    {book.name}
                  </h3>
                  <p className="text-[11px] font-mono text-[#766A57]">
                    Ref Code: {book.code} · {book.swatchCount} Swatches Included
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#766A57] leading-relaxed">
                {book.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#DACBAA]/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#766A57] block">Dealer Price:</span>
                <span className="text-xs font-bold text-[#5F6B4A]">
                  Free (Authorized Dealer Quota)
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedCatalogue(book);
                  setOrderSuccess(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Request Sample Binder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DISPATCH HISTORY TRACKER */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#DACBAA]/60 pb-3">
          <Truck className="w-4 h-4 text-[#8B5A3C]" />
          <h2 className="font-display font-bold text-base text-[#2C2417]">
            Active Catalogue Dispatches to {businessProfile.companyName}
          </h2>
        </div>

        <div className="divide-y divide-[#DACBAA]/50 text-xs">
          {catalogueDispatches.map(cat => (
            <div key={cat.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2C2417]">{cat.catalogueName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E3E7D8] text-[#5F6B4A]">
                    {cat.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#766A57]">
                  Code: <strong className="font-mono">{cat.catalogueCode}</strong> · Qty: {cat.quantity} copy · Invoice: {cat.invoiceNo}
                </p>
              </div>

              <div className="text-left sm:text-right text-[11px] text-[#766A57]">
                <p>Carrier: <strong className="text-[#2C2417]">{cat.transporter}</strong></p>
                <p>Docket: <span className="font-mono text-[#8B5A3C] font-semibold">{cat.docketNumber}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REQUEST MODAL */}
      {selectedCatalogue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2C2417]/60 backdrop-blur-xs"
            onClick={() => setSelectedCatalogue(null)}
          />

          <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4 text-xs">
            {orderSuccess ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-[#E3E7D8] text-[#5F6B4A] mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#2C2417]">
                  Sample Book Request Logged!
                </h3>
                <p className="text-xs text-[#766A57]">
                  Your request for <strong>{selectedCatalogue.name}</strong> will be prepared by the dispatch bay and sent via Surface Logistics.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedCatalogue(null);
                      setOrderSuccess(false);
                    }}
                    className="px-6 py-2 rounded-xl bg-[#8B5A3C] text-white text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#DACBAA]/60">
                  <BookOpen className="w-5 h-5 text-[#8B5A3C]" />
                  <h3 className="font-display font-bold text-base text-[#2C2417]">
                    Request: {selectedCatalogue.name}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-[#2C2417] block mb-1">
                      Copies Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={qty}
                      onChange={e => setQty(parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-[#766A57] ml-2">set(s)</span>
                  </div>

                  <div>
                    <label className="font-bold text-[#2C2417] block mb-1">
                      Deliver to Registered Showroom / Branch
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={e => setSelectedAddressId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs text-[#2C2417]"
                    >
                      {businessProfile.addresses.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.title} — {a.city} ({a.addressLine1})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#DACBAA]/60">
                  <button
                    type="button"
                    onClick={() => setSelectedCatalogue(null)}
                    className="px-4 py-2 rounded-xl border border-[#DACBAA] font-semibold text-[#766A57]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold transition-colors shadow-xs"
                  >
                    Confirm Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
