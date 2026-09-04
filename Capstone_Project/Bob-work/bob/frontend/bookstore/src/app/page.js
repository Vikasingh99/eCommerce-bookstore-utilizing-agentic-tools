'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getHomeProducts } from '@/services/productService';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHome() {
      try {
        const data = await getHomeProducts();
        setProducts(data.products || []);
      } catch {
        setError('Failed to load featured books.');
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchHome();
  }, []);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return (
    <>
      {/* Hero */}
      <section
        className="py-5"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
          minHeight: '420px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6 text-white">
              <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: 1.2 }}>
                Your Next Great Read <span style={{ color: '#e94560' }}>Awaits</span>
              </h1>
              <p className="lead mb-4 text-white-50">
                Discover thousands of books across every genre. From bestsellers to hidden gems — all in one place.
              </p>
              {isAuthenticated ? (
                <Link
                  href="/catalogue"
                  className="btn btn-lg px-5 py-3 fw-bold"
                  style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
                >
                  Browse Catalogue
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-lg px-5 py-3 fw-bold"
                  style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
                >
                  Browse Catalogue
                </Link>
              )}
            </div>
            <div className="col-lg-6 text-center d-none d-lg-block">
              <div style={{ fontSize: '8rem', opacity: 0.15 }}>📚</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-4" style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div className="row text-center g-3">
            {[
              { icon: '🚚', label: 'Free Delivery', sub: 'On orders above ₹499' },
              { icon: '🔖', label: 'Best Prices', sub: 'Lowest price guarantee' },
              { icon: '🔄', label: 'Easy Returns', sub: '7-day return policy' },
              { icon: '🔒', label: 'Secure Payment', sub: 'Encrypted transactions' },
            ].map(({ icon, label, sub }) => (
              <div className="col-6 col-md-3" key={label}>
                <div style={{ fontSize: '1.8rem' }}>{icon}</div>
                <div className="fw-semibold small mt-1">{label}</div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>Featured Books</h2>
              <p className="text-muted small mb-0">Hand-picked titles for you</p>
            </div>
            <Link
              href={isAuthenticated ? '/catalogue' : '/login'}
              className="btn btn-sm"
              style={{ backgroundColor: '#1a1a2e', color: '#fff', border: 'none' }}
            >
              View All →
            </Link>
          </div>

          {loadingProducts ? (
            <Loading message="Loading featured books..." />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : products.length === 0 ? (
            <p className="text-muted text-center py-4">No featured books available right now.</p>
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
              {products.map((product) => {
                const imgUrl = product.imageUrl ? `${apiBase}${product.imageUrl}` : null;
                return (
                  <div className="col" key={product.id}>
                    <div
                      className="card h-100 border-0 shadow-sm"
                      style={{ borderRadius: '12px', overflow: 'hidden' }}
                    >
                      <div
                        style={{ height: '200px', backgroundColor: '#f0f2f5', overflow: 'hidden' }}
                        className="d-flex align-items-center justify-content-center"
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.title}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '3.5rem' }}>📖</span>
                        )}
                      </div>
                      <div className="card-body p-3">
                        <h6 className="fw-bold mb-1 text-truncate" title={product.title}>
                          {product.title}
                        </h6>
                        <p className="fw-bold mb-0" style={{ color: '#e94560' }}>
                          ₹{parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Browse CTA */}
          {!loadingProducts && !error && (
            <div className="text-center mt-5">
              <p className="text-muted mb-3">Want to see more? Sign in to browse our full catalogue.</p>
              <Link
                href={isAuthenticated ? '/catalogue' : '/login'}
                className="btn btn-lg px-5"
                style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
              >
                {isAuthenticated ? 'Browse Full Catalogue' : 'Sign In to Browse'}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
