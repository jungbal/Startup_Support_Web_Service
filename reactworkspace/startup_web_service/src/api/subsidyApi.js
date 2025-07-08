import axios from 'axios'; //

// Vite 프록시와 일치하는 기본 URL
var BASE_URL = '/api'; //

// axios 인스턴스 생성
var api = axios.create({ //
  baseURL: BASE_URL,
  params: {
    serviceKey: import.meta.env.VITE_PUBLIC_SERVICE_KEY, // 인증키 //
    returnType: 'json', // 반환형식 //
  },
});

// ✅ 서비스 목록 조회
export function fetchServiceList(page, rows) { //
  if (page === undefined) page = 1;
  if (rows === undefined) rows = 10;

  return api.get('/gov24/v3/serviceList', { //
    params: {
      page: page,
      perPage: rows,
    },
  })
    .then(function (res) {
      return {
        data: res.data.data,
        totalCount: res.data.totalCount
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

// ✅ 서비스 상세 조회 (servId를 정확하게 전달해야 함)
export function fetchServiceDetail(servId) { //
  return api.get(`/publicservice/${servId}`) // **수정된 부분: 백엔드 엔드포인트에 맞게 URL 변경**
    .then(function (res) {
      // 백엔드에서 단일 PublicService 객체를 반환할 것으로 예상
      const item = res.data; // res.data가 바로 PublicService 객체라고 가정

      // 만약 백엔드 응답이 배열 안에 래핑되어 있다면 아래 코드 사용
      // if (res.data && res.data.length > 0) {
      //   const item = res.data[0];
      // } else {
      //   return null;
      // }
      
      // 백엔드 DTO(PublicService.java) 필드명에 맞춰서 매핑
      return {
        servId: item.serviceId,
        servNm: item.serviceName,
        servDgst: item.serviceSummary,
        servDtlLink: item.serviceUrl,

        supportContent: item.supportContent || null,
        target: item.target || null,
        criteria: item.criteria || null,
        period: item.period || null,
        contact: item.contact || null,
        organization: item.organization || null,
        supportType: item.supportType || null,
        userType: item.userType,
        serviceField: item.serviceField || null,
      };
    })
    .catch(function (err) {
      console.error('❌ [fetchServiceDetail] API 호출 실패:', err); //
      if (err.response) {
        console.error('❌ 서버 응답 상태:', err.response.status);
        console.error('❌ 서버 응답 데이터:', err.response.data);
      }
      throw err;
    });
}
