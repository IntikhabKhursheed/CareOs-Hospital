import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

/* ─────────────────────────────────────────────
   Inline SVG: friendly 3-D style doctor figure
───────────────────────────────────────────── */
const DoctorIllustration = () => (
  <svg viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="login-doctor-svg">
    {/* ── shadow ── */}
    <ellipse cx="170" cy="408" rx="80" ry="12" fill="rgba(0,0,0,0.10)" />

    {/* ── lab coat body ── */}
    <rect x="95" y="210" width="150" height="170" rx="28" fill="#FFFFFF" />
    {/* coat lapels */}
    <polygon points="170,210 130,230 140,290 170,270" fill="#E8F5F5" />
    <polygon points="170,210 210,230 200,290 170,270" fill="#E8F5F5" />
    {/* coat buttons */}
    <circle cx="170" cy="295" r="4" fill="#CFE8E8" />
    <circle cx="170" cy="315" r="4" fill="#CFE8E8" />
    <circle cx="170" cy="335" r="4" fill="#CFE8E8" />

    {/* ── scrubs / shirt under coat ── */}
    <rect x="128" y="215" width="84" height="80" rx="8" fill="#4DB6AC" />

    {/* ── stethoscope ── */}
    <path d="M148 248 Q135 270 145 285 Q158 300 170 285 Q182 300 195 285 Q205 270 192 248" stroke="#37474F" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="170" cy="288" r="9" fill="#37474F" stroke="#546E7A" strokeWidth="2" />
    <circle cx="148" cy="248" r="5" fill="#78909C" />
    <circle cx="192" cy="248" r="5" fill="#78909C" />

    {/* ── left arm / sleeve ── */}
    <rect x="60" y="218" width="42" height="110" rx="20" fill="#FFFFFF" />
    {/* left hand */}
    <ellipse cx="81" cy="338" rx="18" ry="14" fill="#FFCCBC" />
    {/* thumb-up shape */}
    <ellipse cx="72" cy="326" rx="8" ry="13" fill="#FFCCBC" transform="rotate(-20 72 326)" />
    <ellipse cx="88" cy="330" rx="6" ry="10" fill="#FFCCBC" transform="rotate(10 88 330)" />

    {/* ── right arm / sleeve ── */}
    <rect x="238" y="218" width="42" height="110" rx="20" fill="#FFFFFF" />
    {/* right hand relaxed */}
    <ellipse cx="259" cy="337" rx="18" ry="14" fill="#FFCCBC" />

    {/* ── neck ── */}
    <rect x="154" y="175" width="32" height="42" rx="14" fill="#FFCCBC" />

    {/* ── head ── */}
    <ellipse cx="170" cy="148" rx="58" ry="62" fill="#FFCCBC" />

    {/* ── hair ── */}
    <path d="M112 130 Q115 78 170 72 Q225 78 228 130 Q220 100 200 92 Q185 88 170 90 Q155 88 140 92 Q120 100 112 130Z" fill="#6D4C41" />

    {/* ── ears ── */}
    <ellipse cx="113" cy="152" rx="10" ry="13" fill="#FFCCBC" />
    <ellipse cx="227" cy="152" rx="10" ry="13" fill="#FFCCBC" />
    <ellipse cx="113" cy="152" rx="6" ry="9" fill="#FFAB91" />
    <ellipse cx="227" cy="152" rx="6" ry="9" fill="#FFAB91" />

    {/* ── eyebrows ── */}
    <path d="M145 126 Q155 120 165 124" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M175 124 Q185 120 195 126" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* ── eyes ── */}
    <ellipse cx="155" cy="142" rx="10" ry="11" fill="white" />
    <ellipse cx="185" cy="142" rx="10" ry="11" fill="white" />
    <circle cx="157" cy="144" r="6" fill="#37474F" />
    <circle cx="187" cy="144" r="6" fill="#37474F" />
    <circle cx="159" cy="142" r="2.5" fill="white" />
    <circle cx="189" cy="142" r="2.5" fill="white" />

    {/* ── smile ── */}
    <path d="M152 168 Q170 182 188 168" stroke="#E57373" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M152 168 Q170 178 188 168" fill="#FFCDD2" />

    {/* ── cheek blush ── */}
    <ellipse cx="140" cy="162" rx="12" ry="7" fill="#FFAB91" opacity="0.5" />
    <ellipse cx="200" cy="162" rx="12" ry="7" fill="#FFAB91" opacity="0.5" />

    {/* ── name badge ── */}
    <rect x="152" y="240" width="36" height="22" rx="4" fill="#E0F2F1" stroke="#80CBC4" strokeWidth="1.5" />
    <rect x="157" y="245" width="26" height="3" rx="1.5" fill="#80CBC4" />
    <rect x="157" y="251" width="18" height="3" rx="1.5" fill="#B2DFDB" />
    <rect x="157" y="257" width="22" height="3" rx="1.5" fill="#B2DFDB" />

    {/* ── decorative floating circles ── */}
    <circle cx="42" cy="60" r="18" fill="rgba(255,255,255,0.18)" />
    <circle cx="295" cy="30" r="12" fill="rgba(255,255,255,0.14)" />
    <circle cx="30" cy="340" r="10" fill="rgba(255,255,255,0.12)" />
    <circle cx="310" cy="310" r="22" fill="rgba(255,255,255,0.10)" />
  </svg>
);

