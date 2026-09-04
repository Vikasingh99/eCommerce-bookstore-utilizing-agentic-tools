'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import { getCart } from '@/services/cartService';
import { createOrder } from '@/services/orderService';
import { useToast } from '@/components/useToast';

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    async function fetchCart() {
      try {
        const data = await getCart();
        setCart(data.cart);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cart.');
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, []);

  async function handlePlaceOrder() {
    setOrderLoading(true);
    try {
      const data = await createOrder();
      const orderId = data.order?.id;
      if (!orderId) throw new Error('No order ID returned.');
      router.push(`/payment?orderId=${orderId}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create order.', 'error');
      setOrderLoading(false);
    }
  }

  const items = cart?.cartItems || [];
  const total = items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);

  return (
    <div className="container py-5">
      <ToastContainer />
      <h2 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>🧾 Checkout</h2>

      {loading ? (
        <Loading message="Loading order summary…" />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Add items to your cart before checking out."
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
          {/* Order items */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <h5 className="fw-bold mb-3">Order Items</h5>
              {items.map((item, idx) => {
                const imgUrl = item.product.imageUrl ? `${apiBase}${item.product.imageUrl}` : null;
                return (
                  <div key={item.product.id} className={`d-flex gap-3 py-3 ${idx < items.length - 1 ? 'border-bottom' : ''}`}>
                    <div
                      className="rounded-2 flex-shrink-0"
                      style={{ width: '60px', height: '75px', backgroundColor: '#f0f2f5', overflow: 'hidden' }}
                    >
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <span style={{ fontSize: '1.5rem' }}>📖</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1 text-truncate">{item.product.title}</h6>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Qty: {item.quantity}</span>
                        <span>₹{parseFloat(item.product.price).toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="text-end fw-semibold" style={{ minWidth: '80px' }}>
                      ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment summary */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px', position: 'sticky', top: '80px' }}>
              <h5 className="fw-bold mb-3">Price Summary</h5>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-3">
                <span>Shipping</span>
                <span className="text-success fw-semibold">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold mb-4">
                <span>Order Total</span>
                <span style={{ color: '#1a1a2e', fontSize: '1.2rem' }}>₹{total.toFixed(2)}</span>
              </div>

              <div
                className="rounded-2 p-3 mb-4 small"
                style={{ backgroundColor: '#f0f7ff', border: '1px solid #c3daf9' }}
              >
                <p className="fw-semibold mb-1" style={{ color: '#1a56db' }}>ℹ️ Order Note</p>
                <p className="text-muted mb-0">
                  Prices and totals are calculated server-side. You will be redirected to payment after confirmation.
                </p>
              </div>

              <button
                className="btn w-100 fw-semibold py-2 mb-2"
                style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
                onClick={handlePlaceOrder}
                disabled={orderLoading}
              >
                {orderLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Creating Order…</>
                ) : (
                  'Confirm & Proceed to Payment'
                )}
              </button>
              <Link
                href="/cart"
                className="btn btn-sm w-100 text-muted"
                style={{ background: 'none', border: 'none' }}
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
