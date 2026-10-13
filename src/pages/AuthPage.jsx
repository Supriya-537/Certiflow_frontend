import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = mode === 'login'
        ? { email: form.email, password: form.password, role: selectedRole }
        : { name: form.name, email: form.email, password: form.password, role: selectedRole };

      const result = mode === 'login' ? await login(payload) : await register(payload);
      if (result?.user?.role === 'citizen') {
        navigate('/citizen');
      } else if (result?.user?.role === 'officer') {
        navigate('/officer');
      } else if (result?.user?.role === 'admin') {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Check your connection and try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slatewarm px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-xl font-bold text-white">C</div>
          <h1 className="text-2xl font-bold text-navy">Welcome to Certiflow</h1>
        </div>

        <div className="mb-6 flex rounded-xl border border-slate-200 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === 'login' ? 'bg-navy text-white' : 'text-slate-600'}`}>
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === 'register' ? 'bg-navy text-white' : 'text-slate-600'}`}>
            Register
          </button>
        </div>

        {mode === 'login' ? <fieldset className="mb-5">
          <legend className="mb-2 block text-sm font-medium text-slate-700">
            {mode === 'login' ? 'Sign in as' : 'Create an account as'}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['citizen', 'Citizen'],
              ['officer', 'Officer'],
              ['admin', 'Administrator'],
            ].map(([role, label]) => (
              <button
                key={role}
                type="button"
                aria-pressed={selectedRole === role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${selectedRole === role ? 'border-navy bg-navy text-white' : 'border-slate-200 text-slate-600 hover:border-navy'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset> : <p className="mb-5 text-sm text-slate-600">New accounts are registered as citizens.</p>}

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-sage"
                placeholder="Jane Citizen"
                required
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-sage"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-sage"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-navy px-4 py-3 font-medium text-white">
            {mode === 'login' ? 'Login to dashboard' : 'Create citizen account'}
          </button>
        </form>
      </div>
    </div>
  );
}
