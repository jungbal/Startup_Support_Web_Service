// subsidyApi.js
// 공공데이터포털 보조금24 서비스 API 모듈
// 기능: 서비스 리스트 조회 및 특정 서비스 ID로 상세 정보 조회

import axios from 'axios';

// Axios 인스턴스 생성: API 요청에 공통으로 들어가는 baseURL과 인증 파라미터 정의
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    serviceKey: import.meta.env.VITE_PUBLIC_SERVICE_KEY,
    returnType: 'json',
  },
});

// 서비스 목록 조회 함수
// 인자: page (페이지 번호), rows (페이지당 항목 수)
// 응답: { data: 서비스 목록 배열, totalCount: 전체 개수 }
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
      console.error('[fetchServiceList] API 호출 실패:', err);
      if (err.response) {
        console.error('서버 응답 상태:', err.response.status);
        console.error('서버 응답 데이터:', err.response.data);
      }
      throw err;
    });
}

// 서비스 상세 조회 함수
// 전체 목록을 페이지 단위로 반복 조회하면서 serviceId와 일치하는 항목을 찾아 반환함
export async function fetchServiceDetail(serviceId) {
  const perPage = 1000; // 한 페이지당 최대 항목 수
  let foundItem = null;
  let totalCount = 0;

  try {
    // 전체 항목 수 파악 (1페이지만 조회해서 totalCount 확인)
    const initialRes = await api.get('/gov24/v3/serviceList', {
      params: {
        page: 1,
        perPage: perPage,
      },
    });

    totalCount = initialRes.data.totalCount;
    const maxPages = Math.ceil(totalCount / perPage);

    // 전체 페이지 반복 조회하며 해당 ID를 가진 항목 탐색
    for (let currentPageNum = 1; currentPageNum <= maxPages; currentPageNum++) {
      const res = await api.get('/gov24/v3/serviceList', {
        params: {
          page: currentPageNum,
          perPage: perPage,
        },
      });

      const data = res.data.data;

      if (data && data.length > 0) {
        foundItem = data.find(function (d) {
          return String(d.서비스ID) === String(serviceId);
        });

        if (foundItem) {
          break;
        }
      }
    }

    if (!foundItem) {
      throw new Error('상세 데이터를 찾을 수 없습니다.');
    }

    // 필요한 필드만 선택해서 반환
    return {
      servId: foundItem.서비스ID,
      servNm: foundItem.서비스명,
      servDgst: foundItem.서비스목적요약,
      servDtlLink: foundItem.상세조회URL,
      supportContent: foundItem.지원내용,
      target: foundItem.지원대상,
      criteria: foundItem.선정기준,
      period: foundItem.신청기한,
      contact: foundItem.전화문의,
      organization: foundItem.소관기관명,
      supportType: foundItem.지원유형,
      userType: foundItem.사용자구분,
      serviceField: foundItem.서비스분야,
    };
  } catch (err) {
    console.error('[fetchServiceDetail] API 호출 실패:', err);
    if (err.response) {
      console.error('서버 응답 상태:', err.response.status);
      console.error('서버 응답 데이터:', err.response.data);
    }
    throw err;
  }
}