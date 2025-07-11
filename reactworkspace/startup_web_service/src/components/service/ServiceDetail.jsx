import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchServiceDetail } from '../../api/subsidyApi';

import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Button,
  Stack,
  Card,
  CardContent,
} from '@mui/material';

// 텍스트를 비교 용도로 전처리 (소문자 + 공백 제거)
function normalize(value) {
  if (!value) return '';
  return value.toLowerCase().replace(/\s/g, '');
}

function ServiceDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId } = useParams();

  // 상태 정의
  const [service, setService] = useState(null);                  // 현재 상세 보조금 정보
  const [loading, setLoading] = useState(true);                  // 로딩 여부
  const [error, setError] = useState(null);                      // 에러 메시지
  const [relatedServices, setRelatedServices] = useState([]);    // 관련 서비스
  const [fallbackServices, setFallbackServices] = useState([]);  // 추천 불가 시 대체 서비스

  // 상세 데이터 API 호출
  useEffect(function () {
    setService(null);
    setLoading(true);
    setError(null);

    fetchServiceDetail(serviceId)
      .then(function (res) {
        setService(res);
      })
      .catch(function (err) {
        console.error('상세 데이터 로드 실패:', err);
        setError('서비스 정보를 불러오는 데 실패했습니다.');
      })
      .finally(function () {
        setLoading(false);
      });
  }, [serviceId, location.key]);

  // 관련 또는 대체 추천 서비스 추출
  useEffect(function () {
    setRelatedServices([]);
    setFallbackServices([]);

    if (service) {
      const cached = localStorage.getItem('cachedServiceList');
      if (cached) {
        const parsed = JSON.parse(cached);

        // 분야 또는 사용자구분이 유사한 서비스 필터링
        const filtered = parsed.services.filter(function (item) {
          return (
            item.servId !== service.servId &&
            (
              normalize(item.serviceField).includes(normalize(service.serviceField)) ||
              normalize(item.userType).includes(normalize(service.userType))
            )
          );
        });

        // 추천 서비스가 있으면 관련 서비스로 설정, 없으면 인기 서비스로 대체
        if (filtered.length > 0) {
          setRelatedServices(filtered.slice(0, 5));
        } else {
          const fallback = parsed.services
            .filter(function (item) {
              return item.servId !== service.servId;
            })
            .slice(0, 5);
          setFallbackServices(fallback);
        }
      }
    }
  }, [service, location.key]);

  // 로딩 화면 처리
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // 에러 또는 데이터 없음 처리
  if (error) return <Typography color="error">{error}</Typography>;
  if (!service) return <Typography>해당 서비스 정보를 찾을 수 없습니다.</Typography>;

  // 상세 화면 렌더링
  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* 뒤로가기 버튼 */}
        <Button
          variant="outlined"
          onClick={function () { navigate(-1); }}
          sx={{ mb: 2 }}
        >
          뒤로가기
        </Button>

        {/* 서비스명 */}
        <Typography variant="h4" fontWeight="bold" mb={1}>
          {service.servNm}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* 서비스 요약 */}
        <Box mb={3}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {service.servDgst}
          </Typography>
        </Box>

        {/* 분류 정보 (칩 형태) */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={3}>
          <Chip label={'지원유형: ' + (service.supportType || '-')} color="primary" variant="outlined" />
          <Chip label={'사용자구분: ' + (service.userType || '-')} color="secondary" variant="outlined" />
          <Chip label={'서비스분야: ' + (service.serviceField || '-')} color="success" variant="outlined" />
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* 주요 상세 항목 */}
        <Box mb={2}>
          <Typography variant="h6">지원 내용</Typography>
          <Typography>{service.supportContent || '-'}</Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="h6">지원 대상</Typography>
          <Typography>{service.target || '-'}</Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="h6">선정 기준</Typography>
          <Typography>{service.criteria || '-'}</Typography>
        </Box>

        {/* 신청기간 / 문의처 */}
        <Box mb={2} display="flex" flexWrap="wrap" gap={2}>
          <Box flex="1 1 45%">
            <Typography variant="h6">신청 기간</Typography>
            <Typography>{service.period || '-'}</Typography>
          </Box>
          <Box flex="1 1 45%">
            <Typography variant="h6">문의처</Typography>
            <Typography>{service.contact || '-'}</Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="h6">소관 기관</Typography>
          <Typography>{service.organization || '-'}</Typography>
        </Box>

        {/* 상세 페이지 링크 */}
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            href={service.servDtlLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            상세 페이지 바로가기
          </Button>
        </Box>
      </Paper>

      {/* 추천 서비스 영역 */}
      <Box mt={6}>
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1.5,
            backgroundColor: '#f1f3f5',
            borderLeft: '6px solid #1976d2',
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {relatedServices.length > 0 ? '관련 보조금 더 보기' : '인기 보조금 추천'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {relatedServices.length > 0
              ? '동일한 서비스 분야 또는 사용자 구분 기준으로 추천된 서비스입니다.'
              : '많은 사용자들이 관심 가진 인기 서비스를 소개합니다.'}
          </Typography>
        </Box>

        {/* 추천/인기 보조금 없음 안내 */}
        {(relatedServices.length === 0 && fallbackServices.length === 0) && (
          <Box
            sx={{
              p: 3,
              border: '1px dashed #ccc',
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: '#fafafa',
              color: 'text.disabled',
            }}
          >
            <Typography variant="body2">관련된 서비스가 없습니다.</Typography>
          </Box>
        )}

        {/* 카드형 추천 서비스 리스트 */}
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            pb: 1,
            mt: 2,
          }}
        >
          {(relatedServices.length > 0 ? relatedServices : fallbackServices).map(function (item) {
            return (
              <Card
                key={item.servId}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  flex: '0 0 auto',
                  minWidth: 260,
                  height: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2,
                  transition: '0.3s',
                  '&:hover': { boxShadow: 6, borderColor: 'primary.main' },
                }}
                onClick={function () {
                  window.open('/service/detail/' + item.servId, '_blank');
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {item.servNm}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.servDgst}
                  </Typography>
                </CardContent>
                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  <Chip label={item.supportType || '-'} size="small" color="primary" variant="outlined" />
                  <Chip label={item.userType || '-'} size="small" color="secondary" variant="outlined" />
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default ServiceDetail;
