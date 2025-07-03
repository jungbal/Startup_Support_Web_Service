import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useCommercialStore from '../../store/useCommercialStore';

import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Pagination,
  PaginationItem
} from '@mui/material';


export default function CommercialMain() {
  const {
    largeList,
    setLargeList,
    middleList,
    setMiddleList,
    smallList,
    setSmallList,
    selectedLargeCode,
    setSelectedLargeCode,
    selectedMediumCode,
    setSelectedMediumCode,
    selectedSmallCode,
    setSelectedSmallCode,
    keyword,
    setKeyword,
    storeList,
    setStoreList,
  } = useCommercialStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const infoWindowRef = useRef(null);

  const serverUrl = import.meta.env.VITE_BACK_SERVER;
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  const navigate = useNavigate();
  const location = useLocation();

  // 전역 함수로 등록 (InfoWindow 버튼에서 사용)
  // 상가 상세정보 페이지 이동
  useEffect(() => {
    window.goToDetail = (storeId) => {
      navigate(`/commercial/detail/${storeId}`, {
        state: {
          searchConditions: {
            selectedLargeCode,
            selectedMediumCode,
            selectedSmallCode,
            keyword,
            currentPage,
            itemsPerPage
          }
        }
      });
    };
    
    return () => {
      delete window.goToDetail;
    };
  }, [navigate, selectedLargeCode, selectedMediumCode, selectedSmallCode, keyword, currentPage, itemsPerPage]);

  useEffect(function() {
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = function() { window.kakao.maps.load(initMap); };
      document.head.appendChild(script);
    }
  }, [kakaoKey]);

  function initMap() {
    const container = document.getElementById('kakao-map');
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    };

    const mapInstance = new window.kakao.maps.Map(container, options);
    setMap(mapInstance);
  }

  // InfoWindow HTML 내용 생성 함수
  function createInfoWindowContent(store, address) {
    return `
      <div style="padding: 15px; width: 250px; font-family: Arial, sans-serif;">
        <div style="font-weight: bold; font-size: 16px; color: #333; margin-bottom: 8px;">
          ${store.storeName}
        </div>
        <div style="font-size: 14px; color: #666; line-height: 1.4; margin-bottom: 8px;">
          📍 ${address}
        </div>
        <div style="font-size: 12px; color: #999; margin-bottom: 12px;">
          ${store.categoryLarge} > ${store.categoryMedium} > ${store.categorySmall}
        </div>
        <button 
          onclick="window.goToDetail('${store.storeId}')"
          style="
            background: #1976d2; 
            color: white; 
            border: none; 
            border-radius: 6px; 
            padding: 8px 16px; 
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            width: 100%;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.background='#1565c0'"
          onmouseout="this.style.background='#1976d2'"
        >
          📋 상세정보 보기
        </button>
      </div>
    `;
  }

  function displayMarkers(stores) {
    if (!map || !window.kakao || !window.kakao.maps.services) return;

    // 기존 마커들 제거
    markers.forEach(function(marker) { marker.setMap(null); });
    
    // 기존 InfoWindow 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const newMarkers = [];
    const bounds = new window.kakao.maps.LatLngBounds();
    const geocoder = new window.kakao.maps.services.Geocoder();

    let pending = stores.length;
    if (pending === 0) {
      setMarkers([]);
      return;
    }

    stores.forEach(function(store) {
      const address = store.roadAddr || store.landAddr ||
        `${store.provinceName || ''} ${store.districtName || ''} ${store.townName || ''}`.trim();

      if (!address) {
        pending--;
        if (pending === 0) {
          if (newMarkers.length > 0) map.setBounds(bounds);
          setMarkers(newMarkers);
        }
        return;
      }

      geocoder.addressSearch(address, function(result, status) {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          const marker = new window.kakao.maps.Marker({ map: map, position: coords });
          newMarkers.push(marker);
          bounds.extend(coords);

          // 마커 클릭 시 InfoWindow 표시
          window.kakao.maps.event.addListener(marker, 'click', function() {
            // 기존 InfoWindow 닫기
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }
            
            // InfoWindow 내용 생성
            const content = createInfoWindowContent(store, address);
            
            // 새 InfoWindow 생성 및 표시
            const newInfoWindow = new window.kakao.maps.InfoWindow({
              content: content,
              removable: true
            });
            
            newInfoWindow.open(map, marker);
            infoWindowRef.current = newInfoWindow;
            
            // 지도 중심 이동
            map.panTo(coords);
          });
        }

        pending--;
        if (pending === 0) {
          if (newMarkers.length > 0) map.setBounds(bounds);
          setMarkers(newMarkers);
        }
      });
    });
  }

  function moveToMarker(store) {
    if (!map || !window.kakao || !window.kakao.maps.services) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    const address = store.roadAddr || store.landAddr ||
      `${store.provinceName || ''} ${store.districtName || ''} ${store.townName || ''}`.trim();

    if (!address) return;

    geocoder.addressSearch(address, function(result, status) {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        
        // 기존 InfoWindow 닫기
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        // InfoWindow 내용 생성
        const content = createInfoWindowContent(store, address);
        
        // 새 InfoWindow 생성 및 표시
        const newInfoWindow = new window.kakao.maps.InfoWindow({
          content: content,
          removable: true
        });
        
        // 해당 위치의 마커 찾기 (정확한 마커 매칭을 위해)
        const targetMarker = markers.find(function(marker) {
          const markerPosition = marker.getPosition();
          return Math.abs(markerPosition.getLat() - coords.getLat()) < 0.0001 && 
                 Math.abs(markerPosition.getLng() - coords.getLng()) < 0.0001;
        });
        
        if (targetMarker) {
          newInfoWindow.open(map, targetMarker);
        } else {
          // 마커를 찾지 못한 경우 좌표에 InfoWindow 표시
          newInfoWindow.open(map, coords);
        }
        
        infoWindowRef.current = newInfoWindow;
        
        // 지도를 특정 좌표로 이동시키면서 레벨을 조정
        map.setLevel(2, { anchor: coords, animate: true }); // 레벨 2로 확대, 부드러운 애니메이션
        map.panTo(coords); // 해당 좌표로 중심 이동
      }
    });
  }

  function handleSearch() {
    setCurrentPage(1);
    fetchStoreList(1);
  }

  function fetchStoreList(page) {
    let queryParams = [];
    if (selectedLargeCode) queryParams.push(`largeCode=${selectedLargeCode}`);
    if (selectedMediumCode) queryParams.push(`mediumCode=${selectedMediumCode}`);
    if (selectedSmallCode) queryParams.push(`smallCode=${selectedSmallCode}`);
    if (keyword) queryParams.push(`keyword=${keyword}`);
    queryParams.push(`page=${page}`);
    queryParams.push(`size=${itemsPerPage}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    axios.get(`${serverUrl}/commercial/filter${queryString}`)
      .then(function(res) {
        const list = Array.isArray(res.data.list) ? res.data.list : [];
        const totalCount = res.data.totalCount || 0;
        setStoreList(list);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
      })
      .catch(function(err) {
        console.error('Error fetching filtered commercial data:', err);
        setStoreList([]);
        setTotalPages(1);
      });
  }

  function handlePageChange(event, value) {
    setCurrentPage(value);
    fetchStoreList(value);
  }

  useEffect(function() {
    axios.get(`${serverUrl}/commercial/large`)
      .then(function(res) {
        setLargeList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(function(err) {
        console.error('Error fetching large categories:', err);
        setLargeList([]);
      });
  }, [serverUrl]);

  useEffect(function() {
    if (selectedLargeCode) {
      axios.get(`${serverUrl}/commercial/middle?largeCode=${selectedLargeCode}`)
        .then(function(res) {
          setMiddleList(Array.isArray(res.data) ? res.data : []);
          setSelectedMediumCode('');
          setSmallList([]);
          setSelectedSmallCode('');
        })
        .catch(function(err) {
          console.error('Error fetching medium categories:', err);
          setMiddleList([]);
          setSelectedMediumCode('');
          setSmallList([]);
          setSelectedSmallCode('');
        });
    } else {
      setMiddleList([]);
      setSelectedMediumCode('');
      setSmallList([]);
      setSelectedSmallCode('');
    }
  }, [selectedLargeCode, serverUrl]);

  useEffect(function() {
    if (selectedLargeCode && selectedMediumCode) {
      axios.get(`${serverUrl}/commercial/small?largeCode=${selectedLargeCode}&mediumCode=${selectedMediumCode}`)
        .then(function(res) { setSmallList(Array.isArray(res.data) ? res.data : []); })
        .catch(function(err) {
          console.error('Error fetching small categories:', err);
          setSmallList([]);
          setSelectedSmallCode('');
        });
    } else {
      setSmallList([]);
      setSelectedSmallCode('');
    }
  }, [selectedLargeCode, selectedMediumCode, serverUrl]);

  // 이전 검색 조건 복원 및 초기 데이터 로딩
  useEffect(function() {
    const searchConditions = location.state?.searchConditions;
    if (searchConditions) {
      // 상세 페이지에서 돌아온 경우 - 이전 검색 조건 복원
      setSelectedLargeCode(searchConditions.selectedLargeCode || '');
      setSelectedMediumCode(searchConditions.selectedMediumCode || '');
      setSelectedSmallCode(searchConditions.selectedSmallCode || '');
      setKeyword(searchConditions.keyword || '');
      setCurrentPage(searchConditions.currentPage || 1);
      setItemsPerPage(searchConditions.itemsPerPage || 8);
      
      // 검색 조건이 있는 경우 해당 페이지의 데이터 로딩
      fetchStoreList(searchConditions.currentPage || 1);
    } else {
      // 메뉴에서 진입한 경우 - 초기 상태로 설정하고 데이터 로딩
      setSelectedLargeCode('');
      setSelectedMediumCode('');
      setSelectedSmallCode('');
      setKeyword('');
      setCurrentPage(1);
      setItemsPerPage(8);
      
      fetchStoreList(1);
    }
  }, [location.state, serverUrl]);

  // 지도가 준비되면 현재 storeList로 마커 표시
  useEffect(function() {
    if (map) {
      displayMarkers(storeList);
    }
  }, [map, storeList]);

  // 페이지 번호를 5개 그룹으로 제한하는 커스텀 renderItem 함수
  function renderPaginationItem(item) {
    if (item.type === 'page') {
      const displayPageCount = 5; // 한 번에 표시할 페이지 번호 개수
      let startPage = Math.max(1, currentPage - Math.floor(displayPageCount / 2));
      let endPage = Math.min(totalPages, startPage + displayPageCount - 1);

      // 전체 페이지 끝 부분에 있을 때 5개 페이지가 표시되도록 startPage 조정
      if (endPage - startPage + 1 < displayPageCount) {
        startPage = Math.max(1, endPage - displayPageCount + 1);
      }

      if (item.page >= startPage && item.page <= endPage) {
        return <PaginationItem {...item} />;
      }
      return null;
    }
    return <PaginationItem {...item} />;
  }


  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Box
        id="kakao-map"
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 300,
          padding: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 10,
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="large-category-label">대분류</InputLabel>
          <Select
            labelId="large-category-label"
            id="large-category-select"
            value={selectedLargeCode || ''}
            label="대분류"
            onChange={function(e) { setSelectedLargeCode(e.target.value); }}
            size="small"
          >
            <MenuItem value="">대분류 전체</MenuItem>
            {largeList.map(function(item) {
              return (
                <MenuItem key={item.CODE} value={item.CODE}>
                  {item.NAME}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedLargeCode}>
          <InputLabel id="medium-category-label">중분류</InputLabel>
          <Select
            labelId="medium-category-label"
            id="medium-category-select"
            value={selectedMediumCode || ''}
            label="중분류"
            onChange={function(e) { setSelectedMediumCode(e.target.value); }}
            size="small"
          >
            <MenuItem value="">중분류 전체</MenuItem>
            {middleList.map(function(item) {
              return (
                <MenuItem key={item.CODE} value={item.CODE}>
                  {item.NAME}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedMediumCode}>
          <InputLabel id="small-category-label">소분류</InputLabel>
          <Select
            labelId="small-category-label"
            id="small-category-select"
            value={selectedSmallCode || ''}
            label="소분류"
            onChange={function(e) { setSelectedSmallCode(e.target.value); }}
            size="small"
          >
            <MenuItem value="">소분분류 전체</MenuItem>
            {smallList.map(function(item) {
              return (
                <MenuItem key={item.CODE} value={item.CODE}>
                  {item.NAME}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <TextField
          label="상호명"
          variant="outlined"
          value={keyword || ''}
          onChange={function(e) { setKeyword(e.target.value); }}
          fullWidth
          size="small"
        />

        <Button variant="contained" onClick={handleSearch} sx={{ mt: 1 }}>
          검색
        </Button>
      </Box>

      {storeList.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 350,
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {storeList.map(function(store, index) {
            return (
              <Card
                key={store.storeId || index}
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f1f1f1',
                  },
                  borderBottom: '1px solid #ddd'
                }}
                onClick={function() { moveToMarker(store); }}
              >
                <CardContent sx={{ padding: 1.5, '&:last-child': { paddingBottom: 1.5 } }}>
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {store.storeName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {store.roadAddr || store.landAddr}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {store.categoryLarge} &gt; {store.categoryMedium} &gt; {store.categorySmall}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, mt: 'auto' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              renderItem={renderPaginationItem}
              sx={{
                '& .MuiPaginationItem-root': {
                  margin: '-0.5px',
                  minWidth: '32px',
                  height: '32px',
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}