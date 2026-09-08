import axiosPublic from './axiosPublic';
import axiosSecure from './axiosSecure';

export async function getHomeProducts() {
  const res = await axiosPublic.get('/api/home');
  return res.data;
}

export async function getProducts(params = {}) {
  const res = await axiosSecure.get('/api/products', { params });
  return res.data;
}

export async function getProductById(productId) {
  const res = await axiosSecure.get(`/api/products/${productId}`);
  return res.data;
}
