import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchServiceList } from '../../api/subsidyApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Pagination,
  Grid,
  Button,
} from '@mui/material';

// 캐시 만료 시간 (1시간)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

function ServiceList() {
  const navigate = useNavigate();

  // 상태 정의
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');

  const [supportType, setSupportType] = useState('');
  const [userType, setUserType] = useState('');
  const [serviceField, setServiceField] = useState('');

  const [supportTypeList, setSupportTypeList] = useState([]);
  const [userTypeList, setUserTypeList] = useState([]);
  const [serviceFieldList, setServiceFieldList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalItems, setTotalItems] = useState(0);

  // 서비스 필터링 및 페이지네이션 처리
  const applyFilter = useCallback(function () {
    const filteredResults = allServices.filter(function (item) {
      const keyword = searchTrigger.toLowerCase();

      const keywordMatch =
        !searchTrigger ||
        (item.servNm && item.servNm.toLowerCase().includes(keyword)) ||
        (item.servDgst && item.servDgst.toLowerCase().includes(keyword));

      const supportMatch = !supportType || item.supportType === supportType;
      const userMatch = !userType || item.userType === userType;
      const fieldMatch = !serviceField || item.serviceField === serviceField;

      return keywordMatch && supportMatch && userMatch && fieldMatch;
    });

    const totalFilteredItems = filteredResults.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const servicesOnCurrentPage = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    setServices(servicesOnCurrentPage);
    setTotalItems(totalFilteredItems);
  }, [searchTrigger, supportType, userType, serviceField, allServices, currentPage, itemsPerPage]);

  // 전체 서비스 목록을 API에서 불러오고 캐시 처리
  useEffect(function () {
    async function loadAllServices() {
      setLoading(true);

      try {
        const cachedData = localStorage.getItem('cachedServiceList');

        if (cachedData) {
          const parsedData = JSON.parse(cachedData);

          // 캐시가 유효하면 캐시 데이터 사용
          if (Date.now() - parsedData.timestamp < CACHE_EXPIRATION_TIME) {
            setAllServices(parsedData.services);
            setSupportTypeList(parsedData.supportTypes);
            setUserTypeList(parsedData.userTypes);
            setServiceFieldList(parsedData.serviceFields);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem('cachedServiceList');
          }
        }

        // 새로 전체 데이터 요청
        let allFetchedData = [];
        let page = 1;
        let apiTotalCount = 0;
        const apiPerPage = 100;

        do {
          const response = await fetchServiceList(page, apiPerPage);

          if (Array.isArray(response.data)) {
            const cleanedData = response.data.map(function (item) {
              return {
                servId: item['서비스ID'],
                servNm: item['서비스명'],
                servDgst: item['서비스목적요약'],
                servDtlLink: item['상세조회URL'],
                supportType: item['지원유형'],
                userType: item['사용자구분'],
                serviceField: item['서비스분야'],
              };
            });
            allFetchedData = allFetchedData.concat(cleanedData);
            apiTotalCount = response.totalCount;
          } else {
            console.error('API 응답 형식 오류:', response);
            break;
          }

          page++;
        } while (allFetchedData.length < apiTotalCount);

        // 카테고리 목록 구성
        const supportTypeSet = new Set();
        const userTypeSet = new Set();
        const serviceFieldSet = new Set();

        allFetchedData.forEach(function (item) {
          if (item.supportType) supportTypeSet.add(item.supportType);
          if (item.userType) userTypeSet.add(item.userType);
          if (item.serviceField) serviceFieldSet.add(item.serviceField);
        });

        // 캐시 저장 (랜덤 정렬은 원할 경우 이 시점에서 섞기 가능)
        localStorage.setItem('cachedServiceList', JSON.stringify({
          services: allFetchedData,
          supportTypes: Array.from(supportTypeSet).sort(),
          userTypes: Array.from(userTypeSet).sort(),
          serviceFields: Array.from(serviceFieldSet).sort(),
          timestamp: Date.now(),
        }));

        setAllServices(allFetchedData);
        setSupportTypeList(Array.from(supportTypeSet).sort());
        setUserTypeList(Array.from(userTypeSet).sort());
        setServiceFieldList(Array.from(serviceFieldSet).sort());
        setLoading(false);
      } catch (err) {
        console.error('서비스 목록 불러오기 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    loadAllServices();
  }, []);

  // 필터가 변경될 때마다 재적용
  useEffect(function () {
    applyFilter();
  }, [allServices, currentPage, supportType, userType, serviceField, searchTrigger, applyFilter]);

  // 사용자 입력 핸들러들
  function handleInputChange(e) {
    const { name, value } = e.target;
    if (name === 'searchKeyword') setSearchKeyword(value);
    else if (name === 'supportType') setSupportType(value);
    else if (name === 'userType') setUserType(value);
    else if (name === 'serviceField') setServiceField(value);
  }

  function handleSearch() {
    setSearchTrigger(searchKeyword);
    setCurrentPage(1);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function handleReset() {
    setSearchKeyword('');
    setSearchTrigger('');
    setSupportType('');
    setUserType('');
    setServiceField('');
    setCurrentPage(1);
  }

  function handlePageChange(event, value) {
    setCurrentPage(value);
  }

  function renderCard(service) {
    return (
      <Grid item xs={12} sm={6} md={4} key={service.servId}>
        <Card
          onClick={function () {
            navigate(`/service/detail/${service.servId}`, { state: service });
          }}
          variant="outlined"
          sx={{
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: 6,
              cursor: 'pointer',
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom noWrap>
              {service.servNm}
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {service.servDgst}
            </Typography>
            <Box mt={2}>
              <Typography variant="caption" display="block" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                지원유형: {service.supportType || '-'}
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                사용자구분: {service.userType || '-'}
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                서비스분야: {service.serviceField || '-'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        공공서비스 목록
      </Typography>

      {/* 필터 영역 */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3} alignItems="center">
        <TextField
          name="searchKeyword"
          label="서비스명 또는 요약 검색"
          variant="outlined"
          value={searchKeyword}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <FormControl variant="outlined" style={{ minWidth: 160 }}>
          <InputLabel>지원유형</InputLabel>
          <Select name="supportType" value={supportType} onChange={handleInputChange} label="지원유형">
            <MenuItem value="">
              <em>전체</em>
            </MenuItem>
            {supportTypeList.map(function (type, idx) {
              return (
                <MenuItem key={idx} value={type}>
                  {type}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ minWidth: 160 }}>
          <InputLabel>사용자 구분</InputLabel>
          <Select name="userType" value={userType} onChange={handleInputChange} label="사용자 구분">
            <MenuItem value="">
              <em>전체</em>
            </MenuItem>
            {userTypeList.map(function (type, idx) {
              return (
                <MenuItem key={idx} value={type}>
                  {type}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ minWidth: 160 }}>
          <InputLabel>서비스 분야</InputLabel>
          <Select name="serviceField" value={serviceField} onChange={handleInputChange} label="서비스 분야">
            <MenuItem value="">
              <em>전체</em>
            </MenuItem>
            {serviceFieldList.map(function (field, idx) {
              return (
                <MenuItem key={idx} value={field}>
                  {field}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleSearch} sx={{ height: 56 }}>
          검색
        </Button>
        <Button variant="outlined" onClick={handleReset} sx={{ height: 56 }}>
          초기화
        </Button>
      </Box>

      {/* 카드 목록 */}
      <Grid container spacing={2}>{services.map(renderCard)}</Grid>

      {/* 페이지네이션 */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(totalItems / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
}

export default ServiceList;
