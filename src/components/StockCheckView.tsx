import React, { useState } from 'react';
import {
  Layers,
  Search,
  Info,
  CheckCircle,
  Eye,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, FabricCategory } from '../types';

export const StockCheckView: React.FC = () => {
  const { products, setActiveView, setSelectedProduct, setSearchQuery, setVisualizeProduct } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<FabricCategory | 'All'>('All');
  const [activeProduct, setActiveProduct] = useState<Product>(products[0]);

  const categories: (FabricCategory | 'All')[] = [
    'All',
    'Dimout',
    'Blackout',
    'Solar Shading',
    'Curtains',
  ];

  const filtered = products.filter(p => {
    const matchCat = selectedCat === 'All' || p.category === selectedCat;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.sku.toLowerCase().includes(q) ||
      p.catalogueName.toLowerCase().includes(q) ||
      p.shadeNo.includes(q) ||
      p.colorName.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleSelect = (prod: Product) => {
    setActiveProduct(prod);
  };

  const jumpToOrder = (prod: Product) => {
    setSelectedProduct(prod);
    setSearchQuery(prod.sku);
    setActiveView('place-order');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Live Roll Stock Check
          </h1>
          <p className="text-xs text-[#766A57]">
            Real-time roll inventory across all warehouse bays. Read-only verification before commitment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#5F6B4A] font-semibold bg-[#E3E7D8] px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#5F6B4A]/20">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mill Hub Live Sync: Active</span>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FBF7EE] p-3.5 rounded-2xl border border-[#DACBAA] space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#766A57] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shade or SKU (e.g. 801, AMH0011, Blackout)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F3EBDA] border border-[#DACBAA] text-xs text-[#2C2417] focus:outline-hidden focus:border-[#8B5A3C]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === cat
                    ? 'bg-[#8B5A3C] text-white'
                    : 'bg-[#E7DAC0] text-[#766A57] hover:bg-[#DACBAA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left list of SKUs */}
        <div className="lg:col-span-5 bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-3 shadow-xs space-y-2 max-h-[600px] overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-[#766A57] px-2 py-1">
            Select SKU to inspect ({filtered.length} items)
          </p>

          <div className="space-y-1.5">
            {filtered.map(prod => {
              const isSelected = activeProduct.id === prod.id;
              return (
                <div
                  key={prod.id}
                  onClick={() => handleSelect(prod)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                      : 'bg-[#F3EBDA]/60 border-[#DACBAA]/60 hover:bg-[#E7DAC0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-lg border border-[#DACBAA] shrink-0"
                      style={{ backgroundColor: prod.colorHex }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#2C2417]">
                          {prod.catalogueName}
                        </span>
                        <span className="text-[10px] font-mono text-[#8B5A3C]">
                          {prod.sku}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#766A57]">
                        {prod.category} · {prod.colorName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#2C2417] block">
                      {prod.totalStockMeters}m
                    </span>
                    <span className="text-[10px] text-[#766A57]">
                      {prod.totalPieces} pcs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel: Full Roll-Length Buckets */}
        <div className="lg:col-span-7 bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#DACBAA]/60 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-xl border-2 border-[#DACBAA] shadow-inner"
                style={{ backgroundColor: activeProduct.colorHex }}
              />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E9D9C5] text-[#8B5A3C]">
                  {activeProduct.category}
                </span>
                <h2 className="font-display font-bold text-xl text-[#2C2417] mt-0.5">
                  {activeProduct.catalogueName}
                </h2>
                <p className="text-xs text-[#766A57]">
                  SKU: <strong className="font-mono text-[#2C2417]">{activeProduct.sku}</strong> · Shade {activeProduct.shadeNo} ({activeProduct.colorName})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVisualizeProduct(activeProduct)}
                className="p-2 rounded-xl bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs transition-colors"
                title="Preview fabric in room visualizer"
              >
                <Eye className="w-4 h-4 text-[#8B5A3C]" />
              </button>
              <button
                onClick={() => jumpToOrder(activeProduct)}
                className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Order this Shade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
              <span className="text-[#766A57] block text-[10px]">GSM</span>
              <strong className="text-[#2C2417]">{activeProduct.gsm}</strong>
            </div>
            <div className="p-2.5 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
              <span className="text-[#766A57] block text-[10px]">Roll Width</span>
              <strong className="text-[#2C2417]">{activeProduct.width}</strong>
            </div>
            <div className="p-2.5 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
              <span className="text-[#766A57] block text-[10px]">Buying DPL</span>
              <strong className="text-[#8B5A3C] font-mono">₹{activeProduct.dpl}/m</strong>
            </div>
            <div className="p-2.5 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60">
              <span className="text-[#766A57] block text-[10px]">MRP</span>
              <span className="text-[#766A57] font-mono line-through">₹{activeProduct.mrp}/m</span>
            </div>
          </div>

          {/* Live Roll Length Buckets Table */}
          <div className="border border-[#DACBAA] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#E7DAC0] font-bold text-xs text-[#2C2417] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B5A3C]" />
              <span>Current Stock by Roll Length Range</span>
            </div>

            <div className="p-4 bg-[#FBF7EE] space-y-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DACBAA] text-[#766A57] font-semibold">
                    <th className="py-2">Roll Length Range</th>
                    <th className="py-2 text-right">Combined Qty (Metres)</th>
                    <th className="py-2 text-right">No. of Pieces</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DACBAA]/40 text-[#2C2417]">
                  {activeProduct.stockBuckets.map((b, idx) => (
                    <tr key={idx} className="hover:bg-[#F3EBDA]/50">
                      <td className="py-2.5 font-medium">{b.range}</td>
                      <td className="py-2.5 text-right font-mono font-bold">
                        {Number(b.quantityMeters || 0).toFixed(1)} m
                      </td>
                      <td className="py-2.5 text-right font-mono text-[#766A57]">
                        {b.piecesCount} pcs
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#8B5A3C] bg-[#E9D9C5]/50 font-bold">
                    <td className="py-3 text-[#8B5A3C]">Total Live Ready Stock</td>
                    <td className="py-3 text-right font-mono text-[#8B5A3C] text-sm">
                      {activeProduct.totalStockMeters} m
                    </td>
                    <td className="py-3 text-right font-mono text-[#8B5A3C] text-sm">
                      {activeProduct.totalPieces} pcs
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-[#F3EBDA] rounded-xl border border-[#DACBAA]/60 flex items-start gap-2 text-xs text-[#766A57]">
                <Info className="w-4 h-4 shrink-0 text-[#8B5A3C] mt-0.5" />
                <p>
                  *Stock less than 5m is subject to physical availability and actual measurement of the roll at the time of packing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
