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
import { getAllMembers } from '../../api/memberApi';

const userLevelMap = {
  1: { label: '슈퍼관리자', color: 'error' },
  2: { label: '관리자', color: 'warning' },
  3: { label: '창업자', color: 'info' },
  4: { label: '일반회원', color: 'default' },
};

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllMembers();
  }, []);

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const response = await getAllMembers();
      
      if (response.status === 'success') {
        setMembers(response.data || []);
      } else {
        setError('회원 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('회원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
        회원 정보 관리
      </Typography>

      {members.length === 0 ? (
        <Alert severity="info">등록된 회원이 없습니다.</Alert>
      ) : (
        <TableContainer component={Paper} className="mypage-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>아이디</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell width="100">등급</TableCell>
                <TableCell width="100">신고횟수</TableCell>
                <TableCell width="120">제재종료일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => {
                const levelInfo = userLevelMap[member.userLevel] || { label: '기타', color: 'default' };
                return (
                  <TableRow key={member.userId}>
                    <TableCell>{member.userId}</TableCell>
                    <TableCell>{member.userName}</TableCell>
                    <TableCell>{member.userEmail}</TableCell>
                    <TableCell>{member.userPhone}</TableCell>
                    <TableCell>
                      <Chip
                        label={levelInfo.label}
                        color={levelInfo.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {member.reportCount || 0}
                      {member.reportCount >= 3 && (
                        <Chip
                          label="주의"
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {member.banUntil ? (
                        <Typography color="error" variant="body2">
                          {formatDate(member.banUntil)}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MemberManagement; 