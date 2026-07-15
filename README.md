# Interior Configurator

React Three Fiber tabanlı 3D oda/mobilya konfigüratörü. Backend: Supabase (auth + Postgres + RLS + Storage).

## Yerel geliştirme

```bash
npm install
npm run dev
```

`.env.local` dosyasında şu iki değişken olmalı (Supabase panelinden: Project Settings → API):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 3D Modeller (Supabase Storage)

`public/models/*.glb` dosyaları repoya dahil DEĞİL (620MB — git/deploy için çok büyük). Bunun yerine
Supabase Storage'daki **`furniture-models`** adlı public bucket'tan yükleniyor —
bkz. `src/data/catalogData.js`'teki `modelUrl` alanları.

Yeni bir ortamda (ör. yeni bir Supabase projesi) sıfırdan kurulum yapılıyorsa:

1. Supabase panelinde **Storage → New bucket** → adı `furniture-models`, **Public** açık.
2. `public/models/` klasöründeki tüm `.glb` dosyalarını (44 adet) bucket'a yükle
   (sürükle-bırak ile toplu yükleme yapılabilir).
3. `src/data/catalogData.js`'teki `modelUrl` alanlarının bucket adıyla eşleştiğinden emin ol —
   URL kalıbı: `https://<proje-ref>.supabase.co/storage/v1/object/public/furniture-models/<dosya-adi>.glb`

Model dosyası henüz yüklenmemiş/eksikse uygulama çökmez — `FurnitureLoader` otomatik olarak
yer tutucu bir kutu render eder.

## Yayına alma (Vercel)

1. Bu klasörü bir GitHub reposuna push'la (`public/models` zaten `.gitignore`'da, gitmeyecek).
2. [vercel.com](https://vercel.com) → New Project → GitHub reponu seç.
3. Framework preset: **Vite** (otomatik algılanır).
4. Environment Variables kısmına `.env.local`'daki iki değişkeni ekle
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Deploy.

Supabase tarafında ayrıca: Authentication → URL Configuration'da Vercel'in verdiği gerçek
adresi (`https://....vercel.app`) **Site URL** ve **Redirect URLs** listesine eklemeyi unutma —
yoksa e-posta onay linkleri yanlış adrese yönlendirir.
