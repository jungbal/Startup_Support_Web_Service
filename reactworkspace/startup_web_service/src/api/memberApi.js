import createInstance from './Interceptor';

// 인터셉터에서 커스터마이징한 axios Instance 사용하기
const axiosInstance = createInstance();

// 환경변수 파일에 저장된 서버 URL 읽어오기
const serverUrl = import.meta.env.VITE_BACK_SERVER;

// 아이디 중복 체크
export function checkUserId(userId) {
    let options = {};
    options.url = serverUrl + `/member/${userId}/chkId`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 이메일 중복 체크
export function checkUserEmail(userEmail) {
    let options = {};
    options.url = serverUrl + `/member/email/${encodeURIComponent(userEmail)}/chkEmail`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 회원가입
export function signUp(memberData) {
    let options = {};
    options.url = serverUrl + '/member';
    options.method = 'post';
    options.data = memberData;
    
    return axiosInstance(options);
}

// 로그인
export function login(loginData) {
    let options = {};
    options.url = serverUrl + '/member/login';
    options.method = 'post';
    options.data = loginData;
    
    return axiosInstance(options);
}

// 아이디 찾기
export function findUserId(userEmail) {
    let options = {};
    options.url = serverUrl + '/member/findId';
    options.method = 'post';
    options.params = { userEmail };
    
    return axiosInstance(options);
}

// 비밀번호 찾기
export function findUserPw(userId, userEmail) {
    let options = {};
    options.url = serverUrl + '/member/findPw';
    options.method = 'post';
    options.params = { userId, userEmail };
    
    return axiosInstance(options);
}

// 회원 정보 조회
export function getMemberInfo(userId) {
    let options = {};
    options.url = serverUrl + `/member/${userId}`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 회원 정보 수정
export function updateMember(memberData) {
    let options = {};
    options.url = serverUrl + '/member';
    options.method = 'patch';
    options.data = memberData;
    
    return axiosInstance(options);
}

// 비밀번호 확인
export function checkPassword(passwordData) {
    let options = {};
    options.url = serverUrl + '/member/checkPw';
    options.method = 'post';
    options.data = passwordData;
    
    return axiosInstance(options);
}

// 비밀번호 변경
export function updatePassword(passwordData) {
    let options = {};
    options.url = serverUrl + '/member/memberPw';
    options.method = 'patch';
    options.data = passwordData;
    
    return axiosInstance(options);
}

// 내가 쓴 게시글 조회
export function getMyPosts(userId) {
    let options = {};
    options.url = serverUrl + `/member/${userId}/posts`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 내가 쓴 마켓글 조회
export function getMyMarkets(userId) {
    let options = {};
    options.url = serverUrl + `/member/${userId}/markets`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 내가 쓴 공지사항 조회 (관리자용)
export function getMyNotices(userId) {
    let options = {};
    options.url = serverUrl + `/member/${userId}/notices`;
    options.method = 'get';
    
    return axiosInstance(options);
}

// 모든 회원 조회 (관리자용)
export function getAllMembers() {
    let options = {};
    options.url = serverUrl + '/member/admin/members';
    options.method = 'get';
    
    return axiosInstance(options);
}

// 모든 신고 조회 (관리자용)
export function getAllReports() {
    let options = {};
    options.url = serverUrl + '/member/admin/reports';
    options.method = 'get';
    
    return axiosInstance(options);
}

// 신고 처리 (관리자용)
export function processReport(report, action) {
    let options = {};
    options.url = serverUrl + '/member/admin/reports';
    options.method = 'patch';
    options.data = report;
    options.params = { action };
    
    return axiosInstance(options);
}

// 회원 등급 수정 (관리자용)
export function updateUserLevel(userId, userLevel) {
    let options = {};
    options.url = serverUrl + '/member/admin/userLevel';
    options.method = 'patch';
    options.data = { userId, userLevel };
    
    return axiosInstance(options);
}

// 자동등업 테스트 (개발/테스트용)
export function testAutoLevelUp(userId) {
    let options = {};
    options.url = serverUrl + '/member/test/autoLevelUp';
    options.method = 'post';
    options.params = { userId };
    
    return axiosInstance(options);
} 