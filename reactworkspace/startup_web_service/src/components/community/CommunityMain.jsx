import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './CommunityMain.css';

const CommunityMain = function() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 현재 경로에서 활성 탭 결정
  const getActiveTab = function() {
    if (location.pathname.includes('/community/notice')) return 'notice';
    if (location.pathname.includes('/community/qna')) return 'qna';
    return 'common'; // 기본값은 자유게시판
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  const handleTabClick = function(tabType) {
    setActiveTab(tabType);
    navigate(`/community/${tabType}`);
  };
  
  return (
    <div className="community-wrap">
      <div className="community-header">
        <h2>커뮤니티</h2>
        <p>창업 정보를 공유하고 소통하는 공간입니다</p>
      </div>
      
      <div className="community-tabs">
        <button 
          className={`tab-btn ${activeTab === 'notice' ? 'active' : ''}`}
          onClick={function() { handleTabClick('notice'); }}
        >
          공지사항
        </button>
        <button 
          className={`tab-btn ${activeTab === 'common' ? 'active' : ''}`}
          onClick={function() { handleTabClick('common'); }}
        >
          자유게시판
        </button>
        <button 
          className={`tab-btn ${activeTab === 'qna' ? 'active' : ''}`}
          onClick={function() { handleTabClick('qna'); }}
        >
          Q&A
        </button>
      </div>
      
      <div className="community-content">
        <Outlet />
      </div>
    </div>
  );
};

export default CommunityMain; 