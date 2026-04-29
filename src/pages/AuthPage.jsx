import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/firebase.js';
import { Button, Input } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { firebaseErrorMsg } from '../lib/utils.js';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const FEATURES = [
  { icon: '📡', title: 'Real-vaqt kuzatuv',   desc: 'Namunalar holatini jonli kuzating' },
  { icon: '🏢', title: 'Ko\'p laboratoriya',   desc: 'Bir tizimda barcha lablar birlashgan' },
  { icon: '📊', title: 'Hisobot & tahlil',     desc: 'Kuchli statistika va grafik hisobotlar' },
  { icon: '🔒', title: 'Xavfsizlik',           desc: 'Rol asosidagi kirish nazorati' },
];

export default function AuthPage() {
  const { showToast, refreshProfile } = useApp();
  const navigate = useNavigate();

  const [mode, setMode]           = useState('login');
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [form, setForm]           = useState({ email: '', password: '', displayName: '', confirm: '' });
  const [errors, setErrors]       = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "To'g'ri email kiriting";
    if (!form.password || form.password.length < 6) e.password = "Parol kamida 6 belgi bo'lishi kerak";
    if (mode === 'register') {
      if (!form.displayName.trim()) e.displayName = 'Ism kiritilishi shart';
      if (form.password !== form.confirm) e.confirm = 'Parollar mos kelmadi';
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
        await authService.registerWithEmail(form.email, form.password, form.displayName.trim());
        showToast("Ro'yxatdan o'tdingiz ✓", 'success');
      }
      await refreshProfile();
      navigate('/');
    } catch (e) {
      showToast(firebaseErrorMsg(e.code) || e.message, 'error');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      await authService.loginWithGoogle();
      await refreshProfile();
      showToast('Google orqali kirdingiz 🎉', 'success');
      navigate('/');
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        showToast(firebaseErrorMsg(e.code) || e.message, 'error');
      }
    }
    setGLoading(false);
  };

  const handleResetPassword = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors({ email: "To'g'ri email kiriting" });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(form.email);
      setResetSent(true);
      showToast('Parolni tiklash emaili yuborildi ✓', 'success');
    } catch (e) {
      showToast(firebaseErrorMsg(e.code) || e.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left hero panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -left-10 -bottom-20 w-60 h-60 rounded-full bg-blue-400/10" />
        <div className="absolute right-20 bottom-40 w-20 h-20 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">🔬</div>
          <div>
            <h1 className="text-white font-black text-lg leading-none">NamunaKuzatuv</h1>
            <p className="text-blue-300 text-xs mt-0.5">Lab boshqaruv tizimi</p>
          </div>
        </div>

        {/* Main hero text */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Laboratoriya namunalarini boshqarishning aqlli tizimi
          </h2>
          <p className="text-blue-200 text-base mb-10 leading-relaxed">
            Real-vaqt kuzatuv, kuchli hisobotlar va qulay interfeys — barchasi bir joyda.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-white font-bold text-sm mt-1.5">{f.title}</p>
                <p className="text-blue-200 text-xs mt-0.5 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-400 text-xs">© 2025 NamunaKuzatuv</p>
      </div>

      {/* ── Right auth panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-blue-200">🔬</div>
            <h1 className="text-xl font-black text-slate-800">NamunaKuzatuv</h1>
            <p className="text-slate-500 text-sm mt-1">Lab boshqaruv tizimi</p>
          </div>

          {/* ── Forgot password ── */}
          {forgotMode ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <button onClick={() => { setForgotMode(false); setResetSent(false); }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                ← Orqaga
              </button>
              {resetSent ? (
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">📧</div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">Email yuborildi!</h3>
                  <p className="text-slate-500 text-sm">
                    <strong>{form.email}</strong> manziliga tiklash havolasi yuborildi.
                  </p>
                  <Button className="w-full mt-6" onClick={() => { setForgotMode(false); setResetSent(false); }}>
                    Kirish sahifasiga qaytish
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">Parolni tiklash</h3>
                  <p className="text-slate-500 text-sm mb-6">Emailingizga tiklash havolasi yuboramiz</p>
                  <div className="space-y-4">
                    <Input label="Email" type="email" value={form.email}
                      onChange={e => set('email', e.target.value)} error={errors.email}
                      placeholder="email@example.com" />
                    <Button className="w-full" size="lg" onClick={handleResetPassword} loading={loading}>
                      Havolani yuborish
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── Login / Register ── */
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              {/* Tabs */}
              <div className="flex rounded-xl overflow-hidden bg-slate-100 p-1 mb-6 gap-1">
                {[['login', 'Kirish'], ['register', "Ro'yxat"]].map(([m, label]) => (
                  <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      mode === m ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-1">
                {mode === 'login' ? 'Xush kelibsiz! 👋' : "Yangi hisob yaratish"}
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                {mode === 'login' ? 'Hisobingizga kirish uchun ma\'lumotlaringizni kiriting' : 'Formani to\'ldirib, ro\'yxatdan o\'ting'}
              </p>

              {/* Google */}
              <button onClick={handleGoogle} disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all mb-4 disabled:opacity-50">
                {gLoading
                  ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  : <GoogleIcon />
                }
                Google orqali {mode === 'login' ? 'kirish' : "ro'yxat"}
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">yoki email bilan</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Form */}
              <div className="space-y-4" onKeyDown={e => e.key === 'Enter' && handleSubmit()}>
                {mode === 'register' && (
                  <Input label="Ism Familiya" value={form.displayName}
                    onChange={e => set('displayName', e.target.value)}
                    error={errors.displayName} placeholder="F.I.Sh." icon="👤" />
                )}
                <Input label="Email" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  error={errors.email} placeholder="email@example.com" icon="✉️" />
                <div className="relative">
                  <Input label="Parol" type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    error={errors.password} placeholder="Kamida 6 ta belgi" icon="🔑" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 text-sm transition-colors">
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {mode === 'register' && (
                  <Input label="Parolni tasdiqlang" type="password"
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    error={errors.confirm} placeholder="Parolni qayta kiriting" icon="🔒" />
                )}
                {mode === 'login' && (
                  <div className="text-right -mt-1">
                    <button onClick={() => setForgotMode(true)}
                      className="text-xs text-blue-600 hover:underline font-medium transition-colors">
                      Parolni unutdingizmi?
                    </button>
                  </div>
                )}
                <Button onClick={handleSubmit} loading={loading} className="w-full" size="lg">
                  {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
                </Button>
              </div>

              {mode === 'register' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0">ℹ️</span>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Yangi hisob <strong>Kuzatuvchi</strong> sifatida yaratiladi. To'liq huquqlar uchun admin bilan bog'laning.
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2025 NamunaKuzatuv
          </p>
        </div>
      </div>
    </div>
  );
}
