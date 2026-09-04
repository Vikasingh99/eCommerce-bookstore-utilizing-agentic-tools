'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { getProductById } from '@/services/productService';
import { addToCart } from '@/services/cartService';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/services/wishlistService';
import { useToast } from '@/components/useToast';

export default function ProductDetailsPage({ params }) {
  return (
    <ProtectedRoute>
      <ProductContent params={params} />
    </ProtectedRoute>
  );
}

function ProductContent({ params }) {
  const { productId } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProductById(productId);
        setProduct(data.product);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    }
    async function fetchWishlist() {
      try {
        const data = await getWishlist();
        const list = Array.isArray(data.wishlist) ? data.wishlist : [];
        const ids = new Set(list.map((item) => item.productId));
        setInWishlist(ids.has(parseInt(productId, 10)));
      } catch {
        // non-critical
      }
    }
    fetchProduct();
    fetchWishlist();
  }, [productId]);

  async function handleAddToCart() {
    setCartLoading(true);
    try {
      await addToCart(parseInt(productId, 10), 1);
      addToast('Added to cart!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add to cart.', 'error');
    } finally {
      setCartLoading(false);
    }
  }

  async function handleToggleWishlist() {
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(parseInt(productId, 10));
        setInWishlist(false);
        addToast('Removed from wishlist.', 'info');
      } else {
        await addToWishlist(parseInt(productId, 10));
        setInWishlist(true);
        addToast('Added to wishlist!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update wishlist.', 'error');
    } finally {
      setWishlistLoading(false);
    }
  }

  if (loading) return <div className="container py-5"><Loading message="Loading product…" /></div>;
  if (error) return <div className="container py-5"><ErrorMessage message={error} /></div>;
  if (!product) return null;

  const imgUrl = product.imageUrl ? `${apiBase}${product.imageUrl}` : null;

  return (
    <div className="container py-5">
      <ToastContainer />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link href="/catalogue" className="text-decoration-none">Catalogue</Link></li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '200px' }}>{product.title}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Book image */}
        <div className="col-md-4">
          <div
            className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center"
            style={{ height: '380px', backgroundColor: '#f0f2f5' }}
          >
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={product.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '5rem' }}>📖</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="col-md-8">
          {product.category && (
            <span
              className="badge mb-3 text-uppercase"
              style={{ backgroundColor: '#e8edf5', color: '#4a5568', fontSize: '0.7rem' }}
            >
              {product.category} · {product.genre}
            </span>
          )}
          <h2 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>{product.title}</h2>
          <p className="text-muted mb-2">by <strong>{product.author}</strong></p>

          <div className="mb-3" style={{ color: '#f6ad55', fontSize: '1.1rem' }}>
            ⭐ {product.rating} / 5
          </div>

          <p className="mb-4 text-muted" style={{ lineHeight: 1.7 }}>{product.description}</p>

          {/* Meta grid */}
          <div className="row g-2 mb-4 small text-muted">
            <div className="col-6">
              <span className="fw-semibold text-dark">Publisher: </span>{product.publishedBy}
            </div>
            <div className="col-6">
              <span className="fw-semibold text-dark">Language: </span>{product.language}
            </div>
            <div className="col-6">
              <span className="fw-semibold text-dark">Stock: </span>
              {product.stock > 0 ? (
                <span className="text-success">{product.stock} in stock</span>
              ) : (
                <span className="text-danger">Out of stock</span>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="fw-bold" style={{ fontSize: '1.8rem', color: '#1a1a2e' }}>
              ₹{parseFloat(product.price).toFixed(2)}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-3">
            <button
              className="btn px-5 py-2 fw-semibold"
              style={{ backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px' }}
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock === 0}
            >
              {cartLoading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Adding…</>
              ) : (
                '🛒 Add to Cart'
              )}
            </button>
            <button
              className="btn px-4 py-2 fw-semibold"
              style={{
                backgroundColor: inWishlist ? '#fff0f0' : '#f0f2f5',
                color: inWishlist ? '#e94560' : '#4a5568',
                border: `1px solid ${inWishlist ? '#e94560' : '#e5e7eb'}`,
                borderRadius: '8px',
              }}
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
            >
              {inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
