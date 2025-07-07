// subsidyApi.js
import axios from 'axios';

// 공공데이터 API 기본 주소 (Vite 프록시 경로와 일치시킴)
var BASE_URL = '/api'; // <--- vite.config.js의 proxy key와 일치시킴

// axios 인스턴스
var api = axios.create({
  baseURL: BASE_URL,
  params: {
    serviceKey: import.meta.env.VITE_PUBLIC_SERVICE_KEY, // <--- Swagger에 'serviceKey'로 명시됨
    returnType: 'json', // <--- Swagger에 'returnType'으로 명시됨
  },
});

// 1. 공공서비스 목록 조회
export function fetchServiceList(page, rows) {
  if (page === undefined) page = 1;
  if (rows === undefined) rows = 10;

  // Swagger에 명시된 정확한 엔드포인트 경로를 사용
  return api.get('/gov24/v3/serviceList', { // <--- Swagger의 paths 아래 명시된 경로
    params: {
      page: page, // <--- Swagger에 'page'로 명시됨
      perPage: rows, // <--- Swagger에 'perPage'로 명시됨
    },
  }).then(function(res) {
    // 응답 데이터 구조가 Swagger에 따라 res.data.data로 변경됩니다.
    // 각 아이템의 속성 이름도 Swagger의 'serviceList_model'에 따라 한글로 변경됩니다.
    return res.data.data.map(item => ({
      servId: item['서비스ID'],
      servNm: item['서비스명'],
      servDgst: item['서비스목적요약'],
      servDtlLink: item['상세조회URL'] // 필요시 추가
    }));
  }).catch(function(err) {
    console.error('공공서비스 목록 조회 실패:', err);
    throw err;
  });
}

// 2. 공공서비스 상세 조회
export function fetchServiceDetail(servId) {
  // Swagger에 명시된 정확한 엔드포인트 경로를 사용합니다.
  // 이 API는 servId를 직접 파라미터로 받지 않으므로, page/perPage로 조회 후 필터링해야 할 수 있습니다.
  // 여기서는 예시로 첫 페이지의 첫 번째 아이템을 가져오는 방식으로 작성합니다.
  // 정확한 사용법은 Swagger 문서를 다시 확인하거나, API 제공자에게 문의하는 것이 좋습니다.
  return api.get('/gov24/v3/serviceDetail', { // <--- Swagger의 paths 아래 명시된 경로
    params: {
      page: 1,
      perPage: 1, // 필요시 조회할 상세 항목의 개수를 조절
    },
  }).then(function(res) {
    // 응답 데이터 구조가 Swagger에 따라 res.data.data로 변경됩니다.
    // 여기서는 배열의 첫 번째 아이템을 가정합니다.
    if (res.data.data && res.data.data.length > 0) {
      const item = res.data.data[0]; // 첫 번째 상세 항목을 가져옵니다.
      // 반환하는 객체의 속성 이름도 Swagger의 'serviceDetail_model'에 따라 한글로 변경됩니다.
      return {
        servId: item['서비스ID'],
        servNm: item['서비스명'],
        servDgst: item['서비스목적'], // Swagger에는 '서비스목적'으로 되어 있음
        servDtlLink: item['온라인신청사이트URL'], // 예시
        // 기타 필요한 상세 정보 필드 추가
      };
    }
    return null; // 데이터가 없는 경우
  }).catch(function(err) {
    console.error('공공서비스 상세 조회 실패:', err);
    throw err;
  });
}

