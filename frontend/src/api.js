import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 10000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('drivewise_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error) {
  return error?.response?.data?.message || (error?.code === 'ERR_NETWORK' ? 'Không kết nối được máy chủ. Hãy kiểm tra Backend và MongoDB.' : 'Có lỗi xảy ra. Vui lòng thử lại.');
}
export default api;
