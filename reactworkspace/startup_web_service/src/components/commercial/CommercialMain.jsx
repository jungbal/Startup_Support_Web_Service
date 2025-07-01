import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';

import useCommercialStore from '../../store/useCommercialStore';

export default function CommercialMain() {
  // Zustand 상태 가져오기
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

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const serverUrl = import.meta.env.VITE_BACK_SERVER;
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  // 카카오 지도 초기화
  useEffect(function() {
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      var script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`;
      script.async = true;
      script.onload = function() {
        window.kakao.maps.load(initMap);
      };
      document.head.appendChild(script);
    }
  }, [kakaoKey]);

  function initMap() {
    var container = document.getElementById('kakao-map');
    if (!container) return;

    var options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    };
    var mapInstance = new window.kakao.maps.Map(container, options);
    setMap(mapInstance);
  }

  // 마커 출력
  function displayMarkers(stores) {
    markers.forEach(function(m) { m.setMap(null); });
    var newMarkers = [];

    if (!map) return;
    var bounds = new window.kakao.maps.LatLngBounds();

    stores.forEach(function(store) {
      var lat = parseFloat(store.latitude);
      var lng = parseFloat(store.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        var position = new window.kakao.maps.LatLng(lat, lng);
        var marker = new window.kakao.maps.Marker({ position: position });
        marker.setMap(map);
        newMarkers.push(marker);
        bounds.extend(position);
      }
    });

    if (newMarkers.length > 0) {
      map.setBounds(bounds);
    }

    setMarkers(newMarkers);
  }

  // 마커 클릭 시 이동
  function moveToMarker(store) {
    var lat = parseFloat(store.latitude);
    var lng = parseFloat(store.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      var moveLatLng = new window.kakao.maps.LatLng(lat, lng);
      map.panTo(moveLatLng);
    }
  }

  // 검색 요청
  function handleSearch() {
    var params = new URLSearchParams();
    if (selectedLargeCode) params.append('largeCode', selectedLargeCode);
    if (selectedMediumCode) params.append('mediumCode', selectedMediumCode);
    if (selectedSmallCode) params.append('smallCode', selectedSmallCode);
    if (keyword) params.append('keyword', keyword);

    axios.get(serverUrl + 'commercial/filter?' + params.toString())
      .then(function(res) {
        var list = res.data.list || [];
        setStoreList(list);
        displayMarkers(list);
      })
      .catch(function() {
        setStoreList([]);
        displayMarkers([]);
      });
  }

  // 대분류 불러오기
  useEffect(function() {
    axios.get(serverUrl + 'commercial/large')
      .then(function(res) {
        setLargeList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(function() {
        setLargeList([]);
      });
  }, [serverUrl, setLargeList]);

  // 중분류 불러오기 및 선택 초기화
  useEffect(function() {
    if (selectedLargeCode) {
      axios.get(serverUrl + 'commercial/middle?largeCode=' + selectedLargeCode)
        .then(function(res) {
          setMiddleList(Array.isArray(res.data) ? res.data : []);
          setSelectedMediumCode('');
          setSmallList([]);
          setSelectedSmallCode('');
        })
        .catch(function() {
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
  }, [selectedLargeCode, serverUrl, setMiddleList, setSelectedMediumCode, setSmallList, setSelectedSmallCode]);

  // 소분류 불러오기 및 선택 초기화
  useEffect(function() {
    if (selectedLargeCode && selectedMediumCode) {
      axios.get(serverUrl + 'commercial/small?largeCode=' + selectedLargeCode + '&mediumCode=' + selectedMediumCode)
        .then(function(res) {
          setSmallList(Array.isArray(res.data) ? res.data : []);
        })
        .catch(function() {
          setSmallList([]);
          setSelectedSmallCode('');
        });
    } else {
      setSmallList([]);
      setSelectedSmallCode('');
    }
  }, [selectedLargeCode, selectedMediumCode, serverUrl, setSmallList, setSelectedSmallCode]);

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 필터 패널 */}
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: 3,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.95)',
        }}
      >
        <FormControl fullWidth size="small">
          <InputLabel>대분류 선택</InputLabel>
          <Select
            value={selectedLargeCode || ''}
            label="대분류 선택"
            onChange={function(e) {
              setSelectedLargeCode(e.target.value);
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {largeList.map(function(item) {
              return (
                <MenuItem key={item.code} value={item.code}>
                  {item.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedLargeCode}>
          <InputLabel>중분류 선택</InputLabel>
          <Select
            value={selectedMediumCode || ''}
            label="중분류 선택"
            onChange={function(e) {
              setSelectedMediumCode(e.target.value);
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {middleList.map(function(item) {
              return (
                <MenuItem key={item.code} value={item.code}>
                  {item.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedMediumCode}>
          <InputLabel>소분류 선택</InputLabel>
          <Select
            value={selectedSmallCode || ''}
            label="소분류 선택"
            onChange={function(e) {
              setSelectedSmallCode(e.target.value);
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {smallList.map(function(item) {
              return (
                <MenuItem key={item.code} value={item.code}>
                  {item.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="상호명을 입력하세요"
          variant="outlined"
          value={keyword || ''}
          onChange={function(e) {
            setKeyword(e.target.value);
          }}
          fullWidth
        />

        <Button variant="contained" onClick={handleSearch} fullWidth>
          검색
        </Button>
      </Paper>

      {/* 지도 출력 영역 */}
      <Box id="kakao-map" sx={{ width: '100%', height: '100%' }} />

      {/* 검색 결과 하단 리스트 */}
      {storeList.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            maxHeight: 300,
            overflowY: 'auto',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 2,
            padding: 2,
            boxShadow: 3,
            zIndex: 10,
          }}
        >
          {storeList.map(function(store, index) {
            return (
              <Box
                key={index}
                sx={{
                  padding: 1,
                  borderBottom: '1px solid #ddd',
                  cursor: 'pointer',
                }}
                onClick={function() {
                  moveToMarker(store);
                }}
              >
                <strong>{store.storeName}</strong>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  {store.roadAddr || store.landAddr}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                  {store.categoryLarge} &gt; {store.categoryMedium} &gt; {store.categorySmall}
                </div>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
