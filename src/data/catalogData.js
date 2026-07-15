/**
 * The entire furniture catalog, as data — no component in this app
 * hard-codes an item or a model. Every list, card, and variation picker
 * renders by mapping over this structure, so adding a new style (or a new
 * item, or a whole new category) here is enough to make it show up in the
 * UI and be selectable in the 3D scene.
 *
 * Hierarchy: category -> items -> variations.
 *  - A "category" groups items for the sidebar (e.g. "Oturma Grubu").
 *  - An "item" is a piece of furniture the user thinks of as one thing
 *    (e.g. "3'lü Kanepe"). It owns the physical footprint (`dimensions`)
 *    used for room-bounds clamping, since that stays constant across
 *    finishes/styles of the same piece.
 *  - A "variation" is one purchasable style/finish of that item (e.g.
 *    "Modern Kanepe" vs "Chesterfield Kanepe") and owns everything visual/
 *    commercial: `modelUrl` (the .glb to load), `color` + `primitiveType`
 *    (the placeholder shown until/unless that .glb exists), `price`, and
 *    an optional `thumbnail` image for the catalog card.
 *
 * Variation count is NOT fixed at 2 — every item below ships with 5, and
 * nothing in the data shape, the store, or the UI (ItemVariations.jsx)
 * assumes a count. Whether an item has 1 variation or 100, the picker
 * renders it via `.map()` inside a scrollable grid (see ItemVariations.jsx)
 * and everything else (add-to-scene, model-swap, room clamping) works
 * unchanged.
 *
 * @typedef {Object} CatalogVariation
 * @property {string} id
 * @property {string} name
 * @property {string} modelUrl - Full URL to a .glb file hosted in the Supabase Storage "furniture-models" public bucket (moved out of public/models/ so the repo/deploy stays small — see README "3D Modeller" section). Safe to point at a file that doesn't exist yet — FurnitureLoader falls back to a placeholder mesh until it does.
 * @property {string} [thumbnail] - Optional path under public/thumbnails/*. Falls back to a color swatch when omitted.
 * @property {'sofa'|'table'|'lamp'|'box'} primitiveType
 * @property {string} color
 * @property {number} price
 *
 * @typedef {Object} CatalogItem
 * @property {string} id
 * @property {string} displayName
 * @property {{width:number,height:number,depth:number}} dimensions
 * @property {number} [defaultRotationY] - Radians. Most imported .glb files
 *   happen to already face the camera at rotationY 0, so this is omitted
 *   (defaults to 0) almost everywhere. A few third-party models were
 *   authored facing a different direction in their own file, so THIS is
 *   where that gets corrected once, at the catalog level — every new
 *   instance spawns already facing the user instead of sideways/backwards,
 *   with no per-placement fix needed (see designStore.js's addFurnitureToScene).
 * @property {CatalogVariation[]} variations
 *
 * @typedef {Object} CatalogCategory
 * @property {string} categoryName
 * @property {CatalogItem[]} items
 */
