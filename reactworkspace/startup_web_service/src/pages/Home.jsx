import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  console.log('Home 컴포넌트 렌더링됨');
  console.log('navigate 함수:', navigate);
  
  const handleMyPageClick = () => {
    console.log('마이페이지 버튼 클릭됨');
    console.log('navigate 호출 전');
    navigate('/mypage');
    console.log('navigate 호출 후');
  };
  
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">창업든든</h1>
        <p className="home-welcome">환영합니다, {user?.userName}님!</p>
        <p className="home-subtitle">창업을 든든하게 지원해드립니다</p>
      </div>

      <div className="home-nav">
        <h2 className="home-nav-title">주요 서비스</h2>
        <div className="home-nav-grid">
          <div className="home-nav-item">
            <span className="home-nav-item-icon">🚀</span>
            <h3 className="home-nav-item-title">창업 지원</h3>
            <p className="home-nav-item-desc">사업계획서 작성부터 자금 조달까지</p>
          </div>
          <div className="home-nav-item">
            <span className="home-nav-item-icon">📊</span>
            <h3 className="home-nav-item-title">시장 분석</h3>
            <p className="home-nav-item-desc">업종별 시장 동향과 경쟁 분석</p>
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
        </div>
      </div>

      <div className="home-footer">
        <button 
          className="home-mypage-btn" 
          onClick={handleMyPageClick}
          style={{ 
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          마이페이지
        </button>
        <button className="home-logout-btn" onClick={logout}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Home; 