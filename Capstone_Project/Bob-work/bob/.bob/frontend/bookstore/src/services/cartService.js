import axiosSecure from './axiosSecure';

export async function getCart() {
  const res = await axiosSecure.get('/api/cart');
  return res.data;
}

export async function addToCart(productId, quantity = 1) {
  const res = await axiosSecure.post('/api/cart/items', { productId, quantity });
  return res.data;
}

export async function updateCartItem(productId, quantity) {
  const res = await axiosSecure.put(`/api/cart/items/${productId}`, { quantity });
  return res.data;
}

export async function removeFromCart(productId) {
  const res = await axiosSecure.delete(`/api/cart/items/${productId}`);
  return res.data;
}
