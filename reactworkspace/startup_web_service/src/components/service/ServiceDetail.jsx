// ServiceDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchServiceDetail } from '../../api/subsidyApi';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Link,
  Grid,
  Stack
} from '@mui/material';

function ServiceDetail() {
  const { servId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const cached = location.state; // ServiceList에서 전달된 객체
  const [service, setService] = useState(cached || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const detail = await fetchServiceDetail(servId);
        console.log('📡 API 상세 응답:', detail);
        setService({
          ...detail,
          supportType: detail.supportType ?? cached?.supportType ?? '-',
          userType: detail.userType ?? cached?.userType ?? '-',
          serviceField: detail.serviceField ?? cached?.serviceField ?? '-'
        });
      } catch (e) {
        console.error('🛑 상세 API 호출 실패:', e);
        // fallback: cached 또는 기본만 보이도록 유지
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [servId, cached]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh' }} display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  function row(label, content) {
    return (
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={3}>
          <Typography component="strong" color="text.secondary">{label}:</Typography>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{content}</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box p={3}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← 뒤로가기
      </Button>

      <Card variant="outlined" sx={{ boxShadow: 2 }}>
        <CardContent>
          {service.supportContent && (
            <Chip
              label={service.supportContent.split('\n')[0]}
              color="warning"
              sx={{ mb: 2, fontWeight: 'bold' }}
            />
          )}

          <Typography variant="h5" gutterBottom color="primary">
            {service.servNm}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>서비스 목적</Typography>
            <Typography>{service.servDgst || '-'}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>상세 정보</Typography>
            {row('지원내용', service.supportContent || '-')}
            {row('지원대상', service.target || '-')}
            {row('선정기준', service.criteria || '-')}
            {row('신청기한', service.period || '-')}
            {row('문의처', service.contact || '-')}
            {row('소관기관', service.organization || '-')}
            {row('공식링크', service.servDtlLink ? (
              <Link href={service.servDtlLink} target="_blank" rel="noreferrer">gov.kr 바로가기</Link>
            ) : '-')}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>분류</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`지원유형: ${service.supportType}`} color="primary" variant="outlined" />
            <Chip label={`사용자구분: ${service.userType}`} color="secondary" variant="outlined" />
            <Chip label={`서비스분야: ${service.serviceField}`} color="success" variant="outlined" />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ServiceDetail;
