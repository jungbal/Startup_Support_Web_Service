import createInstance from './Interceptor';

// 인터셉터에서 커스터마이징한 axios Instance 사용하기
const axiosInstance = createInstance();

// 아이디 중복 체크
export function checkUserId(userId) {
    let options = {};
    options.url = `/member/${userId}/chkId`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 이메일 중복 체크
export function checkUserEmail(userEmail) {
    let options = {};
    options.url = `/member/email/${encodeURIComponent(userEmail)}/chkEmail`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 회원가입
export function signUp(memberData) {
    let options = {};
    options.url = '/member';
    options.method = 'post';
    options.data = memberData;
    
    return axiosInstance(options);
}

// 로그인
export function login(loginData) {
    let options = {};
    options.url = '/member/login';
    options.method = 'post';
    options.data = loginData;
    
    return axiosInstance(options);
}

// 아이디 찾기
export function findUserId(userEmail) {
    let options = {};
    options.url = '/member/findId';
    options.method = 'post';
    options.params = { userEmail };
    
    return axiosInstance(options);
}

// 비밀번호 찾기
export function findUserPw(userId, userEmail) {
    let options = {};
    options.url = '/member/findPw';
    options.method = 'post';
    options.params = { userId, userEmail };
    
    return axiosInstance(options);
}

// 회원 정보 조회
export function getMemberInfo(userId) {
    let options = {};
    options.url = `/member/${userId}`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 회원 정보 수정
export function updateMember(memberData) {
    let options = {};
    options.url = '/member';
    options.method = 'patch';
    options.data = memberData;
    
    return axiosInstance(options);
}

// 비밀번호 확인
export function checkPassword(passwordData) {
    let options = {};
    options.url = '/member/checkPw';
    options.method = 'post';
    options.data = passwordData;
    
    return axiosInstance(options);
}

// 비밀번호 변경
export function updatePassword(passwordData) {
    let options = {};
    options.url = '/member/memberPw';
    options.method = 'patch';
    options.data = passwordData;
    
    return axiosInstance(options);
}

// 내가 쓴 게시글 조회
export function getMyPosts(userId) {
    let options = {};
    options.url = `/member/${userId}/posts`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 내가 쓴 마켓글 조회
export function getMyMarkets(userId) {
    let options = {};
    options.url = `/member/${userId}/markets`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 내가 쓴 공지사항 조회 (관리자용)
export function getMyNotices(userId) {
    let options = {};
    options.url = `/member/${userId}/notices`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 모든 회원 조회 (관리자용)
export function getAllMembers() {
    let options = {};
    options.url = '/member/admin/members';
    options.method = 'get';
    
    return axiosInstance(options);
}

// 모든 신고 조회 (관리자용)
export function getAllReports() {
    let options = {};
    options.url = '/member/admin/reports';
    options.method = 'get';
    
    return axiosInstance(options);
}

// 신고 처리 (관리자용)
export function processReport(report, action) {
    let options = {};
    options.url = '/member/admin/reports';
    options.method = 'patch';
    options.data = report;
    options.params = { action };
    
    return axiosInstance(options);
} 