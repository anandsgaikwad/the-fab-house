import React, { useState } from 'react';
import {
  X,
  Heart,
  Eye,
  Check,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Maximize2,
  ZoomIn,
  Truck,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { HighResFabricPatternCanvas } from './FullScreenFabricGalleryModal';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForOrder: (product: Product) => void;
  onOpenGallery?: (productId: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onSelectForOrder,
  onOpenGallery,
}) => {
  const {
    isInWishlist,
    toggleWishlist,
    setVisualizeProduct,
    addToCart,
    showToast,
  } = useApp();

  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4>(1);
  const [selectedQty, setSelectedQty] = useState<number>(50);

  if (!isOpen || !product) return null;

  const isFavorited = isInWishlist(product.id);
  const isRollDiscountApplied = selectedQty >= product.rollDiscountThreshold;
  const lineDplGross = product.dpl * selectedQty;
  const discountAmount = isRollDiscountApplied
    ? (lineDplGross * product.rollDiscountPercentage) / 100
    : 0;
  const lineDplNet = lineDplGross - discountAmount;

  const handleQuickAdd = () => {
    addToCart(product, selectedQty, 'Surface');
    showToast(`Added ${selectedQty}m of ${product.catalogueName} to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2C2417]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-2xl w-full shadow-2xl z-10 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#E7DAC0] border-b border-[#DACBAA]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8B5A3C] text-white">
              {product.category}
            </span>
            <span className="text-xs font-mono font-semibold text-[#766A57]">
              SKU: {product.sku}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                  : 'bg-[#FBF7EE] text-[#766A57] hover:text-rose-600 hover:bg-rose-50 border border-[#DACBAA]'
              }`}
              title={isFavorited ? 'Remove from Wishlist' : 'Save to Wishlist in Profile'}
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  isFavorited ? 'fill-rose-600 text-rose-600' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {isFavorited ? 'Saved' : 'Wishlist'}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#766A57] hover:bg-[#DACBAA] hover:text-[#2C2417] transition-colors"
              aria-label="Close Quick View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Grid: Swatch Preview & Primary Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {/* Left: Swatch Pattern Inspector */}
            <div className="space-y-2">
              <div className="relative aspect-square w-full rounded-xl border-2 border-[#DACBAA] shadow-md overflow-hidden bg-white group">
                <HighResFabricPatternCanvas
                  product={product}
                  zoomLevel={zoomLevel}
                  lightingMode="raking"
                  className="w-full h-full"
                />

                {/* Shade Tag */}
                <div className="absolute bottom-2.5 left-2.5 bg-[#2C2417]/85 backdrop-blur-xs text-[#FBF7EE] px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
                  Shade: {product.shadeNo} · {product.colorName}
                </div>

                {/* Color Swatch Dot */}
                <div
                  className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: product.colorHex }}
                  title={product.colorName}
                />

                {/* Macro Zoom Controls */}
                <div className="absolute top-2.5 right-2.5 flex items-center bg-[#2C2417]/80 backdrop-blur-xs rounded-lg p-0.5 border border-white/20 text-white shadow-xs">
                  {([1, 2, 4] as const).map(z => (
                    <button
                      key={z}
                      onClick={() => setZoomLevel(z)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        zoomLevel === z ? 'bg-[#8B5A3C] text-white' : 'hover:bg-white/20'
                      }`}
                    >
                      {z}×
                    </button>
                  ))}
                </div>
              </div>

              {/* View Macro in Gallery button */}
              {onOpenGallery && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGallery(product.id);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-[#E7DAC0] hover:bg-[#DACBAA] text-xs font-semibold text-[#2C2417] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#8B5A3C]" />
                  <span>Inspect Full-Screen Weave Gallery</span>
                </button>
              )}
            </div>

            {/* Right: Info & Pricing */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B5A3C] block">
                  {product.collection}
                </span>
                <h3 className="font-display font-bold text-xl text-[#2C2417] leading-tight">
                  {product.catalogueName}
                </h3>
                <p className="text-xs text-[#766A57] mt-0.5">
                  Colorway: <strong className="text-[#2C2417]">{product.colorName}</strong>
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F3EBDA]/70 p-3 rounded-xl border border-[#DACBAA]/60">
                <div>
                  <span className="text-[#766A57] block text-[10px]">GSM Weight</span>
                  <strong className="text-[#2C2417] font-mono">{product.gsm}</strong>
                </div>
                <div>
                  <span className="text-[#766A57] block text-[10px]">Roll Width</span>
                  <strong className="text-[#2C2417] font-mono">{product.width}</strong>
                </div>
                <div>
                  <span className="text-[#766A57] block text-[10px]">Composition</span>
                  <strong className="text-[#2C2417] truncate block">{product.composition}</strong>
                </div>
                <div>
                  <span className="text-[#766A57] block text-[10px]">Weave Texture</span>
                  <strong className="text-[#2C2417] capitalize">{product.textureType}</strong>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-3.5 bg-[#FAF5EC] rounded-xl border border-[#DACBAA] space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#766A57]">B2B Dealer Price (DPL):</span>
                  <span className="text-lg font-mono font-bold text-[#8B5A3C]">
                    ₹{(product.dpl || 0).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-[#766A57]">/ metre</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#766A57]">
                  <span>Reference MRP:</span>
                  <span className="line-through font-mono">₹{product.mrp} /m</span>
                </div>
                <div className="pt-1.5 border-t border-[#DACBAA]/60 flex items-center justify-between text-xs text-[#5F6B4A]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Roll Discount:
                  </span>
                  <span className="font-bold">
                    {product.rollDiscountPercentage}% OFF on ≥{product.rollDiscountThreshold}m
                  </span>
                </div>
              </div>

              {/* Live Warehouse Stock */}
              <div className="p-3 bg-[#E3E7D8]/80 rounded-xl border border-[#5F6B4A]/30 text-xs">
                <div className="flex items-center justify-between font-semibold text-[#5F6B4A] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Available Warehouse Stock:
                  </span>
                  <span className="font-mono text-sm font-bold">
                    {(product.totalStockMeters || 0).toLocaleString('en-IN')}m
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 font-mono">
                  {product.stockBuckets.map(b => (
                    <div key={b.range} className="p-1 bg-white/70 rounded border border-[#5F6B4A]/20">
                      <span className="text-[9px] text-[#766A57] block truncate">{b.range}</span>
                      <strong className="text-[#2C2417]">{Number(b.quantityMeters || 0).toFixed(0)}m</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Order Quantity Selector */}
          <div className="p-4 bg-[#E7DAC0]/50 rounded-xl border border-[#DACBAA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="font-bold text-[#2C2417] whitespace-nowrap">Order Metres:</span>
              <div className="flex items-center gap-1">
                {[25, 50, 100].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setSelectedQty(qty)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border transition-colors ${
                      selectedQty === qty
                        ? 'bg-[#8B5A3C] text-white border-[#8B5A3C]'
                        : 'bg-white text-[#2C2417] border-[#DACBAA] hover:bg-[#FBF7EE]'
                    }`}
                  >
                    {qty}m
                  </button>
                ))}
              </div>
            </div>

            <div className="text-right w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
              <div>
                <span className="text-[10px] text-[#766A57] block">Estimated Total DPL:</span>
                <span className="font-mono font-bold text-sm text-[#8B5A3C]">
                  ₹{lineDplNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#E7DAC0] border-t border-[#DACBAA] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              setVisualizeProduct(product);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FBF7EE] hover:bg-[#F3EBDA] text-[#2C2417] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#DACBAA] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#8B5A3C]" />
            <span>Room Curtain Visualizer</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#5F6B4A] hover:bg-[#4C563B] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add {selectedQty}m to Cart</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectForOrder(product);
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Place Full Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
