import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Swal from 'sweetalert2';
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

function Login() {
  const navigate = useNavigate();
  
  // 스토리지에 저장한 데이터 추출하기
  const {setIsLogined, setLoginMember, setAccessToken, setRefreshToken} = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 로그인 처리
  const onSubmit = (data) => {
    setIsLoading(true);
    
    if(data.userId == '' || data.userPw == ''){
      Swal.fire({
        title : '알림',
        text : '아이디 또는 비밀번호를 입력하세요.',
        icon : 'warning',
        confirmButtonText : '확인'
      });
      setIsLoading(false);
      return;
    }
    
    login(data)
    .then(function(res){
      /*
      res.data                        == ResponseDTO
      res.data.resData                == LoginMember
      res.data.resData.member         == Member
      res.data.resData.accessToken    == 요청시마다 헤더에 포함시킬 토큰
      res.data.resData.refreshToken   == accessToken 만료 시, 재발급 요청할 때 필요한 토큰
      */
      if(res.data.resData == null){
        // SweetAlert2가 인터셉터에서 이미 처리함
      } else {
        // 정상 로그인 (스토리지 데이터 변경)
        const loginMember = res.data.resData; // LoginMember 객체
        
        setIsLogined(true);
        setLoginMember(loginMember.member);
        // 스토리지에 토큰 저장
        setAccessToken(loginMember.accessToken);
        setRefreshToken(loginMember.refreshToken);
        
        // Home 컴포넌트로 전환
        navigate('/home');
      }
    })
    .catch(function(err){
      console.log(err);
    })
    .finally(function(){
      setIsLoading(false);
    });
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

        <form className="login-form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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
              onClick={function() { setShowPassword(!showPassword); }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
            {errors.userPw && (
              <div className="form-error">{errors.userPw.message}</div>
            )}
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
            onClick={function() { navigate('/signup'); }}
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