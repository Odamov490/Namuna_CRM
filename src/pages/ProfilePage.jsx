import { useState } from 'react';
import { userService } from '../lib/firebase.js';
import { Button, Input, Card } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';

const ROLE_INFO = {
  super_admin: { label: 'Super Admin',  icon: '👑', desc: 'Barcha huquqlar - tizimni to\'liq boshqaradi' },
  lab_manager: { label: 'Lab Menejeri', icon: '🏢', desc: 'O\'z laboratoriyasi namunalarini boshqaradi' },
  technician:  { label: 'Texnik',       icon: '🔬', desc: 'Namuna statusini yangilaydi, skanerlaydi' },
  observer:    { label: 'Kuzatuvchi',   icon: '👁',  desc: 'Faqat hisobotlarni ko\'radi' },
};

export default function ProfilePage() {
  const { userProfile, refreshProfile, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: userProfile?.displayName || '',
    phone: userProfile?.phone || '',
  });

  const roleInfo = ROLE_INFO[userProfile?.role] || ROLE_INFO.observer;

  const handleSave = async () => {
    if (!form.displayName) return showToast('Ism kiritilishi shart', 'error');
    setLoading(true);
    try {
      await userService.updateProfile(userProfile.id, form);
      await refreshProfile();
      setEditing(false);
      showToast('Profil yangilandi ✅', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-black text-slate-800">👤 Profil</h1>

      {/* Avatar & role */}
      <Card className="p-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-3xl font-black mb-3">
          {(userProfile?.displayName || 'U')[0].toUpperCase()}
        </div>
        <h2 className="text-xl font-black text-slate-800">{userProfile?.displayName}</h2>
        <p className="text-slate-500 text-sm">{userProfile?.email}</p>

        <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
          <span className="text-xl">{roleInfo.icon}</span>
          <div className="text-left">
            <p className="font-bold text-blue-700 text-sm">{roleInfo.label}</p>
            <p className="text-xs text-blue-500">{roleInfo.desc}</p>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Ma'lumotlarni tahrirlash</h3>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>✏️ Tahrirlash</Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <Input
              label="Ism Familiya"
              value={form.displayName}
              onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
            />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+998 90 000 00 00"
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1" disabled={loading}>Bekor</Button>
              <Button onClick={handleSave} loading={loading} className="flex-1">Saqlash</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[['Ism Familiya', userProfile?.displayName], ['Email', userProfile?.email], ['Telefon', userProfile?.phone || '—']].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{k}</span>
                <span className="text-sm font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
