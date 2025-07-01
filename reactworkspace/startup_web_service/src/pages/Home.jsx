import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Home = () => {
  const { loginMember, logout, isLogined } = useAuthStore();
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
            <div className="home-nav-item">
              <span className="home-nav-item-icon">🚀</span>
              <h3 className="home-nav-item-title">창업 지원</h3>
              <p className="home-nav-item-desc">사업계획서 작성부터 자금 조달까지</p>
            </div>
            <div className="home-nav-item" onClick={() => navigate('/commercial')}>
              <span className="home-nav-item-icon">📊</span>
              <h3 className="home-nav-item-title">상권 분석</h3>
              <p className="home-nav-item-desc">업종별 시장 동향과 경쟁 분석</p>
            </div>
            <div className="home-nav-item" onClick={function(){
              navigate('/market/list')
            }}>
              <span className="home-nav-item-icon">🛍️</span>
              <h3 className="home-nav-item-title">창업 마켓</h3>
              <p className="home-nav-item-desc">창업 관련 물품 거래 플랫폼</p>
            </div>
            <div className="home-nav-item">
              <span className="home-nav-item-icon">💼</span>
              <h3 className="home-nav-item-title">비즈니스 네트워킹</h3>
              <p className="home-nav-item-desc">동업자 및 파트너 매칭 서비스</p>
            </div>
            <div className="home-nav-item">
              <span className="home-nav-item-icon">📚</span>
              <h3 className="home-nav-item-title">교육 및 멘토링</h3>
              <p className="home-nav-item-desc">창업 노하우와 전문가 멘토링</p>
            </div>
            <div className="home-nav-item">
              <span className="home-nav-item-icon">💬</span>
              <h3 className="home-nav-item-title">커뮤니티</h3>
              <p className="home-nav-item-desc">창업자들의 정보 공유 공간</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Home; 