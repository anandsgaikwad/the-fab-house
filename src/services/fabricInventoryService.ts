import * as XLSX from 'xlsx';
import { Product, FabricCategory, StockBucket } from '../types';

export const FABRICS_STORAGE_KEY = 'tfh_fabrics_inventory';

/**
 * Normalizes category string to one of the 4 standard categories
 */
export function normalizeCategory(catStr?: string): FabricCategory {
  if (!catStr) return 'Dimout';
  const clean = catStr.trim().toLowerCase();
  if (clean.includes('blackout') || clean.includes('blockout')) return 'Blackout';
  if (clean.includes('solar') || clean.includes('screen') || clean.includes('sun')) return 'Solar Shading';
  if (clean.includes('curtain') || clean.includes('drapery') || clean.includes('sheer') || clean.includes('linen')) return 'Curtains';
  return 'Dimout';
}

/**
 * Maps arbitrary column headers to Product fields
 */
function findValue(row: Record<string, any>, possibleKeys: string[]): any {
  const rowKeys = Object.keys(row);
  for (const pKey of possibleKeys) {
    const cleanTarget = pKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const rKey of rowKeys) {
      const cleanRowKey = rKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanRowKey === cleanTarget || cleanRowKey.includes(cleanTarget)) {
        const val = row[rKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return val;
        }
      }
    }
  }
  return undefined;
}

/**
 * Convert parsed rows into Partial<Product> records
 */
export function mapRowToProduct(row: Record<string, any>, index: number): Partial<Product> {
  const name =
    findValue(row, ['Fabric Name', 'Catalogue Name', 'Product Name', 'Item Name', 'Name', 'Description']) ||
    `Imported Fabric ${index + 1}`;

  const sku =
    findValue(row, ['Fabric Code', 'SKU', 'Item Code', 'Product Code', 'Code', 'Amh Code', 'Article']) ||
    `IMP${String(1000 + index).slice(1)}`;

  const categoryStr = findValue(row, ['Category', 'Product Category', 'Group', 'Fabric Group', 'Classification']);
  const category = normalizeCategory(categoryStr);

  const shadeNo = String(findValue(row, ['Shade No', 'Shade', 'Color Code', 'Shade Number']) || (index + 1));
  const collection = String(findValue(row, ['Collection', 'Book', 'Album', 'Catalogue']) || name.split(' ')[0] || 'Exclusive Collection');
  const colorName = String(findValue(row, ['Color', 'Color Name', 'Colour', 'Shade Name']) || 'Classic Neutral');
  const colorHex = String(findValue(row, ['Color Hex', 'Hex', 'Swatch Color', 'Hex Code']) || '#C5B59C');

  const fabricType = String(findValue(row, ['Fabric Type', 'Type', 'Weave', 'Texture', 'Cloth Type']) || `${category} Weave`);
  const patternDesign = String(findValue(row, ['Pattern', 'Design', 'Pattern Design', 'Structure']) || 'Plain Textured');
  const composition = String(findValue(row, ['Material', 'Composition', 'Content', 'Fiber', 'Yarn']) || '100% Polyester');
  const width = String(findValue(row, ['Width', 'Fabric Width', 'Cuttable Width']) || '54"');
  const gsm = String(findValue(row, ['GSM', 'Weight', 'Grammage']) || '280+2%');

  const dplRaw = findValue(row, ['Price', 'Dealer Price', 'DPL', 'Rate', 'Dealer Rate', 'Wholesale Price', 'Unit Price']);
  const dpl = Math.max(1, Number(parseFloat(String(dplRaw).replace(/[^0-9.]/g, '')) || 750));

  const mrpRaw = findValue(row, ['MRP', 'Retail Price', 'Reference Price', 'List Price']);
  const mrp = mrpRaw ? Math.max(dpl, Number(parseFloat(String(mrpRaw).replace(/[^0-9.]/g, '')) || Math.round(dpl * 1.75))) : Math.round(dpl * 1.75);

  const stockRaw = findValue(row, ['Stock', 'Available Quantity', 'Quantity', 'Meters', 'Available Stock', 'Total Stock', 'Current Stock']);
  const totalStockMeters = Math.max(0, Number(parseFloat(String(stockRaw).replace(/[^0-9.]/g, '')) || 120));

  const supplier = String(findValue(row, ['Supplier', 'Mill', 'Manufacturer', 'Vendor', 'Source']) || 'The Fab House Partner Mill');
  const description = String(findValue(row, ['Description', 'Notes', 'Remarks', 'Features', 'Details']) || `High performance ${fabricType.toLowerCase()} fabric suitable for residential and commercial curtains and shades.`);

  const sampleImage = findValue(row, ['Sample Image', 'Image', 'Image URL', 'Sample', 'Photo', 'Swatch']);
  const sampleImages: string[] = [];
  if (sampleImage && typeof sampleImage === 'string' && sampleImage.trim().startsWith('http')) {
    sampleImages.push(sampleImage.trim());
  }

  // Generate realistic stock buckets based on totalStockMeters
  const under5 = Number((totalStockMeters * 0.08).toFixed(1));
  const mid1 = Number((totalStockMeters * 0.12).toFixed(1));
  const mid2 = Number((totalStockMeters * 0.25).toFixed(1));
  const over30 = Number((totalStockMeters - (under5 + mid1 + mid2)).toFixed(1));

  const stockBuckets: StockBucket[] = [
    { range: 'Less than 5m', quantityMeters: under5, piecesCount: Math.max(1, Math.round(under5 / 2.5)) },
    { range: '5m to 15m', quantityMeters: mid1, piecesCount: Math.max(1, Math.round(mid1 / 9)) },
    { range: '15m to 30m', quantityMeters: mid2, piecesCount: Math.max(1, Math.round(mid2 / 22)) },
    { range: 'More than 30m', quantityMeters: Math.max(0, over30), piecesCount: Math.max(1, Math.round(over30 / 50)) },
  ];

  return {
    sku,
    catalogueName: name,
    shadeNo,
    category,
    collection,
    colorName,
    colorHex: colorHex.startsWith('#') ? colorHex : '#A8997C',
    fabricType,
    patternDesign,
    composition,
    width,
    gsm,
    dpl,
    mrp,
    totalStockMeters,
    totalPieces: stockBuckets.reduce((a, b) => a + b.piecesCount, 0),
    stockBuckets,
    supplier,
    description,
    sampleImages,
    primarySampleImage: sampleImages[0] || undefined,
    hsnCode: '5407',
    defaultShippingMode: 'Surface',
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    textureType: category === 'Solar Shading' ? 'solar' : category === 'Dimout' ? 'dimout' : category === 'Curtains' ? 'curtain' : 'woven',
  };
}

