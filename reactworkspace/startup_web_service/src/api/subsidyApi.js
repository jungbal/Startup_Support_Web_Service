import axios from 'axios';

var BASE_URL = '/api';

var api = axios.create({
  baseURL: BASE_URL,
  params: {
    serviceKey: import.meta.env.VITE_PUBLIC_SERVICE_KEY,
    returnType: 'json',
  },
});

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

export async function fetchServiceDetail(serviceId) {
const perPage = 1000;
  let foundItem = null;
  let totalCount = 0;

  try {
    const initialRes = await api.get('/gov24/v3/serviceList', {
      params: {
        page: 1,
        perPage: perPage,
      },
    });
    totalCount = initialRes.data.totalCount;
    
    const maxPages = Math.ceil(totalCount / perPage);
    
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
    console.error('❌ 상세 데이터 로드 실패:', err);
    if (err.response) {
      console.error('❌ 서버 응답 상태:', err.response.status);
      console.error('❌ 서버 응답 데이터:', err.response.data);
    }
    throw err;
  }
}