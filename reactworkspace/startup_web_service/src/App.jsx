import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';


// CSS 파일 import
import './styles/common.css';
import './styles/home.css';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FloatingButtons from './components/common/FloatingButtons';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import FindAccount from './pages/FindAccount';
import MyPage from './pages/MyPage';
import Home from './pages/Home';
import MarketMain from './components/Market/MarketMain';
import CommercialMain from './components/commercial/CommercialMain';
import CommercialDetail from './components/commercial/CommercialDetail';
import ServiceList from './components/service/ServiceList';
import ServiceDetail from './components/service/ServiceDetail';
import CommunityMain from './components/community/CommunityMain';
import PostList from './components/community/PostList';
import PostView from './components/community/PostView';

// MUI 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3c72',
      dark: '#152a54',
    },
    secondary: {
      main: '#f39c12',
      dark: '#e67e22',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// 기존 쿠키 토큰 삭제 함수
function clearOldCookies() {
  // 기존 쿠키들 삭제
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'rememberedUserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const isLogined = useAuthStore((state) => state.isLogined);
  
  if (!isLogined) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 로그인 전용 라우트 컴포넌트 (이미 로그인한 사용자는 홈으로 리다이렉트)
const AuthRoute = ({ children }) => {
  const isLogined = useAuthStore((state) => state.isLogined);
  
  if (isLogined) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Header와 Footer를 조건부로 표시하는 컴포넌트
function AppWithHeaderFooter() {
  const location = useLocation();
  
  // 공통 페이지 경로들
  const authPaths = ['/login', '/signup', '/find-account'];
  const commercialPaths = ['/commercial'];
  
  // 각 UI 요소를 숨길 페이지들
  const shouldHideHeader = authPaths.includes(location.pathname);
  const shouldHideFooter = [...authPaths, ...commercialPaths].includes(location.pathname);
  const shouldHideFloatingButtons = shouldHideFooter;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!shouldHideHeader && <Header />}
      <Box sx={{ flex: 1 }}>
        <Routes>
          {/* 로그인 관련 라우트 (이미 로그인한 사용자는 접근 불가) */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
          <Route path="/find-account" element={<AuthRoute><FindAccount /></AuthRoute>} />
          
          {/* 공개 라우트 (로그인 여부 상관없이 접근 가능) */}
          <Route path="/home" element={<Home />} />
          <Route path="/market/*" element={<MarketMain />} />
          <Route path="/commercial/*" element={<CommercialMain />} />
          <Route path="/commercial/detail/:storeId" element={<CommercialDetail />} />

          <Route path="/service/*" element={<ServiceList />} /> 
          <Route path="/service/detail/:servId" element={<ServiceDetail />} />
          
          {/* 커뮤니티 라우트 */}
          <Route path="/community" element={<CommunityMain />}>
            <Route index element={<Navigate to="/community/common" replace />} />
            <Route path=":postType" element={<PostList />} />
            <Route path=":postType/view/:postNo" element={<PostView />} />
          </Route>
          
          {/* 보호된 라우트 (로그인 필요) */}
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          {/*
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
           */}
          {/* 기본 경로를 홈으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Box>
      {!shouldHideFooter && <Footer />}
      {!shouldHideFloatingButtons && <FloatingButtons />}
    </Box>
  );
}

function App() {
  useEffect(() => {
    // 앱 시작 시 기존 쿠키 토큰 삭제 (한 번만 실행)
    clearOldCookies();
    
    // 상태 동기화 (기존 상태와 새로운 상태 동기화)
    const authStore = useAuthStore.getState();
    if (authStore.syncStates) {
      authStore.syncStates();
    }
    
    // 개발자 도구에서 강제 로그아웃 함수 전역 등록
    window.forceLogout = function() {
      const authStore = useAuthStore.getState();
      if (authStore.forceLogout) {
        authStore.forceLogout();
        console.log('강제 로그아웃 완료');
        window.location.reload();
      }
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      />
      <Router>
        <AppWithHeaderFooter />
      </Router>
    </ThemeProvider>
  );
}

export default App;

