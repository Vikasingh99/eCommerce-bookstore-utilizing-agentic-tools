import axiosSecure from './axiosSecure';

export async function processPayment(orderId, paymentMethod) {
  const res = await axiosSecure.post('/api/payments', { orderId, paymentMethod });
  return res.data;
}
