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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function normalize(value) {
  if (!value) return '';
  return value.toLowerCase().replace(/\s/g, '');
}

function ServiceDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [fallbackServices, setFallbackServices] = useState([]);

  useEffect(function () {
    setService(null);
    setLoading(true);
    setError(null);

    fetchServiceDetail(serviceId)
      .then(function (res) {
        setService(res);
      })
      .catch(function (err) {
        console.error('❌ 상세 데이터 로드 실패:', err);
        setError('서비스 정보를 불러오는 데 실패했습니다.');
      })
      .finally(function () {
        setLoading(false);
      });
  }, [serviceId, location.key]);

  useEffect(function () {
    setRelatedServices([]);
    setFallbackServices([]);

    if (service) {
      const cached = localStorage.getItem('cachedServiceList');
      if (cached) {
        const parsed = JSON.parse(cached);
        const filtered = parsed.services.filter(function (item) {
          return (
            item.servId !== service.servId &&
            (
              normalize(item.serviceField).includes(normalize(service.serviceField)) ||
              normalize(item.userType).includes(normalize(service.userType))
            )
          );
        });

        if (filtered.length > 0) {
          setRelatedServices(filtered.slice(0, 5));
        } else {
          const fallback = parsed.services.filter(function (item) {
            return item.servId !== service.servId;
          }).slice(0, 5);
          setFallbackServices(fallback);
        }
      }
    }
  }, [service, location.key]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;
  if (!service) return <Typography>해당 서비스 정보를 찾을 수 없습니다.</Typography>;

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={function () { navigate(-1); }}
          sx={{ mb: 2 }}
        >
          뒤로가기
        </Button>

        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <InfoOutlinedIcon color="primary" />
          <Typography variant="h4" fontWeight="bold">
            {service.servNm}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box mb={3}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{service.servDgst}</Typography>
        </Box>

        <Stack direction="row" spacing={1} mb={3}>
          <Chip label={'지원유형: ' + (service.supportType || '-')} color="primary" variant="outlined" />
          <Chip label={'사용자구분: ' + (service.userType || '-')} color="secondary" variant="outlined" />
          <Chip label={'서비스분야: ' + (service.serviceField || '-')} color="success" variant="outlined" />
        </Stack>

        <Divider sx={{ my: 3 }} />

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

        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            href={service.servDtlLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            👉 상세 페이지 바로가기
          </Button>
        </Box>
      </Paper>

      <Box mt={6}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {relatedServices.length > 0 ? '📌 관련 보조금 더 보기' : '🔥 인기 보조금 추천'}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {relatedServices.length > 0
            ? '동일한 서비스 분야 또는 사용자 구분을 기반으로 추천됩니다.'
            : '인기 있는 서비스들을 소개합니다.'}
        </Typography>

        {(relatedServices.length === 0 && fallbackServices.length === 0) && (
          <Typography color="text.disabled" sx={{ p: 2 }}>
            관련 서비스가 없습니다.
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            pb: 1,
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
                  minWidth: 280,
                  height: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2,
                  '&:hover': { boxShadow: 4 },
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
                  <Chip
                    label={item.supportType || '-'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={item.userType || '-'}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
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
