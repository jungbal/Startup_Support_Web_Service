import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
} from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import useAuthStore from '../../store/authStore';

// 화면 상단 헤더
export default function Header() {
  return (
    <AppBar position="sticky" sx={{ 
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <Toolbar sx={{ minHeight: 70, py: 2 }}>
        <Logo />
        <MainNavi />
        <HeaderLink />
      </Toolbar>
    </AppBar>
  );
}

// 로고 컴포넌트
function Logo() {
  return (
    <Box sx={{ 
      flexGrow: 0, 
      ml: 3,
      mr: 6,
      display: 'flex',
      alignItems: 'center'
    }}>
      <Link 
        to="/" 
        style={{ 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img 
          src="/image/logo.png" 
          alt="창업든든 로고" 
          style={{ 
            height: '60px',
            width: 'auto'
          }}
        />
      </Link>
    </Box>
  );
}

// 헤더 중앙 메뉴
function MainNavi() {
  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      gap: 8, 
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Button 
        component={Link} 
        to="/commercial"
        sx={{ 
          textTransform: 'none',
          fontSize: '1.3rem',
          fontWeight: 600,
          fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
          color: '#ff8c00',
          py: 2,
          px: 3,
          '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            color: '#e67e00'
          }
        }}
      >
        상권 검색
      </Button>
      <Button 
        component={Link} 
        to="/market/list"
        sx={{ 
          textTransform: 'none',
          fontSize: '1.3rem',
          fontWeight: 600,
          fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
          color: '#ff8c00',
          py: 2,
          px: 3,
          '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            color: '#e67e00'
          }
        }}
      >
        마켓
      </Button>
      <Button 
        component={Link} 
        to="/community"
        sx={{ 
          textTransform: 'none',
          fontSize: '1.3rem',
          fontWeight: 600,
          fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
          color: '#ff8c00',
          py: 2,
          px: 3,
          '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            color: '#e67e00'
          }
        }}
      >
        커뮤니티
      </Button>
      <Button 
        component={Link} 
        to="/subsidy"
        sx={{ 
          textTransform: 'none',
          fontSize: '1.3rem',
          fontWeight: 600,
          fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
          color: '#ff8c00',
          py: 2,
          px: 3,
          '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            color: '#e67e00'
          }
        }}
      >
        보조금 조회
      </Button>
    </Box>
  );
}

// 헤더 우측 메뉴
function HeaderLink() {
  const { 
    isLogined, 
    setIsLogined, 
    loginMember, 
    setLoginMember, 
    setAccessToken, 
    setRefreshToken 
  } = useAuthStore();
  
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // 로그아웃 처리 함수
  function logout() {
    setIsLogined(false);
    setLoginMember(null);
    setAccessToken(null);
    setRefreshToken(null);
    setAnchorEl(null);
    navigate('/');
  }

  // 사용자 메뉴 열기/닫기
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMyPageClick = () => {
    setAnchorEl(null);
    navigate('/mypage');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {isLogined ? (
        <>
          <IconButton
            onClick={handleMenuOpen}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#ff8c00',
              '&:hover': {
                backgroundColor: 'rgba(255, 140, 0, 0.1)'
              }
            }}
          >
            <AccountCircle sx={{ fontSize: '2rem' }} />
            <Typography variant="body1" sx={{ 
              fontWeight: 600,
              fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
              color: '#ff8c00'
            }}>
              {loginMember?.userName || loginMember?.userId}님
            </Typography>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            <MenuItem 
              onClick={handleMyPageClick}
              sx={{ 
                fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
                color: '#333',
                '&:hover': {
                  backgroundColor: 'rgba(255, 140, 0, 0.1)'
                }
              }}
            >
              마이페이지
            </MenuItem>
            <MenuItem 
              onClick={logout}
              sx={{ 
                fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
                color: '#333',
                '&:hover': {
                  backgroundColor: 'rgba(255, 140, 0, 0.1)'
                }
              }}
            >
              로그아웃
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <Button 
            component={Link} 
            to="/login"
            sx={{ 
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
              color: '#ff8c00',
              px: 3,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 140, 0, 0.1)',
                color: '#e67e00'
              }
            }}
          >
            로그인
          </Button>
          <Button 
            component={Link} 
            to="/signup"
            sx={{ 
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
              color: '#ffffff',
              backgroundColor: '#ff8c00',
              px: 3,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#e67e00'
              }
            }}
          >
            회원가입
          </Button>
        </>
      )}
    </Box>
  );
} 