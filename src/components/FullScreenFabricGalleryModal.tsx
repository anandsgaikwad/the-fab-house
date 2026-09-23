import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  ShoppingCart,
  Check,
  Sparkles,
  Layers,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Info,
  CheckCircle,
  AlertCircle,
  Grid,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Columns2,
  Share2,
} from 'lucide-react';
import { Product, FabricCategory } from '../types';
import { useApp } from '../context/AppContext';

export type ColorFamily =
  | 'All'
  | 'Beiges & Ecru'
  | 'Greys & Slate'
  | 'Taupe & Earth'
  | 'Charcoal & Dark'
  | 'Blues & Teal'
  | 'Rust & Terracotta'
  | 'Greens & Olive';

interface FullScreenFabricGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string | null;
  onSelectProductForOrder: (product: Product) => void;
}

// Helper to determine color family based on shade details and category
function getColorFamily(p: Product): ColorFamily {
  const name = p.colorName.toLowerCase();
  const hex = p.colorHex.toLowerCase();
  const shade = parseInt(p.shadeNo, 10);

  if (name.includes('blue') || name.includes('teal') || name.includes('nordic') || name.includes('navy') || (shade >= 815 && shade <= 817)) {
    return 'Blues & Teal';
  }
  if (name.includes('olive') || name.includes('sage') || (shade >= 818 && shade <= 819)) {
    return 'Greens & Olive';
  }
  if (name.includes('terracotta') || name.includes('rust') || name.includes('ochre') || name.includes('mustard') || name.includes('rose') || name.includes('mauve') || (shade >= 820 && shade <= 824)) {
    return 'Rust & Terracotta';
  }
  if (name.includes('obsidian') || name.includes('charcoal') || name.includes('onyx') || name.includes('black') || shade === 814 || shade === 827 || p.sku === 'BLK1013') {
    return 'Charcoal & Dark';
  }
  if (name.includes('grey') || name.includes('slate') || name.includes('mist') || name.includes('ash') || name.includes('cloud') || (shade >= 810 && shade <= 813) || shade === 825) {
    return 'Greys & Slate';
  }
  if (name.includes('taupe') || name.includes('khaki') || name.includes('oyster') || name.includes('mink') || name.includes('mocha') || name.includes('chestnut') || name.includes('oatmeal') || (shade >= 804 && shade <= 808)) {
    return 'Taupe & Earth';
  }
  // Default to beiges / ecru / neutrals
  return 'Beiges & Ecru';
}

/**
 * High-Resolution Fabric Pattern & Weave Generator
 * Generates mathematically sharp, high-res procedural textile weaves with yarn micro-interlacing,
 * twill ridges, linen slub textures, solar screen apertures, and lighting simulations.
 */
