# 🔬 NamunaKuzatuv v2.0

**Laboratoriya namunalarini real-vaqt kuzatish tizimi**

---

## ✨ Yangi xususiyatlar (v2.0)

### UI/UX yaxshilanishlari
- **Sidebar navigatsiya** — desktop uchun chiqma yon panel, mobil uchun drawer
- **DM Sans** zamonaviy shrift
- **Lucide React** ikonkalari (emoji o'rniga)
- **Skeleton loaders** — yuklash animatsiyalari
- **FilterChip** — tezkor filtr tugmalari
- **Smooth animatsiyalar** — fade, slide, scale

### Yangi funksiyalar
- **Pagination** — namunalar ro'yxatida "Ko'proq yuklash"
- **Status filter chips** — bir bosishda status filtr
- **Drawer sidebar** — mobilda ochiluvchi menyu
- **Toast dismiss** — toastlarni yopish imkoni
- **Lab toggle switch** — chiroyli toggle UI

### Kod sifati
- **Input sanitizatsiya** — XSS himoyasi
- **Phone validation** — O'zbekiston raqam validatsiyasi
- **Debounce utility** — keraksiz so'rovlarni kamaytirish
- **Error deduplication** — takroriy toastlar yo'q
- **Bundle splitting** — vendor/firebase chunklarga ajratish

---

## 🚀 Ishga tushirish

### 1. O'rnatish

```bash
cd NamunaKuzatuv
npm install
```

### 2. Firebase sozlash

```bash
cp .env.example .env
```

`.env` faylini to'ldiring:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Ishga tushirish

```bash
npm run dev
```

### 4. Build

```bash
npm run build
```

---

## 📁 Loyiha tuzilmasi

```
src/
├── components/
│   ├── layout/
│   │   └── Navbar.jsx          # Sidebar (desktop) + drawer (mobile)
│   ├── labs/
│   │   └── LabCard.jsx
│   ├── samples/
│   │   ├── AddSampleModal.jsx  # Namuna qo'shish (validatsiya bilan)
│   │   ├── SampleCard.jsx
│   │   ├── SampleDetail.jsx    # Tabs: info / tarix / amallar
│   │   └── StatusBadge.jsx
│   └── ui/
│       └── index.jsx           # Design system komponentlari
├── contexts/
│   └── AppContext.jsx          # Auth + toasts + alerts
├── lib/
│   ├── firebase.js             # Barcha Firebase xizmatlari
│   └── utils.js                # Yordamchi funksiyalar
└── pages/
    ├── AuthPage.jsx            # Login / Register / Forgot password
    ├── DashboardPage.jsx       # Asosiy panel
    ├── SamplesPage.jsx         # Namunalar (filtr + pagination)
    ├── LabsPage.jsx            # Laboratoriyalar
    ├── AlertsPage.jsx          # Ogohlantirishlar
    ├── ScanPage.jsx            # Barcode skaner
    ├── ProfilePage.jsx         # Profil + parol o'zgartirish
    └── AdminPage.jsx           # Admin panel (foydalanuvchilar + hisobotlar)
```

---

## 👥 Rollar

| Rol | Imkoniyatlar |
|-----|-------------|
| `super_admin` | Hammasi |
| `lab_manager` | Namunalar boshqarish, hisobotlar |
| `technician`  | Namuna skanerlash va yangilash |
| `observer`    | Faqat ko'rish |

---

## 🔐 Xavfsizlik

- Firebase Auth (Email + Google)
- Firestore Security Rules
- Input sanitizatsiya (XSS himoya)
- Frontend va Firestore validatsiya
- Role-based access control

---

## 🛠 Texnologiyalar

- **React 19** + **Vite 8**
- **Firebase 12** (Auth + Firestore)
- **Tailwind CSS 3**
- **React Router 6**
- **Lucide React** ikonlar
- **DM Sans** shrift (Google Fonts)