/* ─────────────────────────────────────────────
   Hospital Logo SVG
───────────────────────────────────────────── */
const HospitalLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="42" height="42" rx="10" fill="url(#logoGrad)" />
    <rect x="18" y="9" width="6" height="24" rx="3" fill="white" />
    <rect x="9" y="18" width="24" height="6" rx="3" fill="white" />
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#26C6DA" />
        <stop offset="1" stopColor="#00ACC1" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─────────────────────────────────────────────
   Main Login Component
───────────────────────────────────────────── */
const Login = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
  });

  const handleLoginChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegisterChange = (e) =>
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const response = await authService.register(registerData);
      if (response.success) {
        toast.success('Registration successful! Please login.');
        setShowRegister(false);
        setRegisterData({ name: '', email: '', password: '', role: 'patient', phone: '' });
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration error');
    } finally {
      setRegisterLoading(false);
    }
  };

  /* ── Left gradient panel (shared) ── */
  const LeftPanel = () => (
    <div className="login-left-panel">
      {/* floating decorative rings */}
      <div className="login-deco-ring ring-tl" />
      <div className="login-deco-ring ring-br" />

      <div className="login-left-content">
        <div className="login-tagline-block">
          <h1 className="login-hello">
            Hello <span className="login-hello-accent">!</span>
          </h1>
          <p className="login-tagline">Please enter your details<br />to continue</p>
        </div>
        <div className="login-doctor-wrap">
          <DoctorIllustration />
        </div>
      </div>
    </div>
  );

  /* ── Register view ── */
  if (showRegister) {
    return (
      <div className="login-root">
        <div className="login-card">
          <LeftPanel />
          <div className="login-right-panel">
            <div className="login-form-inner">
              {/* Logo */}
              <div className="login-logo-row">
                <HospitalLogo />
                <span className="login-logo-text">
                  <span className="login-logo-care">Care</span>OS Hospital
                </span>
              </div>

              <h2 className="login-form-title">Create Account</h2>
              <p className="login-form-sub">Register for CareOS access</p>

              <form className="login-form" onSubmit={handleRegisterSubmit}>
                <div className="lf-group">
                  <label className="lf-label">Full Name</label>
                  <input name="name" type="text" value={registerData.name} onChange={handleRegisterChange}
                    required className="lf-input" placeholder="John Doe" />
                </div>
                <div className="lf-group">
                  <label className="lf-label">Email</label>
                  <input name="email" type="email" value={registerData.email} onChange={handleRegisterChange}
                    required className="lf-input" placeholder="you@careos.com" />
                </div>
                <div className="lf-group">
                  <label className="lf-label">Password</label>
                  <input name="password" type="password" value={registerData.password} onChange={handleRegisterChange}
                    required className="lf-input" placeholder="Create a password" />
                </div>
                <div className="lf-group">
                  <label className="lf-label">Phone</label>
                  <input name="phone" type="tel" value={registerData.phone} onChange={handleRegisterChange}
                    required className="lf-input" placeholder="+1 234 567 890" />
                </div>
                <div className="lf-group">
                  <label className="lf-label">Role</label>
                  <select name="role" value={registerData.role} onChange={handleRegisterChange} className="lf-input lf-select">
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="lab_technician">Lab Technician</option>
                  </select>
                </div>

                <button type="submit" disabled={registerLoading} className="lf-btn-primary">
                  {registerLoading ? 'Creating Account…' : 'Create Account'}
                </button>
              </form>

              <p className="login-switch-text">
                Already have an account?{' '}
                <button onClick={() => setShowRegister(false)} className="login-link">
                  Sign In
                </button>
              </p>

              <p className="login-footer-copy">
                Powered by IntikhabKhursheed · Codnocrats Innovating Solutions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login view ── */
  return (
    <div className="login-root">
      <div className="login-card">
        <LeftPanel />

        <div className="login-right-panel">
          <div className="login-form-inner">
            {/* Hospital logo */}
            <div className="login-logo-row">
              <HospitalLogo />
              <span className="login-logo-text">
                <span className="login-logo-care">Care</span>OS Hospital
              </span>
            </div>

            <h2 className="login-form-title">Welcome Back</h2>
            <p className="login-form-sub">Sign in to your account to continue</p>

            <form className="login-form" onSubmit={handleLoginSubmit}>
              {/* Email */}
              <div className="lf-group">
                <label htmlFor="login-email" className="lf-label">Username or E-mail</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleLoginChange}
                  required
                  className="lf-input"
                  placeholder="admin@careos.com"
                />
              </div>

              {/* Password */}
              <div className="lf-group">
                <label htmlFor="login-password" className="lf-label">Password</label>
                <div className="lf-input-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleLoginChange}
                    required
                    className={`lf-input lf-input-icon-right${error ? ' lf-input-error' : ''}`}
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="lf-eye-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {error && <p className="lf-error-msg">{error}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="lf-btn-primary">
                {loading ? 'Signing in…' : 'Log In'}
              </button>
            </form>

            {/* Auxiliary links */}
            <div className="login-aux-links">
              <button className="login-link">Forgot Password?</button>
            </div>

            <p className="login-switch-text">
              Do Not Have Account?{' '}
              <button onClick={() => setShowRegister(true)} className="login-link">
                Sign Up
              </button>
            </p>

            <p className="login-footer-copy">
              Powered by IntikhabKhursheed · Codnocrats Innovating Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
