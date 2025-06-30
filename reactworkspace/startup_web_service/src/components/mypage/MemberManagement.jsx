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
  Select,
  MenuItem,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { getAllMembers, updateUserLevel, testAutoLevelUp } from '../../api/memberApi';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/authStore';

const userLevelMap = {
  1: { label: '슈퍼관리자', color: 'error' },
  2: { label: '관리자', color: 'warning' },
  3: { label: '정회원', color: 'info' },
  4: { label: '일반회원', color: 'default' },
};

const MemberManagement = function() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loginMember = useAuthStore(function(state) { return state.loginMember; });

  useEffect(function() {
    fetchAllMembers();
  }, []);

  const fetchAllMembers = function() {
    setLoading(true);
    
    getAllMembers()
      .then(function(response) {
        console.log('회원 목록 조회 응답:', response);
        
        if (response.data && response.data.httpStatus === 'OK') {
          setMembers(response.data.resData || []);
          setError(null);
        } else {
          setError(response.data.clientMsg || '회원 목록을 불러오는데 실패했습니다.');
          setMembers([]);
        }
      })
      .catch(function(error) {
        console.error('회원 목록 조회 오류:', error);
        
        if (error.response && error.response.status === 403) {
          setError('회원 목록을 조회할 권한이 없습니다. 관리자 계정으로 로그인해주세요.');
        } else if (error.response && error.response.status === 401) {
          setError('로그인이 필요합니다.');
        } else {
          setError('회원 목록을 불러오는 중 오류가 발생했습니다.');
        }
        setMembers([]);
      })
      .finally(function() {
        setLoading(false);
      });
  };

  const handleUserLevelChange = function(userId, newLevel) {
    const currentUserId = loginMember?.userId;
    
    if (!currentUserId) {
      Swal.fire({
        title: '알림',
        text: '로그인 정보를 확인할 수 없습니다.',
        icon: 'error'
      });
      return;
    }
    
    if (userId === currentUserId) {
      Swal.fire({
        title: '알림',
        text: '자신의 등급은 변경할 수 없습니다.',
        icon: 'warning'
      });
      return;
    }
    
    Swal.fire({
      title: '등급 변경',
      text: `정말로 이 회원의 등급을 ${userLevelMap[newLevel].label}(으)로 변경하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '변경',
      cancelButtonText: '취소'
    }).then(function(result) {
      if (result.isConfirmed) {
        updateUserLevel(userId, newLevel)
          .then(function(response) {
            console.log('등급 변경 응답:', response);
            
            if (response.data && response.data.httpStatus === 'OK') {
              Swal.fire({
                title: '성공',
                text: response.data.clientMsg || '회원 등급이 변경되었습니다.',
                icon: 'success'
              });
              
              fetchAllMembers();
            } else {
              Swal.fire({
                title: '실패',
                text: response.data.clientMsg || '등급 변경에 실패했습니다.',
                icon: 'error'
              });
            }
          })
          .catch(function(error) {
            console.error('등급 변경 오류:', error);
            Swal.fire({
              title: '오류',
              text: '등급 변경 중 오류가 발생했습니다.',
              icon: 'error'
            });
          });
      }
    });
  };

  const formatDate = function(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 자동등업 테스트 함수 (개발/테스트용)
  function handleAutoLevelUpTest(userId) {
    Swal.fire({
      title: '자동등업 테스트',
      text: '해당 회원의 자동등업 조건을 확인하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '테스트',
      cancelButtonText: '취소'
    }).then(function(result) {
      if (result.isConfirmed) {
        testAutoLevelUp(userId)
          .then(function(response) {
            console.log('자동등업 테스트 응답:', response);
            
            if (response.data && response.data.httpStatus === 'OK') {
              Swal.fire({
                title: '성공',
                text: response.data.clientMsg || '자동등업 테스트가 성공했습니다.',
                icon: 'success'
              });
              
              fetchAllMembers();
            } else {
              Swal.fire({
                title: '실패',
                text: response.data.clientMsg || '자동등업 테스트에 실패했습니다.',
                icon: 'error'
              });
            }
          })
          .catch(function(error) {
            console.error('자동등업 테스트 오류:', error);
            Swal.fire({
              title: '오류',
              text: '자동등업 테스트 중 오류가 발생했습니다.',
              icon: 'error'
            });
          });
      }
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
        회원 정보 관리
      </Typography>

      {members.length === 0 ? (
        <Alert severity="info">등록된 회원이 없습니다.</Alert>
      ) : (
        <TableContainer component={Paper} className="mypage-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>아이디</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>이름</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>이메일</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>전화번호</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 150 }}>등급</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 100 }}>신고횟수</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 120 }}>제재종료일</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 120 }}>자동등업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => {
                return (
                  <TableRow key={member.userId}>
                    <TableCell>{member.userId}</TableCell>
                    <TableCell>{member.userName}</TableCell>
                    <TableCell>{member.userEmail}</TableCell>
                    <TableCell>{member.userPhone}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={member.userLevel}
                          onChange={(e) => handleUserLevelChange(member.userId, e.target.value)}
                        >
                          <MenuItem value={1}>슈퍼관리자</MenuItem>
                          <MenuItem value={2}>관리자</MenuItem>
                          <MenuItem value={3}>정회원</MenuItem>
                          <MenuItem value={4}>일반회원</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{member.reportCount}</TableCell>
                    <TableCell>
                      {member.banUntil ? new Date(member.banUntil).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => handleAutoLevelUpTest(member.userId)}
                        sx={{ fontSize: '0.7rem', padding: '2px 8px' }}
                      >
                        테스트
                      </Button>
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