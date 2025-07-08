// ServiceList.jsx
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

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; 

function ServiceList() {
  const navigate = useNavigate();
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

  useEffect(function () {
    async function loadAllServices() {
      setLoading(true);
      try {
        const cachedData = localStorage.getItem('cachedServiceList');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (Date.now() - parsedData.timestamp < CACHE_EXPIRATION_TIME) {
            setAllServices(parsedData.services);
            setSupportTypeList(parsedData.supportTypes);
            setUserTypeList(parsedData.userTypes);
            setServiceFieldList(parsedData.serviceFields);
            setLoading(false);
            console.log("서비스 목록을 캐시에서 불러왔습니다.");
            return;
          } else {
            console.log("캐시가 만료되어 새로운 데이터를 불러옵니다.");
            localStorage.removeItem('cachedServiceList');
          }
        }

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
            console.error('API 응답 형식이 예상과 다릅니다:', response);
            break;
          }
          page++;
        } while (allFetchedData.length < apiTotalCount);

        allFetchedData.sort(function (a, b) {
          return a.servNm.localeCompare(b.servNm, 'ko');
        });

        const supportTypeSet = new Set();
        const userTypeSet = new Set();
        const serviceFieldSet = new Set();

        allFetchedData.forEach(function (item) {
          if (item.supportType) supportTypeSet.add(item.supportType);
          if (item.userType) userTypeSet.add(item.userType);
          if (item.serviceField) serviceFieldSet.add(item.serviceField);
        });

        const sortedSupportTypes = Array.from(supportTypeSet).sort();
        const sortedUserTypes = Array.from(userTypeSet).sort();
        const sortedServiceFields = Array.from(serviceFieldSet).sort();

        localStorage.setItem('cachedServiceList', JSON.stringify({
          services: allFetchedData,
          supportTypes: sortedSupportTypes,
          userTypes: sortedUserTypes,
          serviceFields: sortedServiceFields,
          timestamp: Date.now(),
        }));

        setAllServices(allFetchedData);
        setSupportTypeList(sortedSupportTypes);
        setUserTypeList(sortedUserTypes);
        setServiceFieldList(sortedServiceFields);
        setLoading(false);
        console.log("서비스 목록을 API에서 새로 불러왔습니다.");
      } catch (err) {
        console.error('서비스 목록 가져오기 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    loadAllServices();
  }, []);

  useEffect(function () {
    applyFilter();
  }, [allServices, currentPage, supportType, userType, serviceField, searchTrigger, applyFilter]);

  const handleInputChange = function (e) {
    const { name, value } = e.target;
    if (name === 'searchKeyword') setSearchKeyword(value);
    else if (name === 'supportType') setSupportType(value);
    else if (name === 'userType') setUserType(value);
    else if (name === 'serviceField') setServiceField(value);
  };

  const handleSearch = function () {
    setSearchTrigger(searchKeyword);
    setCurrentPage(1);
  };

  const handleKeyDown = function (e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = function () {
    setSearchKeyword('');
    setSearchTrigger('');
    setSupportType('');
    setUserType('');
    setServiceField('');
    setCurrentPage(1);
  };

  const handlePageChange = function (event, value) {
    setCurrentPage(value);
  };

  const renderCard = function (service) {
    return (
      <Grid item xs={12} sm={6} md={4} key={service.servId}>
        <Card
          onClick={function () {
            console.log("✅ 상세페이지로 보낼 데이터:", service); // ✅ 위치 1
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
            <Typography variant="h6" gutterBottom noWrap>{service.servNm}</Typography>
            <Typography variant="body2" gutterBottom sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{service.servDgst}</Typography>
            <Box mt={2}>
              <Typography variant="caption" display="block" sx={{ color: 'primary.main', fontWeight: 'bold' }}>지원유형: {service.supportType || '-'}</Typography>
              <Typography variant="caption" display="block" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>사용자구분: {service.userType || '-'}</Typography>
              <Typography variant="caption" display="block" sx={{ color: 'success.main', fontWeight: 'bold' }}>서비스분야: {service.serviceField || '-'}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>공공서비스 목록</Typography>

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
            <MenuItem value=""><em>전체</em></MenuItem>
            {supportTypeList.map(function (type, idx) {
              return <MenuItem key={idx} value={type}>{type}</MenuItem>;
            })}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ minWidth: 160 }}>
          <InputLabel>사용자 구분</InputLabel>
          <Select name="userType" value={userType} onChange={handleInputChange} label="사용자 구분">
            <MenuItem value=""><em>전체</em></MenuItem>
            {userTypeList.map(function (type, idx) {
              return <MenuItem key={idx} value={type}>{type}</MenuItem>;
            })}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ minWidth: 160 }}>
          <InputLabel>서비스 분야</InputLabel>
          <Select name="serviceField" value={serviceField} onChange={handleInputChange} label="서비스 분야">
            <MenuItem value=""><em>전체</em></MenuItem>
            {serviceFieldList.map(function (field, idx) {
              return <MenuItem key={idx} value={field}>{field}</MenuItem>;
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

      <Grid container spacing={2}>
        {services.map(renderCard)}
      </Grid>

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