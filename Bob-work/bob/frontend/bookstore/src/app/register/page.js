'use client';

import { useState } from 'react';
import Link from 'next/link';
import { register } from '@/services/authService';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  else if (form.name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';
  if (!form.password) errors.password = 'Password is required.';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (form.password.length > 100) errors.password = 'Password must be 100 characters or fewer.';
  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm text-center p-5" style={{ borderRadius: '16px' }}>
              <div style={{ fontSize: '3.5rem' }}>🎉</div>
              <h4 className="fw-bold mt-3 mb-2">Registration Successful!</h4>
              <p className="text-muted mb-4">Your account has been created. You can now log in.</p>
              <Link
                href="/login"
                className="btn btn-lg fw-semibold"
                style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem' }}>📚</div>
              <h4 className="fw-bold mt-2 mb-1">Create an Account</h4>
              <p className="text-muted small">Join BookStore today</p>
            </div>

            {apiError && (
              <div className="alert alert-danger border-0 py-2 small" role="alert">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold small">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

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
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-muted small mt-4 mb-0">
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#e94560' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
