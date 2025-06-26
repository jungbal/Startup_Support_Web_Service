import axios from './axios';

// 아이디 중복 체크
export const checkUserId = async (userId) => {
  const response = await axios.get(`/member/${userId}/chkId`);
  return response.data; // 여기서 response.data는 axios가 반환하는 HTTP 응답 본문(ResponseDTO)
};

// 이메일 중복 체크
export const checkUserEmail = async (userEmail) => {
  const response = await axios.get(`/member/email/${encodeURIComponent(userEmail)}/chkEmail`);
  return response.data;
};

// 회원가입
export const signUp = async (memberData) => {
  const response = await axios.post('/member', memberData);
  return response.data;
};

// 로그인
export const login = async (loginData) => {
  const response = await axios.post('/member/login', loginData);
  return response.data;
};

// 아이디 찾기
export const findUserId = async (userEmail) => {
  const response = await axios.post('/member/findId', null, {
    params: { userEmail }
  });
  return response.data;
};

// 비밀번호 찾기
export const findUserPw = async (userId, userEmail) => {
  const response = await axios.post('/member/findPw', null, {
    params: { userId, userEmail }
  });
  return response.data;
};

// 회원 정보 조회
export const getMemberInfo = async (userId) => {
  const response = await axios.get(`/member/${userId}`);
  return response.data;
};

// 회원 정보 수정
export const updateMember = async (memberData) => {
  const response = await axios.patch('/member', memberData);
  return response.data;
};

// 비밀번호 확인
export const checkPassword = async (passwordData) => {
  const response = await axios.post('/member/checkPw', passwordData);
  return response.data;
};

// 비밀번호 변경
export const updatePassword = async (passwordData) => {
  const response = await axios.patch('/member/memberPw', passwordData);
  return response.data;
};

// 내가 쓴 게시글 조회
export const getMyPosts = async (userId) => {
  const response = await axios.get(`/member/${userId}/posts`);
  return response.data;
};

// 내가 쓴 마켓글 조회
export const getMyMarkets = async (userId) => {
  const response = await axios.get(`/member/${userId}/markets`);
  return response.data;
};

// 내가 쓴 공지사항 조회 (관리자용)
export const getMyNotices = async (userId) => {
  const response = await axios.get(`/member/${userId}/notices`);
  return response.data;
};

// 모든 회원 조회 (관리자용)
export const getAllMembers = async () => {
  const response = await axios.get('/member/admin/members');
  return response.data;
};

// 모든 신고 조회 (관리자용)
export const getAllReports = async () => {
  const response = await axios.get('/member/admin/reports');
  return response.data;
};

// 신고 처리 (관리자용)
export const processReport = async (report, action) => {
  const response = await axios.patch('/member/admin/reports', report, {
    params: { action }
  });
  return response.data;
}; 