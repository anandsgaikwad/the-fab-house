import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  ShieldCheck,
  Building,
  Plus,
  ArrowLeft,
  AlertTriangle,
  FileText,
  QrCode,
  Check,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessAddress, Order } from '../types';
import { BUSINESS_CONTACT, openWhatsAppChat } from '../config/businessContact';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotalDpl,
    cartTotalDiscount,
    placeOrder,
    setActiveView,
    activeDealer,
    activeDealerFinancials,
    businessProfile,
    addBusinessAddress,
    setInvoiceToView,
  } = useApp();

  const canPlaceOrders = activeDealer.status === 'approved' && (activeDealer.permissions?.canPurchaseProducts ?? true);
  const canUseCredit = activeDealer.status === 'approved' && (activeDealer.permissions?.canUseCreditFacility ?? true);

  const [selectedAddress, setSelectedAddress] = useState<BusinessAddress>(
    activeDealer.addresses.find(a => a.isDefault) || activeDealer.addresses[0] || businessProfile.addresses[0]
  );
  const [shippingMode, setShippingMode] = useState<'Surface' | 'Express'>('Surface');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Limit' | 'UPI' | 'Net Banking' | 'Card'>(
    canUseCredit ? 'Credit Limit' : 'UPI'
  );

  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddressTitle, setNewAddressTitle] = useState('');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Cost calculations
  const subtotal = cartSubtotalDpl;
  const rollDiscount = cartTotalDiscount;
  const taxable = subtotal - rollDiscount;
  const gst = Number((taxable * 0.05).toFixed(2));
  const shippingFee = shippingMode === 'Express' ? 1200 : 650;
  const grandTotal = Number((taxable + gst + shippingFee).toFixed(2));

  // Dynamic credit limit calculation from dealer financials
  const availableCredit = activeDealerFinancials.availableCredit;
  const isCreditSufficient = canUseCredit && availableCredit >= grandTotal;

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressTitle || !newAddressLine1 || !newCity || !newPincode) return;
    const newAddr: Omit<BusinessAddress, 'id'> = {
      title: newAddressTitle,
      contactPerson: newContact || activeDealer.contactPerson,
      phone: newPhone || activeDealer.contactPhone || '',
      addressLine1: newAddressLine1,
      addressLine2: newAddressLine2,
      city: newCity,
      state: 'Maharashtra',
      pincode: newPincode,
      gstin: activeDealer.gstin,
      isDefault: false,
    };
    addBusinessAddress(newAddr);
    setShowNewAddressForm(false);
    // Reset form
    setNewAddressTitle('');
    setNewAddressLine1('');
    setNewAddressLine2('');
    setNewCity('');
    setNewPincode('');
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    if (!canPlaceOrders) return;
    if (paymentMethod === 'Credit Limit' && !isCreditSufficient) return;

    const order = placeOrder(selectedAddress, shippingMode, paymentMethod);
    setPlacedOrder(order);
  };

  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#E3E7D8] text-[#5F6B4A] mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#E3E7D8] text-[#5F6B4A]">
            Order Confirmed & Received at Back Office
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#2C2417]">
            Thank you for your order!
          </h1>
          <p className="text-xs text-[#766A57]">
            Order Ref: <strong className="font-mono text-[#8B5A3C] text-sm">{placedOrder.id}</strong>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 text-left text-xs space-y-3 shadow-xs">
          <div className="flex justify-between pb-2 border-b border-[#DACBAA]/60">
            <span className="text-[#766A57]">Delivery Destination:</span>
            <strong className="text-[#2C2417] text-right">{placedOrder.shippingAddress.title}</strong>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#DACBAA]/60">
            <span className="text-[#766A57]">Logistics Mode:</span>
            <strong className="text-[#2C2417]">{placedOrder.shippingMode} Transportation</strong>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#DACBAA]/60">
            <span className="text-[#766A57]">Payment:</span>
            <strong className="text-[#5F6B4A]">{placedOrder.paymentMethod} ({placedOrder.paymentStatus})</strong>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold">
            <span className="text-[#2C2417]">Grand Total (incl. GST):</span>
            <span className="font-mono text-[#8B5A3C]">
              ₹{placedOrder.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <p className="text-[11px] text-[#766A57] pt-2 border-t border-[#DACBAA]/60">
            THE FAB HOUSE back office has received this order. Required fabric rolls are reserved or scheduled for mill procurement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              const msg = `Hello THE FAB HOUSE (${BUSINESS_CONTACT.whatsAppDisplay}), I have placed order ${placedOrder.id} for ₹${placedOrder.grandTotal.toLocaleString('en-IN')}. Please confirm dispatch scheduling.`;
              openWhatsAppChat(msg);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#DCF8C6] hover:bg-[#cbf1af] text-[#075E54] border border-[#25D366]/40 text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            title="Send Order Reference to THE FAB HOUSE via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Notify on WhatsApp</span>
          </button>
          <button
            onClick={() => setActiveView('track-orders')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold transition-colors shadow-xs"
          >
            Track Order Status
          </button>
          <button
            onClick={() => setInvoiceToView(placedOrder)}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>View GST Invoice</span>
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full sm:w-auto px-5 py-3 rounded-full border border-[#DACBAA] text-xs font-semibold text-[#766A57] hover:bg-[#FBF7EE] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView('cart')}
          className="p-1.5 rounded-lg text-[#766A57] hover:bg-[#E7DAC0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C2417]">
            Order Checkout & Confirmation
          </h1>
          <p className="text-xs text-[#766A57]">
            Select destination address, freight mode, and commercial payment terms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Details (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* STEP 1: SHIPPING ADDRESS */}
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8B5A3C]" />
                <h2 className="font-display font-bold text-base text-[#2C2417]">
                  1. Delivery Destination Address
                </h2>
              </div>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs text-[#8B5A3C] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Site</span>
              </button>
            </div>

            {/* Address Radios */}
            <div className="space-y-2">
              {businessProfile.addresses.map(addr => (
                <label
                  key={addr.id}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start justify-between transition-all ${
                    selectedAddress.id === addr.id
                      ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                      : 'bg-[#F3EBDA] border-[#DACBAA]/60 hover:bg-[#E7DAC0]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#2C2417] flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#8B5A3C]" />
                      {addr.title}
                    </span>
                    <p className="text-[#766A57]">
                      {addr.addressLine1}, {addr.addressLine2}, {addr.city} - {addr.pincode}
                    </p>
                    <p className="text-[11px] text-[#766A57]">
                      Attn: {addr.contactPerson} ({addr.phone})
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="checkout_address"
                    checked={selectedAddress.id === addr.id}
                    onChange={() => setSelectedAddress(addr)}
                    className="accent-[#8B5A3C] mt-1"
                  />
                </label>
              ))}
            </div>

            {/* Add New Address Form Modal/Panel */}
            {showNewAddressForm && (
              <form
                onSubmit={handleAddAddress}
                className="p-3.5 bg-[#E7DAC0] rounded-xl border border-[#DACBAA] space-y-2.5 text-xs pt-3"
              >
                <p className="font-bold text-[#2C2417]">Add New Registered Fabrication / Site Address</p>
                <input
                  type="text"
                  placeholder="Address Title (e.g. Pune Depot Annex)"
                  value={newAddressTitle}
                  onChange={e => setNewAddressTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417]"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={newAddressLine1}
                  onChange={e => setNewAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417]"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={newAddressLine2}
                  onChange={e => setNewAddressLine2(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newPincode}
                    onChange={e => setNewPincode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Person"
                    value={newContact}
                    onChange={e => setNewContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417]"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FBF7EE] border border-[#DACBAA] text-xs text-[#2C2417]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#DACBAA] text-xs font-semibold text-[#766A57]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#8B5A3C] text-white text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: SHIPPING MODE */}
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#DACBAA]/60 pb-3">
              <Truck className="w-4 h-4 text-[#8B5A3C]" />
              <h2 className="font-display font-bold text-base text-[#2C2417]">
                2. Select Transportation Mode
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3 rounded-xl border cursor-pointer space-y-1 block ${
                  shippingMode === 'Surface'
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                    : 'bg-[#F3EBDA] border-[#DACBAA]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C2417]">Surface Logistics (Default)</span>
                  <input
                    type="radio"
                    name="shipping_mode"
                    checked={shippingMode === 'Surface'}
                    onChange={() => setShippingMode('Surface')}
                    className="accent-[#8B5A3C]"
                  />
                </div>
                <p className="text-[#766A57]">Standard surface transport (3-5 business days)</p>
                <span className="font-mono font-bold text-[#8B5A3C] block pt-1">₹650 freight</span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer space-y-1 block ${
                  shippingMode === 'Express'
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                    : 'bg-[#F3EBDA] border-[#DACBAA]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C2417]">Express / Fast Cargo</span>
                  <input
                    type="radio"
                    name="shipping_mode"
                    checked={shippingMode === 'Express'}
                    onChange={() => setShippingMode('Express')}
                    className="accent-[#8B5A3C]"
                  />
                </div>
                <p className="text-[#766A57]">Priority direct dispatch (1-2 business days)</p>
                <span className="font-mono font-bold text-[#8B5A3C] block pt-1">₹1,200 freight</span>
              </label>
            </div>
          </div>

          {/* STEP 3: PAYMENT TERMS */}
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#DACBAA]/60 pb-3">
              <CreditCard className="w-4 h-4 text-[#8B5A3C]" />
              <h2 className="font-display font-bold text-base text-[#2C2417]">
                3. Commercial Payment Method
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              {/* Pay on Credit */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${
                  paymentMethod === 'Credit Limit'
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                    : 'bg-[#F3EBDA] border-[#DACBAA]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5F6B4A]" />
                    <span className="font-bold text-[#2C2417]">
                      Pay via Approved Credit Facility (45 Days)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'Credit Limit'}
                    onChange={() => setPaymentMethod('Credit Limit')}
                    className="accent-[#8B5A3C]"
                  />
                </div>

                <div className="mt-2 pt-2 border-t border-[#DACBAA]/60 flex items-center justify-between text-[11px]">
                  <span className="text-[#766A57]">Available Credit Balance:</span>
                  <strong className={isCreditSufficient ? 'text-[#5F6B4A]' : 'text-[#9C4630]'}>
                    ₹{(availableCredit || 0).toLocaleString('en-IN')} (Credit Limit: ₹{(activeDealerFinancials.approvedCreditLimit ?? activeDealerFinancials.creditLimit ?? businessProfile.creditLimit ?? 0).toLocaleString('en-IN')})
                  </strong>
                </div>

                {!isCreditSufficient && (
                  <p className="text-[10px] text-[#9C4630] font-semibold pt-1">
                    *Order value exceeds your available credit balance. Please choose UPI/Net Banking or clear outstanding dues.
                  </p>
                )}
              </label>

              {/* UPI */}
              <label
                className={`p-3 rounded-xl border cursor-pointer block transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                    : 'bg-[#F3EBDA] border-[#DACBAA]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#8B5A3C]" />
                    <span className="font-bold text-[#2C2417]">Instant UPI / QR Payment</span>
                  </div>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-[#8B5A3C]"
                  />
                </div>
                <p className="text-[11px] text-[#766A57] mt-1">Google Pay, PhonePe, Paytm, BHIM</p>
              </label>

              {/* Net Banking */}
              <label
                className={`p-3 rounded-xl border cursor-pointer block transition-all ${
                  paymentMethod === 'Net Banking'
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                    : 'bg-[#F3EBDA] border-[#DACBAA]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C2417]">Corporate Net Banking (NEFT / RTGS)</span>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'Net Banking'}
                    onChange={() => setPaymentMethod('Net Banking')}
                    className="accent-[#8B5A3C]"
                  />
                </div>
                <p className="text-[11px] text-[#766A57] mt-1">HDFC, ICICI, State Bank of India, Axis Bank</p>
              </label>

              {/* Debit/Credit Card */}
              <label
                className={`p-3 rounded-xl border cursor-pointer block transition-all ${
                  paymentMethod === 'Card'
                    ? 'bg-[#E9D9C5] border-[#8B5A3C] shadow-xs'
                    : 'bg-[#F3EBDA] border-[#DACBAA]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C2417]">Corporate Credit / Debit Card</span>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'Card'}
                    onChange={() => setPaymentMethod('Card')}
                    className="accent-[#8B5A3C]"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-sm space-y-4 sticky top-24">
            <h2 className="font-display font-bold text-base text-[#2C2417] border-b border-[#DACBAA]/60 pb-3">
              Order Summary ({cart.length} SKUs)
            </h2>

            {/* Itemized preview */}
            <div className="divide-y divide-[#DACBAA]/40 max-h-56 overflow-y-auto pr-1 text-xs">
              {cart.map(i => (
                <div key={i.id} className="py-2.5 flex justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[#2C2417] block">{i.product.catalogueName}</span>
                    <span className="text-[11px] text-[#766A57]">
                      {i.quantityMeters}m @ ₹{i.product.dpl}/m
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-[#2C2417]">
                    ₹{i.lineDplTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#DACBAA]/60 text-xs">
              <div className="flex justify-between text-[#766A57]">
                <span>DPL Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {rollDiscount > 0 && (
                <div className="flex justify-between text-[#5F6B4A] font-semibold">
                  <span>Bulk Roll Discounts:</span>
                  <span className="font-mono">-₹{rollDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-[#766A57]">
                <span>Taxable Fabric Value:</span>
                <span className="font-mono">₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[#766A57]">
                <span>GST (5% Fabric HSN 5407):</span>
                <span className="font-mono">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[#766A57]">
                <span>Logistics ({shippingMode}):</span>
                <span className="font-mono">₹{shippingFee.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-[#8B5A3C]/30 flex justify-between items-baseline font-bold text-base text-[#2C2417]">
                <span className="font-display">Total Amount:</span>
                <span className="font-mono text-[#8B5A3C] text-xl font-display">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={paymentMethod === 'Credit Limit' && !isCreditSufficient}
              className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
                paymentMethod === 'Credit Limit' && !isCreditSufficient
                  ? 'bg-[#A79876]/40 text-[#766A57] cursor-not-allowed'
                  : 'bg-[#8B5A3C] hover:bg-[#72482E] text-white cursor-pointer active:scale-98'
              }`}
            >
              <span>Confirm & Place Order</span>
              <Check className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#766A57]">
              By confirming, this purchase order flows automatically into THE FAB HOUSE fulfillment system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
