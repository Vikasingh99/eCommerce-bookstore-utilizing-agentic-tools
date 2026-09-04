'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function BookCard({ product, onAddToCart, onToggleWishlist, isInWishlist, loading }) {
  const imageUrl = product.imageUrl
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${product.imageUrl}`
    : null;

  return (
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <div
        className="position-relative"
        style={{ height: '220px', backgroundColor: '#f0f2f5', overflow: 'hidden' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <span style={{ fontSize: '4rem' }}>📖</span>
          </div>
        )}
        {onToggleWishlist && (
          <button
            className="btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle p-1"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              width: '36px',
              height: '36px',
              fontSize: '1.1rem',
              lineHeight: 1,
            }}
            onClick={() => onToggleWishlist(product.id)}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">
        {product.category && (
          <span className="badge mb-2 text-uppercase" style={{ backgroundColor: '#e8edf5', color: '#4a5568', fontSize: '0.65rem' }}>
            {product.category}
          </span>
        )}
        <h6 className="card-title fw-bold mb-1 text-truncate" title={product.title}>
          {product.title}
        </h6>
        {product.author && (
          <p className="text-muted small mb-1">by {product.author}</p>
        )}
        {product.rating && (
          <p className="small mb-2" style={{ color: '#f6ad55' }}>
            ⭐ {product.rating} / 5
          </p>
        )}
        <p className="fw-bold mb-3 mt-auto" style={{ color: '#1a1a2e', fontSize: '1.1rem' }}>
          ₹{parseFloat(product.price).toFixed(2)}
        </p>

        <div className="d-flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="btn btn-sm flex-fill"
            style={{ backgroundColor: '#1a1a2e', color: '#fff', border: 'none' }}
          >
            View Details
          </Link>
          {onAddToCart && (
            <button
              className="btn btn-sm flex-fill"
              style={{ backgroundColor: '#e94560', color: '#fff', border: 'none' }}
              onClick={() => onAddToCart(product.id)}
              disabled={loading}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
