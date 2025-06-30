import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/authStore';
import { getAllReports, processReport } from '../../api/memberApi';

// 신고 관리 컴포넌트 - 관리자 전용
// 신고된 게시글/마켓글을 관리하는 기능 제공
const ReportManagement = function() {
  // authStore에서 로그인한 사용자 정보 가져오기
  const loginMember = useAuthStore(function(state) { return state.loginMember; });
  
  // 상태 관리 변수들
  const [reports, setReports] = useState([]);        // 신고 목록 배열
  const [loading, setLoading] = useState(true);      // 로딩 상태
  const [error, setError] = useState(null);          // 에러 메시지
  const [selectedReport, setSelectedReport] = useState(null);   // 선택된 신고
  const [dialogOpen, setDialogOpen] = useState(false);          // 다이얼로그 열림 상태
  const [dialogAction, setDialogAction] = useState('');         // 처리할 액션

  // 컴포넌트가 마운트될 때 신고 목록을 가져옴
  useEffect(function() {
    fetchReports();
  }, []);

  // 신고 목록을 서버에서 가져오는 함수
  function fetchReports() {
    setLoading(true);
    
    getAllReports()
      .then(function(response) {
        // response.data가 백엔드의 ResponseDTO 객체
        if (response.data && response.data.httpStatus === 'OK') {
          setReports(response.data.resData || []);
          setError(null);
        } else {
          setError('신고 목록을 불러오는데 실패했습니다.');
        }
      })
      .catch(function(error) {
        console.error('신고 목록 조회 오류:', error);
        setError('신고 목록을 불러오는 중 오류가 발생했습니다.');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  // 신고 처리 상태 변경 핸들러
  const handleStatusChange = function(report, newStatus) {
    // 현재 상태와 동일하면 처리하지 않음
    if (report.reportStatus === newStatus) {
      return;
    }
    
    setSelectedReport(report);
    setDialogAction(newStatus);
    setDialogOpen(true);
  };

  // 처리 다이얼로그 닫기
  const handleCloseDialog = function() {
    setDialogOpen(false);
    setSelectedReport(null);
    setDialogAction('');
  };

  // 신고 처리 함수
  const handleProcessReport = function() {
    if (!selectedReport) return;

    // 신고 처리 데이터 구성
    const reportData = {
      reportId: selectedReport.reportId,
      reportStatus: dialogAction,  // wait, rejected, approved, deleted 중 하나
      adminId: loginMember.userId,
    };

    // 백엔드 API 호출
    processReport(reportData, dialogAction)
      .then(function(response) {
        if (response.data && response.data.httpStatus === 'OK') {
          // 성공 메시지 표시
          Swal.fire({
            title: '성공',
            text: getActionMessage(dialogAction),
            icon: 'success'
          });
          fetchReports(); // 목록 새로고침
        } else {
          Swal.fire({
            title: '실패',
            text: '신고 처리에 실패했습니다.',
            icon: 'error'
          });
        }
      })
      .catch(function(error) {
        console.error('신고 처리 오류:', error);
        Swal.fire({
          title: '오류',
          text: '신고 처리 중 오류가 발생했습니다.',
          icon: 'error'
        });
      })
      .finally(function() {
        handleCloseDialog();
      });
  };

  // 액션에 따른 메시지 반환
  function getActionMessage(action) {
    const messages = {
      wait: '신고가 대기 상태로 유지되었습니다.',
      rejected: '신고가 반려되었습니다. 게시글의 신고 횟수가 1 감소합니다.',
      approved: '신고가 승인되었습니다. 작성자의 누적 신고 횟수가 증가합니다.',
      deleted: '신고가 승인되어 해당 게시글이 삭제되었습니다. 작성자의 누적 신고 횟수가 증가합니다.'
    };
    return messages[action] || '처리가 완료되었습니다.';
  }

  // 날짜 포맷 함수
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  // 게시글 타입 한글 변환
  const getPostTypeLabel = function(postType) {
    const typeMap = {
      post: '게시글',
      market: '마켓글',
      comment: '댓글',
    };
    return typeMap[postType] || postType;
  };

  // 신고 상태 배지 렌더링
  const getStatusBadge = function(status) {
    const statusMap = {
      wait: { label: '대기', color: 'default' },
      rejected: { label: '반려', color: 'warning' },
      approved: { label: '승인', color: 'success' },
      deleted: { label: '삭제', color: 'error' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    
    return (
      <Chip 
        label={statusInfo.label} 
        color={statusInfo.color} 
        size="small" 
      />
    );
  };

  // 처리 상태별 색상 반환
  const getStatusColor = function(status) {
    const colorMap = {
      wait: '#757575',      // 회색
      rejected: '#f57c00',  // 주황색
      approved: '#2e7d32',  // 초록색
      deleted: '#d32f2f'    // 빨간색
    };
    return colorMap[status] || '#757575';
  };

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러가 발생했을 때 표시할 UI
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        신고 관리
      </Typography>

      {reports.length === 0 ? (
        <Alert severity="info">신고된 내용이 없습니다.</Alert>
      ) : (
        <TableContainer component={Paper} className="mypage-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>신고ID</TableCell>
                <TableCell>신고자</TableCell>
                <TableCell>대상</TableCell>
                <TableCell>대상ID</TableCell>
                <TableCell>신고사유</TableCell>
                <TableCell>신고일</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>처리자</TableCell>
                <TableCell>처리일</TableCell>
                <TableCell width="150">처리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map(function(report) {
                return (
                  <TableRow key={report.reportId}>
                    <TableCell>{report.reportId}</TableCell>
                    <TableCell>{report.reporterId}</TableCell>
                    <TableCell>{getPostTypeLabel(report.postType)}</TableCell>
                    <TableCell>{report.postId}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{formatDate(report.reportDate)}</TableCell>
                    <TableCell>{getStatusBadge(report.reportStatus)}</TableCell>
                    <TableCell>{report.adminId || '-'}</TableCell>
                    <TableCell>{report.processDate ? formatDate(report.processDate) : '-'}</TableCell>
                    <TableCell>
                      {/* wait 상태인 신고만 처리 가능 */}
                      {report.reportStatus === 'wait' ? (
                        <FormControl size="small" fullWidth>
                          <Select
                            value={report.reportStatus}
                            onChange={function(e) {
                              handleStatusChange(report, e.target.value);
                            }}
                            displayEmpty
                            sx={{
                              '& .MuiSelect-select': {
                                color: getStatusColor(report.reportStatus),
                                fontWeight: 'bold'
                              }
                            }}
                          >
                            <MenuItem 
                              value="wait"
                              sx={{ 
                                color: getStatusColor('wait'),
                                fontWeight: 'bold'
                              }}
                            >
                              대기
                            </MenuItem>
                            <MenuItem 
                              value="rejected"
                              sx={{ 
                                color: getStatusColor('rejected'),
                                fontWeight: 'bold'
                              }}
                            >
                              반려
                            </MenuItem>
                            <MenuItem 
                              value="approved"
                              sx={{ 
                                color: getStatusColor('approved'),
                                fontWeight: 'bold'
                              }}
                            >
                              승인
                            </MenuItem>
                            <MenuItem 
                              value="deleted"
                              sx={{ 
                                color: getStatusColor('deleted'),
                                fontWeight: 'bold'
                              }}
                            >
                              삭제
                            </MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: getStatusColor(report.reportStatus),
                            fontWeight: 'bold'
                          }}
                        >
                          처리완료
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 확인 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          신고 처리 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'wait' && '이 신고를 대기 상태로 유지하시겠습니까?'}
            {dialogAction === 'rejected' && '이 신고를 반려하시겠습니까? 반려 시 해당 게시글의 신고 횟수가 1 감소합니다.'}
            {dialogAction === 'approved' && '이 신고를 승인하시겠습니까? 승인 시 작성자의 누적 신고 횟수가 증가하며, 6회 이상 누적 시 7일간 이용이 제한됩니다. 게시글의 신고 횟수는 그대로 유지됩니다.'}
            {dialogAction === 'deleted' && '이 신고를 승인하고 해당 게시글을 삭제하시겠습니까? 작성자의 누적 신고 횟수가 증가하며, 6회 이상 누적 시 7일간 이용이 제한됩니다.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            취소
          </Button>
          <Button 
            onClick={handleProcessReport} 
            color={
              dialogAction === 'deleted' ? 'error' : 
              dialogAction === 'approved' ? 'success' :
              dialogAction === 'rejected' ? 'warning' : 'info'
            }
            variant="contained"
          >
            {dialogAction === 'wait' && '대기 유지'}
            {dialogAction === 'rejected' && '반려'}
            {dialogAction === 'approved' && '승인'}
            {dialogAction === 'deleted' && '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportManagement; 