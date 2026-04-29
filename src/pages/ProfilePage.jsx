import { useState } from 'react';
import { userService, authService } from '../lib/firebase.js';
import { Button, Input, Card, Avatar, Badge, AlertBanner } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { firebaseErrorMsg } from '../lib/utils.js';
import { Eye, EyeOff, User, Lock, Shield, Phone, Mail, Calendar } from 'lucide-react';
import { formatDate } from '../lib/utils.js';

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', color: 'purple', icon: '👑', desc: "Tizimni to'liq boshqaradi" },
  lab_manager: { label: 'Lab Menejeri', color: 'blue',  icon: '🏢', desc: "O'z laboratoriyasini boshqaradi" },
  technician:  { label: 'Texnik',       color: 'green', icon: '🔬', desc: 'Namunalarni skanerlaydi va yangilaydi' },
  observer:    { label: 'Kuzatuvchi',   color: 'gray',  icon: '👁', desc: "Faqat ma'lumotlarni ko'radi" },
};

const TABS = ['info', 'security'];

export default function ProfilePage() {
  const { userProfile, refreshProfile, showToast } = useApp();
  const [tab,     setTab]     = useState('info');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    displayName: userProfile?.displayName || '',
    phone:       userProfile?.phone || '',
  });
  const [passForm, setPassForm]   = useState({ current: '', newPass: '', confirm: '' });
  const [passErrors, setPassErrors] = useState({});
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass,     setShowNewPass]     = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError,   setPassError]   = useState('');

  const roleInfo     = ROLE_CONFIG[userProfile?.role] || ROLE_CONFIG.observer;
  const isGoogleUser = userProfile?.provider === 'google';

  const handleSave = async () => {
    if (!form.displayName.trim()) { showToast('Ism kiritilishi shart', 'error'); return; }
    setLoading(true);
    try {
      await userService.updateProfile(userProfile.id, {
        displayName: form.displayName.trim(),
        phone:       form.phone,
      });
      await refreshProfile();
      showToast("Profil yangilandi ✅", 'success');
      setEditing(false);
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  const validatePass = () => {
    const e = {};
    if (!passForm.current)                    e.current = 'Joriy parol kiritilishi shart';
    if (!passForm.newPass || passForm.newPass.length < 6) e.newPass = 'Yangi parol kamida 6 belgi bo\'lishi kerak';
    if (passForm.newPass !== passForm.confirm) e.confirm = 'Parollar mos kelmadi';
    setPassErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePass()) return;
    setLoading(true); setPassError('');
    try {
      await authService.changePassword(passForm.current, passForm.newPass);
      setPassSuccess(true);
      setPassForm({ current: '', newPass: '', confirm: '' });
      showToast('Parol muvaffaqiyatli o\'zgartirildi ✅', 'success');
    } catch (e) {
      setPassError(firebaseErrorMsg(e.code) || e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header card */}
      <Card className="p-6 mb-5">
        <div className="flex items-start gap-5">
          <Avatar user={userProfile} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900 truncate">
              {userProfile?.displayName || 'Foydalanuvchi'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{userProfile?.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-lg">{roleInfo.icon}</span>
              <Badge color={roleInfo.color}>{roleInfo.label}</Badge>
              {isGoogleUser && <Badge color="gray">Google</Badge>}
            </div>
            <p className="text-xs text-slate-400 mt-2">{roleInfo.desc}</p>
          </div>
        </div>
      </Card>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        {[
          { id: 'info',     icon: <User className="w-4 h-4" />,   label: "Ma'lumotlar" },
          { id: 'security', icon: <Lock className="w-4 h-4" />,   label: 'Xavfsizlik' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <Card className="p-6">
          {!editing ? (
            <>
              <div className="space-y-0 mb-6">
                {[
                  { icon: <User className="w-4 h-4" />,     label: 'Ism Familiya', value: userProfile?.displayName },
                  { icon: <Mail className="w-4 h-4" />,     label: 'Email',        value: userProfile?.email },
                  { icon: <Phone className="w-4 h-4" />,    label: 'Telefon',      value: userProfile?.phone || '—' },
                  { icon: <Shield className="w-4 h-4" />,   label: 'Rol',          value: roleInfo.label },
                  { icon: <Calendar className="w-4 h-4" />, label: "Ro'yxat sanasi", value: formatDate(userProfile?.createdAt) },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 gap-4">
                    <span className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="text-slate-400">{row.icon}</span>
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 text-right truncate max-w-[55%]">{row.value}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => setEditing(true)} variant="outline" className="w-full" icon={<User className="w-4 h-4" />}>
                Profilni tahrirlash
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <Input
                label="Ism Familiya"
                required
                value={form.displayName}
                onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                placeholder="F.I.Sh."
              />
              <Input
                label="Telefon raqam"
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+998 90 000 00 00"
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1" disabled={loading}>
                  Bekor
                </Button>
                <Button onClick={handleSave} loading={loading} className="flex-1">
                  Saqlash
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <Card className="p-6">
          {isGoogleUser ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-bold text-slate-700 mb-2">Google orqali kirilgan</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Parolni o'zgartirish uchun Google hisobi sozlamalaridan foydalaning
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                Parolni o'zgartirish
              </h3>

              {passSuccess && (
                <div className="mb-4">
                  <AlertBanner type="success" message="Parol muvaffaqiyatli o'zgartirildi!" />
                </div>
              )}
              {passError && (
                <div className="mb-4">
                  <AlertBanner type="error" message={passError} onDismiss={() => setPassError('')} />
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    label="Joriy parol"
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passForm.current}
                    onChange={e => { setPassForm(p => ({ ...p, current: e.target.value })); setPassErrors(p => ({ ...p, current: '' })); }}
                    error={passErrors.current}
                    placeholder="Joriy parolni kiriting"
                  />
                  <button type="button" onClick={() => setShowCurrentPass(p => !p)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600">
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Yangi parol"
                    type={showNewPass ? 'text' : 'password'}
                    value={passForm.newPass}
                    onChange={e => { setPassForm(p => ({ ...p, newPass: e.target.value })); setPassErrors(p => ({ ...p, newPass: '' })); }}
                    error={passErrors.newPass}
                    placeholder="Kamida 6 ta belgi"
                  />
                  <button type="button" onClick={() => setShowNewPass(p => !p)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  label="Parolni tasdiqlang"
                  type="password"
                  value={passForm.confirm}
                  onChange={e => { setPassForm(p => ({ ...p, confirm: e.target.value })); setPassErrors(p => ({ ...p, confirm: '' })); }}
                  error={passErrors.confirm}
                  placeholder="Yangi parolni qayta kiriting"
                />

                <Button
                  onClick={handleChangePassword}
                  loading={loading}
                  className="w-full"
                  icon={<Lock className="w-4 h-4" />}
                >
                  Parolni o'zgartirish
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
