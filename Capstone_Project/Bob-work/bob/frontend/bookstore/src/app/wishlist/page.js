'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import { getWishlist, removeFromWishlist } from '@/services/wishlistService';
import { addToCart } from '@/services/cartService';
import { useToast } from '@/components/useToast';

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}

function WishlistContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const { addToast, ToastContainer } = useToast();

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getWishlist();
        if (!cancelled) setItems(Array.isArray(data.wishlist) ? data.wishlist : []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load wishlist.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleRemove(productId) {
    setActionLoading(productId);
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      addToast('Removed from wishlist.', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to remove.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddToCart(productId) {
    setActionLoading(productId);
    try {
      await addToCart(productId, 1);
      addToast('Added to cart!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add to cart.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="container py-5">
      <ToastContainer />
      <h2 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>❤️ Your Wishlist</h2>

      {loading ? (
        <Loading message="Loading wishlist…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchWishlist} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🤍"
          title="Your wishlist is empty"
          message="Save books you love by clicking the heart icon."
          action={
            <Link
              href="/catalogue"
              className="btn"
              style={{ backgroundColor: '#e94560', color: '#fff', border: 'none' }}
            >
              Browse Catalogue
            </Link>
          }
        />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const imgUrl = product.imageUrl ? `${apiBase}${product.imageUrl}` : null;
            const isLoading = actionLoading === item.productId;

            return (
              <div className="col" key={item.productId}>
                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{ borderRadius: '12px', overflow: 'hidden', opacity: isLoading ? 0.6 : 1 }}
                >
                  <div
                    style={{ height: '180px', backgroundColor: '#f0f2f5', overflow: 'hidden' }}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={product.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '3rem' }}>📖</span>
                    )}
                  </div>
                  <div className="card-body p-3 d-flex flex-column">
                    <h6 className="fw-bold mb-1 text-truncate">{product.title}</h6>
                    {product.author && <p className="text-muted small mb-1">by {product.author}</p>}
                    <p className="fw-bold mb-3" style={{ color: '#e94560' }}>
                      ₹{parseFloat(product.price).toFixed(2)}
                    </p>
                    <div className="d-flex flex-column gap-2 mt-auto">
                      <div className="d-flex gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="btn btn-sm flex-fill"
                          style={{ backgroundColor: '#1a1a2e', color: '#fff', border: 'none' }}
                        >
                          View Details
                        </Link>
                        <button
                          className="btn btn-sm flex-fill"
                          style={{ backgroundColor: '#e94560', color: '#fff', border: 'none' }}
                          onClick={() => handleAddToCart(item.productId)}
                          disabled={isLoading}
                        >
                          Add to Cart
                        </button>
                      </div>
                      <button
                        className="btn btn-sm w-100"
                        style={{ backgroundColor: '#fff0f0', color: '#e94560', border: '1px solid #e94560' }}
                        onClick={() => handleRemove(item.productId)}
                        disabled={isLoading}
                      >
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
