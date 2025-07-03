import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';

{/*
    작성자 : 이정원
    날짜 : 2025-07-03
    내용 : 상가 상세정보 페이지 작성(ag-Grid 적용)
*/}
// ag-Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function CommercialDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [storeDetail, setStoreDetail] = useState(null);
  const [relatedStores, setRelatedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState(null);
  
  // 이전 검색 조건 저장 (상세 페이지에서 돌아갈 때 사용)
  const previousSearchConditions = location.state?.searchConditions;

  const serverUrl = import.meta.env.VITE_BACK_SERVER;

  // ag-Grid 컬럼 정의
  const [colDefs] = useState([
    { 
      field: "storeName", 
      headerName: "상호명", 
      width: 200,
      cellStyle: { fontWeight: 'bold' },
      filter: 'agTextColumnFilter',
      floatingFilter: true
    },
    { 
      field: "roadAddr", 
      headerName: "도로명주소", 
      width: 300,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: function(params) {
        return params.value || params.data.landAddr;
      }
    },
    {
      field: "categoryLarge",
      headerName: "대분류",
      width: 150,
      filter: 'agSetColumnFilter',
      floatingFilter: true
    },
    { 
      field: "categoryMedium", 
      headerName: "중분류", 
      width: 150,
      filter: 'agSetColumnFilter',
      floatingFilter: true
    },
    { 
      field: "categorySmall", 
      headerName: "소분류", 
      width: 150,
      filter: 'agSetColumnFilter',
      floatingFilter: true
    }
  ]);

  // 전역 함수로 등록 (ag-grid 셀 렌더러에서 사용) - ag-Grid와 React 간의 브릿지 역할(React 컴포넌트의 기능을 ag-Grid에서 사용할 수 있게 해주는 우회 방법)
  useEffect(function() {
    window.viewStore = function(id) {
      navigate(`/commercial/detail/${id}`);
    };
    
    return function() {
      delete window.viewStore;
    };
  }, [navigate]);

  // 상가 상세정보 조회
  useEffect(function() {
    if (storeId) {
      fetchStoreDetail();
    }
  }, [storeId]);

  function fetchStoreDetail() {
    setLoading(true);
    
    // 개별 상가 정보 조회
    axios.get(`${serverUrl}/commercial/detail/${storeId}`)
      .then(function(detailRes) {
        const store = detailRes.data;
        setStoreDetail(store); // 상점 정보를 state에 저장

        // 관련 상가 목록 조회 (같은 중분류)
        if (store.mediumCode) {
          return axios.get(`${serverUrl}/commercial/filter`, {
            params: {
              mediumCode: store.mediumCode,
              page: 1,
              size: 300000
            }
          });
        }
        return null;
      })
      .then(function(relatedRes) {
        if (relatedRes) {
          // 현재 상가 제외하고 표시
          const filteredStores = relatedRes.data.list.filter(function(s) {
            return s.storeId !== storeId;
          });
          setRelatedStores(filteredStores);
        }
        setLoading(false);
      })
      .catch(function(error) {
        console.error('Error fetching store detail:', error);
        setLoading(false);
      });
  }

  // 지도로 돌아가기
  function handleBackToMap() {
    if (previousSearchConditions) {
      // 이전 검색 조건이 있는 경우 그대로 전달
      navigate('/commercial', {
        state: {
          searchConditions: previousSearchConditions
        }
      });
    } else {
      // 이전 검색 조건이 없는 경우 기본 페이지로 이동
      navigate('/commercial');
    }
  }

  // 전체 필터 초기화
  function handleClearFilters() {
    if (gridApi) {
      gridApi.setFilterModel(null);
    }
  }

  // ag-Grid 준비 완료 시 호출
  function onGridReady(params) {
    setGridApi(params.api);
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  // 상가 정보를 찾을 수 없을 때
  if (!storeDetail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>상가 정보를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  // 1. 중복 없는 중분류 목록 만들기 (Set, map 금지)
function getUniqueCategorySmalls(relatedStores) {
  var smalls = [];
  for (var i = 0; i < relatedStores.length; i++) {
    var small = relatedStores[i].categorySmall || '기타';
    var exists = false;

    for (var j = 0; j < smalls.length; j++) {
      if (smalls[j] === small) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      smalls.push(small);
    }
  }
  return smalls;
}

// 2. 각 중분류별 상가 수 계산
function countStoresBySmall(relatedStores, smalls) {
  var counts = [];
  for (var i = 0; i < smalls.length; i++) {
    var label = smalls[i];
    var count = 0;

    for (var j = 0; j < relatedStores.length; j++) {
      var small = relatedStores[j].categorySmall || '기타';
      if (small === label) {
        count++;
      }
    }

    counts.push(count);
  }
  return counts;
}

// 3. chart.js용 데이터 구성
function createChartData(relatedStores) {
  var smalls = getUniqueCategorySmalls(relatedStores);
  var counts = countStoresBySmall(relatedStores, smalls);

  return {
    labels: smalls,
    datasets: [{
      label: '중분류별 상가 수',
      data: counts,
      backgroundColor: '#42a5f5'
    }]
  };
}

// 4. chart.js 옵션 (기본)
function getChartOptions() {
  return {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: '중분류별 상가 수 비교'
      }
    }
  };
}
// 5. doughnut 차트용 데이터 구성
function createDoughnutData(relatedStores) {
  var smalls = getUniqueCategorySmalls(relatedStores);
  var counts = countStoresBySmall(relatedStores, smalls);

  return {
    labels: smalls,
    datasets: [{
      data: counts,
      backgroundColor: [
        '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#26a69a', '#ef5350',
        '#ec407a', '#7e57c2', '#ffee58', '#8d6e63', '#789262'
      ],
      borderWidth: 1
    }]
  };
}
  // 상가 정보 표시
  return (
    <Box sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToMap}
          variant="outlined"
        >
          지도로 돌아가기
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          상가 상세정보
        </Typography>
      </Box>

      {/* 상가 기본 정보 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            {storeDetail.storeName}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={storeDetail.categoryLarge} color="primary" size="small" />
            <Chip label={storeDetail.categoryMedium} color="secondary" size="small" />
            <Chip label={storeDetail.categorySmall} color="default" size="small" />
          </Box>

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>📍 주소:</strong> {storeDetail.roadAddr || storeDetail.landAddr}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>🏢 지역:</strong> {storeDetail.provinceName} {storeDetail.districtName} {storeDetail.townName}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            <strong>ID:</strong> {storeDetail.storeId}
          </Typography>
        </CardContent>
      </Card>

      {/* 차트 시각화 영역 */}
      <Box sx={{ mb: 4, display: 'flex', gap: 4, justifyContent: 'space-between' }}>
        {/* Bar 차트 (왼쪽) */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>중분류별 상가 수</Typography>
          <Bar options={getChartOptions()} data={createChartData(relatedStores)} />
        </Box>

        {/* Doughnut 차트 (오른쪽) */}
        <Box sx={{ width: 300 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>중분류 비율</Typography>
          <Doughnut data={createDoughnutData(relatedStores)} />
        </Box>
      </Box>


      <Divider sx={{ mb: 3 }} />

      {/* 관련 상가 목록 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            관련 상가 목록 ({storeDetail.categoryMedium})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            같은 업종의 상가 {relatedStores.length}개를 표시합니다.
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClearFilters}
          sx={{ ml: 2 }}
        >
          필터 초기화
        </Button>
      </Box>

      {/* ag-Grid */}
      <Box sx={{ height: '500px', width: '100%' }}>
        <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
          <AgGridReact
            rowData={relatedStores}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={20}
            domLayout="normal"
            rowSelection="single"
            animateRows={true}
            onGridReady={onGridReady}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true
            }}
          />
        </div>
      </Box>
    </Box>
  );
} 