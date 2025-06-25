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