export const CATALOG = [
  {
    categoryName: "Oturma Grubu",
    items: [
      {
        id: "kanepe-1",
        displayName: "3'lü Kanepe",
        dimensions: { width: 1.3, height: 0.6, depth: 0.7 },
        variations: [
          {
            id: "kanepe-1-modern",
            name: "Modern Kanepe",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kanepe_modern.glb",
            thumbnail: null,
            primitiveType: "sofa",
            color: "#8c7a6b",
            price: 24999,
            
          },
          {
            id: "kanepe-1-klasik",
            name: "Klasik Kanepe",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kanepe_klasik.glb",
            thumbnail: null,
            primitiveType: "sofa",
            color: "#6b5847",
            price: 27999,
          },
          {
            id: "kanepe-1-rustik",
            name: "Rustik Kanepe",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kanepe_rustik.glb",
            thumbnail: null,
            primitiveType: "sofa",
            color: "#9c8468",
            price: 23499,
          },
          {
            id: "kanepe-1-minimalist",
            name: "Minimalist Kanepe",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kanepe_minimalist.glb",
            thumbnail: null,
            primitiveType: "sofa",
            color: "#c9c2b5",
            price: 26999,
          },
          {
            id: "kanepe-1-chesterfield",
            name: "Chesterfield Kanepe",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kanepe_chesterfield.glb",
            thumbnail: null,
            primitiveType: "sofa",
            color: "#5a3d2b",
            price: 32999,
          },
        ],
      },
      {
        id: "berjer-1",
        displayName: "Berjer Koltuk",
        dimensions: { width: 0.5, height: 0.50, depth: 0.5 },
        // Modeli dosyada yan duruyordu (rotationY:0 iken koltuğun yanı
        // kameraya bakıyordu) — 90° düzeltiyoruz ki direkt öne baksın.
        defaultRotationY: Math.PI / 2,
        variations: [
          {
            id: "berjer-1-kadife",
            name: "Kadife Berjer",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/berjer_kadife.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#a8896f",
            price: 8999,
          },
          {
            id: "berjer-1-deri",
            name: "Deri Berjer",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/berjer_deri.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#7a5c3e",
            price: 10999,
          },
          {
            id: "berjer-1-keten",
            name: "Keten Berjer",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/berjer_keten.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#cbbfa8",
            price: 7999,
          },
          {
            id: "berjer-1-boucle",
            name: "Bouclé Berjer",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/boucle_berjer.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#e4ded2",
            price: 11499,
          },
          {
            id: "berjer-1-rattan",
            name: "Rattan Berjer",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/berjer_rattan.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#b48a5a",
            price: 9499,
          },
        ],
      },
    ],
  },
 {
    categoryName: "Masalar",
    items: [
      {
        id: "sehpa-1",
        displayName: "Sehpa",
        dimensions: { width: 1.1, height: 0.4, depth: 0.55 },
        variations: [
          {
            id: "sehpa-1-ahsap",
            name: "Ahşap Sehpa",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/sehpa_ahsap.glb",
            thumbnail: null,
            primitiveType: "table",
            color: "#4b3b2f",
            price: 3499,
          },
          {
            id: "sehpa-1-mermer",
            name: "Mermer Sehpa",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/sehpa_mermer.glb",
            thumbnail: null,
            primitiveType: "table",
            color: "#d9d4c9",
            price: 5499,
          },
          {
            id: "sehpa-1-cam",
            name: "Cam Sehpa",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/sehpa_cam.glb",
            thumbnail: null,
            primitiveType: "table",
            color: "#cfd6d6",
            price: 4299,
          },
          {
            id: "sehpa-1-metal",
            name: "Metal Ayaklı Sehpa",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/sehpa_metal.glb",
            thumbnail: null,
            primitiveType: "table",
            color: "#5f6368",
            price: 3999,
          },
          {
            id: "sehpa-1-beton",
            name: "Beton Görünümlü Sehpa",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/sehpa_beton.glb",
            thumbnail: null,
            primitiveType: "table",
            color: "#8a8782",
            price: 4799,
          },
        ],
      },
    ],
  },
  {
    categoryName: "Depolama",
    items: [
      {
        id: "kitaplik-1",
        displayName: "Kitaplık",
        dimensions: { width: 1.40, height: 2.8, depth: 0.65 },
        // Modeli dosyada sırtı kameraya dönük duruyordu — 180° düzeltiyoruz
        // ki rafları/ön yüzü direkt öne baksın.
        defaultRotationY: Math.PI,
        variations: [
          {
            id: "kitaplik-1-standart",
            name: "Standart Kitaplık",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kitaplik_standart.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#3d3229",
            price: 6999,
          },
          {
            id: "kitaplik-1-vitrinli",
            name: "Vitrinli Kitaplık",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kitaplik_vitrinli.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#2b241d",
            price: 8999,
          },
          {
            id: "kitaplik-1-acik-raf",
            name: "Açık Raf Kitaplık",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kitaplik_acik_raf.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#8a7360",
            price: 6499,
          },
          {
            id: "kitaplik-1-donerli",
            name: "Döner Kitaplık",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kitaplik_donerli.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#4a3c30",
            price: 9999,
          },
          {
            id: "kitaplik-1-duvar-montaji",
            name: "Duvar Montajlı Kitaplık",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kitaplik_duvar_montaji.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#efe9df",
            price: 7499,
          },
        ],
      },
      {
        id: "tv-unitesi-1",
        displayName: "TV Ünitesi",
        dimensions: { width: 2.1, height: 0.6, depth: 0.5},
        variations: [
          {
            id: "tv-unitesi-1-mat",
            name: "Nostaljik TV Ünitesi",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/tv_unitesi_nostaljik.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#2e2620",
            price: 8499,
          },
   
          {
            id: "tv-unitesi-1-ahsap",
            name: "Plazma TV Ünitesi",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/tv_yeni.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#5c4a3a",
            price: 8999,
          },
       
        ],
      },
    ],
  },
  {
    categoryName: "Aydınlatma",
    items: [
      {
        id: "ayakli-lamba-1",
        displayName: "Ayaklı Lamba",
        dimensions: { width: 0.35, height: 1.5, depth: 0.35 },
        variations: [
          {
            id: "ayakli-lamba-1-kumas",
            name: "Ayakli Lamba",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/ayakli_lamba_kumas.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#d8c9a3",
            price: 2499,
          },
          {
            id: "ayakli-lamba-1-metal",
            name: "Siyah Gövdeli Lamba",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/siyah_lamba_metal.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#8a8f94",
            price: 3299,
          },
          {
            id: "ayakli-lamba-1-ahsap",
            name: "Ahşap Gövdeli Lamba",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/ayakli_lamba_xl.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#6b5847",
            price: 2899,
          },
          {
            id: "ayakli-lamba-1-minimalist",
            name: "Yay Lamba",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/ayakli_lamba_minimalist.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#c9c2b5",
            price: 2699,
          },
          {
            id: "ayakli-lamba-1-xl",
            name: "XL Boy Lamba",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/ayakli_lamba_ahsap.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#4a4a4a",
            price: 3799,
          },
        ],
      },
    ],
  },
  {
    categoryName: "Dekorasyon",
    items: [
      {
        id: "hali-1",
        displayName: "Halı",
        dimensions: { width: 2.2, height: 0.02, depth: 1.6 },
        variations: [
          {
            id: "hali-1-desenli",
            name: "Desenli Halı",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/hali_desenli.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#b23a48",
            price: 3999,
          },
          {
            id: "hali-1-duz",
            name: "Düz Renk Halı",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/hali_duz.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#7d8471",
            price: 2999,
          },
          {
            id: "hali-1-shaggy",
            name: "Shaggy Halı",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/hali_shaggy.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#e4ded2",
            price: 4499,
          },


          {
            id: "hali-1-kilim",
            name: "Kilim Desenli Halı",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/hali_kilim.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#a85c32",
            price: 3499,
          },
          {
            id: "hali-1-deri",
            name: "Küçük Deri Halı",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/hali_deri.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#6b5847",
            price: 5999,
          },
          {
  id: "hali-yuvarlak",
  name: "Yuvarlak Halı",
  modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/hali_yuvarlak.glb",
  thumbnail: null,
  primitiveType: "box",
  color: "#d9ccb3",
  price: 3699,
}, 

        ],
      },
      {
        id: "saksi-1",
        displayName: "Saksı Bitkisi",
        dimensions: { width: 0.4, height: 1.1, depth: 0.4 },
        variations: [
          {
            id: "saksi-1-yapay",
            name: "Yapay Bitki",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/saksi_yapay.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#3f6b3f",
            price: 1299,
          },
          {
            id: "saksi-1-seramik",
            name: "Seramik Saksılı Bitki",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/saksi_seramik.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#4a7a4a",
            price: 1899,
          },
          {
            id: "saksi-1-rattan-saksi",
            name: "Rattan Saksılı Bitki",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/saksi_rattan_saksi.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#5a8a54",
            price: 1599,
          },
          {
            id: "saksi-1-beton-saksi",
            name: "Beton Saksılı Bitki",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/saksi_beton_saksi.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#5f8a5a",
            price: 1699,
          },
          {
            id: "saksi-1-asma-saksi",
            name: "Asma Saksı Bitkisi",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/saksi_asma_saksi.glb",
            thumbnail: null,
            primitiveType: "lamp",
            color: "#4a7a4a",
            price: 1399,
          },
        ],
      },
    ],
  },
    {
    categoryName: "Heykeller",
    items: [
      {
        id: "heykel-1",
        displayName: "Heykel",
        dimensions: { width: 0.4, height: 1.2, depth: 0.4 },
        variations: [
          {
            id: "heykel-1-orjinal",
            name: "Boğa Heykeli",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/Dana.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#9c9c9c",
            price: 0,
          }, {
            id: "heykel-2-orjinal",
            name: "Geyik Heykeli",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/geyik.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#9c9c9c",
            price: 0,
          }, {
            id: "heykel-3-orjinal",
            name: "Kartal Heykeli",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/kartal.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#9c9c9c",
            price: 0,
          }, {
            id: "heykel-4-orjinal",
            name: "3 Adam Heykeli",
            modelUrl: "https://pfpiswfcnrfiayrnmqdn.supabase.co/storage/v1/object/public/furniture-models/ucadam.glb",
            thumbnail: null,
            primitiveType: "box",
            color: "#9c9c9c",
            price: 0,
          },
        ],
      },
    ],
  },
];

