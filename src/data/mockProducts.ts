import { Product, StockBucket } from '../types';

// Helper to generate realistic roll stock buckets
function createBuckets(under5: [number, number], mid1: [number, number], mid2: [number, number], over30: [number, number]): {
  buckets: StockBucket[];
  totalMeters: number;
  totalPieces: number;
} {
  const buckets: StockBucket[] = [
    { range: 'Less than 5m', quantityMeters: under5[0], piecesCount: under5[1] },
    { range: '5m to 15m', quantityMeters: mid1[0], piecesCount: mid1[1] },
    { range: '15m to 30m', quantityMeters: mid2[0], piecesCount: mid2[1] },
    { range: 'More than 30m', quantityMeters: over30[0], piecesCount: over30[1] },
  ];
  const totalMeters = Number(buckets.reduce((acc, b) => acc + b.quantityMeters, 0).toFixed(1));
  const totalPieces = buckets.reduce((acc, b) => acc + b.piecesCount, 0);
  return { buckets, totalMeters, totalPieces };
}

// Color palettes for Onyx Dimout 801 - 827
const onyxShadeDetails: Record<number, { name: string; hex: string }> = {
  801: { name: 'Raw Ecru', hex: '#E6DCB8' },
  802: { name: 'Almond Beige', hex: '#DFCCA8' },
  803: { name: 'Desert Sand', hex: '#D2B694' },
  804: { name: 'Warm Taupe', hex: '#BCA488' },
  805: { name: 'Muted Khaki', hex: '#A8997C' },
  806: { name: 'Smoked Oyster', hex: '#94836B' },
  807: { name: 'Espresso Mink', hex: '#634F3D' },
  808: { name: 'Deep Mocha', hex: '#4A3B2C' },
  809: { name: 'Chalk White', hex: '#F4EFE6' },
  810: { name: 'Silver Mist', hex: '#D7D6D0' },
  811: { name: 'Pebble Grey', hex: '#BEBCB4' },
  812: { name: 'Urban Ash', hex: '#9E9C95' },
  813: { name: 'Slate Anthracite', hex: '#686663' },
  814: { name: 'Charcoal Blackout', hex: '#373634' },
  815: { name: 'Nordic Sea', hex: '#87979B' },
  816: { name: 'Aegean Teal', hex: '#5B767E' },
  817: { name: 'Midnight Navy', hex: '#2C3A47' },
  818: { name: 'Olive Drab', hex: '#6E7051' },
  819: { name: 'Sage Leaf', hex: '#8A9678' },
  820: { name: 'Terracotta Clay', hex: '#A95E47' },
  821: { name: 'Rust Ochre', hex: '#B87333' },
  822: { name: 'Mustard Brass', hex: '#C29B38' },
  823: { name: 'Dusty Rose', hex: '#B88B8A' },
  824: { name: 'Mauve Shadow', hex: '#8E777F' },
  825: { name: 'Cast Iron Grey', hex: '#444446' },
  826: { name: 'Pale Bone', hex: '#EBE5D8' },
  827: { name: 'Obsidian Night', hex: '#1E1B18' },
};

// Generate Dimout products 801 - 827
const dimoutProducts: Product[] = Array.from({ length: 27 }, (_, i) => {
  const shadeNum = 801 + i;
  const skuCode = `AMH00${11 + i}`;
  const shadeInfo = onyxShadeDetails[shadeNum] || { name: `Shade ${shadeNum}`, hex: '#D2B694' };
  
  // Create varying realistic roll buckets
  const seed = (i * 17) % 7;
  const under5: [number, number] = seed === 0 ? [14.2, 5] : seed === 2 ? [8.5, 3] : [22.4, 10];
  const mid1: [number, number] = seed === 1 ? [0, 0] : seed === 3 ? [12.6, 1] : [8.2, 1];
  const mid2: [number, number] = seed === 4 ? [24.0, 1] : [0, 0];
  const over30: [number, number] = seed === 5 ? [98.5, 2] : [143.0, 3];
  
  const stock = createBuckets(under5, mid1, mid2, over30);

  const dimoutSample1 = 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80';
  const dimoutSample2 = 'https://images.unsplash.com/photo-1606744888344-493238955de0?w=800&auto=format&fit=crop&q=80';

  return {
    id: `prod-dimout-${shadeNum}`,
    serialNo: i + 1,
    sku: skuCode,
    catalogueName: `Onyx Dimout ${shadeNum}`,
    shadeNo: `${shadeNum}`,
    category: 'Dimout',
    collection: 'Onyx Dimout',
    colorName: shadeInfo.name,
    colorHex: shadeInfo.hex,
    textureType: 'dimout',
    gsm: '265+2%',
    width: '54"',
    composition: '100% Polyester',
    dpl: 704,
    mrp: 1295,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    stockBuckets: stock.buckets,
    totalStockMeters: stock.totalMeters,
    totalPieces: stock.totalPieces,
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Dimout Weave',
    patternDesign: 'Fine Micro-Twill Plain',
    supplier: 'The Fab House Surat Mill No. 1',
    description: `Premium 265 GSM dimout drapery fabric with 95%+ light attenuation. Woven from high-tenacity polyester yarns with an ultra-soft drape and matte finish. Ideal for commercial hospitality and luxury residential installations.`,
    sampleImages: [dimoutSample1, dimoutSample2],
    primarySampleImage: dimoutSample1,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-02-15T10:30:00.000Z',
  };
});

