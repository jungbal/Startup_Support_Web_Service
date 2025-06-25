import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import Logo from '../components/Logo';
import { login } from '../api/memberApi';
import useAuthStore from '../store/authStore';

// CSS 파일 import
import '../styles/common.css';
import '../styles/login.css';

// 유효성 검사 스키마
const schema = yup.object({
  userId: yup.string().required('아이디를 입력해주세요'),
  userPw: yup.string().required('비밀번호를 입력해주세요'),
});

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userId: Cookies.get('rememberedUserId') || '',
    },
  });

  // 로그인 처리
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      
      if (response.alertIcon === 'success' && response.resData) {
        const { member, accessToken, refreshToken } = response.resData;
        
        // 로그인 성공
        setAuth(member, accessToken, refreshToken);
        
        // 아이디 저장
        if (rememberMe) {
          Cookies.set('rememberedUserId', data.userId, { expires: 30 });
        } else {
          Cookies.remove('rememberedUserId');
        }
        
        toast.success('로그인에 성공했습니다');
        navigate('/home');
      } else {
        toast.error(response.clientMsg || '아이디 또는 비밀번호를 확인해주세요');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('로그인 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-paper">
        <div className="login-header">
          <div className="login-logo">
            <Logo size="large" />
          </div>
          <h1 className="login-title">로그인</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          {/* 아이디 */}
          <div className="login-form-group">
            <input
              className={`login-input ${errors.userId ? 'error' : ''}`}
              placeholder="아이디"
              {...register('userId')}
              autoComplete="username"
            />
            {errors.userId && (
              <div className="form-error">{errors.userId.message}</div>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="login-form-group">
            <input
              className={`login-input ${errors.userPw ? 'error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              {...register('userPw')}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
            {errors.userPw && (
              <div className="form-error">{errors.userPw.message}</div>
            )}
          </div>

          {/* 아이디 저장 */}
          <div className="login-remember">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">아이디 저장</label>
          </div>

          {/* 로그인 버튼 */}
          <button
            className="login-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              '로그인'
            )}
          </button>

          <div className="login-divider">
            <span>또는</span>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="button"
            className="signup-button"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>

          {/* 아이디/비밀번호 찾기 링크 */}
          <div className="login-links">
            <Link to="/find-account" className="login-link">
              아이디/비밀번호를 잊으셨나요?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 