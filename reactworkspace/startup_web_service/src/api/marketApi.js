import createInstance from './Interceptor';

// 인터셉터에서 커스터마이징한 axios Instance 사용하기
const axiosInstance = createInstance();

// 환경변수 파일에 저장된 서버 URL 읽어오기
const serverUrl = import.meta.env.VITE_BACK_SERVER;

// 마켓 목록 조회 (모든 사용자용)
export function getMarketList() {
    let options = {};
    options.url = serverUrl + '/market';
    options.method = 'get';
    
    return axiosInstance(options);
}

// 특정 마켓 상세 조회
export function getMarketDetail(marketId) {
    let options = {};
    options.url = serverUrl + `/market/${marketId}`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 마켓 글 작성
export function createMarket(marketData) {
    let options = {};
    options.url = serverUrl + '/market';
    options.method = 'post';
    options.data = marketData;
    
    return axiosInstance(options);
}

// 마켓 글 수정
export function updateMarket(marketData) {
    let options = {};
    options.url = serverUrl + '/market';
    options.method = 'patch';
    options.data = marketData;
    
    return axiosInstance(options);
}

// 마켓 글 삭제
export function deleteMarket(marketId) {
    let options = {};
    options.url = serverUrl + `/market/${marketId}`;
    options.method = 'delete';
    
    return axiosInstance(options);
}

// 댓글 목록 조회 (로그인 불필요)
export function getCommentList(marketNo) {
    let options = {};
    options.url = serverUrl + `/market/${marketNo}/comments`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 댓글 작성 (로그인 필요)
export function createComment(marketNo, commentData) {
    let options = {};
    options.url = serverUrl + `/market/${marketNo}/comment`;
    options.method = 'post';
    options.data = commentData;
    
    return axiosInstance(options);
} 