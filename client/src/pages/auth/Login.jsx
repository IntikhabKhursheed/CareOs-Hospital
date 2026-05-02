import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { login, loading, error } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-primary flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[40px] bg-white/95 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">CareOS hospital management</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">Sign in to your account</h1>
          <p className="mt-3 text-slate-600">Secure access for clinical staff and patient records.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email address</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-600">Use a valid hospital account to access patient workflows, appointments, and lab tools.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
