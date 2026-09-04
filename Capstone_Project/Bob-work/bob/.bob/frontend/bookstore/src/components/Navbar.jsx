'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push('/');
  }

  function close() {
    setMenuOpen(false);
  }

  const navLinkStyle = {
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.95rem',
    display: 'block',
    whiteSpace: 'nowrap',
  };

  return (
    <nav style={{ backgroundColor: '#1a1a2e', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2">

          {/* Brand */}
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={close}>
            <span>📚</span> BookStore
          </Link>

          {/* Desktop links */}
          <div className="d-none d-lg-flex align-items-center gap-1">
            <Link href="/" style={navLinkStyle} onClick={close}>Home</Link>

            {loading ? (
              <span style={{ ...navLinkStyle, cursor: 'default' }}>
                <span className="spinner-border spinner-border-sm text-light" role="status" />
              </span>
            ) : isAuthenticated ? (
              <>
                <Link href="/catalogue" style={navLinkStyle} onClick={close}>Catalogue</Link>
                <Link href="/wishlist" style={navLinkStyle} onClick={close}>♡ Wishlist</Link>
                <Link href="/cart" style={navLinkStyle} onClick={close}>🛒 Cart</Link>
                {/* <Link href="/checkout" style={navLinkStyle} onClick={close}>Checkout</Link> */}
                <span style={{ ...navLinkStyle, color: 'rgba(255,255,255,0.5)', cursor: 'default', fontSize: '0.85rem' }}>
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={navLinkStyle} onClick={close}>Login</Link>
                <Link
                  href="/register"
                  style={{ backgroundColor: '#e94560', color: '#fff', textDecoration: 'none', padding: '7px 20px', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem' }}
                  onClick={close}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="d-lg-none"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, padding: '4px' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="d-lg-none pb-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Link href="/" style={navLinkStyle} onClick={close}>Home</Link>

            {loading ? (
              <span style={{ ...navLinkStyle, cursor: 'default' }}>
                <span className="spinner-border spinner-border-sm text-light me-2" role="status" />
                Loading…
              </span>
            ) : isAuthenticated ? (
              <>
                <Link href="/catalogue" style={navLinkStyle} onClick={close}>Catalogue</Link>
                <Link href="/wishlist" style={navLinkStyle} onClick={close}>♡ Wishlist</Link>
                <Link href="/cart" style={navLinkStyle} onClick={close}>🛒 Cart</Link>
                <Link href="/checkout" style={navLinkStyle} onClick={close}>Checkout</Link>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
                <span style={{ ...navLinkStyle, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', cursor: 'default' }}>
                  Signed in as {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', ...navLinkStyle, color: '#e94560', padding: '8px 12px', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={navLinkStyle} onClick={close}>Login</Link>
                <Link href="/register" style={navLinkStyle} onClick={close}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
