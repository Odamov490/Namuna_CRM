import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/firebase.js';
import { Button, Input, AlertBanner } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { firebaseErrorMsg } from '../lib/utils.js';
import { Eye, EyeOff, Beaker, ArrowLeft, Mail } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const STATS = [
  { value: '7+', label: 'Laboratoriya' },
  { value: '99%', label: 'Ishonchlilik' },
  { value: '24/7', label: 'Monitoring' },
];

const FEATURES = [
  { icon: '🔬', title: 'Real-vaqt kuzatuv', desc: "Namunalar holatini jonli kuzating" },
  { icon: '📊', title: 'Kuchli hisobotlar', desc: 'Batafsil statistika va grafik tahlillar' },
  { icon: '🔔', title: 'Smart ogohlantirishlar', desc: "Muhim hodisalar haqida tezkor xabarlar" },
];

export default function AuthPage() {
  const { showToast, refreshProfile } = useApp();
  const navigate = useNavigate();

  const [mode,       setMode]       = useState('login');   // login | register
  const [loading,    setLoading]    = useState(false);
  const [gLoading,   setGLoading]   = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent,  setResetSent]  = useState(false);
  const [error,      setError]      = useState('');
  const [form, setForm] = useState({ email: '', password: '', displayName: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
    setError('');
  };

  const validate = () => {
    const e = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "To'g'ri email kiriting";
    if (!form.password || form.password.length < 6)
      e.password = "Parol kamida 6 ta belgi bo'lishi kerak";
    if (mode === 'register') {
      if (!form.displayName.trim()) e.displayName = 'Ism kiritilishi shart';
      if (form.password !== form.confirm) e.confirm = 'Parollar mos kelmadi';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        await authService.loginWithEmail(form.email, form.password);
        showToast('Xush kelibsiz! 👋', 'success');
      } else {
        await authService.registerWithEmail(form.email, form.password, form.displayName.trim());
        showToast("Ro'yxatdan o'tdingiz! ✅", 'success');
      }
      await refreshProfile();
      navigate('/');
    } catch (e) {
      setError(firebaseErrorMsg(e.code) || e.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    try {
      await authService.loginWithGoogle();
      await refreshProfile();
      showToast('Google orqali kirdingiz 🎉', 'success');
      navigate('/');
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(firebaseErrorMsg(e.code) || e.message);
      }
    }
    setGLoading(false);
  };

  const handleResetPassword = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors({ email: "To'g'ri email kiriting" }); return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(form.email);
      setResetSent(true);
    } catch (e) {
      setError(firebaseErrorMsg(e.code) || e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left hero panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-slate-900">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Beaker className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">NamunaKuzatuv</p>
            <p className="text-blue-300 text-xs mt-0.5">Lab boshqaruv tizimi</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Namunalarni{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              aqlli boshqaring
            </span>
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            7 ta laboratoriya, real-vaqt kuzatuv va kuchli tahlillar — hammasi bir tizimda.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mb-10">
            {STATS.map(s => (
              <div key={s.value}>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-blue-300 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-4 bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-400 text-xs">© 2025 NamunaKuzatuv. Barcha huquqlar himoyalangan.</p>
      </div>

      {/* ── Right auth form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Beaker className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">NamunaKuzatuv</h1>
            <p className="text-slate-500 text-sm mt-1">Laboratoriya namuna boshqaruv tizimi</p>
          </div>

          {/* ── Forgot password ── */}
          {forgotMode ? (
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
              <button
                onClick={() => { setForgotMode(false); setResetSent(false); setError(''); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Orqaga
              </button>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Email yuborildi!</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    <strong className="text-slate-700">{form.email}</strong> manziliga parolni tiklash havolasi yuborildi.
                  </p>
                  <Button className="w-full" onClick={() => { setForgotMode(false); setResetSent(false); }}>
                    Kirish sahifasiga qaytish
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">Parolni tiklash</h3>
                  <p className="text-slate-500 text-sm mb-6">Emailingizni kiriting, tiklash havolasini yuboramiz</p>
                  {error && <AlertBanner type="error" message={error} className="mb-4" />}
                  <div className="space-y-4">
                    <Input
                      label="Email" type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      error={errors.email}
                      placeholder="email@example.com"
                    />
                    <Button className="w-full" size="lg" onClick={handleResetPassword} loading={loading}>
                      Havolani yuborish
                    </Button>
                  </div>
                </>
              )}
            </div>

          ) : (
            /* ── Login / Register ── */
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">

              {/* Mode tabs */}
              <div className="flex rounded-xl overflow-hidden bg-slate-100 p-1 mb-6 gap-1">
                {['login', 'register'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setErrors({}); setError(''); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      mode === m
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m === 'login' ? 'Kirish' : "Ro'yxat"}
                  </button>
                ))}
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-1">
                {mode === 'login' ? 'Xush kelibsiz!' : "Hisob yaratish"}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {mode === 'login'
                  ? "Ma'lumotlaringizni kiriting"
                  : "Yangi hisob uchun formani to'ldiring"}
              </p>

              {/* Error banner */}
              {error && (
                <div className="mb-4">
                  <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
                </div>
              )}

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-4 disabled:opacity-50 bg-white shadow-sm"
              >
                {gLoading
                  ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  : <GoogleIcon />}
                Google orqali {mode === 'login' ? 'kirish' : "ro'yxat"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">yoki email bilan</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Form */}
              <div className="space-y-3" onKeyDown={e => e.key === 'Enter' && handleSubmit()}>
                {mode === 'register' && (
                  <Input
                    label="Ism Familiya" required
                    value={form.displayName}
                    onChange={e => set('displayName', e.target.value)}
                    error={errors.displayName}
                    placeholder="F.I.Sh."
                  />
                )}

                <Input
                  label="Email" type="email" required
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  error={errors.email}
                  placeholder="email@example.com"
                />

                <div className="relative">
                  <Input
                    label="Parol" required
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    error={errors.password}
                    placeholder="Kamida 6 ta belgi"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === 'register' && (
                  <Input
                    label="Parolni tasdiqlang" required
                    type="password"
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    error={errors.confirm}
                    placeholder="Parolni qayta kiriting"
                  />
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      onClick={() => setForgotMode(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Parolni unutdingizmi?
                    </button>
                  </div>
                )}

                <Button onClick={handleSubmit} loading={loading} className="w-full" size="lg">
                  {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
                </Button>
              </div>

              {mode === 'register' && (
                <div className="mt-4 p-3.5 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0">💡</span>
                  <div>
                    <p className="text-amber-800 text-xs font-semibold">Eslatma</p>
                    <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                      Yangi hisob "Kuzatuvchi" sifatida yaratiladi. Admin tomonidan rol berilgandan so'ng to'liq imkoniyatlardan foydalana olasiz.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2025 NamunaKuzatuv — Barcha huquqlar himoyalangan
          </p>
        </div>
      </div>
    </div>
  );
}
