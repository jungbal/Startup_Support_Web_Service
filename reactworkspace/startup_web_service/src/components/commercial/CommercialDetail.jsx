import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
import Swal from 'sweetalert2';

{/*
    작성자 : 이정원
    날짜 : 2025-07-03
    내용 : 상가 상세정보 페이지 작성(ag-Grid 적용)

    작성자 :이정원
    날짜 : 2025-07-03 17:16
    내용 : 관련 상가 목록 엑셀 저장 기능 추가
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

  // SweetAlert2 공통 함수
  const showAlert = function(type, text) {
    Swal.fire({
      title: '알림',
      text: text,
      icon: type,
      confirmButtonText: '확인'
    });
  };

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
        field: "landAddr",
        headerName: "지번주소",
        width: 300,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellRenderer: function(params) {
            return params.value || params.data.landAddr;
        }
    },
    { 
      field: "roadAddr", 
      headerName: "도로명주소", 
      width: 300,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellRenderer: function(params) {
        return params.value || params.data.roadAddr;
      }
    },
    {
      field: "categoryLarge",
      headerName: "대분류",
      width: 150,
      filter: 'agTextColumnFilter',
      floatingFilter: true
    },
    { 
      field: "categoryMedium", 
      headerName: "중분류", 
      width: 150,
      filter: 'agTextColumnFilter',
      floatingFilter: true
    },
    { 
      field: "categorySmall", 
      headerName: "소분류", 
      width: 150,
      filter: 'agTextColumnFilter',
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

  // ag-Grid 행 클릭 시 해당 상가 상세페이지로 이동
  function onRowClicked(params) {
    const clickedStoreId = params.data.storeId;
    if (clickedStoreId) {
      navigate(`/commercial/detail/${clickedStoreId}`, {
        state: {
          searchConditions: previousSearchConditions
        }
      });
    }
  }

    // 엑셀 내보내기 (XLSX 형식) - 선택된 항목 또는 필터링된 항목만 저장
  function handleExportToExcel() {
    if (!gridApi) {
      showAlert('error', '그리드가 준비되지 않았습니다.');
      return;
    }

    let dataToExport = [];
    let exportType = '';

    // 1. 선택된 행들이 있는지 확인
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      dataToExport = selectedRows;
      exportType = '선택된';
    } else {
      // 2. 선택된 행이 없으면 필터가 적용되었는지 확인
      const filterModel = gridApi.getFilterModel();
      const hasFilter = filterModel && Object.keys(filterModel).length > 0;
      
      if (!hasFilter) {
        // 필터도 적용되지 않은 상태에서는 저장 불가
        showAlert('warning', '데이터를 저장하려면 행을 선택하거나 필터를 적용해주세요.');
        return;
      }
      
      // 3. 필터가 적용된 경우 현재 표시된 데이터 가져오기
      const displayedRowCount = gridApi.getDisplayedRowCount();
      if (displayedRowCount === 0) {
        showAlert('error', '필터링된 데이터가 없습니다.');
        return;
      }
      
      // 필터링된 모든 행 가져오기
      for (let i = 0; i < displayedRowCount; i++) {
        const rowNode = gridApi.getDisplayedRowAtIndex(i);
        if (rowNode) {
          dataToExport.push(rowNode.data);
        }
      }
      exportType = '필터링된';
    }

    if (dataToExport.length === 0) {
      showAlert('error', '내보낼 데이터가 없습니다.');
      return;
    }

    // 엑셀용 데이터 변환 - json 형식의 데이터를 엑셀 형식으로 변환
    const excelData = dataToExport.map(function(store) {
      return {
        '상호명': store.storeName || '',
        '지번주소': store.zibunAddr || store.landAddr || '',
        '도로명주소': store.roadAddr || '',
        '대분류': store.categoryLarge || '',
        '중분류': store.categoryMedium || '',
        '소분류': store.categorySmall || ''
      };
    });

    // 워크시트 생성 - json 형식의 데이터를 엑셀 형식으로 변환
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 25 }, // 상호명
      { wch: 35 }, // 지번주소
      { wch: 35 }, // 도로명주소
      { wch: 15 }, // 대분류
      { wch: 15 }, // 중분류
      { wch: 15 }, // 소분류
      { wch: 15 }  // 상가ID
    ];
    worksheet['!cols'] = columnWidths;

    // 워크북 생성 - 워크시트를 워크북에 추가하기 위해 생성
    const workbook = XLSX.utils.book_new();
    
    // 워크시트를 워크북에 추가 - 워크시트를 워크북에 추가하기 위해 생성
    XLSX.utils.book_append_sheet(workbook, worksheet, '관련상가목록');

    // 파일명 생성 (선택된 항목인지 필터링된 항목인지 구분)
    const fileName = `${exportType}상가목록_${storeDetail?.categoryMedium || '상가정보'}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // 파일 다운로드
    XLSX.writeFile(workbook, fileName);
    
          // 사용자에게 알림
      showAlert('success', `${exportType} 상가 ${dataToExport.length}개가 엑셀로 저장되었습니다.`);
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
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
          >
            필터 초기화
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportToExcel}
          >
            엑셀 저장
          </Button>
        </Box>
      </Box>

      {/* ag-Grid */}
      <Box sx={{ height: '500px', width: '100%' }}>
        <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
          <AgGridReact
            rowData={relatedStores}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={100}
            domLayout="normal"
            rowSelection={{ mode: 'multiRow' }}
            animateRows={true}
            onGridReady={onGridReady}
            onRowClicked={onRowClicked}
            theme="legacy"
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true
            }}
            getRowStyle={function(params) {
              return {
                cursor: 'pointer'
              };
            }}
          />
        </div>
      </Box>
    </Box>
  );
} 