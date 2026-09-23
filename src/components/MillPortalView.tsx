import React, { useState } from 'react';
import {
  Factory,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MillPortalView: React.FC = () => {
  const { orders, showToast, millUpdateStatus } = useApp();

  // Orders that have mill procurement flagged or in progress
  const millOrders = orders.filter(
    o => o.millProcurementRaised || o.status === 'Procurement in Progress' || o.millProcurementStatus === 'Mill Order Placed'
  );

  const [procurementBatches, setProcurementBatches] = useState([
    {
      id: 'MILL-REQ-901',
      orderId: 'TFH-2026-0891',
      sku: 'AMH0011',
      fabricName: 'Onyx Dimout 800 (Shade 801)',
      metersRequested: 50,
      stage: 'Weaving & Dyeing',
      loomId: 'LM-04B',
      estReadyDate: '2026-09-15',
    },
    {
      id: 'MILL-REQ-902',
      orderId: 'TFH-2026-0889',
      sku: 'SOL2001',
      fabricName: 'Solar Shading 3% Screen (Shade 301)',
      metersRequested: 40,
      stage: 'Quality Inspection & Grading',
      loomId: 'LM-12A',
      estReadyDate: '2026-09-14',
    },
  ]);

  const advanceStage = (id: string, relatedOrderId?: string) => {
    setProcurementBatches(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        let nextStage = b.stage;
        if (b.stage === 'Weaving & Dyeing') {
          nextStage = 'Quality Inspection & Grading';
        } else if (b.stage === 'Quality Inspection & Grading') {
          nextStage = 'Dispatched to THE FAB HOUSE Depot';
          // Also sync with central order state if orderId is linked
          const targetOrdId = relatedOrderId || b.orderId;
          if (targetOrdId) {
            millUpdateStatus(targetOrdId, 'Stock Received at Warehouse');
          }
        }
        showToast(`Batch ${id} moved to "${nextStage}" stage.`);
        return { ...b, stage: nextStage };
      })
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Mill Header */}
      <div className="bg-[#2C2417] text-[#FBF7EE] p-5 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#8B5A3C] text-white">
              <Factory className="w-5 h-5" />
            </span>
            <h1 className="font-display font-bold text-xl sm:text-2xl">
              Mill & Manufacturing Sourcing Gateway
            </h1>
          </div>
          <p className="text-xs text-[#E7DAC0]">
            Direct link to partner textile mills in Ichalkaranji & Surat · Wholesale roll intake
          </p>
        </div>

        <div className="text-xs bg-[#4A3B2C] px-3 py-1.5 rounded-xl border border-[#8B5A3C]/40 text-[#E7DAC0]">
          Active Looms: <strong>6 Lines Running</strong>
        </div>
      </div>

      {/* Active Mill Procurement Batches */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8B5A3C]" />
            <h2 className="font-display font-bold text-base text-[#2C2417]">
              Procurement Production Queue
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#8B5A3C]">
            {procurementBatches.length} Live Production Lots
          </span>
        </div>

        <div className="space-y-3">
          {procurementBatches.map(batch => (
            <div
              key={batch.id}
              className="bg-[#F3EBDA] border border-[#DACBAA] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#8B5A3C]">{batch.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9D9C5] text-[#8B5A3C]">
                    {batch.stage}
                  </span>
                  <span className="text-[11px] text-[#766A57]">Ref: {batch.orderId}</span>
                </div>

                <h3 className="font-bold text-sm text-[#2C2417]">{batch.fabricName}</h3>
                <p className="text-[#766A57]">
                  Target: <strong>{batch.metersRequested} Metres</strong> · Machine/Loom: <span className="font-mono">{batch.loomId}</span> · Est. Ready: {batch.estReadyDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {batch.stage !== 'Dispatched to THE FAB HOUSE Depot' ? (
                  <button
                    onClick={() => advanceStage(batch.id, batch.orderId)}
                    className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Advance Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-[#E3E7D8] text-[#5F6B4A] font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Transferred to Depot</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Requisitions Raised from Dealer Orders */}
      {millOrders.length > 0 && (
        <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DACBAA]/60 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8B5A3C]" />
              <h2 className="font-display font-bold text-base text-[#2C2417]">
                Back Office Requisitions (From Confirmed Orders)
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#8B5A3C]">
              {millOrders.length} Pending Procurement
            </span>
          </div>

          <div className="space-y-3">
            {millOrders.map(ord => (
              <div
                key={ord.id}
                className="bg-[#F3EBDA] border border-[#DACBAA] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#8B5A3C]">{ord.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9D9C5] text-[#8B5A3C]">
                      {ord.millProcurementStatus || 'Requisition Logged'}
                    </span>
                    <span className="text-[11px] text-[#766A57]">
                      Order Status: <strong className="text-[#2C2417]">{ord.status}</strong>
                    </span>
                  </div>
                  <p className="text-[#2C2417] font-semibold">
                    Items: {ord.items.map(i => `${i.catalogueName} (${i.quantityMeters}m)`).join(', ')}
                  </p>
                  <p className="text-[#766A57] text-[11px]">
                    Buyer: {ord.shippingAddress?.contactPerson || 'Registered Dealer'} · Mode: {ord.shippingMode}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {ord.millProcurementStatus !== 'Stock Received at Warehouse' ? (
                    <button
                      onClick={() => millUpdateStatus(ord.id, 'Stock Received at Warehouse')}
                      className="px-4 py-2 rounded-xl bg-[#5F6B4A] hover:bg-[#4D573B] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Received at Depot</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-[#E3E7D8] text-[#5F6B4A] font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Depot Received</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#FBF7EE] p-4 rounded-xl border border-[#DACBAA] space-y-1.5">
          <span className="font-bold text-[#2C2417] block">Standard Piece Lengths</span>
          <p className="text-[#766A57]">
            Full rolls woven at 50m - 60m per beam. Cut lengths graded and labeled with barcoded batch tags.
          </p>
        </div>
        <div className="bg-[#FBF7EE] p-4 rounded-xl border border-[#DACBAA] space-y-1.5">
          <span className="font-bold text-[#2C2417] block">Quality Tolerance (A-Grade)</span>
          <p className="text-[#766A57]">
            Color shading tested under D65 daylight simulator. Four-point inspection system applied before wrapping.
          </p>
        </div>
        <div className="bg-[#FBF7EE] p-4 rounded-xl border border-[#DACBAA] space-y-1.5">
          <span className="font-bold text-[#2C2417] block">Depot Transit Cycle</span>
          <p className="text-[#766A57]">
            Direct transit from mill gate to THE FAB HOUSE central depot in Pune takes 24 hours via daily dedicated shuttles.
          </p>
        </div>
      </div>
    </div>
  );
};
