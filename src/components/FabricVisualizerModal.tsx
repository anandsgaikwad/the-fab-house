import React, { useState } from 'react';
import { X, Sun, Moon, Sparkles, Layers, Sliders, Check } from 'lucide-react';
import { Product } from '../types';

interface FabricVisualizerModalProps {
  product: Product | null;
  onClose: () => void;
}

export const FabricVisualizerModal: React.FC<FabricVisualizerModalProps> = ({
  product,
  onClose,
}) => {
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [styleMode, setStyleMode] = useState<'curtain' | 'blind'>('curtain');
  const [wallColor, setWallColor] = useState<'warm-white' | 'slate' | 'sand'>('warm-white');

  if (!product) return null;

  const wallBg =
    wallColor === 'warm-white'
      ? 'bg-[#F5F2EB]'
      : wallColor === 'slate'
      ? 'bg-[#D1D5DB]'
      : 'bg-[#E6DBCA]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="fixed inset-0 bg-[#2C2417]/65 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#DACBAA]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E9D9C5] rounded-xl text-[#8B5A3C]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#2C2417]">
                Room Visualizer (Curtain & Shading Simulation)
              </h3>
              <p className="text-xs text-[#766A57]">
                {product.catalogueName} · {product.colorName} ({product.category})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#766A57] hover:bg-[#E7DAC0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#E7DAC0]/70 rounded-xl text-xs">
          {/* Lighting Mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#766A57] font-medium">Lighting:</span>
            <div className="flex bg-[#FBF7EE] rounded-lg p-0.5 border border-[#DACBAA]">
              <button
                onClick={() => setTimeOfDay('day')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  timeOfDay === 'day' ? 'bg-[#8B5A3C] text-white shadow-xs' : 'text-[#766A57]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Day Sunlight
              </button>
              <button
                onClick={() => setTimeOfDay('night')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  timeOfDay === 'night' ? 'bg-[#2C2417] text-[#EDE3D0] shadow-xs' : 'text-[#766A57]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Evening Interior
              </button>
            </div>
          </div>

          {/* Style */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#766A57] font-medium">Drapery Style:</span>
            <div className="flex bg-[#FBF7EE] rounded-lg p-0.5 border border-[#DACBAA]">
              <button
                onClick={() => setStyleMode('curtain')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  styleMode === 'curtain' ? 'bg-[#8B5A3C] text-white shadow-xs' : 'text-[#766A57]'
                }`}
              >
                Ripple Fold Pleats
              </button>
              <button
                onClick={() => setStyleMode('blind')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  styleMode === 'blind' ? 'bg-[#8B5A3C] text-white shadow-xs' : 'text-[#766A57]'
                }`}
              >
                Architectural Screen
              </button>
            </div>
          </div>
        </div>

        {/* Realistic Architectural Window Room Scene */}
        <div
          className={`relative w-full aspect-16/10 rounded-xl overflow-hidden border border-[#DACBAA] ${wallBg} transition-colors duration-300 flex flex-col justify-end p-4 shadow-inner`}
        >
          {/* Ambient Lighting Overlay */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              timeOfDay === 'night' ? 'bg-[#1a140f]/60' : 'bg-transparent'
            }`}
          />

          {/* Window Frame Background (Glass with view outside) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4/5 h-4/5 bg-gradient-to-b from-[#B0C4DE] to-[#E6F2FF] border-8 border-[#3A2E20] rounded-t-sm shadow-md flex">
            {/* Outdoor skyline / garden silhouette */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#465A42]/50 to-transparent pointer-events-none" />
            <div className="w-1/2 h-full border-r-4 border-[#3A2E20]" />
            <div className="w-1/2 h-full" />
          </div>

          {/* Curtain / Fabric Panels */}
          {styleMode === 'curtain' ? (
            <div className="relative z-10 w-full h-full flex justify-between px-6 pointer-events-none">
              {/* Left Curtain Drapery with Ripple Folds */}
              <div
                className="w-2/5 h-full rounded-b-md shadow-2xl relative overflow-hidden"
                style={{
                  backgroundColor: product.colorHex,
                  backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(255,255,255,0.2) 12px, rgba(0,0,0,0.35) 24px)`,
                  opacity: product.category === 'Blackout' ? 0.98 : product.category === 'Dimout' ? 0.92 : 0.75,
                }}
              >
                <div className="absolute top-0 inset-x-0 h-3 bg-[#2C2417]/80" />
              </div>

              {/* Center Open Vista Window gap */}
              <div className="w-1/5" />

              {/* Right Curtain Drapery */}
              <div
                className="w-2/5 h-full rounded-b-md shadow-2xl relative overflow-hidden"
                style={{
                  backgroundColor: product.colorHex,
                  backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(255,255,255,0.2) 12px, rgba(0,0,0,0.35) 24px)`,
                  opacity: product.category === 'Blackout' ? 0.98 : product.category === 'Dimout' ? 0.92 : 0.75,
                }}
              >
                <div className="absolute top-0 inset-x-0 h-3 bg-[#2C2417]/80" />
              </div>
            </div>
          ) : (
            /* Modern Roller / Architectural Blind simulation */
            <div className="relative z-10 w-full h-full flex justify-center px-8 pointer-events-none">
              <div
                className="w-4/5 h-[85%] rounded-b-xs shadow-2xl relative border-b-6 border-[#8B5A3C]"
                style={{
                  backgroundColor: product.colorHex,
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 6px)`,
                  opacity: product.category === 'Blackout' ? 1 : 0.85,
                }}
              >
                <div className="absolute top-0 inset-x-0 h-4 bg-[#4A3B2C]" />
                <div className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded">
                  {product.category === 'Solar Shading' ? '3% Openness' : '100% Light Block'}
                </div>
              </div>
            </div>
          )}

          {/* Curtain Rod */}
          <div className="absolute top-2 inset-x-6 h-2 bg-[#8B5A3C] rounded-full shadow-lg z-20 flex justify-between items-center">
            <span className="w-4 h-4 rounded-full bg-[#4A3B2C] -ml-2" />
            <span className="w-4 h-4 rounded-full bg-[#4A3B2C] -mr-2" />
          </div>

          {/* Floor baseboard */}
          <div className="relative z-20 -mx-4 -mb-4 h-4 bg-[#8B5A3C]/30 border-t border-[#8B5A3C]/40" />
        </div>

        {/* Fabric Specifications Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2.5 bg-[#E7DAC0]/50 rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[10px]">Fabric Category</span>
            <strong className="text-[#2C2417]">{product.category}</strong>
          </div>
          <div className="p-2.5 bg-[#E7DAC0]/50 rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[10px]">Fabric Weight</span>
            <strong className="text-[#2C2417]">{product.gsm}</strong>
          </div>
          <div className="p-2.5 bg-[#E7DAC0]/50 rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[10px]">Roll Width</span>
            <strong className="text-[#2C2417]">{product.width}</strong>
          </div>
          <div className="p-2.5 bg-[#E7DAC0]/50 rounded-xl border border-[#DACBAA]/60">
            <span className="text-[#766A57] block text-[10px]">Composition</span>
            <strong className="text-[#2C2417] truncate block">{product.composition}</strong>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#8B5A3C] text-white text-xs font-semibold hover:bg-[#72482E] transition-colors"
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>
  );
};
