import axiosSecure from './axiosSecure';

export async function getWishlist() {
  const res = await axiosSecure.get('/api/wishlist');
  return res.data;
}

export async function addToWishlist(productId) {
  const res = await axiosSecure.post('/api/wishlist/items', { productId });
  return res.data;
}

export async function removeFromWishlist(productId) {
  const res = await axiosSecure.delete(`/api/wishlist/items/${productId}`);
  return res.data;
}