export const HighResFabricPatternCanvas: React.FC<{
  product: Product;
  zoomLevel?: 1 | 2 | 4 | 8;
  lightingMode?: 'studio' | 'raking' | 'warm' | 'neutral';
  showBackingView?: boolean;
  className?: string;
  isInteractive?: boolean;
}> = ({
  product,
  zoomLevel = 1,
  lightingMode = 'studio',
  showBackingView = false,
  className = '',
  isInteractive = false,
}) => {
  const [lensPos, setLensPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setLensPos({ x, y });
  };

  const handleMouseLeave = () => {
    setLensPos(null);
  };

  // Lighting overlay styling
  const lightingOverlay = useMemo(() => {
    if (lightingMode === 'raking') {
      // Grazing 25-degree directional light emphasizing 3D weave relief & thread shadows
      return 'linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.1) 35%, rgba(255,255,255,0.18) 55%, rgba(0,0,0,0.25) 100%)';
    }
    if (lightingMode === 'warm') {
      // Warm 2700K sunset interior ambient wash
      return 'linear-gradient(180deg, rgba(255, 230, 180, 0.22) 0%, rgba(139, 90, 60, 0.15) 100%)';
    }
    // Studio balanced clean illumination
    return 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.06) 100%)';
  }, [lightingMode]);

  // Generate SVG pattern ID unique to this render & product
  const patternId = useMemo(
    () => `weave-pat-${product.id}-${lightingMode}-${zoomLevel}`,
    [product.id, lightingMode, zoomLevel]
  );

  // Determine pattern scale multiplier based on zoom
  const scale = zoomLevel;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ backgroundColor: showBackingView ? '#F0EBE1' : product.colorHex }}
    >
      {/* SVG Definitions for Procedural Ultra High-Res Weave Textures */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 1. Dimout Weave: 2/2 Diagonal Twill with Interlaced Micro-Yarns */}
          {product.textureType === 'dimout' && !showBackingView && (
            <pattern
              id={patternId}
              width={16 * scale}
              height={16 * scale}
              patternUnits="userSpaceOnUse"
            >
              {/* Warp background tone */}
              <rect width={16 * scale} height={16 * scale} fill="none" />
              
              {/* Micro yarn ridges (diagonal twill warp/weft structure) */}
              <path
                d={`M0,${4 * scale} L${4 * scale},0 M0,${12 * scale} L${12 * scale},0 M${4 * scale},${16 * scale} L${16 * scale},${4 * scale} M${12 * scale},${16 * scale} L${16 * scale},${12 * scale}`}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={1.8 * scale}
              />
              <path
                d={`M0,${8 * scale} L${8 * scale},0 M${8 * scale},${16 * scale} L${16 * scale},${8 * scale}`}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={2 * scale}
              />
              {/* Vertical warp yarn fibers */}
              <line
                x1={4 * scale}
                y1="0"
                x2={4 * scale}
                y2={16 * scale}
                stroke="rgba(0,0,0,0.12)"
                strokeWidth={0.75 * scale}
                strokeDasharray={`${2 * scale} ${1 * scale}`}
              />
              <line
                x1={12 * scale}
                y1="0"
                x2={12 * scale}
                y2={16 * scale}
                stroke="rgba(255,255,255,0.14)"
                strokeWidth={0.75 * scale}
                strokeDasharray={`${2 * scale} ${1 * scale}`}
              />
              {/* Horizontal weft yarns */}
              <line
                x1="0"
                y1={8 * scale}
                x2={16 * scale}
                y2={8 * scale}
                stroke="rgba(0,0,0,0.18)"
                strokeWidth={1 * scale}
              />
            </pattern>
          )}

          {/* 2. Solar Shading: Precision Perforated Architectural Screen Mesh */}
          {product.textureType === 'solar' && (
            <pattern
              id={patternId}
              width={12 * scale}
              height={12 * scale}
              patternUnits="userSpaceOnUse"
            >
              {/* Screen Base Core Grid */}
              <rect
                width={12 * scale}
                height={12 * scale}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1.5 * scale}
              />
              <rect
                x={2 * scale}
                y={2 * scale}
                width={8 * scale}
                height={8 * scale}
                fill="rgba(255,255,255,0.18)"
              />
              {/* Core vinyl-coated fiberglass thread highlight */}
              <line
                x1={6 * scale}
                y1="0"
                x2={6 * scale}
                y2={12 * scale}
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={2 * scale}
              />
              <line
                x1="0"
                y1={6 * scale}
                x2={12 * scale}
                y2={6 * scale}
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={2 * scale}
              />
              {/* Micro aperture hole (3% to 5% openness transparency) */}
              <rect
                x={1 * scale}
                y={1 * scale}
                width={3.5 * scale}
                height={3.5 * scale}
                fill="rgba(20,20,20,0.4)"
                rx={0.5 * scale}
              />
              <rect
                x={7 * scale}
                y={7 * scale}
                width={3.5 * scale}
                height={3.5 * scale}
                fill="rgba(20,20,20,0.4)"
                rx={0.5 * scale}
              />
            </pattern>
          )}

          {/* 3. Blackout / Woven: Dense 340 GSM Slub Linen Weave or Thermal Acrylic Backing */}
          {(product.textureType === 'woven' || product.category === 'Blackout') && !showBackingView && (
            <pattern
              id={patternId}
              width={20 * scale}
              height={20 * scale}
              patternUnits="userSpaceOnUse"
            >
              {/* Cross-hatch slub linen fibers */}
              <rect width={20 * scale} height={20 * scale} fill="none" />
              {/* Horizontal irregular slubs */}
              <line
                x1="0"
                y1={4 * scale}
                x2={20 * scale}
                y2={4 * scale}
                stroke="rgba(0,0,0,0.22)"
                strokeWidth={2.5 * scale}
              />
              <line
                x1="0"
                y1={14 * scale}
                x2={20 * scale}
                y2={14 * scale}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={2.8 * scale}
              />
              {/* Vertical weave interlacing */}
              <line
                x1={6 * scale}
                y1="0"
                x2={6 * scale}
                y2={20 * scale}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={2 * scale}
              />
              <line
                x1={16 * scale}
                y1="0"
                x2={16 * scale}
                y2={20 * scale}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={2 * scale}
              />
              {/* Micro slub nubs */}
              <circle cx={4 * scale} cy={14 * scale} r={1.5 * scale} fill="rgba(255,255,255,0.4)" />
              <circle cx={14 * scale} cy={4 * scale} r={1.2 * scale} fill="rgba(0,0,0,0.3)" />
            </pattern>
          )}

          {/* 4. Curtain / Sheer Weave: Micro-Filament Drapery */}
          {product.textureType === 'curtain' && !showBackingView && (
            <pattern
              id={patternId}
              width={14 * scale}
              height={24 * scale}
              patternUnits="userSpaceOnUse"
            >
              {/* Fine vertical floating yarns */}
              <line
                x1={3 * scale}
                y1="0"
                x2={3 * scale}
                y2={24 * scale}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth={1.2 * scale}
              />
              <line
                x1={7 * scale}
                y1="0"
                x2={7 * scale}
                y2={24 * scale}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth={1 * scale}
              />
              <line
                x1={11 * scale}
                y1="0"
                x2={11 * scale}
                y2={24 * scale}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.2 * scale}
              />
              {/* Soft airy weft ties */}
              <line
                x1="0"
                y1={6 * scale}
                x2={14 * scale}
                y2={6 * scale}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={0.8 * scale}
              />
              <line
                x1="0"
                y1={18 * scale}
                x2={14 * scale}
                y2={18 * scale}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={0.8 * scale}
              />
            </pattern>
          )}

          {/* 5. Reverse 3-Pass Acrylic Foam Coating (Thermal Acoustic Backing for Blackout) */}
          {showBackingView && (
            <pattern
              id={patternId}
              width={10 * scale}
              height={10 * scale}
              patternUnits="userSpaceOnUse"
            >
              <rect width={10 * scale} height={10 * scale} fill="#FAF7F0" />
              <circle cx={3 * scale} cy={3 * scale} r={0.8 * scale} fill="rgba(0,0,0,0.06)" />
              <circle cx={8 * scale} cy={7 * scale} r={0.8 * scale} fill="rgba(0,0,0,0.06)" />
              <circle cx={2 * scale} cy={8 * scale} r={0.6 * scale} fill="rgba(255,255,255,0.7)" />
            </pattern>
          )}
        </defs>

        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Surface lighting overlay simulation */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ background: lightingOverlay }}
      />

      {/* Backing Indicator Watermark when in reverse mode */}
      {showBackingView && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-[#2C2417]/80 backdrop-blur-xs text-[#FBF7EE] text-[10px] font-mono font-bold rounded-md shadow-xs pointer-events-none">
          3-PASS ACRYLIC FOAM COATING (100% LIGHT BLOCK)
        </div>
      )}

      {/* Interactive Macro Magnifier Lens */}
      {isInteractive && lensPos && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-white shadow-2xl overflow-hidden z-20"
          style={{
            width: 140,
            height: 140,
            left: lensPos.x - 70,
            top: lensPos.y - 70,
            backgroundColor: product.colorHex,
            boxShadow: '0 0 0 3px rgba(44,36,23,0.3), 0 20px 30px rgba(0,0,0,0.4)',
          }}
        >
          {/* Zoomed Weave Interior */}
          <div
            className="w-full h-full relative"
            style={{
              transform: 'scale(2.5)',
              transformOrigin: `${(lensPos.x / (containerRef.current?.clientWidth || 1)) * 100}% ${(lensPos.y / (containerRef.current?.clientHeight || 1)) * 100}%`,
            }}
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          </div>
          {/* Lens crosshair overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-px bg-white/60" />
            <div className="h-6 w-px bg-white/60 absolute" />
            <span className="absolute bottom-1 text-[9px] font-mono font-bold text-white bg-black/60 px-1 rounded">
              MACRO {(zoomLevel * 2.5).toFixed(0)}X
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const FullScreenFabricGalleryModal: React.FC<FullScreenFabricGalleryModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
  onSelectProductForOrder,
}) => {
  const { products, addToCart, setVisualizeProduct, showToast } = useApp();

  // Active view mode: 'grid' (high-density pattern browsing) | 'lightbox' (high-res single pattern inspector) | 'compare' (side-by-side)
  const [viewMode, setViewMode] = useState<'grid' | 'lightbox' | 'compare'>('grid');

  // Active focused product for lightbox inspection
  const [focusedProduct, setFocusedProduct] = useState<Product | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FabricCategory | 'All'>('All');
  const [selectedColorFamily, setSelectedColorFamily] = useState<ColorFamily>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'ready' | 'wholesale-tier'>('all');
  const [sortBy, setSortBy] = useState<'shade' | 'stock-desc' | 'dpl-asc' | 'dpl-desc' | 'gsm-desc'>('shade');

  // Lightbox Inspection controls
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4 | 8>(1);
  const [lightingMode, setLightingMode] = useState<'studio' | 'raking' | 'warm'>('raking');
  const [showBackingView, setShowBackingView] = useState<boolean>(false);
  const [isLensActive, setIsLensActive] = useState<boolean>(false);

  // Comparison tray state (up to 4 products pinned)
  const [comparisonList, setComparisonList] = useState<Product[]>([]);

  // Instant order quantity inside lightbox
  const [orderMetersInput, setOrderMetersInput] = useState<string>('50');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // Synchronize initial product if provided
  useEffect(() => {
    if (initialProductId) {
      const match = products.find(p => p.id === initialProductId);
      if (match) {
        setFocusedProduct(match);
        setViewMode('lightbox');
      }
    } else if (!focusedProduct && products.length > 0) {
      setFocusedProduct(products[0]);
    }
  }, [initialProductId, products]);

  // Reset backing view toggle when changing focused product
  useEffect(() => {
    setShowBackingView(false);
  }, [focusedProduct?.id]);

  // Keyboard navigation for full-screen lightbox
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (viewMode === 'lightbox' && filteredProducts.length > 0) {
        if (e.key === 'ArrowRight') {
          handleNextProduct();
        } else if (e.key === 'ArrowLeft') {
          handlePrevProduct();
        } else if (e.key === '+' || e.key === '=') {
          setZoomLevel(prev => (prev === 1 ? 2 : prev === 2 ? 4 : 8));
        } else if (e.key === '-') {
          setZoomLevel(prev => (prev === 8 ? 4 : prev === 4 ? 2 : 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, focusedProduct]);

  // Filter products based on search, category, color family, and stock
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

        // Color Family filter
        if (selectedColorFamily !== 'All') {
          const family = getColorFamily(p);
          if (family !== selectedColorFamily) return false;
        }

        // Stock filter
        if (stockFilter === 'ready' && p.totalStockMeters < 30) return false;
        if (stockFilter === 'wholesale-tier' && p.totalStockMeters < p.rollDiscountThreshold) return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchName = p.catalogueName.toLowerCase().includes(q);
          const matchShade = p.shadeNo.toLowerCase().includes(q);
          const matchColor = p.colorName.toLowerCase().includes(q);
          const matchCollection = p.collection.toLowerCase().includes(q);
          const matchComp = p.composition.toLowerCase().includes(q);
          return matchSku || matchName || matchShade || matchColor || matchCollection || matchComp;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'stock-desc') return b.totalStockMeters - a.totalStockMeters;
        if (sortBy === 'dpl-asc') return a.dpl - b.dpl;
        if (sortBy === 'dpl-desc') return b.dpl - a.dpl;
        if (sortBy === 'gsm-desc') return parseInt(b.gsm, 10) - parseInt(a.gsm, 10);
        // Default: sort by numeric shade or serial
        const shadeA = parseInt(a.shadeNo, 10) || a.serialNo;
        const shadeB = parseInt(b.shadeNo, 10) || b.serialNo;
        return shadeA - shadeB;
      });
  }, [products, selectedCategory, selectedColorFamily, stockFilter, searchQuery, sortBy]);

  // Next / Previous product helpers
  const handleNextProduct = () => {
    if (!focusedProduct || filteredProducts.length === 0) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === focusedProduct.id);
    const nextIndex = (currentIndex + 1) % filteredProducts.length;
    setFocusedProduct(filteredProducts[nextIndex]);
  };

  const handlePrevProduct = () => {
    if (!focusedProduct || filteredProducts.length === 0) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === focusedProduct.id);
    const prevIndex = (currentIndex - 1 + filteredProducts.length) % filteredProducts.length;
    setFocusedProduct(filteredProducts[prevIndex]);
  };

  // Comparison toggle
  const toggleComparison = (product: Product) => {
    setComparisonList(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        showToast('You can compare up to 4 fabrics side-by-side');
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleQuickAddOrder = (product: Product) => {
    const qty = parseFloat(orderMetersInput) || 50;
    if (qty <= 0) return;
    addToCart(product, qty, 'Surface');
    setAddedItemName(product.catalogueName);
    showToast(`Added ${qty}m of ${product.catalogueName} to cart`);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  if (!isOpen) return null;

  const currentFocus = focusedProduct || filteredProducts[0] || products[0];

  // Calculations for current focus item order
  const orderMeters = parseFloat(orderMetersInput) || 0;
  const isRollDiscountApplied = currentFocus && orderMeters >= currentFocus.rollDiscountThreshold;
  const discountPct = isRollDiscountApplied ? currentFocus.rollDiscountPercentage : 0;
  const grossDpl = (currentFocus?.dpl || 0) * orderMeters;
  const discountAmt = (grossDpl * discountPct) / 100;
  const netDpl = grossDpl - discountAmt;
  const isStockSufficient = currentFocus ? currentFocus.totalStockMeters >= orderMeters : false;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#201A12] text-[#EDE3D0] overflow-hidden select-none animate-fadeIn">
      {/* ================= TOP HEADER BAR ================= */}
      <header className="h-16 shrink-0 bg-[#2A2319] border-b border-[#433829] px-4 sm:px-6 flex items-center justify-between gap-3 shadow-md z-30">
        {/* Left: Branding & Collection Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#8B5A3C] text-white shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base sm:text-lg text-[#FBF7EE] tracking-wide">
                High-Resolution Fabric Gallery
              </h2>
              <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3D3325] text-[#D8C7A8] border border-[#524532]">
                {products.length} Architectural Swatches
              </span>
            </div>
            <p className="text-[11px] text-[#A79876] hidden md:block">
              Inspect authentic weave textures, macro yarn thread structures, and check live mill roll stocks
            </p>
          </div>
        </div>

        {/* Center: Search & Mode Switches */}
        <div className="flex items-center gap-2">
          {/* Quick Search in Gallery */}
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A79876]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search shade, SKU (e.g. 801, Linen)..."
              className="w-full bg-[#1C160F] border border-[#433829] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#EDE3D0] placeholder:text-[#80725C] focus:outline-hidden focus:border-[#8B5A3C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#A79876] hover:text-[#EDE3D0]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-[#1C160F] p-0.5 rounded-xl border border-[#433829]">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#8B5A3C] text-white shadow-xs'
                  : 'text-[#A79876] hover:text-[#EDE3D0]'
              }`}
              title="Multi-swatch gallery grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gallery Grid</span>
            </button>

            <button
              onClick={() => {
                if (!focusedProduct && filteredProducts.length > 0) {
                  setFocusedProduct(filteredProducts[0]);
                }
                setViewMode('lightbox');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'lightbox'
                  ? 'bg-[#8B5A3C] text-white shadow-xs'
                  : 'text-[#A79876] hover:text-[#EDE3D0]'
              }`}
              title="Macro studio weave inspector"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Macro Studio</span>
            </button>

            <button
              onClick={() => {
                if (comparisonList.length === 0 && filteredProducts.length > 1) {
                  setComparisonList([filteredProducts[0], filteredProducts[1]]);
                }
                setViewMode('compare');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
                viewMode === 'compare'
                  ? 'bg-[#8B5A3C] text-white shadow-xs'
                  : 'text-[#A79876] hover:text-[#EDE3D0]'
              }`}
              title="Side-by-side swatch comparison"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
              {comparisonList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#E7DAC0] text-[#2C2417] text-[10px] font-bold flex items-center justify-center">
                  {comparisonList.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Keyboard Tip & Close */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline text-[11px] font-mono text-[#80725C]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#1C160F] border border-[#433829] text-[#D8C7A8]">Esc</kbd> to exit
          </span>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#352C1F] hover:bg-[#433829] text-[#EDE3D0] transition-colors border border-[#4D402F]"
            title="Close Gallery (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="shrink-0 bg-[#251F16] border-b border-[#3D3325] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'Dimout', 'Blackout', 'Solar Shading', 'Curtains'] as (FabricCategory | 'All')[]).map(
            cat => {
              const count =
                cat === 'All'
                  ? products.length
                  : products.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#D8C7A8] text-[#2C2417] shadow-xs'
                      : 'bg-[#1C160F] text-[#A79876] hover:bg-[#31281D] hover:text-[#EDE3D0] border border-[#3D3325]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-mono ${selectedCategory === cat ? 'text-[#766A57]' : 'text-[#645643]'}`}>
                    ({count})
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Secondary Filters: Color Family, Stock, and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Search input */}
          <div className="relative md:hidden w-36">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter..."
              className="w-full bg-[#1C160F] border border-[#433829] rounded-lg px-2.5 py-1 text-xs text-[#EDE3D0]"
            />
          </div>

          {/* Color Family Selector */}
          <div className="flex items-center gap-1 bg-[#1C160F] px-2.5 py-1 rounded-lg border border-[#3D3325]">
            <span className="text-[11px] text-[#80725C]">Tone:</span>
            <select
              value={selectedColorFamily}
              onChange={e => setSelectedColorFamily(e.target.value as ColorFamily)}
              className="bg-transparent text-xs text-[#D8C7A8] font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Tones</option>
              <option value="Beiges & Ecru">Beiges & Ecru</option>
              <option value="Taupe & Earth">Taupe & Earth</option>
              <option value="Greys & Slate">Greys & Slate</option>
              <option value="Charcoal & Dark">Charcoal & Dark</option>
              <option value="Blues & Teal">Blues & Teal</option>
              <option value="Greens & Olive">Greens & Olive</option>
              <option value="Rust & Terracotta">Rust & Terracotta</option>
            </select>
          </div>

          {/* Stock Quick Filter */}
          <div className="flex items-center gap-1 bg-[#1C160F] px-2.5 py-1 rounded-lg border border-[#3D3325]">
            <span className="text-[11px] text-[#80725C]">Stock:</span>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="bg-transparent text-xs text-[#D8C7A8] font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Stocks</option>
              <option value="ready">Ready Rolls (&gt;30m)</option>
              <option value="wholesale-tier">Roll Discount Eligible (≥50m)</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1 bg-[#1C160F] px-2.5 py-1 rounded-lg border border-[#3D3325]">
            <span className="text-[11px] text-[#80725C]">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-[#D8C7A8] font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="shade">Shade Number</option>
              <option value="stock-desc">Stock (High to Low)</option>
              <option value="dpl-asc">Price (Low to High)</option>
              <option value="dpl-desc">Price (High to Low)</option>
              <option value="gsm-desc">GSM Weight</option>
            </select>
          </div>

          <span className="text-[11px] text-[#A79876] font-mono pl-1">
            {filteredProducts.length} results
          </span>
        </div>
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 overflow-hidden relative">
        {/* ---------------------------------------------------- */}
        {/* VIEW 1: MULTI-SWATCH GALLERY GRID                    */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'grid' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center space-y-3">
                <Layers className="w-12 h-12 text-[#645643]" />
                <h3 className="font-display font-bold text-lg text-[#FBF7EE]">No matching fabric swatches found</h3>
                <p className="text-xs text-[#A79876] max-w-sm">
                  Try adjusting your search query, selecting &quot;All Tones&quot;, or switching to another category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedColorFamily('All');
                    setStockFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8B5A3C] text-white text-xs font-semibold hover:bg-[#72482E]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredProducts.map(product => {
                  const isPinned = comparisonList.some(p => p.id === product.id);
                  const isEligibleWholesale = product.totalStockMeters >= product.rollDiscountThreshold;

                  return (
                    <div
                      key={product.id}
                      className="bg-[#2A2319] border border-[#433829] hover:border-[#8B5A3C] rounded-2xl overflow-hidden shadow-md transition-all duration-200 flex flex-col group hover:-translate-y-0.5"
                    >
                      {/* High-Res Pattern Swatch Canvas */}
                      <div
                        onClick={() => {
                          setFocusedProduct(product);
                          setViewMode('lightbox');
                        }}
                        className="relative w-full aspect-4/3 cursor-pointer overflow-hidden group/canvas"
                      >
                        <HighResFabricPatternCanvas
                          product={product}
                          zoomLevel={1}
                          lightingMode="raking"
                          className="w-full h-full"
                        />

                        {/* Top Badges overlay */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1C160F]/80 backdrop-blur-xs text-[#EDE3D0] border border-white/10">
                            {product.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#8B5A3C] text-white shadow-xs">
                            Shade {product.shadeNo}
                          </span>
                        </div>

                        {/* Hover Overlay with Macro Magnifier Hint */}
                        <div className="absolute inset-0 bg-[#2C2417]/50 backdrop-blur-2xs opacity-0 group-hover/canvas:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-white">
                          <div className="p-2.5 rounded-full bg-[#8B5A3C] shadow-lg transform scale-90 group-hover/canvas:scale-100 transition-transform">
                            <ZoomIn className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold tracking-wide">
                            Click to Inspect Macro Weave
                          </span>
                          <span className="text-[10px] text-[#DACBAA]">
                            Yarn micro-structure &amp; roll details
                          </span>
                        </div>

                        {/* Color swatch swatch circle preview in bottom-right */}
                        <div
                          className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full border-2 border-white/80 shadow-md"
                          style={{ backgroundColor: product.colorHex }}
                          title={`Color Hex: ${product.colorHex}`}
                        />
                      </div>

                      {/* Card Content & Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-[#A79876]">
                              SKU: {product.sku}
                            </span>
                            <span className="text-[10px] text-[#A79876]">
                              {product.gsm} · {product.width}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-[#FBF7EE] leading-tight group-hover:text-[#D8C7A8] transition-colors">
                            {product.catalogueName}
                          </h3>
                          <p className="text-xs text-[#C5B59C] line-clamp-1">
                            {product.colorName}
                          </p>
                        </div>

                        {/* Live Stock & Price metrics */}
                        <div className="pt-2 border-t border-[#3D3325] flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[#80725C]">Dealer Price (DPL)</div>
                            <div className="font-mono font-bold text-sm text-[#FBF7EE]">
                              ₹{product.dpl}<span className="text-[10px] font-normal text-[#A79876]">/m</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-[#80725C]">Ready Roll Stock</div>
                            <div className="font-mono font-bold text-xs text-[#82C341] flex items-center gap-1 justify-end">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#82C341]" />
                              <span>{product.totalStockMeters}m</span>
                              <span className="text-[10px] text-[#A79876]">({product.totalPieces} pcs)</span>
                            </div>
                          </div>
                        </div>

                        {/* Roll Discount Tag */}
                        {isEligibleWholesale && (
                          <div className="py-1 px-2 rounded-lg bg-[#384227] border border-[#5F6B4A]/40 text-[#A6C97E] text-[10px] font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#A6C97E]" />
                              <span>10% Wholesale Savings on ≥50m</span>
                            </span>
                          </div>
                        )}

                        {/* Card Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => {
                              onSelectProductForOrder(product);
                              onClose();
                            }}
                            className="w-full py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Select &amp; Order</span>
                          </button>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setVisualizeProduct(product)}
                              className="flex-1 py-2 rounded-xl bg-[#3D3325] hover:bg-[#4D402F] text-[#EDE3D0] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                              title="Visualize on room window drapery"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D8C7A8]" />
                              <span className="hidden sm:inline">Room</span>
                            </button>

                            <button
                              onClick={() => toggleComparison(product)}
                              className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                                isPinned
                                  ? 'bg-[#8B5A3C] text-white border-[#8B5A3C]'
                                  : 'bg-[#1C160F] text-[#A79876] hover:text-[#EDE3D0] border-[#433829]'
                              }`}
                              title={isPinned ? 'Remove from compare' : 'Add to compare tray'}
                            >
                              <Columns2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: MACRO STUDIO WEAVE LIGHTBOX INSPECTOR        */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'lightbox' && currentFocus && (
          <div className="h-full flex flex-col md:flex-row overflow-hidden">
            {/* Left/Center: Huge Interactive Pattern Inspection Viewport */}
            <div className="flex-1 relative flex flex-col bg-[#16120C] overflow-hidden">
              {/* Floating Inspection Toolbar */}
              <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                {/* Left controls: Lighting & Zoom level */}
                <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-[#251F16]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#433829] shadow-xl text-xs">
                  {/* Zoom Multipliers */}
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[11px] text-[#80725C] font-semibold pr-1">Zoom:</span>
                    {[1, 2, 4, 8].map(z => (
                      <button
                        key={z}
                        onClick={() => setZoomLevel(z as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                          zoomLevel === z
                            ? 'bg-[#8B5A3C] text-white shadow-xs'
                            : 'text-[#A79876] hover:bg-[#352C1F] hover:text-[#EDE3D0]'
                        }`}
                      >
                        {z}x
                      </button>
                    ))}
                  </div>

                  <div className="h-4 w-px bg-[#433829]" />

                  {/* Lighting Modes */}
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[11px] text-[#80725C] font-semibold pr-1">Light:</span>
                    <button
                      onClick={() => setLightingMode('raking')}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        lightingMode === 'raking'
                          ? 'bg-[#8B5A3C] text-white shadow-xs'
                          : 'text-[#A79876] hover:bg-[#352C1F]'
                      }`}
                      title="Grazing 25-deg side light revealing 3D weave relief"
                    >
                      Raking
                    </button>
                    <button
                      onClick={() => setLightingMode('studio')}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        lightingMode === 'studio'
                          ? 'bg-[#8B5A3C] text-white shadow-xs'
                          : 'text-[#A79876] hover:bg-[#352C1F]'
                      }`}
                      title="Direct neutral studio light"
                    >
                      Studio
                    </button>
                    <button
                      onClick={() => setLightingMode('warm')}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        lightingMode === 'warm'
                          ? 'bg-[#8B5A3C] text-white shadow-xs'
                          : 'text-[#A79876] hover:bg-[#352C1F]'
                      }`}
                      title="Warm architectural 2700K ambient wash"
                    >
                      Warm
                    </button>
                  </div>

                  <div className="h-4 w-px bg-[#433829]" />

                  {/* Interactive Magnifier Lens Toggle */}
                  <button
                    onClick={() => setIsLensActive(!isLensActive)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isLensActive
                        ? 'bg-[#D8C7A8] text-[#2C2417] font-bold shadow-xs'
                        : 'text-[#A79876] hover:bg-[#352C1F]'
                    }`}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Lens Follower</span>
                  </button>

                  {/* For Blackout: Toggle Front Woven vs Reverse Thermal Foam */}
                  {currentFocus.category === 'Blackout' && (
                    <>
                      <div className="h-4 w-px bg-[#433829]" />
                      <button
                        onClick={() => setShowBackingView(!showBackingView)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          showBackingView
                            ? 'bg-[#E3E7D8] text-[#5F6B4A] font-bold shadow-xs'
                            : 'text-[#A79876] hover:bg-[#352C1F]'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{showBackingView ? 'Showing Foam Backing' : 'Show Reverse Coating'}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Right controls: Next / Prev navigation pills */}
                <div className="pointer-events-auto flex items-center gap-1.5 bg-[#251F16]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#433829] shadow-xl text-xs">
                  <button
                    onClick={handlePrevProduct}
                    className="p-1.5 rounded-xl hover:bg-[#352C1F] text-[#EDE3D0] transition-colors"
                    title="Previous Swatch (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-mono text-xs text-[#D8C7A8] px-2 font-bold">
                    {filteredProducts.findIndex(p => p.id === currentFocus.id) + 1} / {filteredProducts.length}
                  </span>

                  <button
                    onClick={handleNextProduct}
                    className="p-1.5 rounded-xl hover:bg-[#352C1F] text-[#EDE3D0] transition-colors"
                    title="Next Swatch (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Central High-Resolution Weave Canvas */}
              <div className="flex-1 w-full h-full relative flex items-center justify-center p-4">
                <HighResFabricPatternCanvas
                  product={currentFocus}
                  zoomLevel={zoomLevel}
                  lightingMode={lightingMode}
                  showBackingView={showBackingView}
                  isInteractive={isLensActive}
                  className="w-full h-full rounded-2xl border-2 border-[#433829] shadow-2xl"
                />

                {/* Navigation Chevron Left (Huge clickable hover target) */}
                <button
                  onClick={handlePrevProduct}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#251F16]/80 hover:bg-[#8B5A3C] text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-xs border border-white/10 hover:scale-105"
                  title="Previous Fabric (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Navigation Chevron Right (Huge clickable hover target) */}
                <button
                  onClick={handleNextProduct}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#251F16]/80 hover:bg-[#8B5A3C] text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-xs border border-white/10 hover:scale-105"
                  title="Next Fabric (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Thumbnail Strip for Fast Swatch Flicking */}
              <div className="h-20 shrink-0 bg-[#1C160F] border-t border-[#352C1F] px-4 flex items-center gap-2 overflow-x-auto no-scrollbar z-10">
                {filteredProducts.map(prod => {
                  const isCurrent = prod.id === currentFocus.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setFocusedProduct(prod)}
                      className={`h-14 w-20 shrink-0 rounded-xl overflow-hidden relative border-2 transition-all group ${
                        isCurrent
                          ? 'border-[#8B5A3C] scale-105 shadow-md'
                          : 'border-[#352C1F] opacity-60 hover:opacity-100 hover:border-[#524532]'
                      }`}
                      style={{ backgroundColor: prod.colorHex }}
                    >
                      {/* Swatch Mini Texture */}
                      <HighResFabricPatternCanvas
                        product={prod}
                        zoomLevel={1}
                        lightingMode="studio"
                        className="w-full h-full"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-[#1C160F]/80 text-[9px] font-mono font-bold text-center py-0.5 text-[#EDE3D0]">
                        {prod.shadeNo}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Technical Specification & Instant Order Drawer */}
            <div className="w-full md:w-96 lg:w-[420px] shrink-0 bg-[#251F16] border-l border-[#3D3325] flex flex-col h-auto md:h-full overflow-y-auto">
              <div className="p-5 sm:p-6 space-y-5 flex-1">
                {/* Header: Identity, Shade & Category */}
                <div className="space-y-2 pb-4 border-b border-[#3D3325]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#3D3325] text-[#D8C7A8] border border-[#524532]">
                      {currentFocus.category} · {currentFocus.collection}
                    </span>
                    <span className="text-xs font-mono text-[#A79876]">
                      SKU: {currentFocus.sku}
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-2xl text-[#FBF7EE] leading-tight">
                    {currentFocus.catalogueName}
                  </h2>

                  <div className="flex items-center gap-3 pt-1">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/40 shadow-sm shrink-0"
                      style={{ backgroundColor: currentFocus.colorHex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#FBF7EE]">
                        Shade {currentFocus.shadeNo} · {currentFocus.colorName}
                      </div>
                      <div className="text-[11px] text-[#A79876]">
                        Tone Family: <strong>{getColorFamily(currentFocus)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="space-y-2 bg-[#1C160F] p-3.5 rounded-xl border border-[#352C1F] text-xs">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#80725C]">
                    Fabric Technical Sheet
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1">
                    <div>
                      <span className="text-[#80725C] block text-[11px]">GSM Weight:</span>
                      <span className="font-mono font-bold text-[#EDE3D0]">{currentFocus.gsm}</span>
                    </div>
                    <div>
                      <span className="text-[#80725C] block text-[11px]">Roll Width:</span>
                      <span className="font-mono font-bold text-[#EDE3D0]">{currentFocus.width}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#80725C] block text-[11px]">Fiber Composition:</span>
                      <span className="font-medium text-[#EDE3D0]">{currentFocus.composition}</span>
                    </div>
                    <div>
                      <span className="text-[#80725C] block text-[11px]">HSN Code:</span>
                      <span className="font-mono text-[#EDE3D0]">{currentFocus.hsnCode} (Woven Fabrics)</span>
                    </div>
                    <div>
                      <span className="text-[#80725C] block text-[11px]">Light Control:</span>
                      <span className="font-medium text-[#EDE3D0]">
                        {currentFocus.category === 'Blackout' ? '100% Light Block' : currentFocus.category === 'Dimout' ? '90-95% Dimout' : '3% Openness Screen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Roll Stock Breakdown */}
                <div className="space-y-2 border border-[#352C1F] rounded-xl p-3.5 bg-[#1C160F]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#80725C] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#8B5A3C]" />
                      <span>Live Ready Stock</span>
                    </span>
                    <span className="font-mono font-bold text-xs text-[#82C341] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{currentFocus.totalStockMeters}m ({currentFocus.totalPieces} pcs)</span>
                    </span>
                  </div>

                  {/* Stock roll buckets table */}
                  <table className="w-full text-left text-[11px] border-collapse pt-1">
                    <thead>
                      <tr className="text-[#80725C] border-b border-[#352C1F]">
                        <th className="py-1">Roll Length</th>
                        <th className="py-1 text-right">Qty (Pieces)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#352C1F]/60 text-[#EDE3D0]">
                      {currentFocus.stockBuckets.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-1">{b.range}</td>
                          <td className="py-1 text-right font-mono font-semibold">
                            {Number(b.quantityMeters || 0).toFixed(1)}m ({b.piecesCount})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pricing & Roll Discount Tier */}
                <div className="space-y-2 bg-[#2E261B] p-4 rounded-xl border border-[#433829]">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#A79876]">Dealer Price (DPL)</span>
                      <div className="font-mono font-bold text-2xl text-[#FBF7EE]">
                        ₹{currentFocus.dpl}
                        <span className="text-xs font-normal text-[#A79876]">/metre</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-[#80725C]">MRP</span>
                      <div className="font-mono text-sm line-through text-[#80725C]">
                        ₹{currentFocus.mrp}/m
                      </div>
                    </div>
                  </div>

                  {/* Wholesale Tier Notice */}
                  <div className="p-2.5 rounded-lg bg-[#384227] border border-[#5F6B4A]/50 text-xs text-[#A6C97E] flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>10% Roll Discount on ≥50m</span>
                    </span>
                    {isRollDiscountApplied && (
                      <span className="text-[10px] uppercase font-bold bg-[#5F6B4A] text-white px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    )}
                  </div>

                  {/* Quick Order Quantity Input */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-[#EDE3D0] font-semibold">Order Quantity (metres):</label>
                      <span className="font-mono text-[11px] text-[#A79876]">
                        {orderMeters}m requested
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          value={orderMetersInput}
                          onChange={e => setOrderMetersInput(e.target.value)}
                          className="w-full bg-[#1C160F] border border-[#433829] rounded-xl px-3 py-2 font-mono font-bold text-sm text-[#FBF7EE] focus:outline-hidden focus:border-[#8B5A3C]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-[#80725C] font-semibold">
                          m
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuickAddOrder(currentFocus)}
                        className="px-4 py-2 bg-[#433829] hover:bg-[#524532] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Add this fabric quantity directly to cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add Cart</span>
                      </button>
                    </div>

                    {/* Calculated Net Value preview */}
                    <div className="flex items-center justify-between text-xs pt-1 text-[#D8C7A8]">
                      <span>Calculated Net Order Value:</span>
                      <span className="font-mono font-bold text-sm text-[#82C341]">
                        ₹{netDpl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      onSelectProductForOrder(currentFocus);
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Select Fabric for Order Placement</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setVisualizeProduct(currentFocus)}
                      className="py-2.5 rounded-xl bg-[#352C1F] hover:bg-[#433829] text-[#EDE3D0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-[#D8C7A8]" />
                      <span>Curtain Visualizer</span>
                    </button>

                    <button
                      onClick={() => toggleComparison(currentFocus)}
                      className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                        comparisonList.some(p => p.id === currentFocus.id)
                          ? 'bg-[#8B5A3C] text-white border-[#8B5A3C]'
                          : 'bg-[#1C160F] text-[#D8C7A8] border-[#433829] hover:bg-[#352C1F]'
                      }`}
                    >
                      <Columns2 className="w-4 h-4" />
                      <span>{comparisonList.some(p => p.id === currentFocus.id) ? 'In Compare' : 'Add Compare'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: SIDE-BY-SIDE SWATCH COMPARISON TRAY         */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'compare' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#3D3325]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#FBF7EE]">
                  Side-by-Side Fabric Swatch Comparison
                </h3>
                <p className="text-xs text-[#A79876]">
                  Compare shade gradation, weave structures, GSM weights, and roll stock side-by-side
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComparisonList([])}
                  className="px-3 py-1.5 rounded-xl bg-[#352C1F] hover:bg-[#433829] text-xs text-[#EDE3D0] transition-colors"
                >
                  Clear All ({comparisonList.length})
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-1.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-semibold transition-colors"
                >
                  + Add More Swatches
                </button>
              </div>
            </div>

            {comparisonList.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-center space-y-3">
                <Columns2 className="w-10 h-10 text-[#645643]" />
                <h4 className="font-display font-bold text-base text-[#FBF7EE]">
                  No fabrics currently pinned for comparison
                </h4>
                <p className="text-xs text-[#A79876] max-w-sm">
                  Click the &quot;Compare&quot; icon on any fabric card in the gallery grid or lightbox to inspect them side-by-side.
                </p>
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-4 py-2 rounded-xl bg-[#8B5A3C] text-white text-xs font-semibold"
                >
                  Browse Gallery Grid
                </button>
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(comparisonList.length, 4)}, minmax(260px, 1fr))`,
                }}
              >
                {comparisonList.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#2A2319] border border-[#433829] rounded-2xl overflow-hidden shadow-lg flex flex-col space-y-3 p-4"
                  >
                    {/* Header with Remove */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3D3325] text-[#D8C7A8]">
                        Shade {item.shadeNo}
                      </span>
                      <button
                        onClick={() => toggleComparison(item)}
                        className="p-1 text-[#A79876] hover:text-[#EDE3D0]"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* High-Res Pattern Swatch Canvas */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden border border-[#433829] relative shadow-inner">
                      <HighResFabricPatternCanvas
                        product={item}
                        zoomLevel={2}
                        lightingMode="raking"
                        className="w-full h-full"
                      />
                      <div
                        className="absolute bottom-2 right-2 w-6 h-6 rounded-full border border-white shadow-md"
                        style={{ backgroundColor: item.colorHex }}
                      />
                    </div>

                    {/* Titles */}
                    <div>
                      <h4 className="font-display font-bold text-base text-[#FBF7EE] leading-tight">
                        {item.catalogueName}
                      </h4>
                      <p className="text-xs text-[#C5B59C]">{item.colorName}</p>
                    </div>

                    {/* Specifications table */}
                    <div className="space-y-1.5 text-xs bg-[#1C160F] p-3 rounded-xl border border-[#352C1F] divide-y divide-[#352C1F]/60">
                      <div className="flex justify-between py-1">
                        <span className="text-[#80725C]">Category:</span>
                        <span className="font-semibold text-[#EDE3D0]">{item.category}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#80725C]">GSM Weight:</span>
                        <span className="font-mono font-semibold text-[#EDE3D0]">{item.gsm}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#80725C]">Width:</span>
                        <span className="font-mono text-[#EDE3D0]">{item.width}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#80725C]">DPL Price:</span>
                        <span className="font-mono font-bold text-[#FBF7EE]">₹{item.dpl}/m</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#80725C]">Roll Stock:</span>
                        <span className="font-mono font-bold text-[#82C341]">{item.totalStockMeters}m</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#80725C]">Roll Discount:</span>
                        <span className="text-[#A6C97E] font-medium">10% on ≥50m</span>
                      </div>
                    </div>

                    {/* Order action */}
                    <button
                      onClick={() => {
                        onSelectProductForOrder(item);
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Select for Order</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
