import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// axios 인스턴스 생성 (Vite 프록시 사용)
const instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    // 토큰이 필요한 요청의 경우 토큰 추가
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 시도
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/member/refresh', {
            refreshToken: refreshToken
          });
          
          const newAccessToken = response.data.resData;
          Cookies.set('accessToken', newAccessToken);
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 이동
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance; 