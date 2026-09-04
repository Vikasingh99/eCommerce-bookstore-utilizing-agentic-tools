'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import { getCart, updateCartItem, removeFromCart } from '@/services/cartService';
import { useToast } from '@/components/useToast';

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}

function CartContent() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const { addToast, ToastContainer } = useToast();

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCart(data.cart);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCart();
        if (!cancelled) setCart(data.cart);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load cart.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []); // initial load only; fetchCart used for manual refresh

  async function handleQuantityChange(productId, newQty) {
    if (newQty < 1) return;
    setActionLoading(productId);
    try {
      await updateCartItem(productId, newQty);
      await fetchCart();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update quantity.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(productId) {
    setActionLoading(productId);
    try {
      await removeFromCart(productId);
      addToast('Item removed from cart.', 'info');
      await fetchCart();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to remove item.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  const items = cart?.cartItems || [];
  const total = items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);

  return (
    <div className="container py-5">
      <ToastContainer />
      <h2 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>🛒 Your Cart</h2>

      {loading ? (
        <Loading message="Loading cart…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchCart} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Browse the catalogue to find books you love."
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
        <div className="row g-4">
          {/* Cart items */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-body p-0">
                {items.map((item, idx) => {
                  const imgUrl = item.product.imageUrl ? `${apiBase}${item.product.imageUrl}` : null;
                  const itemTotal = parseFloat(item.product.price) * item.quantity;
                  const isLoading = actionLoading === item.product.id;
                  return (
                    <div
                      key={item.product.id}
                      className={`p-4 d-flex gap-3 align-items-start ${idx < items.length - 1 ? 'border-bottom' : ''}`}
                      style={{ opacity: isLoading ? 0.6 : 1 }}
                    >
                      {/* Image */}
                      <div
                        className="rounded-2 flex-shrink-0"
                        style={{ width: '80px', height: '100px', backgroundColor: '#f0f2f5', overflow: 'hidden' }}
                      >
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.product.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <span style={{ fontSize: '2rem' }}>📖</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="fw-bold mb-1 text-truncate">{item.product.title}</h6>
                        {item.product.author && (
                          <p className="text-muted small mb-2">by {item.product.author}</p>
                        )}
                        <p className="fw-semibold mb-2" style={{ color: '#e94560' }}>
                          ₹{parseFloat(item.product.price).toFixed(2)}
                        </p>

                        {/* Quantity controls */}
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm px-2 py-1"
                            style={{ backgroundColor: '#f0f2f5', border: 'none', borderRadius: '6px', lineHeight: 1 }}
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                          >−</button>
                          <span className="fw-semibold px-2">{item.quantity}</span>
                          <button
                            className="btn btn-sm px-2 py-1"
                            style={{ backgroundColor: '#f0f2f5', border: 'none', borderRadius: '6px', lineHeight: 1 }}
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= item.product.stock}
                          >+</button>
                          <button
                            className="btn btn-sm ms-3"
                            style={{ color: '#e94560', background: 'none', border: 'none', padding: 0, fontSize: '0.8rem' }}
                            onClick={() => handleRemove(item.product.id)}
                            disabled={isLoading}
                          >
                            🗑 Remove
                          </button>
                        </div>
                      </div>

                      {/* Item total */}
                      <div className="text-end flex-shrink-0">
                        <p className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>₹{itemTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px', position: 'sticky', top: '80px' }}>
              <h5 className="fw-bold mb-3">Order Summary</h5>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-3">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold mb-4">
                <span>Total</span>
                <span style={{ color: '#1a1a2e', fontSize: '1.2rem' }}>₹{total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="btn w-100 fw-semibold py-2"
                style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/catalogue"
                className="btn btn-sm w-100 mt-2 text-muted"
                style={{ background: 'none', border: 'none' }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
