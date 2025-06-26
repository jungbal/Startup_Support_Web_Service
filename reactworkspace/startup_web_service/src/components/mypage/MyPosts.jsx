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
import { getMyPosts } from '../../api/memberApi';

const postTypeMap = {
  notice: { label: '공지사항', className: 'notice' },
  qna: { label: 'Q&A', className: 'qna' },
  common: { label: '자유게시판', className: 'common' },
};

const MyPosts = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    console.log('MyPosts - fetchMyPosts 호출됨');
    console.log('현재 user:', user);
    
    if (!user?.userId) {
      console.log('user.userId가 없음');
      return;
    }

    try {
      setLoading(true);
      console.log('getMyPosts API 호출 중...');
      const response = await getMyPosts(user.userId);
      console.log('getMyPosts 응답:', response);
      
      if (response.alertIcon === 'success') {
        const postsData = response.resData || [];
        console.log('가져온 게시글 데이터:', postsData);
        console.log('첫 번째 게시글 상세:', postsData[0]);
        if (postsData[0]) {
          console.log('첫 번째 게시글의 postStatus:', postsData[0].postStatus);
        }
        setPosts(postsData);
      } else {
        console.log('getMyPosts 실패:', response.clientMsg);
        setError('게시글을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('getMyPosts 오류:', error);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
        내가 쓴 게시글
      </Typography>

      {posts.length === 0 ? (
        <Alert severity="info">작성한 게시글이 없습니다.</Alert>
      ) : (
        <TableContainer component={Paper} className="mypage-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="100">번호</TableCell>
                <TableCell width="120">유형</TableCell>
                <TableCell>제목</TableCell>
                <TableCell width="100">조회수</TableCell>
                <TableCell width="120">작성일</TableCell>
                <TableCell width="100">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => {
                const typeInfo = postTypeMap[post.postType] || { label: post.postType, className: '' };
                return (
                  <TableRow key={post.postNo}>
                    <TableCell>{post.postNo}</TableCell>
                    <TableCell>
                      <span className={`post-type-badge ${typeInfo.className}`}>
                        {typeInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>{post.postTitle}</TableCell>
                    <TableCell>{post.readCount || 0}</TableCell>
                    <TableCell>{formatDate(post.postDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={(post.postStatus === 'public' || post.postStatus === '공개' || post.postStatus === null || post.postStatus === undefined) ? '공개' : '비공개'}
                        color={(post.postStatus === 'public' || post.postStatus === '공개' || post.postStatus === null || post.postStatus === undefined) ? 'success' : 'default'}
                        size="small"
                      />
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

export default MyPosts; 