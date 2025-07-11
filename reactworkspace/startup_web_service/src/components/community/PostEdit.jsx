import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail, updatePost } from '../../api/postApi';
import useAuthStore from '../../store/authStore';
import SimpleEditor from './SimpleEditor';
import Swal from 'sweetalert2';
import './PostWrite.css';

const PostEdit = function() {
  const { postType, postNo } = useParams();
  const navigate = useNavigate();
  const { isLogined, user, loginMember } = useAuthStore();
  
  // 사용자 정보 통합 (user 또는 loginMember 중 존재하는 것 사용)
  const currentUser = user || loginMember;
  
  const [formData, setFormData] = useState({
    postTitle: '',
    postContent: '',
    postType: postType || 'common'
  });
  
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 로그인 체크
  if (!isLogined) {
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
  
  // 게시글 데이터 불러오기
  useEffect(function() {
    fetchPostData();
  }, [postNo]);
  
  const fetchPostData = function() {
    setInitialLoading(true);
    getPostDetail(postNo)
      .then(function(response) {
        const post = response.data;
        
        // 권한 체크
        if (post.userId !== currentUser?.userId && currentUser?.userLevel !== 1) {
          Swal.fire({
            icon: 'error',
            title: '권한 없음',
            text: '수정 권한이 없습니다.',
            confirmButtonText: '확인'
          }).then(function() {
            navigate(`/community/${postType}/view/${postNo}`);
          });
          return;
        }
        
        setFormData({
          postTitle: post.postTitle || '',
          postContent: post.postContent || '',
          postType: post.postType || postType
        });
        
        // 기존 첨부파일 설정
        if (post.attachedFiles && post.attachedFiles.length > 0) {
          setExistingFiles(post.attachedFiles);
        }
      })
      .catch(function(error) {
        Swal.fire({
          icon: 'error',
          title: '로드 실패',
          text: '게시글을 불러오는 중 오류가 발생했습니다.',
          confirmButtonText: '확인'
        }).then(function() {
          navigate(`/community/${postType}`);
        });
      })
      .finally(function() {
        setInitialLoading(false);
      });
  };
  
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
  
  // 내용 입력 핸들러
  const handleContentChange = function(content) {
    setFormData({
      ...formData,
      postContent: content
    });
  };
  

  
  // 새 파일 선택 핸들러
  const handleFileChange = function(e) {
    const files = Array.from(e.target.files);
    
    // 기존 파일 + 새 파일 합쳐서 5개 제한
    const totalFiles = existingFiles.length + attachedFiles.length + files.length;
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
    e.target.value = '';
  };
  
  // 새 파일 제거 핸들러
  const handleNewFileRemove = function(index) {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
  };
  
  // 기존 파일 제거 핸들러
  const handleExistingFileRemove = function(index) {
    const fileToDelete = existingFiles[index];
    setDeletedFiles([...deletedFiles, fileToDelete.fileNo]);
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
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
      title: '게시글 수정',
      text: '게시글을 수정하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '수정',
      cancelButtonText: '취소'
    }).then(function(result) {
      if (result.isConfirmed) {
        submitPost();
      }
    });
  };
  
  // 게시글 수정
  const submitPost = function() {
    setLoading(true);
    
    // FormData 생성
    const formDataToSend = new FormData();
    formDataToSend.append('postTitle', formData.postTitle);
    formDataToSend.append('postContent', formData.postContent);
    formDataToSend.append('postType', formData.postType);
    
    // 삭제할 파일 ID 추가
    if (deletedFiles.length > 0) {
      const deletedFilesJson = JSON.stringify(deletedFiles);
      formDataToSend.append('deletedFiles', deletedFilesJson);
    }
    
    // 새 첨부파일 추가
    for (let i = 0; i < attachedFiles.length; i++) {
      formDataToSend.append('attachedFiles', attachedFiles[i]);
    }
    
    updatePost(postNo, formDataToSend)
      .then(function(response) {
        Swal.fire({
          icon: 'success',
          title: '수정 완료',
          text: '게시글이 성공적으로 수정되었습니다.',
          confirmButtonText: '확인'
        }).then(function() {
          navigate(`/community/${postType}/view/${postNo}`);
        });
      })
      .catch(function(error) {
        if (error.response?.status === 401) {
          Swal.fire({
            icon: 'warning',
            title: '로그인 필요',
            text: '로그인이 필요합니다. 다시 로그인해주세요.',
            confirmButtonText: '확인'
          }).then(function() {
            navigate('/login');
          });
        } else if (error.response?.status === 403) {
          Swal.fire({
            icon: 'error',
            title: '권한 없음',
            text: '수정 권한이 없습니다.',
            confirmButtonText: '확인'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '수정 실패',
            text: '게시글 수정 중 오류가 발생했습니다.',
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
      title: '수정 취소',
      text: '수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.',
      showCancelButton: true,
      confirmButtonText: '취소',
      cancelButtonText: '계속 수정',
      confirmButtonColor: '#d33'
    }).then(function(result) {
      if (result.isConfirmed) {
        navigate(`/community/${postType}/view/${postNo}`);
      }
    });
  };
  
  if (initialLoading) {
    return <div className="loading">게시글을 불러오는 중...</div>;
  }
  
  return (
    <div className="post-write-wrap">
      <div className="post-write-header">
        <div className="breadcrumb">
          <span className="board-title">{getBoardTitle()}</span>
          <span className="separator"> &gt; </span>
          <span className="current">글수정</span>
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
            initialValue={formData.postContent}
            onChange={handleContentChange}
            height="400px"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fileInput">첨부파일 (최대 5개)</label>
          
          {/* 기존 첨부파일 목록 */}
          {existingFiles.length > 0 && (
            <div className="attached-files">
              <h4>기존 첨부파일</h4>
              <ul className="file-list">
                {existingFiles.map((file, index) => (
                  <li key={index} className="file-item">
                    <span className="file-name">{file.fileName}</span>
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => handleExistingFileRemove(index)}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 새 파일 업로드 */}
          <input
            type="file"
            id="fileInput"
            multiple
            onChange={handleFileChange}
            accept="*/*"
            className="file-input"
            style={{ marginTop: existingFiles.length > 0 ? '15px' : '0' }}
          />
          <div className="file-info">
            <p>* 파일 크기는 최대 10MB까지 업로드 가능합니다.</p>
          </div>
          
          {/* 새로 추가된 파일 목록 */}
          {attachedFiles.length > 0 && (
            <div className="attached-files">
              <h4>새로 추가된 파일</h4>
              <ul className="file-list">
                {attachedFiles.map((file, index) => (
                  <li key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)}KB)</span>
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => handleNewFileRemove(index)}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="file-count-info">
            <p>전체 파일 수: {existingFiles.length + attachedFiles.length}/5</p>
          </div>
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
            {loading ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEdit; 