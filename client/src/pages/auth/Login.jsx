import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check } from 'lucide-react';

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
    phone: ''
  });

  const handleLoginChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegisterChange = (e) => {
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  const brandSide = (
    <div className="hidden lg:flex lg:w-[40%] flex-col justify-center p-12 text-white" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
      <h1 className="text-5xl font-bold mb-4">CareOS</h1>
      <p className="text-xl opacity-90 mb-10">AI-Powered Hospital Management</p>
      <ul className="space-y-5 text-base opacity-90">
        <li className="flex items-center gap-3"><Check size={22} strokeWidth={3} /> Intelligent clinical note generation</li>
        <li className="flex items-center gap-3"><Check size={22} strokeWidth={3} /> Real-time hospital operations</li>
        <li className="flex items-center gap-3"><Check size={22} strokeWidth={3} /> Complete patient lifecycle management</li>
      </ul>
    </div>
  );

  if (showRegister) {
    return (
      <div className="min-h-screen flex">
        {brandSide}
        <div className="flex-1 flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 mb-8">Register for CareOS access</p>
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input name="name" type="text" value={registerData.name} onChange={handleRegisterChange} required className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input name="email" type="email" value={registerData.email} onChange={handleRegisterChange} required className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input name="password" type="password" value={registerData.password} onChange={handleRegisterChange} required className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Enter password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input name="phone" type="tel" value={registerData.phone} onChange={handleRegisterChange} required className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select name="role" value={registerData.role} onChange={handleRegisterChange} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="lab_technician">Lab Technician</option>
                </select>
              </div>
              <button type="submit" disabled={registerLoading} className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50">
                {registerLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => setShowRegister(false)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition">Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {brandSide}
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <h2 className="text-[28px] font-bold text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your account</p>

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleLoginChange} required className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="admin@careos.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleLoginChange} required className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none pr-10" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-slate-500">or</span>
            </div>
          </div>

          <button onClick={() => setShowRegister(true)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            Create Account
          </button>

          <p className="mt-8 text-center text-xs text-slate-400">
            Demo: admin@careos.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
