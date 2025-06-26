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
} from '@mui/material';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getAllReports, processReport } from '../../api/memberApi';

const ReportManagement = () => {
  const { user } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getAllReports();
      
      if (response.status === 'success') {
        setReports(response.data || []);
      } else {
        setError('신고 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('신고 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (report, action) => {
    setSelectedReport(report);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
    setDialogAction('');
  };

  const handleProcessReport = async () => {
    if (!selectedReport) return;

    try {
      const reportData = {
        reportId: selectedReport.reportId,
        reportStatus: dialogAction,
        adminId: user.userId,
      };

      const response = await processReport(reportData, dialogAction);
      
      if (response.status === 'success') {
        toast.success('신고가 처리되었습니다.');
        fetchReports(); // 목록 새로고침
      } else {
        toast.error('신고 처리에 실패했습니다.');
      }
    } catch (error) {
      toast.error('신고 처리 중 오류가 발생했습니다.');
    } finally {
      handleCloseDialog();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getPostTypeLabel = (postType) => {
    const typeMap = {
      post: '게시글',
      market: '마켓글',
      comment: '댓글',
    };
    return typeMap[postType] || postType;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      wait: { label: '대기중', className: 'wait' },
      approve: { label: '승인', className: 'approve' },
      reject: { label: '거절', className: 'reject' },
    };
    const statusInfo = statusMap[status] || { label: status, className: '' };
    return (
      <span className={`report-status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

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
                <TableCell width="160">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
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
                    {report.reportStatus === 'wait' && (
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenDialog(report, 'approve')}
                        >
                          승인
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleOpenDialog(report, 'reject')}
                        >
                          거절
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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
            정말로 이 신고를 {dialogAction === 'approve' ? '승인' : '거절'}하시겠습니까?
            {dialogAction === 'approve' && 
              ' 승인 시 해당 회원의 신고 횟수가 증가하며, 3회 이상 시 자동으로 제재됩니다.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            취소
          </Button>
          <Button 
            onClick={handleProcessReport} 
            color={dialogAction === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {dialogAction === 'approve' ? '승인' : '거절'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportManagement; 