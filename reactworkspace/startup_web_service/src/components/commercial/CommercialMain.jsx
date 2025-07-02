import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/commercialMain.css';
import useCommercialStore from '../../store/useCommercialStore';

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

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const serverUrl = import.meta.env.VITE_BACK_SERVER;
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(initMap);
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

  function displayMarkers(stores) {
    if (!map || !window.kakao || !window.kakao.maps.services) return;

    markers.forEach(marker => marker.setMap(null));

    const newMarkers = [];
    const bounds = new window.kakao.maps.LatLngBounds();
    const geocoder = new window.kakao.maps.services.Geocoder();

    let pending = stores.length;
    if (pending === 0) {
      setMarkers([]);
      return;
    }

    stores.forEach((store) => {
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

      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          const marker = new window.kakao.maps.Marker({ map, position: coords });
          newMarkers.push(marker);
          bounds.extend(coords);

          window.kakao.maps.event.addListener(marker, 'click', () => {
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

    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        map.panTo(coords);
      }
    });
  }

  function handleSearch() {
    let queryParams = [];
    if (selectedLargeCode) queryParams.push(`largeCode=${selectedLargeCode}`);
    if (selectedMediumCode) queryParams.push(`mediumCode=${selectedMediumCode}`);
    if (selectedSmallCode) queryParams.push(`smallCode=${selectedSmallCode}`);
    if (keyword) queryParams.push(`keyword=${keyword}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    axios.get(`${serverUrl}/commercial/filter${queryString}`)
      .then(res => {
        const list = Array.isArray(res.data.list) ? res.data.list : [];
        setStoreList(list);
        displayMarkers(list);
      })
      .catch(err => {
        console.error('Error fetching filtered commercial data:', err);
        setStoreList([]);
        displayMarkers([]);
      });
  }

  useEffect(() => {
    axios.get(`${serverUrl}/commercial/large`)
      .then(res => {
        setLargeList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('Error fetching large categories:', err);
        setLargeList([]);
      });
  }, [serverUrl]);

  useEffect(() => {
    if (selectedLargeCode) {
      axios.get(`${serverUrl}/commercial/middle?largeCode=${selectedLargeCode}`)
        .then(res => {
          setMiddleList(Array.isArray(res.data) ? res.data : []);
          setSelectedMediumCode('');
          setSmallList([]);
          setSelectedSmallCode('');
        })
        .catch(err => {
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

  useEffect(() => {
    if (selectedLargeCode && selectedMediumCode) {
      axios.get(`${serverUrl}/commercial/small?largeCode=${selectedLargeCode}&mediumCode=${selectedMediumCode}`)
        .then(res => setSmallList(Array.isArray(res.data) ? res.data : []))
        .catch(err => {
          console.error('Error fetching small categories:', err);
          setSmallList([]);
          setSelectedSmallCode('');
        });
    } else {
      setSmallList([]);
      setSelectedSmallCode('');
    }
  }, [selectedLargeCode, selectedMediumCode, serverUrl]);

  return (
    <div className="commercial-main">
      <div className="filter-panel">
        <select
          value={selectedLargeCode || ''}
          onChange={e => setSelectedLargeCode(e.target.value)}
        >
          <option value="">대분류 전체</option>
          {largeList.map(item => (
            <option key={item.CODE} value={item.CODE}>
              {item.NAME}
            </option>
          ))}
        </select>

        <select
          value={selectedMediumCode || ''}
          onChange={e => setSelectedMediumCode(e.target.value)}
          disabled={!selectedLargeCode}
        >
          <option value="">중분류 전체</option>
          {middleList.map(item => (
            <option key={item.CODE} value={item.CODE}>
              {item.NAME}
            </option>
          ))}
        </select>

        <select
          value={selectedSmallCode || ''}
          onChange={e => setSelectedSmallCode(e.target.value)}
          disabled={!selectedMediumCode}
        >
          <option value="">소분류 전체</option>
          {smallList.map(item => (
            <option key={item.CODE} value={item.CODE}>
              {item.NAME}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="상호명을 입력하세요"
          value={keyword || ''}
          onChange={e => setKeyword(e.target.value)}
        />

        <button onClick={handleSearch}>검색</button>
      </div>

      {storeList.length > 0 && (
        <div className="result-panel">
          {storeList.map((store, index) => (
            <div key={store.storeId || index} className="store-item" onClick={() => moveToMarker(store)}>
              <strong>{store.storeName}</strong>
              <div>{store.roadAddr || store.landAddr}</div>
              <div>{store.categoryLarge} &gt; {store.categoryMedium} &gt; {store.categorySmall}</div>
            </div>
          ))}
        </div>
      )}

      <div id="kakao-map" className="kakao-map" />
    </div>
  );
}