/** Flat list of every item across all categories, each tagged with its parent categoryName. Handy for lookups that don't care about grouping. */
export const ALL_ITEMS = CATALOG.flatMap((category) =>
  category.items.map((item) => ({ ...item, categoryName: category.categoryName }))
);

const ITEM_INDEX = new Map(ALL_ITEMS.map((item) => [item.id, item]));

/** @type {Map<string, {item: CatalogItem, variation: CatalogVariation}>} */
const VARIATION_INDEX = new Map(
  ALL_ITEMS.flatMap((item) => item.variations.map((variation) => [variation.id, { item, variation }]))
);

/**
 * Looks up a catalog item by id (no variation info attached).
 * @param {string} itemId
 * @returns {CatalogItem | null}
 */
export function getItemById(itemId) {
  return ITEM_INDEX.get(itemId) ?? null;
}

/**
 * Looks up a variation by id, returning it alongside its parent item (you
 * almost always need both — the item for dimensions/displayName, the
 * variation for modelUrl/color/price).
 * @param {string} variationId
 * @returns {{item: CatalogItem, variation: CatalogVariation} | null}
 */
export function getVariationById(variationId) {
  return VARIATION_INDEX.get(variationId) ?? null;
}

/**
 * The min/max price across an item's variations (however many there are),
 * for a catalog card's "₺X'den itibaren" (starting from ₺X) label.
 * @param {CatalogItem} item
 * @returns {{min: number, max: number}}
 */
export function getItemPriceRange(item) {
  const prices = item.variations.map((variation) => variation.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
