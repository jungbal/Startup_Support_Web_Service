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

export default function CommercialMapFilter() {
  const [largeList, setLargeList] = useState([]);
  const [middleList, setMiddleList] = useState([]);
  const [smallList, setSmallList] = useState([]);

  const [selectedLarge, setSelectedLarge] = useState('');
  const [selectedMiddle, setSelectedMiddle] = useState('');
  const [selectedSmall, setSelectedSmall] = useState('');
  const [keyword, setKeyword] = useState('');

  const [storeList, setStoreList] = useState([]);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const serverUrl = import.meta.env.VITE_BACK_SERVER;
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  // 카카오 지도 초기화
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(() => initMap());
      document.head.appendChild(script);
    }
  }, [kakaoKey]);

  const initMap = () => {
    const container = document.getElementById('kakao-map');
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    };
    const mapInstance = new window.kakao.maps.Map(container, options);
    setMap(mapInstance);
  };

  // 마커 출력
  const displayMarkers = (stores) => {
    markers.forEach((m) => m.setMap(null));
    const newMarkers = [];

    if (!map) return;
    const bounds = new window.kakao.maps.LatLngBounds();

    stores.forEach((store) => {
      const lat = parseFloat(store.latitude);
      const lng = parseFloat(store.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const position = new window.kakao.maps.LatLng(lat, lng);
        const marker = new window.kakao.maps.Marker({ position });
        marker.setMap(map);
        newMarkers.push(marker);
        bounds.extend(position);
      }
    });

    if (newMarkers.length > 0) {
      map.setBounds(bounds);
    }

    setMarkers(newMarkers);
  };

  // 마커 클릭 시 이동
  const moveToMarker = (store) => {
    const lat = parseFloat(store.latitude);
    const lng = parseFloat(store.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
      map.panTo(moveLatLng);
    }
  };

  // 검색 요청
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLarge) params.append('largeCode', selectedLarge);
    if (selectedMiddle) params.append('mediumCode', selectedMiddle);
    if (selectedSmall) params.append('smallCode', selectedSmall);
    if (keyword) params.append('keyword', keyword);

    axios
      .get(`${serverUrl}commercial/filter?${params.toString()}`)
      .then((res) => {
        const list = res.data.list || [];
        setStoreList(list);
        displayMarkers(list);
      })
      .catch(() => {
        setStoreList([]);
        displayMarkers([]);
      });
  };

  // 대분류 불러오기
  useEffect(() => {
    axios
      .get(`${serverUrl}commercial/large`)
      .then((res) => setLargeList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLargeList([]));
  }, [serverUrl]);

  // 중분류 불러오기
  useEffect(() => {
    if (selectedLarge) {
      axios
        .get(`${serverUrl}commercial/middle?largeCode=${selectedLarge}`)
        .then((res) => {
          setMiddleList(Array.isArray(res.data) ? res.data : []);
          setSelectedMiddle('');
          setSmallList([]);
          setSelectedSmall('');
        })
        .catch(() => {
          setMiddleList([]);
          setSelectedMiddle('');
          setSmallList([]);
          setSelectedSmall('');
        });
    } else {
      setMiddleList([]);
      setSelectedMiddle('');
      setSmallList([]);
      setSelectedSmall('');
    }
  }, [selectedLarge, serverUrl]);

  // 소분류 불러오기
  useEffect(() => {
    if (selectedLarge && selectedMiddle) {
      axios
        .get(`${serverUrl}commercial/small?largeCode=${selectedLarge}&mediumCode=${selectedMiddle}`)
        .then((res) => setSmallList(Array.isArray(res.data) ? res.data : []))
        .catch(() => {
          setSmallList([]);
          setSelectedSmall('');
        });
    } else {
      setSmallList([]);
      setSelectedSmall('');
    }
  }, [selectedMiddle, selectedLarge, serverUrl]);

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
            value={selectedLarge || ''}
            label="대분류 선택"
            onChange={(e) => setSelectedLarge(e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {largeList.map((item) => (
              <MenuItem key={item.code} value={item.code}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedLarge}>
          <InputLabel>중분류 선택</InputLabel>
          <Select
            value={selectedMiddle || ''}
            label="중분류 선택"
            onChange={(e) => setSelectedMiddle(e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {middleList.map((item) => (
              <MenuItem key={item.code} value={item.code}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedMiddle}>
          <InputLabel>소분류 선택</InputLabel>
          <Select
            value={selectedSmall || ''}
            label="소분류 선택"
            onChange={(e) => setSelectedSmall(e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {smallList.map((item) => (
              <MenuItem key={item.code} value={item.code}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="상호명을 입력하세요"
          variant="outlined"
          value={keyword || ''}
          onChange={(e) => setKeyword(e.target.value)}
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
          {storeList.map((store, index) => (
            <Box
              key={index}
              sx={{
                padding: 1,
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
              }}
              onClick={() => moveToMarker(store)}
            >
              <strong>{store.storeName}</strong>
              <div style={{ fontSize: '0.9rem', color: '#555' }}>
                {store.roadAddr || store.landAddr}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>
                {store.categoryLarge} &gt; {store.categoryMedium} &gt; {store.categorySmall}
              </div>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}


