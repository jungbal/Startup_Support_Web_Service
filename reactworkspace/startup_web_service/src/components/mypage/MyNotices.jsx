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
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import useAuthStore from '../../store/authStore';
import { getMyNotices } from '../../api/memberApi';

const MyNotices = () => {
  const { loginMember } = useAuthStore();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyNotices();
  }, [loginMember]);

  // 팀원들이 배운 방식: function 선언문 + .then/.catch
  function fetchMyNotices() {
    if (!loginMember?.userId) return;

    setLoading(true);
    
    getMyNotices(loginMember.userId)
      .then(function(response) {
        // 팀원들이 배운 방식: response.data에서 확인
        if (response.data && response.data.alertIcon === 'success') {
          setNotices(response.data.resData || []);
        } else {
          setError('공지사항을 불러오는데 실패했습니다.');
        }
      })
      .catch(function(error) {
        console.error('공지사항을 불러오는 중 오류가 발생했습니다.');
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

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
        내가 쓴 공지사항
      </Typography>

      {notices.length === 0 ? (
        <Alert severity="info">작성한 공지사항이 없습니다.</Alert>
      ) : (
        <TableContainer component={Paper} className="mypage-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="100">번호</TableCell>
                <TableCell>제목</TableCell>
                <TableCell width="100">조회수</TableCell>
                <TableCell width="120">작성일</TableCell>
                <TableCell width="100">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.postNo}>
                  <TableCell>{notice.postNo}</TableCell>
                  <TableCell>{notice.postTitle}</TableCell>
                  <TableCell>{notice.readCount || 0}</TableCell>
                  <TableCell>{formatDate(notice.postDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={(notice.postStatus === 'public' || notice.postStatus === '공개' || notice.postStatus === null || notice.postStatus === undefined) ? '공개' : '비공개'}
                      color={(notice.postStatus === 'public' || notice.postStatus === '공개' || notice.postStatus === null || notice.postStatus === undefined) ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MyNotices; 