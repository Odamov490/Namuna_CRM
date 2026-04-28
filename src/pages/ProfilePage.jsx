import { useState } from 'react';
import { userService, authService } from '../lib/firebase.js';
import { Button, Input, Card, Avatar, InfoRow } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { formatDate, getAvatarColor } from '../lib/utils.js';

const ROLE_INFO = {
  super_admin: {
    label: 'Super Admin',
    img:   'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=48&h=48&q=80&fit=crop',
    desc:  "Barcha huquqlar — tizimni to'liq boshqaradi",
    color: 'from-violet-500 to-purple-700',
    badge: 'bg-purple-100 text-purple-700',
  },
  lab_manager: {
    label: 'Lab Menejeri',
    img:   'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=48&h=48&q=80&fit=crop',
    desc:  "O'z laboratoriyasi namunalarini boshqaradi",
    color: 'from-blue-500 to-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  technician: {
    label: 'Texnik',
    img:   'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=48&h=48&q=80&fit=crop',
    desc:  'Namuna statusini yangilaydi, skanerlaydi',
    color: 'from-emerald-500 to-green-700',
    badge: 'bg-green-100 text-green-700',
  },
  observer: {
    label: 'Kuzatuvchi',
    img:   'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=48&h=48&q=80&fit=crop',
    desc:  "Faqat ma'lumotlarni ko'radi",
    color: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-100 text-slate-600',
  },
};

export default function ProfilePage() {
  const { userProfile, refreshProfile, showToast } = useApp();
  const [tab, setTab]         = useState('info'); // 'info' | 'security'
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    displayName: userProfile?.displayName || '',
    phone:       userProfile?.phone || '',
  });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passErrors, setPassErrors] = useState({});

  const roleInfo = ROLE_INFO[userProfile?.role] || ROLE_INFO.observer;
  const isGoogleUser = userProfile?.provider === 'google';

  const handleSave = async () => {
    if (!form.displayName.trim()) return showToast('Ism kiritilishi shart', 'error');
    setLoading(true);
    try {
      await userService.updateProfile(userProfile.id, {
        displayName: form.displayName.trim(),
        phone:       form.phone,
      });
      await refreshProfile();
      setEditing(false);
      showToast('Profil yangilandi ✅', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    const e = {};
    if (!passForm.current)               e.current = 'Joriy parolni kiriting';
    if (passForm.newPass.length < 6)     e.newPass  = 'Kamida 6 belgi';
    if (passForm.newPass !== passForm.confirm) e.confirm = 'Parollar mos kelmadi';
    if (Object.keys(e).length) { setPassErrors(e); return; }

    setLoading(true);
    try {
      await authService.changePassword(passForm.current, passForm.newPass);
      setPassForm({ current: '', newPass: '', confirm: '' });
      setPassErrors({});
      showToast("Parol o'zgartirildi ✅", 'success');
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setPassErrors({ current: "Joriy parol noto'g'ri" });
      } else {
        showToast(err.message, 'error');
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
        <img
          src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=200&q=80&fit=crop"
          alt="bg"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10 flex items-center gap-5">
          <div className="flex-shrink-0">
            {userProfile?.photoURL
              ? <img src={userProfile.photoURL} alt="avatar"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl" />
              : <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(userProfile?.displayName)} flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-white/20`}>
                  {(userProfile?.displayName || 'U')[0].toUpperCase()}
                </div>
            }
          </div>
          <div>
            <h2 className="text-2xl font-black">{userProfile?.displayName}</h2>
            <p className="text-slate-300 text-sm mt-0.5">{userProfile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <img src={roleInfo.img} alt={roleInfo.label}
                className="w-6 h-6 rounded-lg object-cover" />
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${roleInfo.badge}`}>
                {roleInfo.label}
              </span>
              {isGoogleUser && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10 text-white">
                  Google
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl overflow-hidden bg-slate-100 p-1 gap-1">
        {[['info', "Ma'lumotlar", 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=20&h=20&q=80&fit=crop'],
          ['security', 'Xavfsizlik', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=20&h=20&q=80&fit=crop']
        ].map(([id, label, img]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <img src={img} alt={label} className="w-4 h-4 rounded-md object-cover" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' ? (
        <>
          {/* Rol haqida */}
          <Card className="overflow-hidden">
            <div className="relative h-24">
              <img src={roleInfo.img} alt={roleInfo.label}
                className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${roleInfo.color} opacity-80`} />
              <div className="absolute inset-0 flex items-center px-5 gap-3">
                <div className="text-white">
                  <p className="text-xs text-white/70 font-medium">Sizning rolingiz</p>
                  <p className="text-xl font-black text-white">{roleInfo.label}</p>
                  <p className="text-xs text-white/80 mt-0.5">{roleInfo.desc}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Ma'lumotlar */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=28&h=28&q=80&fit=crop"
                  alt="info" className="w-7 h-7 rounded-lg object-cover" />
                <h3 className="font-bold text-slate-800">Shaxsiy ma'lumotlar</h3>
              </div>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  ✏️ Tahrirlash
                </Button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <Input label="Ism Familiya" value={form.displayName}
                  onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                  placeholder="F.I.Sh." />
                <Input label="Telefon" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+998 90 000 00 00" />
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1" disabled={loading}>
                    Bekor
                  </Button>
                  <Button onClick={handleSave} loading={loading} className="flex-1">
                    Saqlash
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <InfoRow label="Ism Familiya" value={userProfile?.displayName} icon="👤" />
                <InfoRow label="Email"         value={userProfile?.email}       icon="📧" />
                <InfoRow label="Telefon"       value={userProfile?.phone}       icon="📱" />
                <InfoRow label="Kirish usuli"  value={isGoogleUser ? 'Google hisobi' : 'Email/Parol'} icon="🔑" />
                <InfoRow label="Ro'yxat sanasi" value={formatDate(userProfile?.createdAt)} icon="📅" />
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Xavfsizlik tab */
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=28&h=28&q=80&fit=crop"
              alt="security" className="w-7 h-7 rounded-lg object-cover" />
            <h3 className="font-bold text-slate-800">Parolni o'zgartirish</h3>
          </div>

          {isGoogleUser ? (
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <img src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=48&h=48&q=80&fit=crop"
                alt="google" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div>
                <p className="font-bold text-blue-800">Google hisobi orqali kirgan</p>
                <p className="text-sm text-blue-600 mt-0.5">
                  Parol o'zgartirish Google hisobingiz sozlamalarida amalga oshiriladi.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input label="Joriy parol" type="password"
                value={passForm.current}
                onChange={e => { setPassForm(p => ({ ...p, current: e.target.value })); setPassErrors(p => ({ ...p, current: '' })); }}
                error={passErrors.current} placeholder="Hozirgi parolingiz" />
              <Input label="Yangi parol" type="password"
                value={passForm.newPass}
                onChange={e => { setPassForm(p => ({ ...p, newPass: e.target.value })); setPassErrors(p => ({ ...p, newPass: '' })); }}
                error={passErrors.newPass} placeholder="Kamida 6 belgi"
                hint="Kuchli parol: harflar, raqamlar va belgilar" />
              <Input label="Yangi parolni tasdiqlang" type="password"
                value={passForm.confirm}
                onChange={e => { setPassForm(p => ({ ...p, confirm: e.target.value })); setPassErrors(p => ({ ...p, confirm: '' })); }}
                error={passErrors.confirm} placeholder="Parolni qayta kiriting" />
              <Button onClick={handleChangePassword} loading={loading} className="w-full" size="lg">
                Parolni o'zgartirish
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
