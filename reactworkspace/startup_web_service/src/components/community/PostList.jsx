import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostList } from '../../api/postApi';
import PageNavi from '../common/PageNavi';
import useAuthStore from '../../store/authStore';
import './PostList.css';

const PostList = function() {
  const { postType } = useParams();
  const navigate = useNavigate();
  const { isLogin, user } = useAuthStore();
  
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // 게시판 타입별 제목 설정
  const getBoardTitle = function() {
    switch(postType) {
      case 'notice': return '공지사항';
      case 'common': return '자유게시판';
      case 'qna': return 'Q&A';
      default: return '게시판';
    }
  };
  
  // 게시글 목록 불러오기
  useEffect(function() {
    fetchPosts();
  }, [postType, currentPage]);
  
  const fetchPosts = function() {
    setLoading(true);
    getPostList(postType, currentPage)
      .then(function(response) {
        setPosts(response.data.list);
        setPageInfo(response.data.pi);
        setTotalCount(response.data.totalCount || 0); // totalCount 저장
      })
      .catch(function(error) {
        console.error('게시글 목록 조회 실패:', error);
      })
      .finally(function() {
        setLoading(false);
      });
  };
  
  // 게시글 상세보기
  const handlePostClick = function(postNo) {
    navigate(`/community/${postType}/view/${postNo}`);
  };
  
  // 글쓰기 버튼 클릭
  const handleWriteClick = function() {
    if (!isLogin) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    
    // 공지사항은 슈퍼관리자만 작성 가능
    if (postType === 'notice' && user?.userLevel !== 1) {
      alert('공지사항은 관리자만 작성할 수 있습니다.');
      return;
    }
    
    navigate(`/community/${postType}/write`);
  };
  
  // 순차적 게시글 번호 계산 함수
  const calculatePostNumber = function(index) {
    // 페이지당 게시글 수 (백엔드와 동일하게 설정)
    const postsPerPage = 10;
    // 전체 게시글 수에서 현재 페이지와 인덱스를 고려하여 계산
    return totalCount - ((currentPage - 1) * postsPerPage) - index;
  };
  
  // 날짜 포맷팅
  const formatDate = function(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR').replace(/\.$/, '');
    }
  };
  
  if (loading) {
    return <div className="loading">로딩중...</div>;
  }
  
  return (
    <div className="post-list-wrap">
      <div className="post-list-header">
        <h3>{getBoardTitle()}</h3>
        {(postType !== 'notice' || (postType === 'notice' && user?.userLevel === 1)) && (
          <button className="write-btn" onClick={handleWriteClick}>
            글쓰기
          </button>
        )}
      </div>
      
      <div className="post-list-table">
        <div className="table-header">
          <div className="col-no">번호</div>
          <div className="col-title">제목</div>
          <div className="col-writer">작성자</div>
          <div className="col-date">작성일</div>
          <div className="col-read">조회수</div>
        </div>
        
        {posts.length === 0 ? (
          <div className="no-data">등록된 게시글이 없습니다.</div>
        ) : (
          posts.map(function(post, index) {
            return (
              <div 
                key={post.postNo} 
                className="table-row"
                onClick={function() { handlePostClick(post.postNo); }}
              >
                <div className="col-no">
                  {postType === 'notice' ? 
                    <span className="notice-badge">공지</span> : 
                    calculatePostNumber(index)
                  }
                </div>
                <div className="col-title">
                  {post.postTitle}
                  {post.postStatus === 'private' && 
                    <span className="status-badge">비공개</span>
                  }
                </div>
                <div className="col-writer">{post.userName}</div>
                <div className="col-date">{formatDate(post.postDate)}</div>
                <div className="col-read">{post.readCount}</div>
              </div>
            );
          })
        )}
      </div>
      
      {pageInfo && (
        <PageNavi 
          pageInfo={pageInfo} 
          reqPage={currentPage} 
          setReqPage={setCurrentPage} 
        />
      )}
    </div>
  );
};

export default PostList; 