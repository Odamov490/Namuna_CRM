import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/firebase.js';
import { Button, Input, Card } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { firebaseErrorMsg } from '../lib/utils.js';

// Google SVG icon
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

// Laboratoriya rasmlari (Unsplash)
const LAB_IMAGES = [
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80',
  'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',
];

const FEATURES = [
  { img: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=80&q=80', title: "Real-vaqt kuzatuv", desc: "Namunalar holatini jonli kuzatib boring" },
  { img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=80&q=80', title: "7 laboratoriya", desc: "Bir tizimda barcha lablar birlashgan" },
  { img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&q=80', title: "Hisobot & tahlil", desc: "Batafsil statistika va grafik hisobotlar" },
];

export default function AuthPage() {
  const { showToast, refreshProfile } = useApp();
  const navigate = useNavigate();

  const [mode, setMode]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [form, setForm]       = useState({ email: '', password: '', displayName: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [bgImg]               = useState(() => LAB_IMAGES[Math.floor(Math.random() * LAB_IMAGES.length)]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "To'g'ri email kiriting";
    if (!form.password || form.password.length < 6) e.password = "Parol kamida 6 belgi bo'lishi kerak";
    if (mode === 'register') {
      if (!form.displayName.trim()) e.displayName = "Ism kiritilishi shart";
      if (form.password !== form.confirm)           e.confirm   = "Parollar mos kelmadi";
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
        showToast("Ro'yxatdan o'tdingiz ✅", 'success');
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
      showToast('Parolni tiklash emaili yuborildi ✅', 'success');
    } catch (e) {
      showToast(firebaseErrorMsg(e.code) || e.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — hero panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <img src={bgImg} alt="lab" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-indigo-900/90" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=48&h=48&q=80&fit=crop"
            alt="logo"
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/30"
          />
          <div>
            <h1 className="text-white font-black text-xl leading-none">NamunaKuzatuv</h1>
            <p className="text-blue-200 text-xs mt-0.5">Lab boshqaruv tizimi</p>
          </div>
        </div>

        {/* Center text */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Laboratoriya namunaviy boshqaruvining eng qulay tizimi
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            7 laboratoriya, real-vaqt kuzatuv va kuchli hisobotlar — barchasi bir joyda.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <img src={f.img} alt={f.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <p className="text-white font-bold">{f.title}</p>
                  <p className="text-blue-200 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-blue-300 text-xs">© 2025 NamunaKuzatuv</p>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=64&h=64&q=80&fit=crop"
              alt="logo"
              className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg"
            />
            <h1 className="text-2xl font-black text-slate-800">NamunaKuzatuv</h1>
            <p className="text-slate-500 text-sm mt-1">Laboratoriya namuna boshqaruv tizimi</p>
          </div>

          {forgotMode ? (
            /* ── Parolni tiklash ── */
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
              <button onClick={() => { setForgotMode(false); setResetSent(false); }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                ← Orqaga
              </button>
              {resetSent ? (
                <div className="text-center py-4">
                  <img src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=80&h=80&q=80&fit=crop"
                    alt="email" className="w-16 h-16 rounded-full object-cover mx-auto mb-4" />
                  <h3 className="text-xl font-black text-slate-800 mb-2">Email yuborildi!</h3>
                  <p className="text-slate-500 text-sm">
                    <strong>{form.email}</strong> manziliga parolni tiklash havolasi yuborildi.
                    Pochtangizni tekshiring.
                  </p>
                  <Button className="w-full mt-6" onClick={() => { setForgotMode(false); setResetSent(false); }}>
                    Kirish sahifasiga qaytish
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">Parolni tiklash</h3>
                  <p className="text-slate-500 text-sm mb-6">Emailingizni kiriting, tiklash havolasi yuboramiz</p>
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
            /* ── Kirish / Ro'yxat ── */
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 mb-1">
                {mode === 'login' ? 'Xush kelibsiz!' : "Ro'yxatdan o'tish"}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {mode === 'login'
                  ? 'Tizimga kirish uchun ma\'lumotlaringizni kiriting'
                  : 'Yangi hisob yaratish uchun formani to\'ldiring'}
              </p>

              {/* Tabs */}
              <div className="flex rounded-2xl overflow-hidden bg-slate-100 p-1 mb-6 gap-1">
                {['login', 'register'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      mode === m ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    {m === 'login' ? 'Kirish' : "Ro'yxat"}
                  </button>
                ))}
              </div>

              {/* Google button */}
              <button onClick={handleGoogle} disabled={gLoading}
                className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-4 disabled:opacity-50">
                {gLoading
                  ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  : <GoogleIcon />}
                Google orqali {mode === 'login' ? 'kirish' : "ro'yxat"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">yoki email bilan</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Form */}
              <div className="space-y-4" onKeyDown={e => e.key === 'Enter' && handleSubmit()}>
                {mode === 'register' && (
                  <Input label="Ism Familiya" value={form.displayName}
                    onChange={e => set('displayName', e.target.value)}
                    error={errors.displayName} placeholder="F.I.Sh." />
                )}
                <Input label="Email" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  error={errors.email} placeholder="email@example.com" />

                <div className="relative">
                  <Input label="Parol" type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    error={errors.password} placeholder="Kamida 6 belgi" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 text-sm">
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>

                {mode === 'register' && (
                  <Input label="Parolni tasdiqlang" type="password"
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    error={errors.confirm} placeholder="Parolni qayta kiriting" />
                )}

                {mode === 'login' && (
                  <div className="text-right -mt-1">
                    <button onClick={() => setForgotMode(true)}
                      className="text-xs text-blue-600 hover:underline font-medium">
                      Parolni unutdingizmi?
                    </button>
                  </div>
                )}

                <Button onClick={handleSubmit} loading={loading} className="w-full" size="lg">
                  {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
                </Button>
              </div>

              {/* Rol haqida ma'lumot */}
              {mode === 'register' && (
                <div className="mt-5 p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2">
                  <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=32&h=32&q=80&fit=crop"
                    alt="info" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 text-xs font-semibold">Eslatma</p>
                    <p className="text-amber-700 text-xs mt-0.5">
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
