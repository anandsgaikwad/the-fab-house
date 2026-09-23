import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  QrCode,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Eye,
  Info,
  Truck,
  Check,
  Package,
  Calculator,
  Grid,
  Maximize2,
  ZoomIn,
  Heart,
  X,
  Tag,
  SlidersHorizontal,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, FabricCategory } from '../types';
import { BUSINESS_CONTACT, openWhatsAppChat } from '../config/businessContact';
import { QRCodeScannerModal } from './QRCodeScannerModal';
import { FullScreenFabricGalleryModal, HighResFabricPatternCanvas } from './FullScreenFabricGalleryModal';
import { QuickViewModal } from './QuickViewModal';

export const PlaceOrderView: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    addToCart,
    setActiveView,
    setVisualizeProduct,
    setIsCalculatorModalOpen,
    wishlist,
    toggleWishlist,
    isInWishlist,
  } = useApp();

  const [quantityInput, setQuantityInput] = useState<string>('50');
  const [showStockDetails, setShowStockDetails] = useState<boolean>(true);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [addedModalOpen, setAddedModalOpen] = useState<boolean>(false);
  const [addedDetails, setAddedDetails] = useState<{ name: string; qty: number; dpl: number } | null>(null);

  // Quick View modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Full-Screen Gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryInitialProductId, setGalleryInitialProductId] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectFromGallery = (prod: Product) => {
    setSelectedProduct(prod);
    setSearchQuery(prod.sku);
    setQuantityInput('50');
    setIsGalleryOpen(false);
  };

  const categories: (FabricCategory | 'All')[] = [
    'All',
    'Dimout',
    'Blackout',
    'Solar Shading',
    'Curtains',
  ];

  // Auto-suggestions calculations
  const qClean = searchQuery.toLowerCase().trim();

  // 1. Matching categories (e.g. "Blackout", "Solar", "Dimout", "Curtains")
  const matchingCategories = (['Blackout', 'Dimout', 'Solar Shading', 'Curtains'] as FabricCategory[]).filter(cat => {
    if (!qClean) return false;
    return cat.toLowerCase().includes(qClean);
  });

  // 2. Matching patterns by name, SKU, shade, or collection
  const matchingPatterns = products
    .filter(p => {
      if (!qClean) return false;
      return (
        p.sku.toLowerCase().includes(qClean) ||
        p.catalogueName.toLowerCase().includes(qClean) ||
        p.shadeNo.toLowerCase().includes(qClean) ||
        p.collection.toLowerCase().includes(qClean) ||
        p.category.toLowerCase().includes(qClean) ||
        p.colorName.toLowerCase().includes(qClean)
      );
    })
    .slice(0, 8);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSearchQuery(prod.sku);
    setShowSuggestions(false);
  };

  const handleSelectCategoryFromSuggestion = (cat: FabricCategory) => {
    setSelectedCategory(cat);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Check if query is directly a category
    const catMatch = (['Blackout', 'Dimout', 'Solar Shading', 'Curtains'] as FabricCategory[]).find(
      c => c.toLowerCase() === query
    );
    if (catMatch) {
      setSelectedCategory(catMatch);
      setShowSuggestions(false);
      return;
    }

    const matched = products.find(
      p =>
        p.sku.toLowerCase() === query ||
        p.catalogueName.toLowerCase().includes(query) ||
        p.shadeNo === query
    );
    if (matched) {
      setSelectedProduct(matched);
      setShowSuggestions(false);
    }
  };

  const handleScanSuccess = (sku: string) => {
    setIsScannerOpen(false);
    const matched = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (matched) {
      setSelectedProduct(matched);
      setSearchQuery(matched.sku);
    }
  };

  const currentQty = parseFloat(quantityInput) || 0;
  const isAvailable =
    selectedProduct && currentQty > 0 && currentQty <= selectedProduct.totalStockMeters;
  const isRollDiscountApplied =
    selectedProduct && currentQty >= selectedProduct.rollDiscountThreshold;
  const discountRate = isRollDiscountApplied ? selectedProduct.rollDiscountPercentage : 0;

  const unitDpl = selectedProduct ? selectedProduct.dpl : 0;
  const unitMrp = selectedProduct ? selectedProduct.mrp : 0;
  const lineDplGross = unitDpl * currentQty;
  const lineDiscountAmount = (lineDplGross * discountRate) / 100;
  const totalDplNet = lineDplGross - lineDiscountAmount;
  const totalMrp = unitMrp * currentQty;

  const handleAddToCart = () => {
    if (!selectedProduct || currentQty <= 0) return;
    addToCart(selectedProduct, currentQty, 'Surface');
    setAddedDetails({
      name: selectedProduct.catalogueName,
      qty: currentQty,
      dpl: totalDplNet,
    });
    setAddedModalOpen(true);
  };

  // Products filtered by selectedCategory and/or search query for browsing
  const browserProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-5 pb-24">
      {/* SECTION 1: SEARCH & QR BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Place Fabric Order
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setGalleryInitialProductId(selectedProduct?.id || null);
                setIsGalleryOpen(true);
              }}
              className="text-xs font-bold bg-[#8B5A3C] hover:bg-[#72482E] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-98"
              title="Open full-screen gallery to inspect high-resolution fabric patterns"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Full-Screen Gallery</span>
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {products.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsCalculatorModalOpen(true)}
              className="text-xs font-semibold bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-[#DACBAA] shadow-2xs"
            >
              <Calculator className="w-3.5 h-3.5 text-[#8B5A3C]" />
              <span>Curtain Calculator</span>
            </button>
            <button
              onClick={() => setActiveView('stock-check')}
              className="text-xs font-semibold text-[#8B5A3C] hover:underline flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stock Check Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#8B5A3C] text-white shadow-xs'
                  : 'bg-[#FBF7EE] text-[#766A57] hover:bg-[#E7DAC0] border border-[#DACBAA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box with QR Scanner Icon & Auto-suggest */}
        <div className="relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#766A57]">
                <Search className="w-4 h-4" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search by category (Blackout, Solar), pattern name, or SKU..."
                className="w-full pl-10 pr-20 py-3 rounded-xl bg-[#FBF7EE] border border-[#DACBAA] text-sm text-[#2C2417] placeholder:text-[#A79876] focus:outline-hidden focus:border-[#8B5A3C] focus:ring-1 focus:ring-[#8B5A3C] shadow-xs"
              />

              {/* Action buttons inside right of search input */}
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1 text-[#8B5A3C]">
                {searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="p-1 rounded-full text-[#766A57] hover:text-[#2C2417] hover:bg-[#E7DAC0] transition-colors"
                    title="Clear search input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="p-1 text-[#8B5A3C] hover:text-[#72482E] transition-colors"
                  title="Scan QR on physical swatch card"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Auto-suggest dropdown filtering by category and pattern name */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-[#DACBAA]/60 max-h-[460px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Category Suggestions Header */}
              {matchingCategories.length > 0 && (
                <div className="p-3 bg-[#F3EBDA]/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#766A57] mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-[#8B5A3C]" />
                    <span>Matching Fabric Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchingCategories.map(cat => {
                      const count = products.filter(p => p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleSelectCategoryFromSuggestion(cat)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#8B5A3C] hover:text-white border border-[#DACBAA] text-xs font-semibold text-[#2C2417] transition-all flex items-center gap-1.5 shadow-2xs group cursor-pointer"
                        >
                          <span className="group-hover:text-white">{cat}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E7DAC0] group-hover:bg-white/20 text-[#8B5A3C] group-hover:text-white font-bold">
                            {count} patterns
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pattern Suggestions */}
              {matchingPatterns.length > 0 ? (
                <div className="p-2 space-y-1">
                  <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#766A57] flex items-center justify-between">
                    <span>Matching Patterns &amp; Fabrics ({matchingPatterns.length})</span>
                    <span className="text-[10px] font-normal lowercase text-[#8B5A3C]">click to select</span>
                  </div>
                  {matchingPatterns.map(item => {
                    const isFav = isInWishlist(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(item)}
                        className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs hover:bg-[#E7DAC0]/70 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg border border-[#DACBAA] shadow-2xs shrink-0 overflow-hidden relative">
                            <HighResFabricPatternCanvas
                              product={item}
                              zoomLevel={1}
                              lightingMode="neutral"
                              className="w-full h-full"
                            />
                            <span className="absolute bottom-0.5 left-0.5 text-[8px] font-mono font-bold bg-[#2C2417]/85 text-white px-0.5 rounded">
                              {item.shadeNo}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#2C2417] group-hover:text-[#8B5A3C] truncate">
                                {item.catalogueName}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#E9D9C5] text-[#8B5A3C] shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#766A57] flex items-center gap-2 pt-0.5 truncate">
                              <span>Color: <strong>{item.colorName}</strong></span>
                              <span>•</span>
                              <span className="font-mono text-[#8B5A3C]">SKU: {item.sku}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#8B5A3C] text-xs block">
                              ₹{item.dpl}/m
                            </span>
                            <span className="text-[10px] text-[#5F6B4A] font-semibold">
                              {(item.totalStockMeters || 0).toLocaleString('en-IN')}m in stock
                            </span>
                          </div>

                          {/* Heart icon in suggestion item */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(item.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isFav
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : 'bg-white text-[#766A57] hover:text-rose-600 border-[#DACBAA]/60'
                            }`}
                            title={isFav ? 'Remove from Wishlist' : 'Save to Wishlist in Profile'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : matchingCategories.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#766A57] space-y-2">
                  <p>No matching fabrics found for <strong>"{searchQuery}"</strong></p>
                  <p className="text-[11px] text-[#A79876]">Try searching by category ("Blackout", "Solar", "Dimout") or pattern name ("Onyx", "Linen")</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: PRODUCT DETAIL CARD (IF SELECTED) */}
      {selectedProduct ? (
        <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
          {/* Top Product Header: Swatch + Titles */}
          <div className="flex flex-col sm:flex-row items-start gap-4 pb-4 border-b border-[#DACBAA]/60">
            {/* Fabric Swatch Preview with High-Res Weave & Gallery Trigger */}
            <div
              onClick={() => {
                setGalleryInitialProductId(selectedProduct.id);
                setIsGalleryOpen(true);
              }}
              className="relative group shrink-0 cursor-pointer"
              title="Click to inspect high-resolution weave texture in full-screen gallery"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-[#DACBAA] group-hover:border-[#8B5A3C] shadow-md overflow-hidden relative transition-colors">
                <HighResFabricPatternCanvas
                  product={selectedProduct}
                  zoomLevel={1}
                  lightingMode="raking"
                  className="w-full h-full"
                />
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold bg-[#2C2417]/80 text-[#FBF7EE] px-1.5 py-0.5 rounded shadow-xs">
                  Shade {selectedProduct.shadeNo}
                </span>
              </div>
              <div className="absolute inset-0 bg-[#2C2417]/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center text-white text-center p-1">
                <ZoomIn className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold mt-1 leading-tight">Inspect Weave</span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E9D9C5] text-[#8B5A3C]">
                  [{selectedProduct.category}, {selectedProduct.collection}]
                </span>
                <span className="text-xs font-mono font-semibold text-[#766A57]">
                  SKU: {selectedProduct.sku}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
                {selectedProduct.catalogueName}
              </h2>
              <p className="text-xs text-[#766A57]">
                Shade {selectedProduct.shadeNo} · {selectedProduct.colorName}
              </p>

              {/* Specs Pills */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 text-xs text-[#766A57]">
                <span>GSM: <strong className="text-[#2C2417]">{selectedProduct.gsm}</strong></span>
                <span>•</span>
                <span>Width: <strong className="text-[#2C2417]">{selectedProduct.width}</strong></span>
                <span>•</span>
                <span>Composition: <strong className="text-[#2C2417]">{selectedProduct.composition}</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 self-start sm:self-auto">
              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isInWishlist(selectedProduct.id)
                    ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                    : 'bg-[#FBF7EE] text-[#766A57] hover:text-rose-600 hover:bg-rose-50 border-[#DACBAA]'
                }`}
                title={isInWishlist(selectedProduct.id) ? 'Remove from Saved Wishlist' : 'Save to Wishlist in Profile'}
              >
                <Heart
                  className={`w-4 h-4 transition-transform active:scale-125 ${
                    isInWishlist(selectedProduct.id) ? 'fill-rose-600 text-rose-600' : ''
                  }`}
                />
                <span>{isInWishlist(selectedProduct.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGalleryInitialProductId(selectedProduct.id);
                  setIsGalleryOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Browse full-screen fabric gallery"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Gallery &amp; Weave</span>
              </button>

              <button
                type="button"
                onClick={() => setVisualizeProduct(selectedProduct)}
                className="px-3.5 py-2 rounded-xl bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Visualize this fabric on realistic room curtain drapery"
              >
                <Eye className="w-4 h-4 text-[#8B5A3C]" />
                <span>Curtain Visualizer</span>
              </button>
            </div>
          </div>

          {/* ROLL DISCOUNT BANNER (OLIVE THEME) */}
          <div className="p-3 bg-[#E3E7D8] border border-[#5F6B4A]/30 rounded-xl flex items-center justify-between text-xs text-[#5F6B4A]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-[#5F6B4A]" />
              <span className="font-semibold">
                Get Roll Discount of {selectedProduct.rollDiscountPercentage}% on order qty of minimum{' '}
                {selectedProduct.rollDiscountThreshold}m
              </span>
            </div>
            {isRollDiscountApplied && (
              <span className="text-[10px] uppercase font-bold bg-[#5F6B4A] text-white px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          {/* COLLAPSIBLE LIVE STOCK ROLL-LENGTH BUCKETS PANEL */}
          <div className="border border-[#DACBAA] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowStockDetails(!showStockDetails)}
              className="w-full px-4 py-3 bg-[#E7DAC0] hover:bg-[#DACBAA]/60 flex items-center justify-between text-xs font-bold text-[#2C2417] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8B5A3C]" />
                <span>Live Stock Roll-Length Breakdown</span>
                <span className="text-[11px] font-normal text-[#766A57]">
                  (Total Available: <strong>{selectedProduct.totalStockMeters}m</strong> across {selectedProduct.totalPieces} pcs)
                </span>
              </div>
              {showStockDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showStockDetails && (
              <div className="p-4 bg-[#FBF7EE] space-y-3">
                {/* Roll Stock Buckets Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DACBAA] text-[#766A57] font-semibold">
                      <th className="py-2">Roll Length Range</th>
                      <th className="py-2 text-right">Combined Qty (No. of Pieces)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DACBAA]/40 text-[#2C2417]">
                    {selectedProduct.stockBuckets.map((bucket, idx) => (
                      <tr key={idx} className="hover:bg-[#F3EBDA]/50">
                        <td className="py-2.5 font-medium">{bucket.range}</td>
                        <td className="py-2.5 text-right font-mono font-semibold">
                          {Number(bucket.quantityMeters || 0).toFixed(1)} m ({bucket.piecesCount})
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#8B5A3C] font-bold bg-[#E9D9C5]/50">
                      <td className="py-2.5 text-[#8B5A3C]">Total Live Ready Stock</td>
                      <td className="py-2.5 text-right font-mono text-[#8B5A3C] text-sm">
                        {selectedProduct.totalStockMeters} m ({selectedProduct.totalPieces})
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-[11px] text-[#766A57] italic flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0 text-[#8B5A3C]" />
                  <span>
                    Stock less than 5m is subject to physical availability and actual measurement of the roll.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* QUANTITY INPUT & STOCK VALIDATION */}
          <div className="space-y-2 p-4 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2417] block">
                  Enter Order Quantity (metres)
                </label>
                <p className="text-[11px] text-[#766A57]">
                  Order 50m or more to unlock 10% wholesale roll savings
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={quantityInput}
                    onChange={e => setQuantityInput(e.target.value)}
                    className="w-32 px-3 py-2.5 rounded-xl bg-[#FBF7EE] border border-[#DACBAA] text-right font-mono font-bold text-base text-[#2C2417] focus:outline-hidden focus:border-[#8B5A3C]"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-[#766A57] font-semibold">
                    m
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    isAvailable
                      ? 'bg-[#8B5A3C] hover:bg-[#72482E] text-white cursor-pointer active:scale-95'
                      : 'bg-[#A79876]/40 text-[#766A57] cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>
              </div>
            </div>

            {/* Real-time stock status indicator */}
            <div className="pt-2">
              {isAvailable ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F6B4A]">
                  <CheckCircle className="w-4 h-4" />
                  <span>STOCK IS AVAILABLE. Ready for immediate dispatch.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9C4630]">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      Insufficient ready roll stock ({currentQty}m requested vs {selectedProduct.totalStockMeters}m in warehouse).
                      Proceeding will trigger a Mill Procurement order.
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsAppChat(
                          `Hello THE FAB HOUSE, I am inquiring about stock availability & expedited mill weaving for ${selectedProduct.catalogueName} (Shade ${selectedProduct.shadeNo}, SKU: ${selectedProduct.sku}). Required yardage: ${currentQty}m.`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DCF8C6] hover:bg-[#cbf1af] text-[#075E54] border border-[#25D366]/40 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      title="Direct WhatsApp Inquiry to Central Depot"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp Depot: {BUSINESS_CONTACT.whatsAppDisplay}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PRICE DETAILS TABLE */}
          <div className="space-y-2 border border-[#DACBAA] rounded-xl p-4 bg-[#FBF7EE]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#766A57]">
              Price Details
            </h3>

            <div className="divide-y divide-[#DACBAA]/50 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-[#766A57]">DPL (Dealer Price per metre):</span>
                <span className="font-mono font-semibold text-[#2C2417]">₹{unitDpl}/m</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#766A57]">MRP (Reference Retail):</span>
                <span className="font-mono text-[#766A57]">₹{unitMrp}/m</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#766A57]">Gross DPL Total ({currentQty}m):</span>
                <span className="font-mono font-semibold text-[#2C2417]">
                  ₹{lineDplGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {isRollDiscountApplied && (
                <div className="py-2 flex justify-between text-[#5F6B4A] font-semibold">
                  <span>Roll Discount (10% on ≥50m):</span>
                  <span className="font-mono">
                    -₹{lineDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="py-2.5 flex justify-between font-bold text-sm bg-[#E7DAC0]/50 -mx-4 px-4 border-t border-[#8B5A3C]/30">
                <span className="text-[#2C2417]">Net Order DPL:</span>
                <span className="font-mono text-[#8B5A3C]">
                  ₹{totalDplNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* SHIPPING NOTE */}
          <div className="flex items-start gap-2 p-3 bg-[#E7DAC0]/50 rounded-xl text-xs text-[#766A57]">
            <Truck className="w-4 h-4 shrink-0 text-[#8B5A3C] mt-0.5" />
            <p>
              This product will be shipped via <strong>SURFACE transportation</strong>. If you need faster shipping, please select your preferred option during checkout.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State before search / Browse Catalog */
        <div className="space-y-4">
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 sm:p-7 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DACBAA]/60">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#2C2417]">
                  Browse Fabric Catalog
                </h3>
                <p className="text-xs text-[#766A57] mt-0.5">
                  Select any fabric pattern to configure meterage, roll discounts, and order details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGalleryInitialProductId(null);
                  setIsGalleryOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer shrink-0"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full-Screen Gallery ({products.length})</span>
              </button>
            </div>

            {/* Product Cards Grid with Hover Effect & Quick View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {browserProducts.map(p => {
                const isFav = isInWishlist(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="group relative bg-white border border-[#DACBAA] hover:border-[#8B5A3C] rounded-2xl p-3.5 shadow-2xs hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    {/* Swatch & Visual Canvas */}
                    <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border border-[#DACBAA]/60 bg-[#FAF5EC] mb-3">
                      <HighResFabricPatternCanvas
                        product={p}
                        zoomLevel={1}
                        lightingMode="neutral"
                        className="w-full h-full"
                      />

                      {/* Category Tag (Top Left) */}
                      <span className="absolute top-2 left-2 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2C2417]/80 backdrop-blur-xs text-[#FBF7EE] shadow-2xs">
                        {p.category}
                      </span>

                      {/* Wishlist Heart Icon (Top Right) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-full transition-transform active:scale-125 z-10 shadow-sm border ${
                          isFav
                            ? 'bg-white text-rose-600 border-rose-200'
                            : 'bg-white/90 text-[#766A57] hover:text-rose-600 hover:bg-white border-[#DACBAA]/70'
                        }`}
                        title={isFav ? 'Remove from Wishlist' : 'Save to Wishlist in Profile'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                      </button>

                      {/* Shade & Stock Pills (Bottom) */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono pointer-events-none">
                        <span className="bg-[#2C2417]/85 backdrop-blur-xs text-white px-1.5 py-0.5 rounded shadow-2xs">
                          Shade {p.shadeNo}
                        </span>
                        <span className="bg-[#5F6B4A]/90 backdrop-blur-xs text-white px-1.5 py-0.5 rounded shadow-2xs font-semibold">
                          {(p.totalStockMeters || 0).toLocaleString('en-IN')}m
                        </span>
                      </div>

                      {/* REVEAL ON HOVER: 'Quick View' button overlay */}
                      <div className="absolute inset-0 bg-[#2C2417]/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(p);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#FBF7EE] text-[#2C2417] hover:bg-white text-xs font-bold shadow-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform duration-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#8B5A3C]" />
                          <span>Quick View</span>
                        </button>
                      </div>
                    </div>

                    {/* Info & Specs */}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between text-[10px] text-[#766A57]">
                        <span className="font-semibold uppercase tracking-wider text-[#8B5A3C] truncate">
                          {p.collection}
                        </span>
                        <span className="font-mono">{p.sku}</span>
                      </div>

                      <h3 className="font-display font-bold text-sm text-[#2C2417] group-hover:text-[#8B5A3C] transition-colors truncate">
                        {p.catalogueName}
                      </h3>

                      <p className="text-[11px] text-[#766A57] truncate">
                        {p.colorName} · {p.composition}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[10px] text-[#766A57]">
                        <span>GSM: <strong className="text-[#2C2417]">{p.gsm}</strong></span>
                        <span>•</span>
                        <span>Width: <strong className="text-[#2C2417]">{p.width}</strong></span>
                      </div>
                    </div>

                    {/* Pricing & Selection Footer */}
                    <div className="pt-2.5 mt-2 border-t border-[#DACBAA]/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#766A57]">Dealer Price</div>
                        <div className="text-sm font-mono font-bold text-[#8B5A3C]">
                          ₹{(p.dpl || 0).toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-normal text-[#766A57]">/m</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(p);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] transition-colors cursor-pointer"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Companion section when a product is selected: Browse Other Patterns */}
      {selectedProduct && (
        <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#DACBAA]/60">
            <div>
              <h3 className="font-display font-bold text-base text-[#2C2417]">
                Browse Other Patterns ({browserProducts.length})
              </h3>
              <p className="text-xs text-[#766A57]">
                Showing {selectedCategory} fabrics. Hover for Quick View or click to switch order.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setGalleryInitialProductId(null);
                setIsGalleryOpen(true);
              }}
              className="text-xs font-semibold text-[#8B5A3C] hover:underline flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full-Screen Gallery</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {browserProducts.slice(0, 6).map(p => {
              const isFav = isInWishlist(p.id);
              const isSelected = selectedProduct.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`group relative bg-white border rounded-2xl p-3.5 shadow-2xs hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-[#8B5A3C] ring-2 ring-[#8B5A3C]/40 bg-[#FAF5EC]'
                      : 'border-[#DACBAA] hover:border-[#8B5A3C]'
                  }`}
                >
                  <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border border-[#DACBAA]/60 bg-[#FAF5EC] mb-2.5">
                    <HighResFabricPatternCanvas
                      product={p}
                      zoomLevel={1}
                      lightingMode="neutral"
                      className="w-full h-full"
                    />

                    <span className="absolute top-2 left-2 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2C2417]/80 backdrop-blur-xs text-[#FBF7EE] shadow-2xs">
                      {p.category}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-transform active:scale-125 z-10 shadow-sm border ${
                        isFav
                          ? 'bg-white text-rose-600 border-rose-200'
                          : 'bg-white/90 text-[#766A57] hover:text-rose-600 hover:bg-white border-[#DACBAA]/70'
                      }`}
                      title={isFav ? 'Remove from Wishlist' : 'Save to Wishlist in Profile'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono pointer-events-none">
                      <span className="bg-[#2C2417]/85 backdrop-blur-xs text-white px-1.5 py-0.5 rounded shadow-2xs">
                        Shade {p.shadeNo}
                      </span>
                      <span className="bg-[#5F6B4A]/90 backdrop-blur-xs text-white px-1.5 py-0.5 rounded shadow-2xs font-semibold">
                        {(p.totalStockMeters || 0).toLocaleString('en-IN')}m
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-[#2C2417]/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(p);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FBF7EE] text-[#2C2417] hover:bg-white text-xs font-bold shadow-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform duration-200 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8B5A3C]" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between text-[10px] text-[#766A57]">
                      <span className="font-semibold uppercase tracking-wider text-[#8B5A3C] truncate">
                        {p.collection}
                      </span>
                      <span className="font-mono">{p.sku}</span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#2C2417] group-hover:text-[#8B5A3C] transition-colors truncate">
                      {p.catalogueName}
                    </h4>

                    <p className="text-[11px] text-[#766A57] truncate">
                      {p.colorName}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#DACBAA]/60 flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-[#8B5A3C]">
                      ₹{(p.dpl || 0).toLocaleString('en-IN')}/m
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProduct(p);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#8B5A3C] text-white'
                          : 'bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417]'
                      }`}
                    >
                      {isSelected ? 'Current' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onSelectForOrder={(prod) => {
          handleSelectProduct(prod);
          setQuickViewProduct(null);
        }}
        onOpenGallery={(prodId) => {
          setQuickViewProduct(null);
          setGalleryInitialProductId(prodId);
          setIsGalleryOpen(true);
        }}
      />

      {/* ITEM ADDED CONFIRMATION MODAL */}
      {addedModalOpen && addedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2C2417]/60 backdrop-blur-xs"
            onClick={() => setAddedModalOpen(false)}
          />

          <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#E3E7D8] text-[#5F6B4A] mx-auto flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-[#2C2417]">
                Item Added to Cart
              </h3>
              <p className="text-xs text-[#766A57]">
                Added <strong>{addedDetails.qty}m</strong> of {addedDetails.name}
              </p>
              <p className="text-sm font-mono font-bold text-[#8B5A3C] pt-1">
                ₹{(addedDetails.dpl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setAddedModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DACBAA] text-xs font-semibold text-[#2C2417] hover:bg-[#E7DAC0] transition-colors"
              >
                Keep Browsing
              </button>
              <button
                onClick={() => {
                  setAddedModalOpen(false);
                  setActiveView('cart');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#8B5A3C] text-white text-xs font-semibold hover:bg-[#72482E] transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Camera Scanner Modal */}
      <QRCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Full-Screen High-Resolution Fabric Gallery Modal */}
      <FullScreenFabricGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectProductForOrder={handleSelectFromGallery}
        initialProductId={galleryInitialProductId}
      />
    </div>
  );
};
