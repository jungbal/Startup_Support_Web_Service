import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail } from '../../api/postApi';
import useAuthStore from '../../store/authStore';
import './PostView.css';

const PostView = function() {
  const { postType, postNo } = useParams();
  const navigate = useNavigate();
  const { isLogin, user } = useAuthStore();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false); // 중복 호출 방지
  
  // 게시판 타입별 제목 설정
  const getBoardTitle = function() {
    switch(postType) {
      case 'notice': return '공지사항';
      case 'common': return '자유게시판';
      case 'qna': return 'Q&A';
      default: return '게시판';
    }
  };
  
  // 게시글 상세정보 불러오기
  useEffect(function() {
    // postNo가 변경되면 fetchedRef 리셋
    fetchedRef.current = false;
    fetchPostDetail();
  }, [postNo]);
  
  const fetchPostDetail = function() {
    // 이미 조회한 경우 중복 호출 방지
    if (fetchedRef.current) {
      return;
    }
    
    setLoading(true);
    setError(null);
    fetchedRef.current = true; // 호출 시작 시 플래그 설정
    
    getPostDetail(postNo)
      .then(function(response) {
        setPost(response.data);
      })
      .catch(function(error) {
        console.error('게시글 조회 실패:', error);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
        fetchedRef.current = false; // 에러 발생 시 플래그 리셋
      })
      .finally(function() {
        setLoading(false);
      });
  };
  
  // 목록으로 돌아가기
  const handleGoBack = function() {
    navigate(`/community/${postType}`);
  };
  
  // 수정 버튼 클릭
  const handleEditClick = function() {
    if (!isLogin) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    
    // 작성자 본인이거나 관리자인지 확인
    if (post.userNo !== user?.userNo && user?.userLevel !== 1) {
      alert('수정 권한이 없습니다.');
      return;
    }
    
    navigate(`/community/${postType}/edit/${postNo}`);
  };
  
  // 삭제 버튼 클릭
  const handleDeleteClick = function() {
    if (!isLogin) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    
    // 작성자 본인이거나 관리자인지 확인
    if (post.userNo !== user?.userNo && user?.userLevel !== 1) {
      alert('삭제 권한이 없습니다.');
      return;
    }
    
    if (confirm('정말로 삭제하시겠습니까?')) {
      // 삭제 로직은 나중에 구현
      alert('삭제 기능은 추후 구현됩니다.');
    }
  };
  
  // 신고 버튼 클릭
  const handleReportClick = function() {
    if (!isLogin) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    
    // 본인 글은 신고 불가
    if (post.userNo === user?.userNo) {
      alert('본인이 작성한 글은 신고할 수 없습니다.');
      return;
    }
    
    // 신고 로직은 나중에 구현
    alert('신고 기능은 추후 구현됩니다.');
  };
  
  // 날짜 포맷팅
  const formatDate = function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 상태 표시 한글 변환
  const getStatusText = function(status) {
    return status === 'public' ? '공개' : '비공개';
  };
  
  if (loading) {
    return <div className="loading">게시글을 불러오는 중...</div>;
  }
  
  if (error) {
    return (
      <div className="error-wrap">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={handleGoBack}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="error-wrap">
        <div className="error-message">게시글을 찾을 수 없습니다.</div>
        <button className="btn-back" onClick={handleGoBack}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div className="post-view-wrap">
      <div className="post-view-header">
        <div className="breadcrumb">
          <span className="board-title">{getBoardTitle()}</span>
          <span className="separator"> &gt; </span>
          <span className="current">게시글 상세보기</span>
        </div>
        <button className="btn-back" onClick={handleGoBack}>
          목록으로
        </button>
      </div>
      
      <div className="post-view-container">
        <div className="post-header">
          <div className="post-title-row">
            <h2 className="post-title">{post.postTitle}</h2>
            {post.postStatus === 'private' && (
              <span className="status-badge">비공개</span>
            )}
          </div>
          
          <div className="post-meta">
            <div className="post-info">
              <span className="info-item">
                <strong>작성자:</strong> {post.userName}
              </span>
              <span className="info-item">
                <strong>작성일:</strong> {formatDate(post.postDate)}
              </span>
              <span className="info-item">
                <strong>조회수:</strong> {post.readCount}
              </span>
              <span className="info-item">
                <strong>신고수:</strong> {post.reportCount || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="post-content">
          <div className="content-text">
            {post.postContent}
          </div>
        </div>
        
        <div className="post-actions">
          <div className="action-buttons">
            {/* 공지사항이 아닌 경우에만 신고 버튼 표시 */}
            {postType !== 'notice' && (
              <button className="btn-report" onClick={handleReportClick}>
                신고
              </button>
            )}
            
            {/* 작성자 본인이거나 관리자인 경우에만 수정/삭제 버튼 표시 */}
            {(isLogin && (post.userNo === user?.userNo || user?.userLevel === 1)) && (
              <>
                <button className="btn-edit" onClick={handleEditClick}>
                  수정
                </button>
                <button className="btn-delete" onClick={handleDeleteClick}>
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostView; 