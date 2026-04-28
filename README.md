# 🔬 NamunaKuzatuv — Laboratoriya Namuna Boshqaruv Tizimi

7 ta laboratoriya o'rtasida aylanib yuradigan sinov namunalarini real vaqt rejimida kuzatib borish tizimi.

---

## 🚀 Ishga tushirish

### 1. Firebase loyihasi yarating
- [console.firebase.google.com](https://console.firebase.google.com) ga kiring
- Yangi loyiha yarating
- **Authentication** → Email/Password yoqing
- **Firestore Database** → yarating (production mode)
- **Project Settings** → Web app qo'shing → config nusxalang

### 2. `.env` fayl yarating
```bash
cp .env.example .env
```
Va Firebase config kalitlarini kiriting.

### 3. Firestore rules joylang
Firebase console → Firestore → Rules → `firestore.rules` tarkibini joylang.

### 4. O'rnatish va ishga tushirish
```bash
npm install
npm run dev
```

### 5. Birinchi Super Admin
Auth sahifasida ro'yxatdan o'ting, so'ngra Firebase console → Firestore → `users` kolleksiyasiga kiring va o'z hujjatingizda `role: "super_admin"` qiling.

---

## 📁 Loyiha strukturasi

```
src/
├── components/
│   ├── layout/
│   │   └── Navbar.jsx          # Desktop nav + Mobile bottom nav
│   ├── ui/
│   │   └── index.jsx           # Button, Input, Modal, Card, Badge...
│   ├── samples/
│   │   ├── StatusBadge.jsx     # Status ko'rsatgich
│   │   ├── SampleCard.jsx      # Namuna kartochkasi
│   │   ├── SampleDetail.jsx    # Batafsil modal (status + tarix + amallar)
│   │   └── AddSampleModal.jsx  # Yangi namuna qo'shish
│   └── labs/
│       └── LabCard.jsx         # Laboratoriya kartochkasi
├── pages/
│   ├── DashboardPage.jsx       # Bosh sahifa - statistika
│   ├── SamplesPage.jsx         # Barcha namunalar + filter
│   ├── ScanPage.jsx            # QR/Barcode skaner
│   ├── LabsPage.jsx            # Laboratoriyalar boshqaruvi
│   ├── AlertsPage.jsx          # Ogohlantirishlar
│   ├── AdminPage.jsx           # Admin panel - foydalanuvchilar
│   ├── AuthPage.jsx            # Kirish/Ro'yxat
│   └── ProfilePage.jsx         # Profil sahifasi
├── contexts/
│   └── AppContext.jsx          # Global state (auth, toasts, alerts)
└── lib/
    ├── firebase.js             # Barcha Firebase services
    └── utils.js                # Yordamchi funksiyalar
```

---

## 👥 Foydalanuvchi rollari

| Rol | Huquqlar |
|-----|----------|
| `super_admin` | Barcha huquqlar, foydalanuvchi boshqaruvi |
| `lab_manager` | O'z laboratoriyasi, namuna ko'chirish |
| `technician`  | Status o'zgartirish, skanerlash |
| `observer`    | Faqat ko'rish |

---

## 🗄️ Firestore Kolleksiyalar

| Kolleksiya | Tavsif |
|-----------|--------|
| `users` | Foydalanuvchilar profillari |
| `laboratories` | 7 ta laboratoriya ma'lumotlari |
| `samples` | Namunalar (joriy status, lab) |
| `sampleHistory` | Har bir o'zgarish tarixi |
| `alerts` | Ogohlantirishlar |

---

## 📊 Namuna Status oqimi

```
RECEIVED → WAITING → TESTING → COMPLIANT → TRANSFERRED → COMPLETED
                              ↘ NON_COMPLIANT ↗
```

---

## ⚡ Asosiy imkoniyatlar

- ✅ Real-time namuna kuzatuvi (onSnapshot)
- ✅ QR/Barcode skanerlash (qo'lda yoki skaner orqali)
- ✅ Status tarixi va audit trail
- ✅ Laboratoriya yuklanganligi monitoring
- ✅ 48 soatdan ortiq turib qolgan namunalar ogohlantirishi
- ✅ Rol asosidagi kirish huquqlari
- ✅ Mobile-first dizayn (bottom nav)
- ✅ Real-time ogohlantirishlar
"# Namuna_CRM" 
