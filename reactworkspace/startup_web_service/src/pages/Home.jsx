import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Home = () => {
  const { loginMember, isLogined } = useAuthStore();
  const navigate = useNavigate();
  
  const handleMyPageClick = () => {
    navigate('/mypage');
  };
  
  const handleLoginClick = () => {
    navigate('/login');
  };
  
  const handleSignUpClick = () => {
    navigate('/signup');
  };
  
  return (

      <div className="home-content">
        <div className="home-header">
          <p className="home-subtitle">창업을 든든하게 지원해드립니다</p>
          {isLogined && (
            <p className="home-welcome">환영합니다, {loginMember?.userName}님!</p>
          )}
        </div>

        <div className="home-nav">
          <h2 className="home-nav-title">주요 서비스</h2>
          <div className="home-nav-grid">
            <div className="home-nav-item" onClick={() => navigate('/commercial')}>
              <span className="home-nav-item-icon">🔍</span>
              <h3 className="home-nav-item-title">상권 검색</h3>
              <p className="home-nav-item-desc">업종별 상권 정보와 분석 데이터 제공</p>
            </div>
            <div className="home-nav-item" onClick={() => navigate('/market/list')}>
              <span className="home-nav-item-icon">🛍️</span>
              <h3 className="home-nav-item-title">마켓</h3>
              <p className="home-nav-item-desc">창업 관련 물품 거래 플랫폼</p>
            </div>
            <div className="home-nav-item" onClick={() => navigate('/community')}>
              <span className="home-nav-item-icon">💬</span>
              <h3 className="home-nav-item-title">커뮤니티</h3>
              <p className="home-nav-item-desc">창업자들의 정보 공유 및 소통 공간</p>
            </div>
            <div className="home-nav-item" onClick={() => navigate('/service')}>
              <span className="home-nav-item-icon">💰</span>
              <h3 className="home-nav-item-title">보조금 조회</h3>
              <p className="home-nav-item-desc">창업 관련 정부 지원 사업 정보</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Home; 