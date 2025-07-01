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

// 보호된 라우트 컴포넌트 (팀원이 배운 방식)
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
  
  // Header와 Footer를 숨길 페이지들
  const hideHeaderFooterPaths = ['/login', '/signup', '/find-account'];
  const shouldHideHeaderFooter = hideHeaderFooterPaths.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!shouldHideHeaderFooter && <Header />}
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
          
          {/* 보호된 라우트 (로그인 필요) */}
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          
          {/* 기본 경로를 홈으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Box>
      {!shouldHideHeaderFooter && <Footer />}
      {!shouldHideHeaderFooter && <FloatingButtons />}
    </Box>
  );
}

function App() {
  useEffect(() => {
    // 앱 시작 시 기존 쿠키 토큰 삭제 (한 번만 실행)
    clearOldCookies();
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
