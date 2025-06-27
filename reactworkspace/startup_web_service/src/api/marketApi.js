import createInstance from './Interceptor';

// 인터셉터에서 커스터마이징한 axios Instance 사용하기
const axiosInstance = createInstance();

// 마켓 목록 조회 (로그인 불필요)
export function getMarketList() {
    let options = {};
    options.url = '/market/list';
    options.method = 'get';
    
    return axiosInstance(options);
}

// 마켓 상세 조회 (로그인 불필요)
export function getMarketDetail(marketNo) {
    let options = {};
    options.url = `/market/${marketNo}`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 마켓 글 작성 (로그인 필요)
export function createMarket(marketData) {
    let options = {};
    options.url = '/market';
    options.method = 'post';
    options.data = marketData;
    
    return axiosInstance(options);
}

// 마켓 글 수정 (로그인 필요)
export function updateMarket(marketNo, marketData) {
    let options = {};
    options.url = `/market/${marketNo}`;
    options.method = 'patch';
    options.data = marketData;
    
    return axiosInstance(options);
}

// 마켓 글 삭제 (로그인 필요)
export function deleteMarket(marketNo) {
    let options = {};
    options.url = `/market/${marketNo}`;
    options.method = 'delete';
    
    return axiosInstance(options);
}

// 댓글 목록 조회 (로그인 불필요)
export function getCommentList(marketNo) {
    let options = {};
    options.url = `/market/${marketNo}/comments`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 댓글 작성 (로그인 필요)
export function createComment(marketNo, commentData) {
    let options = {};
    options.url = `/market/${marketNo}/comment`;
    options.method = 'post';
    options.data = commentData;
    
    return axiosInstance(options);
} 