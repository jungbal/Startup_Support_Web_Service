// Zustand 상태 관리 라이브러리의 기본 create 함수 import
import { create } from 'zustand';
// Zustand의 persist 미들웨어 import - localStorage 자동 저장/복원을 위해
import { persist } from 'zustand/middleware';
// 쿠키 관리를 위한 라이브러리 import - JWT 토큰을 안전하게 저장하기 위해
import Cookies from 'js-cookie';

// 인증 관련 전역 상태 스토어 생성
const useAuthStore = create(
  // persist 미들웨어로 감싸서 새로고침해도 상태가 유지되도록 함
  persist(
    // set: 상태 변경 함수, get: 현재 상태 조회 함수
    (set, get) => ({
      // 로그인한 사용자 정보 (null이면 로그인 안됨)
      user: null,
      // 로그인 여부 boolean 값
      isAuthenticated: false,
      // 로딩 상태 (API 호출 중일 때 true)
      isLoading: false,
      // JWT 액세스 토큰 (단기간 유효)
      accessToken: null,
      // JWT 리프레시 토큰 (장기간 유효, 액세스 토큰 갱신용)
      refreshToken: null,

      // 로그인 성공 시 사용자 정보와 토큰을 저장하는 함수
      setAuth: (userData, accessToken, refreshToken) => {
        // 액세스 토큰이 있으면 쿠키에 1일간 저장
        if (accessToken) {
          Cookies.set('accessToken', accessToken, { expires: 1 }); // 1일
        }
        // 리프레시 토큰이 있으면 쿠키에 7일간 저장
        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7일
        }
        // Zustand 상태 업데이트 - 모든 로그인 관련 정보 저장
        set({ 
          user: userData,           // 사용자 정보 저장
          isAuthenticated: true,   // 로그인 상태를 true로 변경
          isLoading: false,        // 로딩 완료
          accessToken,             // 액세스 토큰 상태에 저장
          refreshToken             // 리프레시 토큰 상태에 저장
        });
      },

      // 로그아웃 처리 함수
      logout: () => {
        // 쿠키에서 액세스 토큰 삭제
        Cookies.remove('accessToken');
        // 쿠키에서 리프레시 토큰 삭제
        Cookies.remove('refreshToken');
        // Zustand 상태를 초기값으로 리셋
        set({ 
          user: null,              // 사용자 정보 삭제
          isAuthenticated: false,  // 로그인 상태를 false로 변경
          isLoading: false,        // 로딩 상태 false
          accessToken: null,       // 액세스 토큰 삭제
          refreshToken: null       // 리프레시 토큰 삭제
        });
      },

      // 로딩 상태만 변경하는 함수 (API 호출 중 스피너 표시용)
      setLoading: (loading) => set({ isLoading: loading }),

      // 페이지 새로고침 시 토큰 체크하여 로그인 상태 복원하는 함수
      checkAuth: async () => {
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
          return false; // 인증 실패 반환
        }

        try {
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
            return true; // 인증 성공 반환
          }
          
          // TODO: 실제 프로젝트에서는 여기서 서버에 토큰 검증 API 호출
          // 예: const response = await validateToken(accessToken);
          // 현재는 토큰이 있고 사용자 정보가 저장되어 있으면 인증된 것으로 처리
          
          // 토큰은 있지만 사용자 정보가 없으면 비정상 상태이므로 로그아웃 처리
          Cookies.remove('accessToken');   // 쿠키에서 액세스 토큰 삭제
          Cookies.remove('refreshToken');  // 쿠키에서 리프레시 토큰 삭제
          set({ 
            isAuthenticated: false,  // 인증 해제
            user: null,              // 사용자 정보 삭제
            isLoading: false,        // 로딩 완료
            accessToken: null,       // 토큰 삭제
            refreshToken: null       // 리프레시 토큰 삭제
          });
          return false; // 인증 실패 반환
          
        } catch (error) {
          // 토큰 검증 중 오류 발생 시 (예: 만료된 토큰, 잘못된 토큰)
          Cookies.remove('accessToken');   // 쿠키에서 액세스 토큰 삭제
          Cookies.remove('refreshToken');  // 쿠키에서 리프레시 토큰 삭제
          set({ 
            isAuthenticated: false,  // 인증 해제
            user: null,              // 사용자 정보 삭제
            isLoading: false,        // 로딩 완료
            accessToken: null,       // 토큰 삭제
            refreshToken: null       // 리프레시 토큰 삭제
          });
          return false; // 인증 실패 반환
        }
      },
    }),
    // persist 미들웨어 설정 객체
    {
      name: 'auth-storage',        // localStorage에 저장될 키 이름
      partialize: (state) => ({   // 어떤 상태만 localStorage에 저장할지 선택
        user: state.user,          // 사용자 정보만 저장 (보안상 토큰은 제외)
        isAuthenticated: state.isAuthenticated  // 로그인 상태만 저장
      }), // 토큰은 보안상 localStorage가 아닌 httpOnly 쿠키에만 저장
    }
  )
);

// 다른 컴포넌트에서 사용할 수 있도록 스토어 export
export default useAuthStore; 