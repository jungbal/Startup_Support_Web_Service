import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost } from '../../api/postApi';
import useAuthStore from '../../store/authStore';
import SimpleEditor from './SimpleEditor';
import Swal from 'sweetalert2';
import './PostWrite.css';

const PostWrite = function() {
  const { postType } = useParams();
  const navigate = useNavigate();
  const { isLogined, user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    postTitle: '',
    postContent: '',
    postType: postType || 'common'
  });
  
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 컴포넌트 마운트 시 토큰 동기화
  useEffect(function() {
    const syncTokenFromStorage = function() {
      const { accessToken, isLogined } = useAuthStore.getState();
      
      // Zustand store에 토큰이 없지만 localStorage에는 있을 수 있음
      if (!accessToken) {
        const storageData = localStorage.getItem('auth-storage');
        if (storageData) {
          try {
            const parsed = JSON.parse(storageData);
            if (parsed.state && parsed.state.accessToken) {
              const state = useAuthStore.getState();
              state.setAccessToken(parsed.state.accessToken);
              state.setIsLogined(parsed.state.isLogined || true);
              state.setLoginMember(parsed.state.loginMember);
              if (parsed.state.refreshToken) {
                state.setRefreshToken(parsed.state.refreshToken);
              }
              // user 정보도 동기화
              if (parsed.state.user || parsed.state.loginMember) {
                state.user = parsed.state.user || parsed.state.loginMember;
              }
            }
          } catch (error) {
            console.error('localStorage 파싱 오류:', error);
          }
        }
      }
    };
    
    syncTokenFromStorage();
  }, []);
  
  // 로그인 체크
  if (!isLogined) {
    // localStorage에서 토큰 확인 후 재시도
    const storageData = localStorage.getItem('auth-storage');
    if (storageData) {
      try {
        const parsed = JSON.parse(storageData);
        if (parsed.state && parsed.state.accessToken) {
          // 토큰이 있으면 새로고침하여 상태 동기화
          window.location.reload();
          return null;
        }
      } catch (error) {
        console.error('localStorage 확인 오류:', error);
      }
    }
    
    Swal.fire({
      icon: 'warning',
      title: '로그인 필요',
      text: '로그인이 필요한 서비스입니다.',
      confirmButtonText: '확인'
    }).then(function() {
      navigate('/login');
    });
    return null;
  }
  
  // 공지사항 권한 체크
  if (postType === 'notice' && user?.userLevel !== 1) {
    Swal.fire({
      icon: 'error',
      title: '권한 없음',
      text: '공지사항은 관리자만 작성할 수 있습니다.',
      confirmButtonText: '확인'
    }).then(function() {
      navigate(`/community/${postType}`);
    });
    return null;
  }
  
  // 게시판 타입별 제목 설정
  const getBoardTitle = function() {
    switch(postType) {
      case 'notice': return '공지사항';
      case 'common': return '자유게시판';
      case 'qna': return 'Q&A';
      default: return '게시판';
    }
  };
  
  // 제목 입력 핸들러
  const handleTitleChange = function(e) {
    setFormData({
      ...formData,
      postTitle: e.target.value
    });
  };
  
  // 내용 입력 핸들러 (ToastEditor에서 호출)
  const handleContentChange = function(content) {
    setFormData({
      ...formData,
      postContent: content
    });
  };
  

  
  // 파일 선택 핸들러
  const handleFileChange = function(e) {
    const files = Array.from(e.target.files);
    
    // 기존 파일과 새 파일 합쳐서 5개 제한
    const totalFiles = attachedFiles.length + files.length;
    if (totalFiles > 5) {
      Swal.fire({
        icon: 'warning',
        title: '파일 개수 초과',
        text: '첨부파일은 최대 5개까지 업로드할 수 있습니다.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024;
    for (let file of files) {
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'warning',
          title: '파일 크기 초과',
          text: `${file.name}은 파일 크기가 너무 큽니다. (최대 10MB)`,
          confirmButtonText: '확인'
        });
        return;
      }
    }
    
    setAttachedFiles([...attachedFiles, ...files]);
    e.target.value = ''; // 파일 선택 초기화
  };
  
  // 파일 제거 핸들러
  const handleFileRemove = function(index) {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
  };
  
  // 폼 제출 핸들러
  const handleSubmit = function(e) {
    e.preventDefault();
    
    // 입력값 검증
    if (!formData.postTitle.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '제목 누락',
        text: '제목을 입력해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    if (!formData.postContent.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '내용 누락',
        text: '내용을 입력해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'question',
      title: '게시글 등록',
      text: '게시글을 등록하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '등록',
      cancelButtonText: '취소'
    }).then(function(result) {
      if (result.isConfirmed) {
        submitPost();
      }
    });
  };
  
  // 게시글 등록
  const submitPost = function() {
    setLoading(true);
    
    let { accessToken } = useAuthStore.getState();
    
    // Zustand store에 토큰이 없으면 localStorage에서 직접 가져오기
    if (!accessToken) {
      const storageData = localStorage.getItem('auth-storage');
      if (storageData) {
        try {
          const parsed = JSON.parse(storageData);
          if (parsed.state && parsed.state.accessToken) {
            accessToken = parsed.state.accessToken;
            
            // Zustand store도 업데이트
            const state = useAuthStore.getState();
            state.setAccessToken(accessToken);
            state.setIsLogined(parsed.state.isLogined || true);
            state.setLoginMember(parsed.state.loginMember);
            if (parsed.state.refreshToken) {
              state.setRefreshToken(parsed.state.refreshToken);
            }
          }
        } catch (error) {
          console.error('localStorage 파싱 오류:', error);
        }
      }
    }
    
    if (!accessToken) {
      Swal.fire({
        icon: 'warning',
        title: '로그인 필요',
        text: '로그인이 필요한 서비스입니다.',
        confirmButtonText: '확인'
      }).then(function() {
        navigate('/login');
      });
      return;
    }
    
    // FormData 생성 (파일 업로드를 위해)
    const formDataToSend = new FormData();
    formDataToSend.append('postTitle', formData.postTitle);
    formDataToSend.append('postContent', formData.postContent);
    formDataToSend.append('postType', formData.postType);
    
    // 첨부파일 추가
    for (let i = 0; i < attachedFiles.length; i++) {
      formDataToSend.append('attachedFiles', attachedFiles[i]);
    }
    
    createPost(formDataToSend)
      .then(function(response) {
        Swal.fire({
          icon: 'success',
          title: '등록 완료',
          text: '게시글이 성공적으로 등록되었습니다.',
          confirmButtonText: '확인'
        }).then(function() {
          navigate(`/community/${postType}`);
        });
      })
      .catch(function(error) {
        if (error.response?.status === 403) {
          Swal.fire({
            icon: 'warning',
            title: '로그인 만료',
            text: '로그인이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.',
            confirmButtonText: '확인'
          }).then(function() {
            useAuthStore.getState().logout();
            navigate('/login');
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '등록 실패',
            text: '게시글 등록 중 오류가 발생했습니다.',
            confirmButtonText: '확인'
          });
        }
      })
      .finally(function() {
        setLoading(false);
      });
  };
  
  // 취소 버튼 핸들러
  const handleCancel = function() {
    Swal.fire({
      icon: 'question',
      title: '작성 취소',
      text: '작성을 취소하시겠습니까? 작성한 내용이 사라집니다.',
      showCancelButton: true,
      confirmButtonText: '취소',
      cancelButtonText: '계속 작성',
      confirmButtonColor: '#d33'
    }).then(function(result) {
      if (result.isConfirmed) {
        navigate(`/community/${postType}`);
      }
    });
  };
  
  return (
    <div className="post-write-wrap">
      <div className="post-write-header">
        <div className="breadcrumb">
          <span className="board-title">{getBoardTitle()}</span>
          <span className="separator"> &gt; </span>
          <span className="current">글쓰기</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="post-write-form">
        <div className="form-group">
          <label htmlFor="postTitle">제목 *</label>
          <input
            type="text"
            id="postTitle"
            value={formData.postTitle}
            onChange={handleTitleChange}
            placeholder="제목을 입력해주세요"
            maxLength={100}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="postContent">내용 *</label>
          <SimpleEditor
            initialValue=""
            onChange={handleContentChange}
            height="400px"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fileInput">첨부파일 (최대 5개)</label>
          <input
            type="file"
            id="fileInput"
            multiple
            onChange={handleFileChange}
            accept="*/*"
            className="file-input"
          />
          <div className="file-info">
            <p>* 파일 크기는 최대 10MB까지 업로드 가능합니다.</p>
          </div>
          
          {attachedFiles.length > 0 && (
            <div className="attached-files">
              <h4>첨부된 파일 ({attachedFiles.length}/5)</h4>
              <ul className="file-list">
                {attachedFiles.map((file, index) => (
                  <li key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)}KB)</span>
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => handleFileRemove(index)}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostWrite; 