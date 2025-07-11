import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './ReportModal.css';

const ReportModal = function({ isOpen, onClose, postType, postId, postTitle, reportApi }) {
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 신고 사유 목록
  const reportReasons = [
    { value: 'spam', label: '스팸/도배성 게시글' },
    { value: 'inappropriate', label: '부적절한 내용' },
    { value: 'false_info', label: '허위 정보' },
    { value: 'commercial', label: '상업적 광고' },
    { value: 'harassment', label: '욕설/비방' },
    { value: 'copyright', label: '저작권 침해' },
    { value: 'other', label: '기타' }
  ];

  // 모달 닫기
  const handleClose = function() {
    if (isSubmitting) return;
    setReportReason('');
    setCustomReason('');
    onClose();
  };

  // 신고 제출
  const handleSubmit = function(e) {
    e.preventDefault();
    
    if (!reportReason) {
      Swal.fire({
        icon: 'warning',
        title: '사유 미선택',
        text: '신고 사유를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    if (reportReason === 'other' && !customReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '사유 미입력',
        text: '기타 사유를 입력해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const finalReason = reportReason === 'other' ? customReason : reportReasons.find(r => r.value === reportReason).label;
    
    setIsSubmitting(true);

    const reportData = {
      postType: postType,
      postId: postId,
      reason: finalReason
    };

    reportApi(reportData)
      .then(function(response) {
        Swal.fire({
          icon: 'success',
          title: '신고 접수 완료',
          text: '신고가 정상적으로 접수되었습니다. 관리자가 검토 후 적절한 조치를 취할 예정입니다.',
          confirmButtonText: '확인'
        }).then(function() {
          handleClose();
        });
      })
      .catch(function(error) {
        if (error.response?.data?.message) {
          Swal.fire({
            icon: 'error',
            title: '신고 실패',
            text: error.response.data.message,
            confirmButtonText: '확인'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '신고 실패',
            text: '신고 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            confirmButtonText: '확인'
          });
        }
      })
      .finally(function() {
        setIsSubmitting(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal-container" onClick={function(e) { e.stopPropagation(); }}>
        <div className="report-modal-header">
          <h3>게시글 신고</h3>
          <button className="close-btn" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>
        
        <div className="report-modal-body">
          <div className="report-target-info">
            <p><strong>신고 대상:</strong> {postTitle}</p>
            <p className="report-warning">
              허위 신고 시 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>신고 사유를 선택해주세요</label>
              <div className="reason-options">
                {reportReasons.map(function(reason) {
                  return (
                    <div key={reason.value} className="reason-option">
                      <input
                        type="radio"
                        id={reason.value}
                        name="reportReason"
                        value={reason.value}
                        checked={reportReason === reason.value}
                        onChange={function(e) { setReportReason(e.target.value); }}
                        disabled={isSubmitting}
                      />
                      <label htmlFor={reason.value}>{reason.label}</label>
                    </div>
                  );
                })}
              </div>
            </div>

            {reportReason === 'other' && (
              <div className="form-group">
                <label htmlFor="customReason">상세 사유를 입력해주세요</label>
                <textarea
                  id="customReason"
                  value={customReason}
                  onChange={function(e) { setCustomReason(e.target.value); }}
                  placeholder="신고 사유를 상세히 입력해주세요 (최대 200자)"
                  maxLength={200}
                  rows={4}
                  disabled={isSubmitting}
                />
                <div className="char-count">{customReason.length}/200</div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? '신고 중...' : '신고하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal; 