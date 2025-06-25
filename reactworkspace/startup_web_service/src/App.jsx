import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// CSS 파일 import
import './styles/common.css';
import './styles/home.css';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import FindAccount from './pages/FindAccount';

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

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 공개 라우트 컴포넌트 (로그인한 사용자는 홈으로 리다이렉트)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// 홈 페이지
const Home = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">창업든든</h1>
        <p className="home-welcome">환영합니다, {user?.userName}님!</p>
        <p className="home-subtitle">창업을 든든하게 지원해드립니다</p>
      </div>

      <div className="home-nav">
        <h2 className="home-nav-title">주요 서비스</h2>
        <div className="home-nav-grid">
          <div className="home-nav-item">
            <span className="home-nav-item-icon">🚀</span>
            <h3 className="home-nav-item-title">창업 지원</h3>
            <p className="home-nav-item-desc">사업계획서 작성부터 자금 조달까지</p>
          </div>
          <div className="home-nav-item">
            <span className="home-nav-item-icon">📊</span>
            <h3 className="home-nav-item-title">시장 분석</h3>
            <p className="home-nav-item-desc">업종별 시장 동향과 경쟁 분석</p>
          </div>
          <div className="home-nav-item">
            <span className="home-nav-item-icon">💼</span>
            <h3 className="home-nav-item-title">비즈니스 네트워킹</h3>
            <p className="home-nav-item-desc">동업자 및 파트너 매칭 서비스</p>
          </div>
          <div className="home-nav-item">
            <span className="home-nav-item-icon">📚</span>
            <h3 className="home-nav-item-title">교육 및 멘토링</h3>
            <p className="home-nav-item-desc">창업 노하우와 전문가 멘토링</p>
          </div>
        </div>
      </div>

      <div className="home-footer">
        <button className="home-logout-btn" onClick={logout}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        로딩 중...
      </div>
    );
  }

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
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path="/find-account" element={<PublicRoute><FindAccount /></PublicRoute>} />
          
          {/* 보호된 라우트 */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          
          {/* 기본 경로와 모든 경로를 로그인으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
