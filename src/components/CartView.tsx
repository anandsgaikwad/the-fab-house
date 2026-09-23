import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  MapPin,
  Truck,
  ArrowRight,
  ShoppingCart,
  AlertTriangle,
  Check,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CartItem } from '../types';

export const CartView: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotalDpl,
    cartTotalDiscount,
    cartGrandTotal,
    updateCartQuantity,
    removeFromCart,
    setActiveView,
    businessProfile,
  } = useApp();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    businessProfile.addresses.find(a => a.isDefault)?.id || businessProfile.addresses[0]?.id || ''
  );
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  const confirmRemove = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#E7DAC0] text-[#8B5A3C] mx-auto flex items-center justify-center">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="font-display font-bold text-2xl text-[#2C2417]">
          CART IS EMPTY — TRY ADDING A PRODUCT TO CART
        </h2>
        <p className="text-xs text-[#766A57] max-w-md mx-auto">
          Explore our wholesale collections in Blackout, Dimout, Solar Shading, and Curtains. Check live roll stock and order with dealer pricing.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveView('place-order')}
            className="px-6 py-3 rounded-full bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
          Order Cart ({cartCount} items)
        </h1>
        <button
          onClick={() => setActiveView('place-order')}
          className="text-xs font-semibold text-[#8B5A3C] hover:underline"
        >
          + Add more items
        </button>
      </div>

      {/* LINE ITEMS LIST */}
      <div className="space-y-3">
        {cart.map(item => (
          <div
            key={item.id}
            className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            {/* Swatch & Description */}
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-xl border border-[#DACBAA] shrink-0 shadow-inner flex items-end p-1"
                style={{ backgroundColor: item.product.colorHex }}
              >
                <span className="text-[9px] font-mono font-bold bg-[#2C2417]/80 text-[#FBF7EE] px-1 rounded">
                  {item.product.shadeNo}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E9D9C5] text-[#8B5A3C]">
                    {item.product.category}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#766A57]">
                    SKU: {item.product.sku}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-[#2C2417]">
                  {item.product.catalogueName}
                </h3>
                <p className="text-xs text-[#766A57]">
                  DPL: <strong className="font-mono text-[#2C2417]">₹{item.product.dpl}/m</strong> · Width: {item.product.width}
                </p>
                <p className="text-[11px] text-[#766A57] flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#8B5A3C]" />
                  <span>Surface transportation default</span>
                </p>
              </div>
            </div>

            {/* Quantity Controller & Price Calculation */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#DACBAA]/50">
              {/* Stepper */}
              <div className="flex items-center gap-1.5 bg-[#E7DAC0] rounded-xl p-1 border border-[#DACBAA]">
                <button
                  onClick={() => updateCartQuantity(item.id, Math.max(0, item.quantityMeters - 5))}
                  className="p-1 rounded-lg text-[#2C2417] hover:bg-[#DACBAA] transition-colors"
                  title="Decrease quantity by 5m"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={item.quantityMeters}
                  onChange={e => updateCartQuantity(item.id, parseFloat(e.target.value) || 0)}
                  className="w-16 text-center font-mono font-bold text-xs bg-transparent focus:outline-hidden"
                />
                <span className="text-[11px] text-[#766A57] font-semibold pr-1">m</span>
                <button
                  onClick={() => updateCartQuantity(item.id, item.quantityMeters + 5)}
                  className="p-1 rounded-lg text-[#2C2417] hover:bg-[#DACBAA] transition-colors"
                  title="Increase quantity by 5m"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price */}
              <div className="text-right min-w-[100px]">
                <span className="font-mono font-bold text-base text-[#8B5A3C] block">
                  ₹{(item.lineDplTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-[#766A57] line-through font-mono">
                  MRP: ₹{(item.lineMrpTotal || 0).toLocaleString('en-IN')}
                </span>
                {item.appliedDiscountPercentage > 0 && (
                  <span className="text-[10px] text-[#5F6B4A] font-semibold block">
                    (10% Roll Savings Applied)
                  </span>
                )}
              </div>

              {/* Delete trigger */}
              <button
                onClick={() => setItemToDelete(item)}
                className="p-2 text-[#766A57] hover:text-[#9C4630] hover:bg-[#9C4630]/10 rounded-lg transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CHOOSE SHIPPING ADDRESS CARD */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#DACBAA]/60 pb-3">
          <MapPin className="w-5 h-5 text-[#8B5A3C]" />
          <div>
            <h2 className="font-display font-bold text-base text-[#2C2417]">
              Choose Registered Shipping Address
            </h2>
            <p className="text-xs text-[#766A57]">
              Select delivery destination site on file for {businessProfile.companyName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {businessProfile.addresses.map(addr => (
            <label
              key={addr.id}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1 block relative ${
                selectedAddressId === addr.id
                  ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                  : 'bg-[#F3EBDA] border-[#DACBAA]/60 hover:bg-[#E7DAC0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C2417] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#8B5A3C]" />
                  {addr.title}
                </span>
                <input
                  type="radio"
                  name="shipping_address"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="accent-[#8B5A3C]"
                />
              </div>
              <p className="text-[#766A57] line-clamp-2">
                {addr.addressLine1}, {addr.addressLine2}, {addr.city} - {addr.pincode}
              </p>
              <p className="text-[11px] text-[#766A57] pt-1">
                Attn: {addr.contactPerson} ({addr.phone})
              </p>
            </label>
          ))}
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-[#E9D9C5] border-t border-[#DACBAA] p-4 shadow-xl z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-[#766A57]">
              Subtotal (<strong className="text-[#2C2417]">{cartCount} items</strong>):
            </span>
            <span className="font-display font-bold text-xl sm:text-2xl text-[#8B5A3C] font-mono">
              ₹{(cartGrandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-[#766A57] hidden sm:inline">
              (incl. estimated GST & Surface Freight)
            </span>
          </div>

          <button
            onClick={() => setActiveView('checkout')}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* REMOVE ITEM CONFIRMATION DIALOG */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2C2417]/60 backdrop-blur-xs"
            onClick={() => setItemToDelete(null)}
          />

          <div className="relative bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#9C4630]/15 text-[#9C4630] mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-[#2C2417]">
                Remove this product from the cart?
              </h3>
              <p className="text-xs text-[#766A57]">
                {itemToDelete.product.catalogueName} ({itemToDelete.quantityMeters}m)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#DACBAA] text-xs font-semibold text-[#2C2417] hover:bg-[#E7DAC0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 rounded-xl bg-[#9C4630] hover:bg-[#853926] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
