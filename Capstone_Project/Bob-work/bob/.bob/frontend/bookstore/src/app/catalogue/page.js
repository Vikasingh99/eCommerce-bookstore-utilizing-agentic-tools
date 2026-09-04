'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import BookCard from '@/components/BookCard';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import { getProducts } from '@/services/productService';
import { addToCart } from '@/services/cartService';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/services/wishlistService';
import { useToast } from '@/components/useToast';

const CATEGORIES = ['All', 'Self-Help', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology'];

export default function CataloguePage() {
  return (
    <ProtectedRoute>
      <CatalogueContent />
    </ProtectedRoute>
  );
}

function CatalogueContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [cartLoading, setCartLoading] = useState(null);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (search) params.search = search;
        if (category && category !== 'All') params.category = category;
        const data = await getProducts(params);
        if (!cancelled) setProducts(data.products || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [search, category]);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const data = await getWishlist();
        const list = Array.isArray(data.wishlist) ? data.wishlist : [];
        const ids = new Set(list.map((item) => item.productId));
        setWishlistIds(ids);
      } catch {
        // non-critical
      }
    }
    fetchWishlist();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function handleCategoryChange(cat) {
    setCategory(cat);
    setSearch('');
    setSearchInput('');
  }

  async function handleAddToCart(productId) {
    setCartLoading(productId);
    try {
      await addToCart(productId, 1);
      addToast('Added to cart!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add to cart.', 'error');
    } finally {
      setCartLoading(null);
    }
  }

  async function handleToggleWishlist(productId) {
    try {
      if (wishlistIds.has(productId)) {
        await removeFromWishlist(productId);
        setWishlistIds((prev) => { const s = new Set(prev); s.delete(productId); return s; });
        addToast('Removed from wishlist.', 'info');
      } else {
        await addToWishlist(productId);
        setWishlistIds((prev) => new Set([...prev, productId]));
        addToast('Added to wishlist!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update wishlist.', 'error');
    }
  }

  return (
    <div className="container py-5">
      <ToastContainer />

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>Book Catalogue</h2>
        <p className="text-muted small">Browse our full collection</p>
      </div>

      {/* Search + Filter bar */}
      <div className="row g-3 mb-4 align-items-center">
        <div className="col-md-6">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or author…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn"
              style={{ backgroundColor: '#1a1a2e', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="btn btn-sm"
            style={{
              backgroundColor: category === cat ? '#1a1a2e' : '#f0f2f5',
              color: category === cat ? '#fff' : '#4a5568',
              border: 'none',
              borderRadius: '20px',
            }}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-muted small mb-3">
          {products.length} {products.length === 1 ? 'book' : 'books'} found
          {search ? ` for "${search}"` : ''}
          {category !== 'All' ? ` in ${category}` : ''}
        </p>
      )}

      {loading ? (
        <Loading message="Loading catalogue…" />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No books found"
          message="Try a different search term or category."
          action={
            <button
              className="btn"
              style={{ backgroundColor: '#e94560', color: '#fff', border: 'none' }}
              onClick={() => { setSearch(''); setSearchInput(''); setCategory('All'); }}
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          {products.map((product) => (
            <div className="col" key={product.id}>
              <BookCard
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={wishlistIds.has(product.id)}
                loading={cartLoading === product.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
