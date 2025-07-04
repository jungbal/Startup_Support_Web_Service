// Zustand 상태 관리 라이브러리의 기본 create 함수 import
import { create } from 'zustand';
// Zustand의 persist 미들웨어 import - localStorage 자동 저장/복원을 위해
import { persist } from 'zustand/middleware';
// 쿠키 관리를 위한 라이브러리 import - JWT 토큰을 안전하게 저장하기 위해
import Cookies from 'js-cookie';

/*
isLogined : 로그인 여부 (true == 로그인 된 상태, false == 로그아웃 상태)
setIsLogined : 로그인 상태 변경 시, 호출 함수
loginMember : 로그인 회원 정보
setLoginMember : 로그인 회원 정보 변경 시, 호출 함수
accessToken : 로그인 이후, 요청시마다 헤더에 포함될 토큰
setAccessToken : accessToken 변경 시, 호출 함수
refreshToken : accessToken 만료 시, 재발급 할 때 필요한 토큰
setRefreshToken : refreshToken 변경 시, 호출 함수
*/
const useAuthStore = create(
  persist(
    function(set, get) {
      return {
      isLogined: false,
      setIsLogined: function(loginChk) {
        set({
          isLogined: loginChk
        });
      },
      loginMember: null,
      setLoginMember: function(memberObj) {
        set({
          loginMember: memberObj
        });
      },
      accessToken: null,
      setAccessToken: function(accessToken) {
        set({
          accessToken: accessToken
        });
      },
      refreshToken: null,
      setRefreshToken: function(refreshToken) {
        set({
          refreshToken: refreshToken
        });
      },
      
      // 기존 방식 호환을 위한 별칭
      user: null,
      isAuthenticated: false,
      setAuth: function(userData, accessToken, refreshToken) {
        set({
          // 기존 방식
          isLogined: true,
          loginMember: userData,
          accessToken: accessToken,
          refreshToken: refreshToken,
          // 새로운 방식 (동기화)
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      },
      logout: function() {
        // 쿠키에서 토큰 완전 삭제
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // 모든 상태 초기화
        set({
          isLogined: false,
          loginMember: null,
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          isLoading: false
        });
      },

      // 완전 초기화 함수 (강제 로그아웃)
      forceLogout: function() {
        // 쿠키 완전 삭제
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // localStorage 완전 초기화
        localStorage.removeItem('auth-storage');
        
        // 모든 상태 초기화
        set({
          isLogined: false,
          loginMember: null,
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          isLoading: false
        });
      },

      // 기존 상태와 새로운 상태 동기화 함수 (일회성 사용)
      syncStates: function() {
        const state = get();
        if (state.isLogined && state.loginMember && !state.isAuthenticated) {
          set({
            user: state.loginMember,
            isAuthenticated: true,
            isLoading: false
          });
        }
      },

      // 로딩 상태만 변경하는 함수 (API 호출 중 스피너 표시용)
      setLoading: function(loading) {
        set({ isLoading: loading });
      },

      // 사용자 정보 업데이트 함수 (프로필 수정 후 사용)
      updateUser: function(updatedUserData) {
        const currentState = get();
        if (currentState.user) {
          set({
            user: {
              ...currentState.user,
              ...updatedUserData
            }
          });
        }
      },

      // 페이지 새로고침 시 토큰 체크하여 로그인 상태 복원하는 함수
      checkAuth: function() {
        // 쿠키에서 액세스 토큰 가져오기
        const accessToken = Cookies.get('accessToken');
        // 쿠키에서 리프레시 토큰 가져오기
        const refreshToken = Cookies.get('refreshToken');
        
        // 액세스 토큰이 없으면 로그아웃 상태로 설정
        if (!accessToken) {
          set({ 
            isAuthenticated: false,  // 인증되지 않은 상태
            user: null,              // 사용자 정보 없음
            isLoading: false,        // 로딩 완료
            accessToken: null,       // 토큰 없음
            refreshToken: null       // 리프레시 토큰 없음
          });
          return Promise.resolve(false); // 인증 실패 반환
        }

        // 토큰 검증 중 로딩 상태 표시
        set({ isLoading: true });
        
        // 현재 Zustand 상태 가져오기
        const state = get();
        
        // 토큰과 사용자 정보가 모두 있으면 로그인 상태 복원
        if (state.user && accessToken) {
          set({ 
            isAuthenticated: true,   // 인증된 상태로 복원
            user: state.user,        // localStorage에서 복원된 사용자 정보 사용
            isLoading: false,        // 로딩 완료
            accessToken,             // 쿠키에서 가져온 액세스 토큰
            refreshToken             // 쿠키에서 가져온 리프레시 토큰
          });
          return Promise.resolve(true); // 인증 성공 반환
        }
        
        // 실제 프로젝트에서는 여기서 서버에 토큰 검증 API 호출 필요
        // 예: axios.post('/auth/validate', { token: accessToken })
        // 현재는 임시로 Promise로 처리 (실제로는 서버 검증 로직이 들어가야 함)
        
        // 토큰은 있지만 사용자 정보가 없으면 비정상 상태이므로 로그아웃 처리
        return new Promise(function(resolve) {
          // 실제로는 서버 API 호출 후 결과에 따라 처리
          // 현재는 임시로 바로 로그아웃 처리
          Cookies.remove('accessToken');   // 쿠키에서 액세스 토큰 삭제
          Cookies.remove('refreshToken');  // 쿠키에서 리프레시 토큰 삭제
          set({ 
            isAuthenticated: false,  // 인증 해제
            user: null,              // 사용자 정보 삭제
            isLoading: false,        // 로딩 완료
            accessToken: null,       // 토큰 삭제
            refreshToken: null       // 리프레시 토큰 삭제
          });
          resolve(false); // 인증 실패 반환
        });
      },
      };
    },
    {
      name: 'auth-storage',        // localStorage에 저장될 키 이름
      // 모든 상태를 localStorage에 저장
    }
  )
);

// 다른 컴포넌트에서 사용할 수 있도록 스토어 export
export default useAuthStore; 