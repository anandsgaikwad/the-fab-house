import React, { useState, useMemo, useRef } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Lock,
  ShieldCheck,
  Star,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, FabricCategory } from '../types';
import {
  parseExcelOrCsvFile,
  exportFabricsToExcel,
  exportFabricsToCsv,
  processSampleImageFile,
} from '../services/fabricInventoryService';

interface FabricFormData {
  id?: string;
  catalogueName: string;
  sku: string;
  fabricType: string;
  category: FabricCategory;
  collection: string;
  shadeNo: string;
  colorName: string;
  colorHex: string;
  patternDesign: string;
  composition: string;
  width: string;
  gsm: string;
  dpl: number;
  mrp: number;
  totalStockMeters: number;
  supplier: string;
  description: string;
  sampleImages: string[];
  primarySampleImage?: string;
  hsnCode: string;
  rollDiscountThreshold: number;
  rollDiscountPercentage: number;
}

const INITIAL_FORM: FabricFormData = {
  catalogueName: '',
  sku: '',
  fabricType: 'Dimout Weave',
  category: 'Dimout',
  collection: '',
  shadeNo: '',
  colorName: 'Beige Cream',
  colorHex: '#D5C4A7',
  patternDesign: 'Plain Weave',
  composition: '100% Polyester',
  width: '54"',
  gsm: '280+2%',
  dpl: 720,
  mrp: 1290,
  totalStockMeters: 150,
  supplier: 'The Fab House Surat Mill',
  description: 'High-density drape fabric with superior light attenuation, dimensional stability, and anti-shrink finish.',
  sampleImages: [],
  primarySampleImage: undefined,
  hsnCode: '5407',
  rollDiscountThreshold: 50,
  rollDiscountPercentage: 10,
};

