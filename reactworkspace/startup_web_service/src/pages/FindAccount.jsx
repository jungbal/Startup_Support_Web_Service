import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowBack } from '@mui/icons-material';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import { findUserId, findUserPw } from '../api/memberApi';

// CSS 파일 import
import '../styles/common.css';
import '../styles/findaccount.css';

// 아이디 찾기 스키마
const findIdSchema = yup.object({
  userEmail: yup
    .string()
    .required('이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
});

// 비밀번호 찾기 스키마
const findPwSchema = yup.object({
  userId: yup.string().required('아이디를 입력해주세요'),
  userEmail: yup
    .string()
    .required('이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
});

const FindAccount = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('id'); // 'id' 또는 'password'
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState('');
  const [tempPasswordSent, setTempPasswordSent] = useState('');

  // 아이디 찾기 폼
  const {
    register: registerFindId,
    handleSubmit: handleSubmitFindId,
    formState: { errors: errorsFindId },
  } = useForm({
    resolver: yupResolver(findIdSchema),
  });

  // 비밀번호 찾기 폼
  const {
    register: registerFindPw,
    handleSubmit: handleSubmitFindPw,
    formState: { errors: errorsFindPw },
  } = useForm({
    resolver: yupResolver(findPwSchema),
  });

  // 아이디 찾기 처리
  const onSubmitFindId = async (data) => {
    setIsLoading(true);
    setEmailSent('');
    
    try {
      const response = await findUserId(data.userEmail);
      
      if (response.alertIcon === 'success' && response.resData) {
        setEmailSent(response.clientMsg);
        toast.success(response.clientMsg);
      } else {
        toast.error(response.clientMsg || '해당 이메일로 가입된 회원이 없습니다');
      }
    } catch (error) {
      console.error('Find ID error:', error);
      toast.error('아이디 찾기 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 찾기 처리
  const onSubmitFindPw = async (data) => {
    setIsLoading(true);
    setTempPasswordSent('');
    
    try {
      const response = await findUserPw(data.userId, data.userEmail);
      
      if (response.alertIcon === 'success' && response.resData) {
        setTempPasswordSent(response.clientMsg);
        toast.success(response.clientMsg);
      } else {
        toast.error(response.clientMsg || '아이디 또는 이메일을 확인해주세요');
      }
    } catch (error) {
      console.error('Find PW error:', error);
      toast.error('비밀번호 찾기 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="findaccount-container">
      <div className="findaccount-paper">
        <div className="findaccount-header">
          <div className="findaccount-logo">
            <Logo size="large" />
          </div>
          <h1 className="findaccount-title">아이디/비밀번호 찾기</h1>
        </div>

        {/* 탭 메뉴 */}
        <div className="findaccount-tabs">
          <button
            className={`findaccount-tab ${activeTab === 'id' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('id');
              setEmailSent('');
              setTempPasswordSent('');
            }}
          >
            아이디 찾기
          </button>
          <button
            className={`findaccount-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('password');
              setEmailSent('');
              setTempPasswordSent('');
            }}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 아이디 찾기 탭 */}
        <div className={`findaccount-tab-content ${activeTab === 'id' ? 'active' : ''}`}>
          <form className="findaccount-form" onSubmit={handleSubmitFindId(onSubmitFindId)}>
            <div className="findaccount-description">
              가입 시 등록한 이메일 주소를 입력하시면, 아이디를 알려드립니다.
            </div>

            <div className="findaccount-form-group">
              <input
                className={`findaccount-input ${errorsFindId.userEmail ? 'error' : ''}`}
                type="email"
                placeholder="이메일"
                {...registerFindId('userEmail')}
              />
              {errorsFindId.userEmail && (
                <div className="form-error">{errorsFindId.userEmail.message}</div>
              )}
            </div>

            {/* 이메일 발송 안내 메시지 */}
            {emailSent && (
              <div className="findaccount-result">
                <p className="findaccount-result-text">{emailSent}</p>
              </div>
            )}

            <button
              className="findaccount-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                '아이디 찾기'
              )}
            </button>
          </form>
        </div>

        {/* 비밀번호 찾기 탭 */}
        <div className={`findaccount-tab-content ${activeTab === 'password' ? 'active' : ''}`}>
          <form className="findaccount-form" onSubmit={handleSubmitFindPw(onSubmitFindPw)}>
            <div className="findaccount-description">
              아이디와 가입 시 등록한 이메일 주소를 입력하시면, 임시 비밀번호를 발급해드립니다.
            </div>

            <div className="findaccount-form-group">
              <input
                className={`findaccount-input ${errorsFindPw.userId ? 'error' : ''}`}
                placeholder="아이디"
                {...registerFindPw('userId')}
              />
              {errorsFindPw.userId && (
                <div className="form-error">{errorsFindPw.userId.message}</div>
              )}
            </div>

            <div className="findaccount-form-group">
              <input
                className={`findaccount-input ${errorsFindPw.userEmail ? 'error' : ''}`}
                type="email"
                placeholder="이메일"
                {...registerFindPw('userEmail')}
              />
              {errorsFindPw.userEmail && (
                <div className="form-error">{errorsFindPw.userEmail.message}</div>
              )}
            </div>

            {/* 임시 비밀번호 발송 안내 메시지 */}
            {tempPasswordSent && (
              <div className="findaccount-result">
                <p className="findaccount-result-text">{tempPasswordSent}</p>
                <div className="findaccount-password-notice">
                  로그인 후 반드시 비밀번호를 변경해주세요.
                </div>
              </div>
            )}

            <button
              className="findaccount-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                '비밀번호 찾기'
              )}
            </button>
          </form>
        </div>

        {/* 뒤로가기 버튼 */}
        <button
          className="findaccount-back-button"
          onClick={() => navigate('/login')}
        >
          <ArrowBack />
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default FindAccount; 