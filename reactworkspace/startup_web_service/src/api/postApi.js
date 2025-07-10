import createInstance from './Interceptor';

// 인터셉터에서 커스터마이징한 axios Instance 사용하기
const axiosInstance = createInstance();

// 환경변수 파일에 저장된 서버 URL 읽어오기
const serverUrl = import.meta.env.VITE_BACK_SERVER;

// 게시글 목록 조회
export function getPostList(postType, reqPage) {
  let options = {};
  options.url = serverUrl + `/api/post/list/${postType}/${reqPage}`;
  options.method = 'get';
  
  return axiosInstance(options);
}

// 게시글 상세 조회
export function getPostDetail(postNo) {
  let options = {};
  options.url = serverUrl + `/api/post/view/${postNo}`;
  options.method = 'get';
  
  return axiosInstance(options);
}

// 게시글 등록
export function createPost(postData) {
  let options = {};
  options.url = serverUrl + '/api/post';
  options.method = 'post';
  options.data = postData;
  
  return axiosInstance(options);
}

// 게시글 수정
export function updatePost(postNo, postData) {
  let options = {};
  options.url = serverUrl + `/api/post/${postNo}`;
  options.method = 'patch';
  options.data = postData;
  
  return axiosInstance(options);
}

// 게시글 삭제
export function deletePost(postNo) {
  let options = {};
  options.url = serverUrl + `/api/post/${postNo}`;
  options.method = 'delete';
  
  return axiosInstance(options);
} 