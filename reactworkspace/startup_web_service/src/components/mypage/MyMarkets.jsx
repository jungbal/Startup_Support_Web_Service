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
import { getMyMarkets } from '../../api/memberApi';

const marketTypeMap = {
  free: { label: '무료나눔', className: 'free' },
  purchase: { label: '구매', className: 'purchase' },
  sale: { label: '판매', className: 'sale' },
};

const MyMarkets = () => {
  const { user } = useAuthStore();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyMarkets();
  }, [user]);

  const fetchMyMarkets = async () => {
    console.log('MyMarkets - fetchMyMarkets 호출됨');
    console.log('현재 user:', user);
    
    if (!user?.userId) {
      console.log('user.userId가 없음');
      return;
    }

    try {
      setLoading(true);
      console.log('getMyMarkets API 호출 중...');
      const response = await getMyMarkets(user.userId);
      console.log('getMyMarkets 응답:', response);
      
      if (response.alertIcon === 'success') {
        const marketsData = response.resData || [];
        console.log('가져온 마켓글 데이터:', marketsData);
        console.log('첫 번째 마켓글 상세:', marketsData[0]);
        if (marketsData[0]) {
          console.log('첫 번째 마켓글의 price:', marketsData[0].price);
          console.log('첫 번째 마켓글의 marketStatus:', marketsData[0].marketStatus);
        }
        setMarkets(marketsData);
      } else {
        console.log('getMyMarkets 실패:', response.clientMsg);
        setError('마켓글을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('getMyMarkets 오류:', error);
      setError('마켓글을 불러오는 중 오류가 발생했습니다.');
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

  const formatPrice = (price) => {
    console.log('formatPrice 호출됨, price:', price, 'typeof:', typeof price);
    if (price === null || price === undefined || price === 0) return '무료';
    if (typeof price !== 'number') {
      console.warn('price가 숫자가 아님:', price);
      return '가격 정보 없음';
    }
    return price.toLocaleString() + '원';
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
        내가 쓴 마켓글
      </Typography>

      {markets.length === 0 ? (
        <Alert severity="info">작성한 마켓글이 없습니다.</Alert>
      ) : (
        <TableContainer component={Paper} className="mypage-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="100">번호</TableCell>
                <TableCell width="120">유형</TableCell>
                <TableCell>제목</TableCell>
                <TableCell width="120">가격</TableCell>
                <TableCell width="100">조회수</TableCell>
                <TableCell width="120">작성일</TableCell>
                <TableCell width="100">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {markets.map((market) => {
                const typeInfo = marketTypeMap[market.marketType] || { label: market.marketType, className: '' };
                return (
                  <TableRow key={market.marketNo}>
                    <TableCell>{market.marketNo}</TableCell>
                    <TableCell>
                      <span className={`market-type-badge ${typeInfo.className}`}>
                        {typeInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>{market.marketTitle}</TableCell>
                    <TableCell>{formatPrice(market.price)}</TableCell>
                    <TableCell>{market.readCount || 0}</TableCell>
                    <TableCell>{formatDate(market.marketDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={(market.marketStatus === 'public' || market.marketStatus === '공개' || market.marketStatus === null || market.marketStatus === undefined) ? '공개' : '비공개'}
                        color={(market.marketStatus === 'public' || market.marketStatus === '공개' || market.marketStatus === null || market.marketStatus === undefined) ? 'success' : 'default'}
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

export default MyMarkets; 