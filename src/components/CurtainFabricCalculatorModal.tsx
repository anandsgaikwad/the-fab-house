import React, { useState } from 'react';
import {
  Calculator,
  X,
  Layers,
  Sparkles,
  ShoppingCart,
  Check,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CurtainFabricCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurtainFabricCalculatorModal: React.FC<CurtainFabricCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, addToCart, showToast, setActiveView } = useApp();

  // Inputs
  const [windowWidthFeet, setWindowWidthFeet] = useState<number>(5); // e.g. 5 feet wide
  const [windowHeightFeet, setWindowHeightFeet] = useState<number>(7); // e.g. 7 feet high
  const [pannaWidth, setPannaWidth] = useState<54 | 110>(54); // 54" single panna or 110" double panna
  const [pleatFullness, setPleatFullness] = useState<number>(2.2); // 2.2x standard eyelet/pinch pleat
  const [selectedSku, setSelectedSku] = useState<string>(products[0]?.sku || '');
  const [panelsCount, setPanelsCount] = useState<number>(2); // Pair of 2 panels

  if (!isOpen) return null;

  // Calculation Logic
  // Convert window width to inches
  const windowWidthInches = windowWidthFeet * 12;
  const windowHeightInches = windowHeightFeet * 12;

  // Total fabric width required with fullness
  const totalFabricWidthNeeded = windowWidthInches * pleatFullness;

  let metersNeeded = 0;
  let calculationNote = '';

  if (pannaWidth === 54) {
    // Single panna (54 inches wide roll):
    // Fabric runs vertically down the drop.
    // Number of 54" cuts needed = totalFabricWidthNeeded / 54
    const cutsNeeded = Math.ceil(totalFabricWidthNeeded / 54);
    // Hem allowance per cut: 8 inches top header + 4 inches bottom hem = 12 inches
    const cutLengthInches = windowHeightInches + 12;
    // Total inches = cutsNeeded * cutLengthInches
    const totalInches = cutsNeeded * cutLengthInches;
    // Convert to meters (1 meter = 39.37 inches)
    metersNeeded = Math.ceil((totalInches / 39.37) * 10) / 10;
    calculationNote = `${cutsNeeded} vertical drops of ${(cutLengthInches / 39.37).toFixed(1)}m each (including hems) for 54" roll`;
  } else {
    // Double panna (110 inches / 2.8 meters wide roll):
    // Roll width is high enough to cover standard 7-8 ft drops seamlessly without vertical joints!
    // Fabric length needed is along the width of window + fullness + side hems (8 inches)
    const totalWidthInches = totalFabricWidthNeeded + 8;
    metersNeeded = Math.ceil((totalWidthInches / 39.37) * 10) / 10;
    calculationNote = `Continuous seamless horizontal run on 110" double-width roll (no vertical stitching joints)`;
  }

  // Round up to nearest 0.5 meter for standard wholesale roll cutting
  const recommendedOrderMeters = Math.max(2.5, Math.ceil(metersNeeded * 2) / 2);

  const selectedProduct = products.find(p => p.sku === selectedSku) || products[0];
  const estimatedCost = selectedProduct ? recommendedOrderMeters * (selectedProduct.dpl || selectedProduct.dealerPriceList || 0) : 0;

  const handleAddCalculatedToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, recommendedOrderMeters);
    showToast(`Added ${recommendedOrderMeters}m of ${selectedProduct.catalogueName} to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C2417]/65 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close background" />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-xl w-full shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-b border-[#DACBAA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#8B5A3C] text-white rounded-lg">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B5A3C] block">
                Fabric Estimation Tool
              </span>
              <h3 className="font-display font-bold text-sm text-[#2C2417]">
                Curtain & Blind Yardage Calculator
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-2.5 bg-[#F3EBDA] border-b border-[#DACBAA]/60 flex items-center gap-2 text-[11px] text-[#766A57]">
          <Info className="w-3.5 h-3.5 text-[#8B5A3C] shrink-0" />
          <span>
            Instantly calculate exact fabric meterage required for single (54") and double (110") panna rolls based on window aperture.
          </span>
        </div>

        {/* Inputs Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Dimension Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2C2417] block mb-1">
                Window Width (Feet)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={30}
                  step={0.5}
                  value={windowWidthFeet}
                  onChange={e => setWindowWidthFeet(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DACBAA] text-xs font-semibold text-[#2C2417]"
                />
                <span className="absolute right-3 top-2 text-[11px] text-[#766A57]">ft</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#2C2417] block mb-1">
                Window Height / Drop (Feet)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={25}
                  step={0.5}
                  value={windowHeightFeet}
                  onChange={e => setWindowHeightFeet(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DACBAA] text-xs font-semibold text-[#2C2417]"
                />
                <span className="absolute right-3 top-2 text-[11px] text-[#766A57]">ft</span>
              </div>
            </div>
          </div>

          {/* Panna Width Selection */}
          <div>
            <label className="font-bold text-[#2C2417] block mb-1.5">
              Roll Panna / Width
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPannaWidth(54)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  pannaWidth === 54
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] text-[#2C2417] shadow-xs'
                    : 'bg-white border-[#DACBAA] text-[#766A57]'
                }`}
              >
                <span className="font-bold block text-xs">54" Single Panna (137 cm)</span>
                <span className="text-[10px] text-[#766A57]">Standard vertical drops & tailoring</span>
              </button>

              <button
                type="button"
                onClick={() => setPannaWidth(110)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  pannaWidth === 110
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] text-[#2C2417] shadow-xs'
                    : 'bg-white border-[#DACBAA] text-[#766A57]'
                }`}
              >
                <span className="font-bold block text-xs">110" Double Panna (280 cm)</span>
                <span className="text-[10px] text-[#766A57]">Seamless joint-free curtains</span>
              </button>
            </div>
          </div>

          {/* Pleating / Gathering Fullness */}
          <div>
            <label className="font-bold text-[#2C2417] block mb-1.5">
              Pleat Fullness Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '2.0x Standard', value: 2.0, desc: 'Tailored wave' },
                { label: '2.2x Deluxe', value: 2.2, desc: 'Eyelet / Pleated' },
                { label: '2.5x Heavy', value: 2.5, desc: 'Luxury rich folds' },
              ].map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPleatFullness(item.value)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    pleatFullness === item.value
                      ? 'bg-[#8B5A3C] text-white border-[#8B5A3C] font-bold'
                      : 'bg-white text-[#766A57] border-[#DACBAA]'
                  }`}
                >
                  <span className="block text-xs">{item.label}</span>
                  <span className="text-[10px] opacity-80">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select Target Fabric Product */}
          <div>
            <label className="font-bold text-[#2C2417] block mb-1">
              Select Fabric Catalogue & Shade
            </label>
            <select
              value={selectedSku}
              onChange={e => setSelectedSku(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DACBAA] text-xs font-medium text-[#2C2417]"
            >
              {products.map(prod => (
                <option key={prod.sku} value={prod.sku}>
                  {prod.catalogueName} · {prod.colorName || prod.shadeNo} (Rate: ₹{prod.dpl || prod.dealerPriceList}/m, Panna: {prod.width})
                </option>
              ))}
            </select>
          </div>

          {/* Calculation Result Summary Card */}
          <div className="p-4 bg-[#E7DAC0] rounded-2xl border border-[#DACBAA] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#8B5A3C]">
                Calculated Requirement
              </span>
              <span className="text-[10px] bg-[#5F6B4A] text-white px-2 py-0.5 rounded-full font-semibold">
                Tailoring Verified
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-display font-bold text-[#2C2417]">
                  {recommendedOrderMeters} Metres
                </span>
                <p className="text-[11px] text-[#766A57]">{calculationNote}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#766A57] block">Estimated DPL Value:</span>
                <span className="font-mono font-bold text-base text-[#8B5A3C]">
                  ₹{estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-t border-[#DACBAA] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-[#DACBAA] bg-[#FBF7EE] hover:bg-white text-[#2C2417] font-semibold text-xs transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleAddCalculatedToCart}
            className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add {recommendedOrderMeters}m to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
