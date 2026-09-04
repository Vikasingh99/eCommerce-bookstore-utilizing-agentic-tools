import axiosSecure from './axiosSecure';

export async function createOrder() {
  const res = await axiosSecure.post('/api/orders');
  return res.data;
}

export async function getOrderById(orderId) {
  const res = await axiosSecure.get(`/api/orders/${orderId}`);
  return res.data;
}
