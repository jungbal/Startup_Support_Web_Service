import axios from 'axios';

// Vite 프록시와 일치하는 기본 API URL 설정
var BASE_URL = '/api';

// axios 인스턴스 생성 및 인증 파라미터 기본 설정
var api = axios.create({
  baseURL: BASE_URL,
  params: {
    serviceKey: import.meta.env.VITE_PUBLIC_SERVICE_KEY, // 인증키
    returnType: 'json', // JSON 형태로 응답 받음
  },
});

// 서비스 목록 조회 (page와 rows를 이용한 페이징 처리)
export function fetchServiceList(page, rows) {
  if (page === undefined) page = 1;
  if (rows === undefined) rows = 10;

  return api.get('/gov24/v3/serviceList', {
    params: {
      page: page,
      perPage: rows,
    },
  })
    .then(function (res) {
      return {
        data: res.data.data,
        totalCount: res.data.totalCount,
      };
    })
    .catch(function (err) {
      console.error('❌ [fetchServiceList] API 호출 실패:', err);
      if (err.response) {
        console.error('❌ 서버 응답 상태:', err.response.status);
        console.error('❌ 서버 응답 데이터:', err.response.data);
      }
      throw err;
    });
}

// 서비스 상세 조회 (serviceId 기반 단일 항목 요청)
export function fetchServiceDetail(serviceId) {
  return api.get(`/publicservice/${serviceId}`)
    .then(function (res) {
      const item = res.data; // 백엔드가 단일 객체 반환한다고 가정

      // 응답 필드명을 프론트에 맞게 변환
      return {
        servId: item.serviceId,
        servNm: item.serviceName,
        servDgst: item.serviceSummary,
        servDtlLink: item.serviceUrl,

        supportContent: item.supportContent,
        target: item.targetAudience,
        criteria: item.selectionCriteria,
        period: item.applicationPeriod,
        contact: item.contactInfo,
        organization: item.organizationName,

        supportType: item.supportType,
        userType: item.userType,
        serviceField: item.serviceField,
      };
    })
    .catch(function (err) {
      console.error('❌ [fetchServiceDetail] API 호출 실패:', err);
      if (err.response) {
        console.error('❌ 서버 응답 상태:', err.response.status);
        console.error('❌ 서버 응답 데이터:', err.response.data);
      }
      throw err;
    });
}