/**
 * Parse Excel file (.xlsx, .xls) or CSV file (.csv)
 */
export async function parseExcelOrCsvFile(file: File): Promise<Partial<Product>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Read first worksheet
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded spreadsheet contains no sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The spreadsheet appears to be empty. Please ensure it has header columns and rows.');
  }

  return rawRows.map((row, idx) => mapRowToProduct(row, idx));
}

/**
 * Parse raw CSV or TSV string text
 */
export function parseCsvText(csvText: string): Partial<Product>[] {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('No data found in CSV text.');
  }
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  return rawRows.map((row, idx) => mapRowToProduct(row, idx));
}

/**
 * Export fabrics list to CSV formatted string
 */
export function exportFabricsToCsv(fabrics: Product[]): string {
  const rows = fabrics.map(f => ({
    'Fabric Name': f.catalogueName,
    'Fabric Code / SKU': f.sku,
    'Fabric Type': f.fabricType || `${f.category} Weave`,
    'Category': f.category,
    'Color Name': f.colorName,
    'Color Hex': f.colorHex,
    'Pattern / Design': f.patternDesign || 'Plain',
    'Material / Composition': f.composition,
    'Width': f.width,
    'GSM': f.gsm,
    'Price (DPL)': f.dpl,
    'MRP': f.mrp,
    'Stock (Meters)': f.totalStockMeters,
    'Stock (Pieces)': f.totalPieces,
    'Supplier': f.supplier || 'The Fab House Mill',
    'Description': f.description || '',
    'Sample Images Count': f.sampleImages?.length || 0,
    'Primary Sample Image': f.primarySampleImage || f.sampleImages?.[0] || '',
    'HSN Code': f.hsnCode,
    'Collection': f.collection,
    'Shade No': f.shadeNo,
    'Last Updated': f.updatedAt || f.createdAt || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(worksheet);
}

/**
 * Export fabrics list directly as an .xlsx file download
 */
export function exportFabricsToExcel(fabrics: Product[], filename: string = 'the_fab_house_fabric_inventory.xlsx'): void {
  const rows = fabrics.map(f => ({
    'Fabric Name': f.catalogueName,
    'Fabric Code / SKU': f.sku,
    'Fabric Type': f.fabricType || `${f.category} Weave`,
    'Category': f.category,
    'Color Name': f.colorName,
    'Color Hex': f.colorHex,
    'Pattern / Design': f.patternDesign || 'Plain',
    'Material / Composition': f.composition,
    'Width': f.width,
    'GSM': f.gsm,
    'Price (DPL)': f.dpl,
    'MRP': f.mrp,
    'Stock (Meters)': f.totalStockMeters,
    'Stock (Pieces)': f.totalPieces,
    'Supplier': f.supplier || 'The Fab House Mill',
    'Description': f.description || '',
    'Primary Sample Image': f.primarySampleImage || f.sampleImages?.[0] || '',
    'HSN Code': f.hsnCode,
    'Collection': f.collection,
    'Shade No': f.shadeNo,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fabrics');
  XLSX.writeFile(workbook, filename);
}

/**
 * Downscale and compress an uploaded image file to lightweight Base64 string
 * Keeps localStorage well within quota while preserving high fidelity for fabric inspection!
 */
export function processSampleImageFile(file: File, maxDimension: number = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG 0.85 compression to keep sample images compact (~80-150KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to decode fabric sample image.'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read fabric image file.'));
    reader.readAsDataURL(file);
  });
}