// Blackout products (100% Light Blocking with thermal back)
const blackoutProducts: Product[] = [
  {
    id: 'prod-bo-101',
    serialNo: 28,
    sku: 'BLK1011',
    catalogueName: 'Chelmsford Blackout 101',
    shadeNo: '101',
    category: 'Blackout',
    collection: 'Chelmsford Blackout',
    colorName: 'Pure Ivory 100% Block',
    colorHex: '#F7F3E8',
    textureType: 'woven',
    gsm: '340+3%',
    width: '118"',
    composition: '100% Polyester with 3-Pass Acrylic Coating',
    dpl: 920,
    mrp: 1650,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([18.5, 6], [11.2, 1], [27.0, 1], [185.0, 4]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: '3-Pass Total Blackout',
    patternDesign: 'Smooth Matt Weave',
    supplier: 'Surat Coating & Lamination Mills',
    description: '100% Total Blackout fabric with zero pinhole light leakage. 3-pass acrylic backing delivers superior thermal insulation and UV radiation barrier.',
    sampleImages: ['https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-02-18T11:00:00.000Z',
  },
  {
    id: 'prod-bo-102',
    serialNo: 29,
    sku: 'BLK1012',
    catalogueName: 'Chelmsford Blackout 102',
    shadeNo: '102',
    category: 'Blackout',
    collection: 'Chelmsford Blackout',
    colorName: 'Smoky Grey 100% Block',
    colorHex: '#8E9192',
    textureType: 'woven',
    gsm: '340+3%',
    width: '118"',
    composition: '100% Polyester with 3-Pass Acrylic Coating',
    dpl: 920,
    mrp: 1650,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([12.0, 4], [0, 0], [18.4, 1], [112.5, 3]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: '3-Pass Total Blackout',
    patternDesign: 'Smooth Matt Weave',
    supplier: 'Surat Coating & Lamination Mills',
    description: 'Medium smoke grey total blackout drapery fabric with anti-fungal treatment and flame-retardant coating.',
    sampleImages: ['https://images.unsplash.com/photo-1606744888344-493238955de0?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1606744888344-493238955de0?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-02-18T11:00:00.000Z',
  },
  {
    id: 'prod-bo-103',
    serialNo: 30,
    sku: 'BLK1013',
    catalogueName: 'Chelmsford Blackout 103',
    shadeNo: '103',
    category: 'Blackout',
    collection: 'Chelmsford Blackout',
    colorName: 'Deep Onyx 100% Block',
    colorHex: '#252526',
    textureType: 'woven',
    gsm: '340+3%',
    width: '118"',
    composition: '100% Polyester with 3-Pass Acrylic Coating',
    dpl: 920,
    mrp: 1650,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([6.8, 2], [14.0, 1], [0, 0], [210.0, 5]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: '3-Pass Total Blackout',
    patternDesign: 'Smooth Matt Weave',
    supplier: 'Surat Coating & Lamination Mills',
    description: 'Deep onyx blackout fabric providing complete darkness for AV auditoriums, luxury bedrooms, and home theatres.',
    sampleImages: ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-02-18T11:00:00.000Z',
  },
  {
    id: 'prod-bo-201',
    serialNo: 31,
    sku: 'BLK2021',
    catalogueName: 'Twilight Blackout 301',
    shadeNo: '301',
    category: 'Blackout',
    collection: 'Twilight Series',
    colorName: 'Linen Oat Weave',
    colorHex: '#D8CAB3',
    textureType: 'woven',
    gsm: '360+2%',
    width: '54"',
    composition: '100% Textured Poly-Slub Coating',
    dpl: 840,
    mrp: 1490,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([9.2, 3], [7.5, 1], [22.0, 1], [88.0, 2]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Slub Blackout Drapery',
    patternDesign: 'Horizontal Slub Texture',
    supplier: 'Bhilwara Speciality Weavers',
    description: 'Rustic faux linen slub texture with bonded thermal blackout backing for elegant curtains that require no separate blackout lining.',
    sampleImages: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-02-18T11:00:00.000Z',
  },
  {
    id: 'prod-bo-202',
    serialNo: 32,
    sku: 'BLK2022',
    catalogueName: 'Twilight Blackout 302',
    shadeNo: '302',
    category: 'Blackout',
    collection: 'Twilight Series',
    colorName: 'Chestnut Bronze',
    colorHex: '#6D4E3A',
    textureType: 'woven',
    gsm: '360+2%',
    width: '54"',
    composition: '100% Textured Poly-Slub Coating',
    dpl: 840,
    mrp: 1490,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([4.1, 1], [9.8, 1], [16.5, 1], [64.0, 2]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Slub Blackout Drapery',
    patternDesign: 'Horizontal Slub Texture',
    supplier: 'Bhilwara Speciality Weavers',
    description: 'Warm chestnut bronze tone in slub blackout drapery weave. Acoustic damping coefficient NRC 0.45.',
    sampleImages: ['https://images.unsplash.com/photo-1606744888344-493238955de0?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1606744888344-493238955de0?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-02-18T11:00:00.000Z',
  },
];

// Solar Shading fabrics (Screen fabrics for architectural blinds & roller shades)
const solarShadingProducts: Product[] = [
  {
    id: 'prod-sol-401',
    serialNo: 33,
    sku: 'SOL4001',
    catalogueName: 'Solis View 3% 401',
    shadeNo: '401',
    category: 'Solar Shading',
    collection: 'Solis View 3%',
    colorName: 'White / Grey Screen 3% Openness',
    colorHex: '#EAE6DD',
    textureType: 'solar',
    gsm: '420+2%',
    width: '98"',
    composition: '30% Polyester, 70% PVC Coating (Flame Retardant)',
    dpl: 640,
    mrp: 1180,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([16.0, 4], [8.0, 1], [0, 0], [165.0, 4]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Solar Architectural Screen',
    patternDesign: '2x2 Basketweave Screen',
    supplier: 'Solis Architectural Polymer Fabrics',
    description: 'Commercial 3% openness solar screen fabric for glare reduction, solar heat control, and clear exterior view preservation.',
    sampleImages: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
  },
  {
    id: 'prod-sol-402',
    serialNo: 34,
    sku: 'SOL4002',
    catalogueName: 'Solis View 3% 402',
    shadeNo: '402',
    category: 'Solar Shading',
    collection: 'Solis View 3%',
    colorName: 'Charcoal / Bronze Screen 3%',
    colorHex: '#3A3631',
    textureType: 'solar',
    gsm: '420+2%',
    width: '98"',
    composition: '30% Polyester, 70% PVC Coating (Flame Retardant)',
    dpl: 640,
    mrp: 1180,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([7.4, 2], [13.2, 1], [21.0, 1], [130.0, 3]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Solar Architectural Screen',
    patternDesign: '2x2 Basketweave Screen',
    supplier: 'Solis Architectural Polymer Fabrics',
    description: 'Charcoal/bronze glare-reduction solar fabric engineered for corporate offices, IT campuses, and south-facing curtain walls.',
    sampleImages: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
  },
  {
    id: 'prod-sol-403',
    serialNo: 35,
    sku: 'SOL4003',
    catalogueName: 'Helix Screen 5% 601',
    shadeNo: '601',
    category: 'Solar Shading',
    collection: 'Helix Screen 5%',
    colorName: 'Sandy Linen 5% Screen',
    colorHex: '#D5C4A7',
    textureType: 'solar',
    gsm: '380+2%',
    width: '118"',
    composition: '35% Fiberglass, 65% Vinyl',
    dpl: 690,
    mrp: 1250,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([11.5, 3], [6.0, 1], [18.0, 1], [92.0, 2]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'High Performance Solar Screen',
    patternDesign: '1x2 Dense Screen Weave',
    supplier: 'Solis Architectural Polymer Fabrics',
    description: 'Fiberglass core screen with excellent dimensional stability up to 118" width without bowing or puckering.',
    sampleImages: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-22T09:00:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
  },
];

// Curtains fabrics (Drapery & Sheer Collections)
const curtainsProducts: Product[] = [
  {
    id: 'prod-cur-201',
    serialNo: 36,
    sku: 'CUR2001',
    catalogueName: 'Velvet Touch Sheer 201',
    shadeNo: '201',
    category: 'Curtains',
    collection: 'Velvet Touch Drapery',
    colorName: 'Champagne Luster Sheer',
    colorHex: '#ECE4CF',
    textureType: 'curtain',
    gsm: '160+2%',
    width: '118"',
    composition: '100% Micro-Filament Polyester',
    dpl: 580,
    mrp: 990,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([28.0, 8], [12.4, 1], [25.0, 1], [215.0, 5]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Micro-Filament Sheer',
    patternDesign: 'Translucent Voile',
    supplier: 'The Fab House Weaving Park',
    description: 'Featherlight 160 GSM translucent drapery sheer with subtle champagne luster and weighted lead bottom band.',
    sampleImages: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-25T09:00:00.000Z',
    updatedAt: '2026-02-22T11:00:00.000Z',
  },
  {
    id: 'prod-cur-202',
    serialNo: 37,
    sku: 'CUR2002',
    catalogueName: 'Heritage Linen Texture 701',
    shadeNo: '701',
    category: 'Curtains',
    collection: 'Heritage Linen',
    colorName: 'Oatmeal Slub Drapery',
    colorHex: '#C5B59C',
    textureType: 'curtain',
    gsm: '310+2%',
    width: '54"',
    composition: '80% Polyester, 20% Linen Blend',
    dpl: 780,
    mrp: 1390,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([8.0, 2], [9.5, 1], [0, 0], [115.0, 3]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Textured Linen Drapery',
    patternDesign: 'Rich Rustic Slub',
    supplier: 'Vardhman Fine Textiles',
    description: 'Natural linen blend offering organic hand feel with polyester durability, wrinkle recovery, and fluid drape.',
    sampleImages: ['https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-25T09:00:00.000Z',
    updatedAt: '2026-02-22T11:00:00.000Z',
  },
  {
    id: 'prod-cur-203',
    serialNo: 38,
    sku: 'CUR2003',
    catalogueName: 'Heritage Linen Texture 702',
    shadeNo: '702',
    category: 'Curtains',
    collection: 'Heritage Linen',
    colorName: 'Storm Cloud Grey',
    colorHex: '#7C848C',
    textureType: 'curtain',
    gsm: '310+2%',
    width: '54"',
    composition: '80% Polyester, 20% Linen Blend',
    dpl: 780,
    mrp: 1390,
    rollDiscountThreshold: 50,
    rollDiscountPercentage: 10,
    ...(() => {
      const s = createBuckets([5.4, 2], [10.0, 1], [19.0, 1], [84.0, 2]);
      return { stockBuckets: s.buckets, totalStockMeters: s.totalMeters, totalPieces: s.totalPieces };
    })(),
    defaultShippingMode: 'Surface',
    hsnCode: '5407',
    fabricType: 'Textured Linen Drapery',
    patternDesign: 'Rich Rustic Slub',
    supplier: 'Vardhman Fine Textiles',
    description: 'Subtle slate storm cloud grey tone in woven linen drapery with natural slub yarn variations.',
    sampleImages: ['https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&auto=format&fit=crop&q=80'],
    primarySampleImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-25T09:00:00.000Z',
    updatedAt: '2026-02-22T11:00:00.000Z',
  },
];

export const ALL_PRODUCTS: Product[] = [
  ...dimoutProducts,
  ...blackoutProducts,
  ...solarShadingProducts,
  ...curtainsProducts,
];
