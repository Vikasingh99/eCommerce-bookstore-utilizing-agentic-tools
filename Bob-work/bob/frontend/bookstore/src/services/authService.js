import axiosPublic from './axiosPublic';

export async function register(data) {
  const res = await axiosPublic.post('/api/auth/register', data);
  return res.data;
}

export async function login(data) {
  const res = await axiosPublic.post('/api/auth/login', data);
  return res.data;
}

export async function refresh(refreshToken) {
  const res = await axiosPublic.post('/api/auth/refresh', { refreshToken });
  return res.data;
}