export const AdminFabricManagementView: React.FC = () => {
  const {
    products,
    addFabric,
    updateFabric,
    deleteFabric,
    uploadFabricSample,
    removeFabricSample,
    setPrimaryFabricSample,
    importFabricsFromDataset,
    resetFabricsToDefault,
    setActiveView,
    setSelectedProduct,
    isAdminAuthenticated,
    setIsAdminAuthModalOpen,
    adminUser,
    showToast,
  } = useApp();

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FabricCategory | 'All'>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'in_stock' | 'low_stock' | 'critical' | 'has_samples'>('All');
  const [sortBy, setSortBy] = useState<'name_asc' | 'sku_asc' | 'price_desc' | 'price_asc' | 'stock_desc' | 'stock_asc'>('name_asc');

  // Modal & Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FabricFormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete Confirmation Modal
  const [fabricToDelete, setFabricToDelete] = useState<Product | null>(null);

  // Sample Management Modal
  const [sampleModalFabric, setSampleModalFabric] = useState<Product | null>(null);
  const [sampleUrlInput, setSampleUrlInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sample Preview Zoom Modal
  const [previewSampleImage, setPreviewSampleImage] = useState<string | null>(null);

  // Excel / CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [parsedPreviewFabrics, setParsedPreviewFabrics] = useState<Partial<Product>[] | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);

  // File input refs
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const sampleFileInputRef = useRef<HTMLInputElement>(null);

  // Filtered & Sorted Fabrics
  const filteredFabrics = useMemo(() => {
    return products
      .filter(f => {
        // Category Filter
        if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;

        // Stock Filter
        if (stockFilter === 'in_stock' && f.totalStockMeters < 30) return false;
        if (stockFilter === 'low_stock' && (f.totalStockMeters < 10 || f.totalStockMeters >= 30)) return false;
        if (stockFilter === 'critical' && f.totalStockMeters >= 10) return false;
        if (stockFilter === 'has_samples' && (!f.sampleImages || f.sampleImages.length === 0)) return false;

        // Search Filter
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          f.catalogueName.toLowerCase().includes(q) ||
          f.sku.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.colorName.toLowerCase().includes(q) ||
          (f.fabricType && f.fabricType.toLowerCase().includes(q)) ||
          (f.patternDesign && f.patternDesign.toLowerCase().includes(q)) ||
          (f.supplier && f.supplier.toLowerCase().includes(q)) ||
          (f.composition && f.composition.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return a.catalogueName.localeCompare(b.catalogueName);
          case 'sku_asc':
            return a.sku.localeCompare(b.sku);
          case 'price_desc':
            return b.dpl - a.dpl;
          case 'price_asc':
            return a.dpl - b.dpl;
          case 'stock_desc':
            return b.totalStockMeters - a.totalStockMeters;
          case 'stock_asc':
            return a.totalStockMeters - b.totalStockMeters;
          default:
            return 0;
        }
      });
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy]);

  // Inventory Statistics
  const stats = useMemo(() => {
    const totalFabrics = products.length;
    const totalMeters = products.reduce((sum, p) => sum + p.totalStockMeters, 0);
    const withSamples = products.filter(p => p.sampleImages && p.sampleImages.length > 0).length;
    const lowStockCount = products.filter(p => p.totalStockMeters < 30).length;
    return { totalFabrics, totalMeters: Math.round(totalMeters), withSamples, lowStockCount };
  }, [products]);

  // Handlers for Form
  const openAddModal = () => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      return;
    }
    setFormData({
      ...INITIAL_FORM,
      sku: `TFH${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsEditing(false);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (fabric: Product) => {
    if (!isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      return;
    }
    setFormData({
      id: fabric.id,
      catalogueName: fabric.catalogueName,
      sku: fabric.sku,
      fabricType: fabric.fabricType || `${fabric.category} Weave`,
      category: fabric.category,
      collection: fabric.collection || fabric.catalogueName,
      shadeNo: fabric.shadeNo,
      colorName: fabric.colorName,
      colorHex: fabric.colorHex,
      patternDesign: fabric.patternDesign || 'Plain',
      composition: fabric.composition,
      width: fabric.width,
      gsm: fabric.gsm,
      dpl: fabric.dpl,
      mrp: fabric.mrp,
      totalStockMeters: fabric.totalStockMeters,
      supplier: fabric.supplier || 'The Fab House Partner Mill',
      description: fabric.description || '',
      sampleImages: fabric.sampleImages || [],
      primarySampleImage: fabric.primarySampleImage || fabric.sampleImages?.[0],
      hsnCode: fabric.hsnCode,
      rollDiscountThreshold: fabric.rollDiscountThreshold,
      rollDiscountPercentage: fabric.rollDiscountPercentage,
    });
    setIsEditing(true);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.catalogueName.trim()) errors.catalogueName = 'Fabric Name is required';
    if (!formData.sku.trim()) errors.sku = 'Fabric SKU / Code is required';
    if (formData.dpl <= 0) errors.dpl = 'Dealer Price must be greater than 0';
    if (formData.mrp < formData.dpl) errors.mrp = 'MRP must be greater than or equal to Dealer Price';
    if (formData.totalStockMeters < 0) errors.totalStockMeters = 'Stock cannot be negative';

    // Duplicate SKU check (unless editing same product)
    const cleanSku = formData.sku.trim().toUpperCase();
    const duplicate = products.find(p => p.sku.toUpperCase() === cleanSku && p.id !== formData.id);
    if (duplicate) errors.sku = `SKU "${cleanSku}" is already used by ${duplicate.catalogueName}`;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveFabric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing && formData.id) {
      const existing = products.find(p => p.id === formData.id);
      if (!existing) return;

      const updatedProduct: Product = {
        ...existing,
        ...formData,
        id: formData.id,
        sku: formData.sku.trim().toUpperCase(),
        catalogueName: formData.catalogueName.trim(),
        totalStockMeters: Number(formData.totalStockMeters),
        dpl: Number(formData.dpl),
        mrp: Number(formData.mrp),
        primarySampleImage: formData.primarySampleImage || formData.sampleImages[0] || undefined,
      };

      const result = updateFabric(updatedProduct);
      if (result.success) {
        setIsFormModalOpen(false);
      }
    } else {
      const result = addFabric(formData);
      if (result.success) {
        setIsFormModalOpen(false);
      }
    }
  };

  const handleDeleteFabricConfirm = () => {
    if (!fabricToDelete) return;
    deleteFabric(fabricToDelete.id);
    setFabricToDelete(null);
  };

  // Sample Images Management Handlers
  const handleOpenSampleModal = (fabric: Product) => {
    setSampleModalFabric(fabric);
    setSampleUrlInput('');
  };

  const handleAddSampleFromUrl = () => {
    if (!sampleModalFabric || !sampleUrlInput.trim()) return;
    const url = sampleUrlInput.trim();
    uploadFabricSample(sampleModalFabric.id, url);

    // Update local modal state
    setSampleModalFabric(prev =>
      prev
        ? {
            ...prev,
            sampleImages: [...(prev.sampleImages || []), url],
            primarySampleImage: prev.primarySampleImage || url,
          }
        : null
    );
    setSampleUrlInput('');
  };

  const handleSampleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sampleModalFabric) return;

    try {
      setIsUploadingImage(true);
      const base64 = await processSampleImageFile(file, 1000);
      uploadFabricSample(sampleModalFabric.id, base64);

      // Update local modal state
      setSampleModalFabric(prev =>
        prev
          ? {
              ...prev,
              sampleImages: [...(prev.sampleImages || []), base64],
              primarySampleImage: prev.primarySampleImage || base64,
            }
          : null
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to process sample image.');
    } finally {
      setIsUploadingImage(false);
      if (sampleFileInputRef.current) sampleFileInputRef.current.value = '';
    }
  };

  const handleRemoveSample = (index: number) => {
    if (!sampleModalFabric) return;
    removeFabricSample(sampleModalFabric.id, index);

    setSampleModalFabric(prev => {
      if (!prev) return null;
      const updated = [...(prev.sampleImages || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        sampleImages: updated,
        primarySampleImage: updated[0] || undefined,
      };
    });
  };

  const handleSetPrimary = (index: number) => {
    if (!sampleModalFabric || !sampleModalFabric.sampleImages?.[index]) return;
    setPrimaryFabricSample(sampleModalFabric.id, index);

    setSampleModalFabric(prev =>
      prev
        ? {
            ...prev,
            primarySampleImage: prev.sampleImages?.[index],
          }
        : null
    );
  };

  // Excel / CSV File Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsParsingFile(true);
      setImportFileName(file.name);
      const parsed = await parseExcelOrCsvFile(file);
      setParsedPreviewFabrics(parsed);
      setIsImportModalOpen(true);
    } catch (err: any) {
      showToast(`Error parsing file: ${err.message}`);
    } finally {
      setIsParsingFile(false);
      if (excelFileInputRef.current) excelFileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = () => {
    if (!parsedPreviewFabrics || parsedPreviewFabrics.length === 0) return;
    importFabricsFromDataset(parsedPreviewFabrics, importMode);
    setIsImportModalOpen(false);
    setParsedPreviewFabrics(null);
    setImportFileName('');
  };

  const handleDownloadExcel = () => {
    exportFabricsToExcel(products, `THE_FAB_HOUSE_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Excel inventory sheet downloaded successfully.');
  };

  const handleDownloadCsv = () => {
    const csvData = exportFabricsToCsv(products);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `THE_FAB_HOUSE_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV inventory file downloaded successfully.');
  };

  const downloadSampleTemplate = () => {
    const sampleTemplateData: Product[] = [
      {
        id: 'sample-1',
        serialNo: 1,
        sku: 'AMH0011',
        catalogueName: 'Onyx Dimout 801',
        shadeNo: '801',
        category: 'Dimout',
        collection: 'Onyx Dimout',
        colorName: 'Vanilla Ecru',
        colorHex: '#F0E6D2',
        textureType: 'dimout',
        gsm: '265+2%',
        width: '54"',
        composition: '100% Polyester',
        dpl: 704,
        mrp: 1295,
        rollDiscountThreshold: 50,
        rollDiscountPercentage: 10,
        stockBuckets: [],
        totalStockMeters: 180,
        totalPieces: 12,
        defaultShippingMode: 'Surface',
        hsnCode: '5407',
        fabricType: 'Dimout Weave',
        patternDesign: 'Fine Micro-Twill Plain',
        supplier: 'The Fab House Surat Mill No. 1',
        description: 'Premium dimout drapery fabric with soft drape and 95%+ light blockage.',
        sampleImages: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80'],
        primarySampleImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
      },
    ];
    exportFabricsToExcel(sampleTemplateData, 'Fabric_Import_Template_TheFabHouse.xlsx');
    showToast('Sample Excel template downloaded.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Top Banner & Title */}
      <div className="bg-[#2C2417] text-[#FBF7EE] p-5 sm:p-6 rounded-2xl shadow-md border border-[#4A3B2C] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8B5A3C] text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight">
                  Fabric Inventory &amp; Sample Management
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#8B5A3C] text-white">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-[#DACBAA] mt-0.5">
                Manage fabrics, modify technical specs, upload high-res sample images, and maintain real-time inventory independently.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {isAdminAuthenticated ? (
              <span className="inline-flex items-center gap-1.5 bg-[#5F6B4A]/30 text-[#D7E2C7] px-2.5 py-1 rounded-full border border-[#5F6B4A]/60 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3C088]" />
                <span>Verified Admin: {adminUser?.email}</span>
              </span>
            ) : (
              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-amber-900/40 text-amber-200 px-3 py-1 rounded-full border border-amber-600/50 hover:bg-amber-800/40 font-semibold transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in with Google to enable editing</span>
              </button>
            )}
            <span className="text-[#8E7E65]">·</span>
            <span className="text-[#DACBAA] text-xs">
              Independent Live Database ({products.length} Fabrics)
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add New Fabric Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5A3C] hover:bg-[#72482E] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Create and register a new fabric in inventory"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Fabric</span>
          </button>

          {/* Import Spreadsheet */}
          <label className="flex items-center gap-2 px-3.5 py-2.5 bg-[#3D3021] hover:bg-[#4D3D2A] text-[#FBF7EE] border border-[#DACBAA]/30 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs">
            <Upload className="w-4 h-4 text-[#DACBAA]" />
            <span>Import Excel / CSV</span>
            <input
              ref={excelFileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center bg-[#3D3021] border border-[#DACBAA]/30 rounded-xl p-0.5">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#FBF7EE] hover:bg-[#4D3D2A] rounded-lg transition-colors"
              title="Download entire fabric inventory as Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export XLSX</span>
            </button>
            <span className="w-px h-4 bg-[#DACBAA]/30" />
            <button
              onClick={handleDownloadCsv}
              className="px-2.5 py-2 text-xs font-medium text-[#DACBAA] hover:bg-[#4D3D2A] hover:text-white rounded-lg transition-colors"
              title="Export as CSV"
            >
              CSV
            </button>
          </div>

          {/* Switch to Fulfillment Protocol */}
          <button
            onClick={() => setActiveView('admin-fulfillment')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#251D12] hover:bg-[#322718] text-[#DACBAA] hover:text-white border border-[#DACBAA]/20 rounded-xl text-xs transition-colors"
            title="Switch to Orders Fulfillment Protocol"
          >
            <span>Fulfillment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FBF7EE] p-4 rounded-xl border border-[#DACBAA] shadow-xs">
          <p className="text-[11px] font-semibold text-[#766A57] uppercase tracking-wider">Total Active Fabrics</p>
          <p className="text-2xl font-bold font-display text-[#2C2417] mt-1">{stats.totalFabrics}</p>
          <span className="text-[11px] text-[#5F6B4A] font-medium">100% Manually Editable</span>
        </div>

        <div className="bg-[#FBF7EE] p-4 rounded-xl border border-[#DACBAA] shadow-xs">
          <p className="text-[11px] font-semibold text-[#766A57] uppercase tracking-wider">Stock on Hand</p>
          <p className="text-2xl font-bold font-display text-[#2C2417] mt-1">{(stats.totalMeters || 0).toLocaleString()} <span className="text-sm font-normal text-[#766A57]">Meters</span></p>
          <span className="text-[11px] text-[#766A57]">Across 4 category lines</span>
        </div>

        <div className="bg-[#FBF7EE] p-4 rounded-xl border border-[#DACBAA] shadow-xs">
          <p className="text-[11px] font-semibold text-[#766A57] uppercase tracking-wider">With Sample Images</p>
          <p className="text-2xl font-bold font-display text-[#8B5A3C] mt-1">
            {stats.withSamples} <span className="text-sm font-normal text-[#766A57]">/ {stats.totalFabrics}</span>
          </p>
          <span className="text-[11px] text-[#766A57]">Visual Swatch Coverage</span>
        </div>

        <div className="bg-[#FBF7EE] p-4 rounded-xl border border-[#DACBAA] shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#766A57] uppercase tracking-wider">Low Stock Alerts (&lt;30m)</p>
            <p className={`text-2xl font-bold font-display mt-1 ${stats.lowStockCount > 0 ? 'text-amber-700' : 'text-[#5F6B4A]'}`}>
              {stats.lowStockCount} <span className="text-sm font-normal text-[#766A57]">Fabrics</span>
            </p>
          </div>
          <button
            onClick={downloadSampleTemplate}
            className="text-[11px] text-[#8B5A3C] hover:underline font-semibold text-left flex items-center gap-1 pt-1"
          >
            <Download className="w-3 h-3" />
            <span>Download CSV/Excel Template</span>
          </button>
        </div>
      </div>

      {/* Search, Category Filter, and Sorting Controls */}
      <div className="bg-[#FBF7EE] p-4 rounded-2xl border border-[#DACBAA] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#766A57] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Fabric Name, SKU / Code, Category, Color, Pattern, or Supplier..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-[#F3EBDA] border border-[#DACBAA] rounded-xl text-[#2C2417] placeholder-[#8E7E65] focus:outline-none focus:border-[#8B5A3C] focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766A57] hover:text-[#2C2417]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stock status filter */}
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="text-xs bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-3 py-2 text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
            >
              <option value="All">All Stock Levels</option>
              <option value="in_stock">High Stock (&gt;30m)</option>
              <option value="low_stock">Low Stock (10m - 30m)</option>
              <option value="critical">Critical Stock (&lt;10m)</option>
              <option value="has_samples">Has Sample Photos</option>
            </select>

            {/* Sort order */}
            <div className="flex items-center gap-1.5 bg-[#F3EBDA] border border-[#DACBAA] rounded-xl px-2.5 py-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#766A57]" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-[#2C2417] focus:outline-none cursor-pointer py-1"
              >
                <option value="name_asc">Name (A to Z)</option>
                <option value="sku_asc">SKU Code</option>
                <option value="price_desc">Price (Highest First)</option>
                <option value="price_asc">Price (Lowest First)</option>
                <option value="stock_desc">Stock Meters (Highest)</option>
                <option value="stock_asc">Stock Meters (Lowest)</option>
              </select>
            </div>

            {/* Reset to Standard Defaults */}
            <button
              onClick={() => {
                if (window.confirm('Reset fabric inventory back to default initial catalogue records? Any custom added fabrics will be reset.')) {
                  resetFabricsToDefault();
                }
              }}
              className="flex items-center gap-1 px-2.5 py-2 text-[11px] text-[#766A57] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
              title="Reset inventory back to initial default fabrics"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#DACBAA]/40">
          <span className="text-[11px] font-semibold text-[#766A57] mr-1">Category:</span>
          {(['All', 'Dimout', 'Blackout', 'Solar Shading', 'Curtains'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#8B5A3C] text-white shadow-xs font-semibold'
                  : 'bg-[#F3EBDA] text-[#2C2417] hover:bg-[#E7DAC0]'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-[11px] text-[#766A57] ml-auto">
            Showing <strong>{filteredFabrics.length}</strong> of <strong>{products.length}</strong> fabrics
          </span>
        </div>
      </div>

      {/* Main Fabric Management Table & Cards */}
      <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl shadow-xs overflow-hidden">
        {filteredFabrics.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[#E7DAC0] text-[#766A57] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-[#2C2417]">No fabrics found</h3>
            <p className="text-xs text-[#766A57] max-w-md mx-auto">
              No fabrics match your current search or filter criteria. Try clearing search filters or add a new fabric.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('All');
                  setStockFilter('All');
                }}
                className="px-3.5 py-1.5 bg-[#E7DAC0] hover:bg-[#DACBAA] text-[#2C2417] text-xs font-semibold rounded-lg transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={openAddModal}
                className="px-3.5 py-1.5 bg-[#8B5A3C] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Add Fabric Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#E7DAC0]/70 border-b border-[#DACBAA] text-[#766A57] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Fabric Details</th>
                  <th className="py-3 px-3">Category / Type</th>
                  <th className="py-3 px-3">Color / Swatch</th>
                  <th className="py-3 px-3">Specs (GSM/Width)</th>
                  <th className="py-3 px-3 text-right">Price (DPL / MRP)</th>
                  <th className="py-3 px-3 text-right">Stock (Meters)</th>
                  <th className="py-3 px-3 text-center">Samples</th>
                  <th className="py-3 px-4 text-center">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DACBAA]/60">
                {filteredFabrics.map(fabric => {
                  const hasSamples = fabric.sampleImages && fabric.sampleImages.length > 0;
                  const primarySample = fabric.primarySampleImage || fabric.sampleImages?.[0];

                  return (
                    <tr
                      key={fabric.id}
                      className="hover:bg-[#F3EBDA]/50 transition-colors group"
                    >
                      {/* Fabric Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          {/* Mini Thumbnail or Color Swatch */}
                          <div
                            onClick={() => primarySample && setPreviewSampleImage(primarySample)}
                            className={`w-10 h-10 rounded-lg border border-[#DACBAA] flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer shadow-2xs ${
                              primarySample ? 'hover:ring-2 hover:ring-[#8B5A3C]' : ''
                            }`}
                            style={{ backgroundColor: fabric.colorHex }}
                            title={primarySample ? 'Click to inspect fabric sample texture' : fabric.colorName}
                          >
                            {primarySample ? (
                              <img
                                src={primarySample}
                                alt={fabric.catalogueName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[9px] font-bold text-[#2C2417]/60 drop-shadow-xs">
                                {fabric.shadeNo || 'TFH'}
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-[#2C2417] text-xs hover:text-[#8B5A3C] transition-colors truncate">
                                {fabric.catalogueName}
                              </p>
                              <span className="font-mono text-[10px] font-bold text-[#8B5A3C] bg-[#E9D9C5] px-1.5 py-0.2 rounded">
                                {fabric.sku}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#766A57] truncate max-w-xs">
                              {fabric.collection} · Shade {fabric.shadeNo}
                            </p>
                            <p className="text-[10px] text-[#8E7E65] truncate max-w-xs">
                              Supplier: {fabric.supplier || 'The Fab House Partner Mill'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Weave Type */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                              fabric.category === 'Blackout'
                                ? 'bg-zinc-800 text-zinc-100'
                                : fabric.category === 'Solar Shading'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : fabric.category === 'Curtains'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {fabric.category}
                          </span>
                          <p className="text-[11px] text-[#2C2417] font-medium truncate max-w-[130px]">
                            {fabric.fabricType || 'Standard Weave'}
                          </p>
                          <p className="text-[10px] text-[#766A57] truncate max-w-[130px]">
                            {fabric.patternDesign || 'Plain'}
                          </p>
                        </div>
                      </td>

                      {/* Color & Hex */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-[#2C2417]/20 flex-shrink-0 shadow-2xs"
                            style={{ backgroundColor: fabric.colorHex }}
                          />
                          <div>
                            <p className="font-medium text-[#2C2417] text-xs">{fabric.colorName}</p>
                            <span className="text-[10px] font-mono text-[#766A57] uppercase">{fabric.colorHex}</span>
                          </div>
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5 text-[11px]">
                          <p className="text-[#2C2417] font-medium">{fabric.width} · {fabric.gsm}</p>
                          <p className="text-[#766A57] text-[10px] truncate max-w-[120px]">{fabric.composition}</p>
                          <p className="text-[#8E7E65] text-[10px]">HSN: {fabric.hsnCode}</p>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3 text-right">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#8B5A3C] text-xs">₹{(fabric.dpl || 0).toLocaleString()}/m</p>
                          <p className="text-[10px] text-[#766A57]">MRP: ₹{(fabric.mrp || 0).toLocaleString()}</p>
                          <span className="text-[9px] text-[#5F6B4A] bg-[#5F6B4A]/10 px-1 rounded">
                            {fabric.rollDiscountPercentage}% off &ge;{fabric.rollDiscountThreshold}m
                          </span>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-right">
                        <div className="space-y-0.5">
                          <p className={`font-bold text-xs ${
                            fabric.totalStockMeters < 10
                              ? 'text-red-700 font-black'
                              : fabric.totalStockMeters < 30
                              ? 'text-amber-700'
                              : 'text-[#2C2417]'
                          }`}>
                            {fabric.totalStockMeters}m
                          </p>
                          <p className="text-[10px] text-[#766A57]">{fabric.totalPieces} pieces</p>
                          {fabric.totalStockMeters < 10 && (
                            <span className="text-[9px] font-bold text-red-600 uppercase">Critical</span>
                          )}
                        </div>
                      </td>

                      {/* Samples Badge & Manage Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenSampleModal(fabric)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                            hasSamples
                              ? 'bg-[#E9D9C5] hover:bg-[#DACBAA] text-[#8B5A3C] border-[#DACBAA]'
                              : 'bg-[#F3EBDA] hover:bg-[#E7DAC0] text-[#766A57] border-dashed border-[#DACBAA]'
                          }`}
                          title="Manage fabric sample images and photos"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{fabric.sampleImages?.length || 0} Photos</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Preview in Buyer View */}
                          <button
                            onClick={() => {
                              setSelectedProduct(fabric);
                              setActiveView('place-order');
                              showToast(`Loaded "${fabric.catalogueName}" in Order view.`);
                            }}
                            className="p-1.5 rounded-lg text-[#766A57] hover:text-[#8B5A3C] hover:bg-[#E7DAC0] transition-colors"
                            title="Preview how dealers see this fabric in Place Order view"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Fabric */}
                          <button
                            onClick={() => openEditModal(fabric)}
                            className="p-1.5 rounded-lg text-[#2C2417] hover:text-[#8B5A3C] hover:bg-[#E7DAC0] transition-colors"
                            title="Edit fabric specifications, prices, and stock"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Fabric */}
                          <button
                            onClick={() => {
                              if (!isAdminAuthenticated) {
                                setIsAdminAuthModalOpen(true);
                                return;
                              }
                              setFabricToDelete(fabric);
                            }}
                            className="p-1.5 rounded-lg text-[#766A57] hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete fabric record from inventory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT FABRIC MODAL                                                   */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FBF7EE] text-[#2C2417] border border-[#DACBAA] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#2C2417] text-[#FBF7EE] flex items-center justify-between border-b border-[#4A3B2C]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#8B5A3C] text-white">
                  {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <div>
                  <h2 className="font-display font-bold text-lg">
                    {isEditing ? `Edit Fabric: ${formData.catalogueName}` : 'Add New Fabric to Inventory'}
                  </h2>
                  <p className="text-xs text-[#DACBAA]">
                    {isEditing
                      ? 'Update specifications, pricing, stock levels, or supplier details'
                      : 'Manually register a new fabric product independent of initial spreadsheets'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-[#DACBAA] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveFabric} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Basic Identity Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#766A57] flex items-center gap-1.5 border-b border-[#DACBAA]/60 pb-1">
                  <Info className="w-3.5 h-3.5 text-[#8B5A3C]" />
                  <span>Basic Fabric Identification</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fabric Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Fabric Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.catalogueName}
                      onChange={e => setFormData({ ...formData, catalogueName: e.target.value })}
                      placeholder="e.g. Chelmsford Blackout 105"
                      className={`w-full px-3 py-2 text-xs bg-white border rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C] ${
                        formErrors.catalogueName ? 'border-red-500' : 'border-[#DACBAA]'
                      }`}
                    />
                    {formErrors.catalogueName && (
                      <p className="text-[10px] text-red-600 mt-0.5">{formErrors.catalogueName}</p>
                    )}
                  </div>

                  {/* SKU / Fabric Code */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Fabric Code / SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. BLK1015 or AMH0038"
                      className={`w-full px-3 py-2 text-xs bg-white border rounded-xl font-mono uppercase text-[#2C2417] focus:outline-none focus:border-[#8B5A3C] ${
                        formErrors.sku ? 'border-red-500' : 'border-[#DACBAA]'
                      }`}
                    />
                    {formErrors.sku && (
                      <p className="text-[10px] text-red-600 mt-0.5">{formErrors.sku}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as FabricCategory })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    >
                      <option value="Dimout">Dimout (Room Darkening 95%)</option>
                      <option value="Blackout">Blackout (100% Light Blocking)</option>
                      <option value="Solar Shading">Solar Shading (Architectural Screen)</option>
                      <option value="Curtains">Curtains (Drapery & Sheer)</option>
                    </select>
                  </div>

                  {/* Fabric Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Fabric Type / Weave
                    </label>
                    <input
                      type="text"
                      value={formData.fabricType}
                      onChange={e => setFormData({ ...formData, fabricType: e.target.value })}
                      placeholder="e.g. 3-Pass Coated Blackout, Micro-Twill, Linen Slub"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>

                  {/* Collection Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Collection / Book Name
                    </label>
                    <input
                      type="text"
                      value={formData.collection}
                      onChange={e => setFormData({ ...formData, collection: e.target.value })}
                      placeholder="e.g. Chelmsford Series, Onyx Edition"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>

                  {/* Shade Number */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Shade Number
                    </label>
                    <input
                      type="text"
                      value={formData.shadeNo}
                      onChange={e => setFormData({ ...formData, shadeNo: e.target.value })}
                      placeholder="e.g. 101, 805, or SH-42"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>
                </div>
              </div>

              {/* Color & Visual Design Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#766A57] flex items-center gap-1.5 border-b border-[#DACBAA]/60 pb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5A3C]" />
                  <span>Color &amp; Aesthetics</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Color Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Color / Shade Name
                    </label>
                    <input
                      type="text"
                      value={formData.colorName}
                      onChange={e => setFormData({ ...formData, colorName: e.target.value })}
                      placeholder="e.g. Warm Oat, Slate Grey, Ivory"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>

                  {/* Color Swatch Hex */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Swatch Hex Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.colorHex}
                        onChange={e => setFormData({ ...formData, colorHex: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#DACBAA] p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.colorHex}
                        onChange={e => setFormData({ ...formData, colorHex: e.target.value })}
                        placeholder="#D5C4A7"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl font-mono uppercase text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                      />
                    </div>
                  </div>

                  {/* Pattern / Design */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Pattern / Surface Design
                    </label>
                    <input
                      type="text"
                      value={formData.patternDesign}
                      onChange={e => setFormData({ ...formData, patternDesign: e.target.value })}
                      placeholder="e.g. Plain, Basketweave, Slubbed"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#766A57] flex items-center gap-1.5 border-b border-[#DACBAA]/60 pb-1">
                  <Layers className="w-3.5 h-3.5 text-[#8B5A3C]" />
                  <span>Technical Specifications</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Composition */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Material / Composition
                    </label>
                    <input
                      type="text"
                      value={formData.composition}
                      onChange={e => setFormData({ ...formData, composition: e.target.value })}
                      placeholder="e.g. 100% Polyester with Acrylic Thermal Backing"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>

                  {/* Cuttable Width */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Cuttable Width
                    </label>
                    <input
                      type="text"
                      value={formData.width}
                      onChange={e => setFormData({ ...formData, width: e.target.value })}
                      placeholder='e.g. 54" or 118"'
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>

                  {/* GSM */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Grammage (GSM)
                    </label>
                    <input
                      type="text"
                      value={formData.gsm}
                      onChange={e => setFormData({ ...formData, gsm: e.target.value })}
                      placeholder="e.g. 340+3%"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing, Stock & Commercials */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#766A57] flex items-center gap-1.5 border-b border-[#DACBAA]/60 pb-1">
                  <Star className="w-3.5 h-3.5 text-[#8B5A3C]" />
                  <span>Pricing, Stock &amp; Supply</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* DPL Price */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Dealer Price (DPL ₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.dpl}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          dpl: val,
                          mrp: formData.mrp ? formData.mrp : Math.round(val * 1.75),
                        });
                      }}
                      className={`w-full px-3 py-2 text-xs bg-white border rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C] ${
                        formErrors.dpl ? 'border-red-500' : 'border-[#DACBAA]'
                      }`}
                    />
                    {formErrors.dpl && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.dpl}</p>}
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Retail Reference MRP (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.mrp}
                      onChange={e => setFormData({ ...formData, mrp: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                    {formErrors.mrp && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.mrp}</p>}
                  </div>

                  {/* Stock Available (Meters) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Available Stock (Meters)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.totalStockMeters}
                      onChange={e => setFormData({ ...formData, totalStockMeters: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>

                  {/* Supplier Mill */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                      Supplier / Mill
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="e.g. The Fab House Surat Mill"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#2C2417] mb-1">
                    Fabric Description &amp; Selling Points
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide technical description, acoustic dampening, light blockage, or washing instructions..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DACBAA] sticky bottom-0 bg-[#FBF7EE]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#766A57] hover:bg-[#E7DAC0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#8B5A3C] hover:bg-[#72482E] text-white shadow-xs transition-colors"
                >
                  {isEditing ? 'Update Fabric Details' : 'Register Fabric to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SAMPLE IMAGES MANAGEMENT MODAL                                            */}
      {/* ========================================================================= */}
      {sampleModalFabric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FBF7EE] text-[#2C2417] border border-[#DACBAA] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#2C2417] text-[#FBF7EE] flex items-center justify-between border-b border-[#4A3B2C]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#8B5A3C] text-white">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg">
                    Fabric Sample Images · {sampleModalFabric.catalogueName}
                  </h2>
                  <p className="text-xs text-[#DACBAA]">
                    SKU: {sampleModalFabric.sku} · Color: {sampleModalFabric.colorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSampleModalFabric(null)}
                className="p-1 rounded-full text-[#DACBAA] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Add New Sample Row */}
              <div className="bg-[#F3EBDA] p-4 rounded-xl border border-[#DACBAA] space-y-3">
                <h4 className="text-xs font-bold text-[#2C2417] uppercase tracking-wider">
                  Add / Upload New Sample Image
                </h4>

                {/* File Upload Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-[#8B5A3C]/40 hover:border-[#8B5A3C] rounded-xl text-xs font-semibold text-[#8B5A3C] cursor-pointer hover:bg-[#FBF7EE] transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingImage ? 'Optimizing Image...' : 'Upload Image File (JPG, PNG, WebP)'}</span>
                    <input
                      ref={sampleFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSampleFileUpload}
                      disabled={isUploadingImage}
                    />
                  </label>

                  <span className="text-xs text-center text-[#766A57] font-bold">OR</span>

                  {/* Direct Image URL input */}
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="url"
                      value={sampleUrlInput}
                      onChange={e => setSampleUrlInput(e.target.value)}
                      placeholder="Paste Sample Image URL..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-[#DACBAA] rounded-xl text-[#2C2417] focus:outline-none focus:border-[#8B5A3C]"
                    />
                    <button
                      onClick={handleAddSampleFromUrl}
                      disabled={!sampleUrlInput.trim()}
                      className="px-3 py-2 bg-[#8B5A3C] hover:bg-[#72482E] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Attach
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Samples Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#766A57]">
                    Attached Fabric Samples ({sampleModalFabric.sampleImages?.length || 0})
                  </h4>
                  <span className="text-[11px] text-[#8E7E65]">Click star to designate Primary Sample</span>
                </div>

                {(!sampleModalFabric.sampleImages || sampleModalFabric.sampleImages.length === 0) ? (
                  <div className="p-8 text-center bg-[#F3EBDA]/50 rounded-xl border border-dashed border-[#DACBAA]">
                    <ImageIcon className="w-8 h-8 text-[#DACBAA] mx-auto mb-2" />
                    <p className="text-xs font-medium text-[#766A57]">No sample images uploaded for this fabric yet.</p>
                    <p className="text-[11px] text-[#8E7E65]">Upload a swatch photo or paste an image link above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sampleModalFabric.sampleImages.map((imgUrl, idx) => {
                      const isPrimary = sampleModalFabric.primarySampleImage === imgUrl || (!sampleModalFabric.primarySampleImage && idx === 0);

                      return (
                        <div
                          key={idx}
                          className={`group relative rounded-xl border overflow-hidden bg-white shadow-xs transition-all ${
                            isPrimary ? 'border-[#8B5A3C] ring-2 ring-[#8B5A3C]/40' : 'border-[#DACBAA]'
                          }`}
                        >
                          <div className="aspect-square w-full overflow-hidden bg-zinc-100 relative cursor-pointer" onClick={() => setPreviewSampleImage(imgUrl)}>
                            <img
                              src={imgUrl}
                              alt={`Sample ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {isPrimary && (
                              <span className="absolute top-2 left-2 bg-[#8B5A3C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                Primary
                              </span>
                            )}
                          </div>

                          <div className="p-2 bg-[#FBF7EE] flex items-center justify-between border-t border-[#DACBAA]/60 text-xs">
                            <button
                              onClick={() => handleSetPrimary(idx)}
                              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                                isPrimary ? 'text-[#8B5A3C]' : 'text-[#766A57] hover:text-[#8B5A3C]'
                              }`}
                              title="Set as primary sample photo shown to buyers"
                            >
                              <Star className={`w-3.5 h-3.5 ${isPrimary ? 'fill-[#8B5A3C]' : ''}`} />
                              <span>{isPrimary ? 'Default' : 'Set Primary'}</span>
                            </button>

                            <button
                              onClick={() => handleRemoveSample(idx)}
                              className="p-1 rounded text-[#766A57] hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Delete this sample photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#F3EBDA] border-t border-[#DACBAA] flex justify-end">
              <button
                onClick={() => setSampleModalFabric(null)}
                className="px-4 py-2 bg-[#8B5A3C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#72482E] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXCEL / CSV IMPORT MODAL PREVIEW                                          */}
      {/* ========================================================================= */}
      {isImportModalOpen && parsedPreviewFabrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FBF7EE] text-[#2C2417] border border-[#DACBAA] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#2C2417] text-[#FBF7EE] flex items-center justify-between border-b border-[#4A3B2C]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-700 text-white">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-display font-bold text-lg">
                    Import Spreadsheet · {importFileName}
                  </h2>
                  <p className="text-xs text-[#DACBAA]">
                    Parsed {parsedPreviewFabrics.length} fabric records from spreadsheet. Review columns and choose import mode.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-full text-[#DACBAA] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Import Mode Radio selection */}
              <div className="bg-[#F3EBDA] p-4 rounded-xl border border-[#DACBAA] space-y-2">
                <p className="text-xs font-bold text-[#2C2417] uppercase tracking-wider">Select Import Strategy:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setImportMode('merge')}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                      importMode === 'merge'
                        ? 'bg-white border-[#8B5A3C] shadow-xs'
                        : 'bg-[#FBF7EE]/60 border-[#DACBAA] hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5 text-[#8B5A3C]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#2C2417]">Merge With Existing Inventory (Recommended)</p>
                      <p className="text-[11px] text-[#766A57]">
                        Updates fabric details matching existing SKU/Codes and appends any new fabric records. Existing fabrics not in the sheet remain untouched.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                      importMode === 'replace'
                        ? 'bg-white border-amber-600 shadow-xs'
                        : 'bg-[#FBF7EE]/60 border-[#DACBAA] hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Replace Entire Inventory</p>
                      <p className="text-[11px] text-[#766A57]">
                        Wipes existing fabric records and re-initializes the application catalogue exclusively from this file.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#766A57]">
                    Parsed Records Preview (Showing first 6 of {parsedPreviewFabrics.length})
                  </h4>
                  <span className="text-[11px] text-[#5F6B4A] font-semibold">
                    ✓ All columns automatically mapped
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#DACBAA] rounded-xl">
                  <table className="w-full text-left text-xs bg-white">
                    <thead className="bg-[#E7DAC0]/70 text-[#766A57] text-[10px] font-semibold uppercase">
                      <tr>
                        <th className="py-2 px-3">Fabric Name</th>
                        <th className="py-2 px-2">SKU</th>
                        <th className="py-2 px-2">Category</th>
                        <th className="py-2 px-2">Color</th>
                        <th className="py-2 px-2">Width / GSM</th>
                        <th className="py-2 px-2 text-right">Price (DPL)</th>
                        <th className="py-2 px-2 text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DACBAA]/40 text-[11px]">
                      {parsedPreviewFabrics.slice(0, 6).map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FBF7EE]">
                          <td className="py-2 px-3 font-semibold text-[#2C2417]">{row.catalogueName}</td>
                          <td className="py-2 px-2 font-mono text-[#8B5A3C]">{row.sku}</td>
                          <td className="py-2 px-2">{row.category}</td>
                          <td className="py-2 px-2">{row.colorName}</td>
                          <td className="py-2 px-2">{row.width} · {row.gsm}</td>
                          <td className="py-2 px-2 text-right font-bold text-[#8B5A3C]">₹{row.dpl}</td>
                          <td className="py-2 px-2 text-right">{row.totalStockMeters}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[#F3EBDA] border-t border-[#DACBAA] flex items-center justify-between">
              <span className="text-xs text-[#766A57]">
                Will process <strong>{parsedPreviewFabrics.length}</strong> fabrics into persistent database.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#766A57] hover:bg-[#E7DAC0] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Confirm &amp; Import {parsedPreviewFabrics.length} Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG                                                */}
      {/* ========================================================================= */}
      {fabricToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FBF7EE] text-[#2C2417] border border-[#DACBAA] rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-full bg-red-100 text-red-700">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-display font-bold text-base text-[#2C2417]">Delete Fabric Record</h3>
                <p className="text-xs text-[#766A57]">This action will remove the fabric from the live inventory.</p>
              </div>
            </div>

            <div className="bg-[#F3EBDA] p-3.5 rounded-xl border border-[#DACBAA] space-y-1 text-xs">
              <p className="font-bold text-[#2C2417]">{fabricToDelete.catalogueName}</p>
              <p className="text-[#766A57]">SKU: {fabricToDelete.sku} · Category: {fabricToDelete.category}</p>
              <p className="text-[#8E7E65]">Current Stock: {fabricToDelete.totalStockMeters} meters ({fabricToDelete.totalPieces} pieces)</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setFabricToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#766A57] hover:bg-[#E7DAC0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFabricConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
              >
                Yes, Delete Fabric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH RES SAMPLE IMAGE PREVIEW ZOOM MODAL                                   */}
      {/* ========================================================================= */}
      {previewSampleImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out"
          onClick={() => setPreviewSampleImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <img
              src={previewSampleImage}
              alt="Fabric Sample Full Texture"
              className="w-full h-full object-contain max-h-[80vh]"
            />
            <button
              onClick={() => setPreviewSampleImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
