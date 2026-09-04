'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login } from '@/services/authService';

export default function LoginPage() {
  const { login: setAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      const data = await login({ email: form.email.trim(), password: form.password });
      setAuth(data); // stores tokens and user in context + storage
      router.replace('/catalogue');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem' }}>🔑</div>
              <h4 className="fw-bold mt-2 mb-1">Welcome Back</h4>
              <p className="text-muted small">Sign in to your BookStore account</p>
            </div>

            {apiError && (
              <div className="alert alert-danger border-0 py-2 small" role="alert">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold small">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold small">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <button
                type="submit"
                className="btn w-100 fw-semibold py-2"
                style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                ) : null}
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-muted small mt-4 mb-0">
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: '#e94560' }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
