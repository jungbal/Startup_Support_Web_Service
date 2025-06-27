import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Check,
  Close,
  ArrowBack,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import { signUp, checkUserId, checkUserEmail } from '../api/memberApi';

// CSS 파일 import
import '../styles/common.css';
import '../styles/signup.css';

// 유효성 검사 스키마
const schema = yup.object({
  userId: yup
    .string()
    .required('아이디를 입력해주세요')
    .min(4, '아이디는 최소 4자 이상이어야 합니다')
    .max(20, '아이디는 최대 20자까지 가능합니다')
    .matches(/^[a-zA-Z0-9]+$/, '아이디는 영문과 숫자만 사용 가능합니다'),
  userName: yup
    .string()
    .required('이름을 입력해주세요')
    .min(2, '이름은 최소 2자 이상이어야 합니다'),
  userPw: yup
    .string()
    .required('비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다'
    ),
  confirmPassword: yup
    .string()
    .required('비밀번호 확인을 입력해주세요')
    .oneOf([yup.ref('userPw')], '비밀번호가 일치하지 않습니다'),
  userPhone: yup
    .string()
    .required('전화번호를 입력해주세요')
    .matches(/^010-\d{4}-\d{4}$/, '전화번호 형식이 올바르지 않습니다 (010-0000-0000)'),
  userEmail: yup
    .string()
    .required('이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  userAddr: yup.string().required('주소를 입력해주세요'),
});

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState(null);
  const [checkedId, setCheckedId] = useState('');
  const [emailCheckStatus, setEmailCheckStatus] = useState(null);
  const [checkedEmail, setCheckedEmail] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchUserId = watch('userId');
  const watchPassword = watch('userPw');
  const watchConfirmPassword = watch('confirmPassword');
  const watchPhone = watch('userPhone');
  const watchEmail = watch('userEmail');

  // 아이디가 변경되면 중복체크 상태 초기화
  useEffect(() => {
    if (watchUserId !== checkedId) {
      setIdCheckStatus(null);
      if (errors.userId && errors.userId.message === '이미 사용중인 아이디입니다') {
        clearErrors('userId');
      }
    }
  }, [watchUserId, checkedId, errors.userId, clearErrors]);

  // 이메일이 변경되면 중복체크 상태 초기화
  useEffect(() => {
    if (watchEmail !== checkedEmail) {
      setEmailCheckStatus(null);
      if (errors.userEmail && errors.userEmail.message === '이미 사용중인 이메일입니다') {
        clearErrors('userEmail');
      }
    }
  }, [watchEmail, checkedEmail, errors.userEmail, clearErrors]);

  // 비밀번호 유효성 검사 규칙들
  const passwordRules = [
    {
      rule: '최소 8자 이상',
      isValid: watchPassword && watchPassword.length >= 8,
    },
    {
      rule: '대문자 포함',
      isValid: watchPassword && /[A-Z]/.test(watchPassword),
    },
    {
      rule: '소문자 포함',
      isValid: watchPassword && /[a-z]/.test(watchPassword),
    },
    {
      rule: '숫자 포함',
      isValid: watchPassword && /\d/.test(watchPassword),
    },
    {
      rule: '특수문자 포함',
      isValid: watchPassword && /[@$!%*?&]/.test(watchPassword),
    },
  ];

  const allPasswordRulesValid = passwordRules.every(rule => rule.isValid);
  const passwordsMatch = watchPassword && watchConfirmPassword && watchPassword === watchConfirmPassword;

  // 전화번호 유효성 검사
  const phoneValid = watchPhone && /^010-\d{4}-\d{4}$/.test(watchPhone);
  const phoneFormatCorrect = watchPhone && watchPhone.length === 13 && watchPhone.includes('-');

  // 이메일 유효성 검사
  const emailValid = watchEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchEmail);
  const emailFormatCorrect = watchEmail && watchEmail.includes('@') && watchEmail.includes('.');

  // 아이디 중복 체크 - 팀원들이 배운 방식
  const handleCheckUserId = () => {
    if (!watchUserId) {
      toast.error('아이디를 입력해주세요');
      return;
    }

    clearErrors('userId');
    setIdCheckStatus('checking');
    
    checkUserId(watchUserId)
      .then(function(response) {
        // 팀원들이 배운 방식: response.data에서 확인
        if (response.data && response.data.resData === 0) {
          setIdCheckStatus('available');
          setCheckedId(watchUserId);
          toast.success('사용 가능한 아이디입니다');
        } else {
          setIdCheckStatus('unavailable');
          setError('userId', { message: '이미 사용중인 아이디입니다' });
          toast.error('이미 사용중인 아이디입니다');
        }
      })
      .catch(function(error) {
        setIdCheckStatus(null);
        toast.error('아이디 중복 체크 중 오류가 발생했습니다');
      });
  };

  // 이메일 중복 체크 - 팀원들이 배운 방식
  const handleCheckUserEmail = () => {
    if (!watchEmail) {
      toast.error('이메일을 입력해주세요');
      return;
    }

    clearErrors('userEmail');
    setEmailCheckStatus('checking');
    
    checkUserEmail(watchEmail)
      .then(function(response) {
        // 팀원들이 배운 방식: response.data에서 확인
        if (response.data && response.data.resData === 0) {
          setEmailCheckStatus('available');
          setCheckedEmail(watchEmail);
          toast.success('사용 가능한 이메일입니다');
        } else {
          setEmailCheckStatus('unavailable');
          setError('userEmail', { message: '이미 사용중인 이메일입니다' });
          toast.error('이미 사용중인 이메일입니다');
        }
      })
      .catch(function(error) {
        setEmailCheckStatus(null);
        toast.error('이메일 중복 체크 중 오류가 발생했습니다');
      });
  };

  // 회원가입 처리 - 팀원들이 배운 방식
  const onSubmit = (data) => {
    // 아이디 중복 체크 확인
    if (idCheckStatus !== 'available' || checkedId !== data.userId) {
      toast.error('아이디 중복 체크를 해주세요');
      return;
    }

    // 이메일 중복 체크 확인
    if (emailCheckStatus !== 'available' || checkedEmail !== data.userEmail) {
      toast.error('이메일 중복 체크를 해주세요');
      return;
    }

    setIsLoading(true);
    
    const { confirmPassword, ...signUpData } = data;
    
    signUp(signUpData)
      .then(function(response) {
        // 팀원들이 배운 방식: response.data에서 확인
        if (response.data && response.data.alertIcon === 'success') {
          toast.success('회원가입이 완료되었습니다');
          navigate('/login');
        } else {
          toast.error(response.data?.clientMsg || '회원가입에 실패했습니다');
        }
      })
      .catch(function(error) {
        console.error('SignUp error:', error);
        toast.error('회원가입 중 오류가 발생했습니다');
      })
      .finally(function() {
        setIsLoading(false);
      });
  };

  return (
    <div className="signup-container">
      <div className="signup-paper">
        <div className="signup-header">
          <div className="signup-logo">
            <Logo size="large" />
          </div>
          <h1 className="signup-title">회원가입</h1>
        </div>

        <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
          {/* 아이디 */}
          <div className="signup-form-group has-button">
            <input
              className={`signup-input signup-input-with-button ${errors.userId ? 'error' : ''}`}
              placeholder="아이디"
              {...register('userId')}
              autoComplete="username"
            />
            <button
              type="button"
              className={`signup-check-button ${
                idCheckStatus === 'available' ? 'success' : 
                idCheckStatus === 'unavailable' ? 'error' : ''
              }`}
              onClick={handleCheckUserId}
              disabled={idCheckStatus === 'checking' || !watchUserId}
            >
              {idCheckStatus === 'checking' ? (
                <div className="loading-spinner" style={{width: '16px', height: '16px'}} />
              ) : (
                '중복확인'
              )}
            </button>
          </div>
          {errors.userId && (
            <div className="form-error" style={{marginTop: '-10px', marginBottom: '10px'}}>{errors.userId.message}</div>
          )}

          {/* 이름 */}
          <div className="signup-form-group">
            <input
              className={`signup-input ${errors.userName ? 'error' : ''}`}
              placeholder="이름"
              {...register('userName')}
              autoComplete="name"
            />
            {errors.userName && (
              <div className="form-error">{errors.userName.message}</div>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="signup-form-group">
            <input
              className={`signup-input ${errors.userPw ? 'error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              {...register('userPw')}
              autoComplete="new-password"
              onFocus={() => setPasswordFocused(true)}
            />
            <button
              type="button"
              className="signup-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
            {errors.userPw && (
              <div className="form-error">{errors.userPw.message}</div>
            )}
          </div>
          
          {/* 비밀번호 규칙 */}
          {(passwordFocused || watchPassword) && (
            <div className="password-rules">
              <div className="password-rules-title">비밀번호 조건</div>
              <ul className="password-rule-list">
                {passwordRules.map((rule, index) => (
                  <li key={index} className="password-rule-item">
                    {rule.isValid ? (
                      <CheckCircle className="password-rule-icon valid" />
                    ) : (
                      <Cancel className="password-rule-icon invalid" />
                    )}
                    <span className={`password-rule-text ${rule.isValid ? 'valid' : 'invalid'}`}>
                      {rule.rule}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 비밀번호 확인 */}
          <div className="signup-form-group">
            <input
              className={`signup-input ${errors.confirmPassword ? 'error' : ''}`}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호 확인"
              {...register('confirmPassword')}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="signup-password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
            </button>
            {errors.confirmPassword && (
              <div className="form-error">{errors.confirmPassword.message}</div>
            )}
          </div>
          
          {/* 비밀번호 일치 확인 */}
          {watchConfirmPassword && (
            <div className={`password-match ${passwordsMatch ? 'valid' : 'invalid'}`}>
              {passwordsMatch ? <Check /> : <Close />}
              <span>
                {passwordsMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
              </span>
            </div>
          )}

          {/* 전화번호 */}
          <div className="signup-form-group">
            <input
              className={`signup-input ${errors.userPhone ? 'error' : ''}`}
              placeholder="전화번호 (010-0000-0000)"
              {...register('userPhone')}
              autoComplete="tel"
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
            {errors.userPhone && (
              <div className="form-error">{errors.userPhone.message}</div>
            )}
          </div>
          
          {/* 전화번호 유효성 표시 */}
          {(phoneFocused || watchPhone) && watchPhone && (
            <div className={`field-validation ${phoneValid ? 'valid' : 'invalid'}`} style={{marginTop: '-10px', marginBottom: '10px'}}>
              {phoneValid ? <Check /> : <Close />}
              <span>
                {phoneValid ? '올바른 전화번호 형식입니다' : '전화번호 형식을 확인해주세요 (010-0000-0000)'}
              </span>
            </div>
          )}

          {/* 이메일 */}
          <div className="signup-form-group has-button">
            <input
              className={`signup-input signup-input-with-button ${errors.userEmail ? 'error' : ''}`}
              type="email"
              placeholder="이메일"
              {...register('userEmail')}
              autoComplete="email"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
            <button
              type="button"
              className={`signup-check-button ${
                emailCheckStatus === 'available' ? 'success' : 
                emailCheckStatus === 'unavailable' ? 'error' : ''
              }`}
              onClick={handleCheckUserEmail}
              disabled={emailCheckStatus === 'checking' || !watchEmail}
            >
              {emailCheckStatus === 'checking' ? (
                <div className="loading-spinner" style={{width: '16px', height: '16px'}} />
              ) : (
                '중복확인'
              )}
            </button>
          </div>
          {errors.userEmail && (
            <div className="form-error" style={{marginTop: '-10px', marginBottom: '10px'}}>{errors.userEmail.message}</div>
          )}
          
          {/* 이메일 유효성 표시 */}
          {(emailFocused || watchEmail) && watchEmail && (
            <div className={`field-validation ${emailValid ? 'valid' : 'invalid'}`} style={{marginTop: '-10px', marginBottom: '10px'}}>
              {emailValid ? <Check /> : <Close />}
              <span>
                {emailValid ? '올바른 이메일 형식입니다' : '이메일 형식을 확인해주세요'}
              </span>
            </div>
          )}

          {/* 주소 */}
          <div className="signup-form-group">
            <textarea
              className={`signup-input signup-input-textarea ${errors.userAddr ? 'error' : ''}`}
              placeholder="주소"
              {...register('userAddr')}
              autoComplete="address-line1"
              rows="3"
            />
            {errors.userAddr && (
              <div className="form-error">{errors.userAddr.message}</div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="signup-buttons">
            <button
              type="button"
              className="signup-cancel-button"
              onClick={() => navigate('/login')}
            >
              <ArrowBack />
              취소
            </button>
            <button
              type="submit"
              className="signup-submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                '회원가입'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp; 