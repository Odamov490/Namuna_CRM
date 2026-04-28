import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/firebase.js';
import { Button, Input, Card } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';

export default function AuthPage() {
  const { showToast, refreshProfile } = useApp();
  const navigate = useNavigate();
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ email: '', password: '', displayName: '', confirm: '' });
  const [errors, setErrors]     = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email kiritilishi shart";
    if (!form.password || form.password.length < 6) e.password = "Parol kamida 6 belgi bo'lishi kerak";
    if (mode === 'register') {
      if (!form.displayName) e.displayName = "Ism kiritilishi shart";
      if (form.password !== form.confirm) e.confirm = "Parollar mos kelmadi";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await authService.loginWithEmail(form.email, form.password);
        showToast('Xush kelibsiz! 👋', 'success');
      } else {
        await authService.registerWithEmail(form.email, form.password, form.displayName);
        showToast("Ro'yxatdan o'tdingiz ✅", 'success');
      }
      await refreshProfile();
      navigate('/');
    } catch (e) {
      const msg = e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
        ? "Email yoki parol noto'g'ri"
        : e.code === 'auth/email-already-in-use'
        ? "Bu email allaqachon ro'yxatdan o'tgan"
        : e.message;
      showToast(msg, 'error');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔬</div>
          <h1 className="text-3xl font-black text-slate-800">NamunaKuzatuv</h1>
          <p className="text-slate-500 mt-2 text-sm">Laboratoriya namuna boshqaruv tizimi</p>
        </div>

        <Card className="p-6 shadow-lg">
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Kirish
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Ro'yxat
            </button>
          </div>

          <div className="space-y-4" onKeyDown={handleKeyDown}>
            {mode === 'register' && (
              <Input
                label="Ism Familiya *"
                value={form.displayName}
                onChange={e => set('displayName', e.target.value)}
                error={errors.displayName}
                placeholder="F.I.Sh."
                icon="👤"
              />
            )}
            <Input
              label="Email *"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              error={errors.email}
              placeholder="email@example.com"
              icon="📧"
            />
            <Input
              label="Parol *"
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              error={errors.password}
              placeholder="Kamida 6 belgi"
              icon="🔒"
            />
            {mode === 'register' && (
              <Input
                label="Parolni tasdiqlang *"
                type="password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                error={errors.confirm}
                placeholder="Parolni qayta kiriting"
                icon="🔒"
              />
            )}
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="w-full"
              size="lg"
            >
              {mode === 'login' ? '🚀 Kirish' : "✅ Ro'yxatdan o'tish"}
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 NamunaKuzatuv — Laboratoriya namuna boshqaruv tizimi
        </p>
      </div>
    </div>
  );
}
