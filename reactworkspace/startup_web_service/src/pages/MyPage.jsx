import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Person,
  Lock,
  Article,
  Store,
  Announcement,
  People,
  Report,
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';
import ProfileEdit from '../components/mypage/ProfileEdit';
import PasswordChange from '../components/mypage/PasswordChange';
import MyPosts from '../components/mypage/MyPosts';
import MyMarkets from '../components/mypage/MyMarkets';
import MyNotices from '../components/mypage/MyNotices';
import MemberManagement from '../components/mypage/MemberManagement';
import ReportManagement from '../components/mypage/ReportManagement';
import '../styles/mypage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const { loginMember, isLogined } = useAuthStore();
  const [selectedMenu, setSelectedMenu] = useState('profile');

  useEffect(() => {
    if (!isLogined) {
      navigate('/login');
    }
  }, [isLogined, navigate]);

  // 일반 사용자 메뉴
  const userMenus = [
    { id: 'profile', label: '기본 정보 수정', icon: <Person /> },
    { id: 'password', label: '비밀번호 변경', icon: <Lock /> },
    { id: 'posts', label: '내가 쓴 게시글', icon: <Article /> },
    { id: 'markets', label: '내가 쓴 마켓글', icon: <Store /> },
  ];

  // 관리자 메뉴
  const adminMenus = [
    { id: 'notices', label: '내가 쓴 공지사항', icon: <Announcement /> },
    { id: 'members', label: '회원 정보 관리', icon: <People /> },
    { id: 'reports', label: '신고 관리', icon: <Report /> },
  ];

  // 사용자 레벨에 따라 메뉴 결정
  const menus = loginMember?.userLevel <= 2 ? [...userMenus, ...adminMenus] : userMenus;

  const renderContent = () => {
    switch (selectedMenu) {
      case 'profile':
        return <ProfileEdit />;
      case 'password':
        return <PasswordChange />;
      case 'posts':
        return <MyPosts />;
      case 'markets':
        return <MyMarkets />;
      case 'notices':
        return <MyNotices />;
      case 'members':
        return <MemberManagement />;
      case 'reports':
        return <ReportManagement />;
      default:
        return <ProfileEdit />;
    }
  };

  return (
    <Container maxWidth="lg" className="mypage-container">
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
        마이페이지
      </Typography>

      <Box className="mypage-content">
        {/* 사이드바 */}
        <Paper className="mypage-sidebar">
          <List>
            <ListItem>
              <ListItemText 
                primary={`${loginMember?.userName}님`} 
                secondary={loginMember?.userLevel <= 2 ? '관리자' : '일반회원'}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <Divider />
            {menus.map((menu) => (
              <ListItemButton
                key={menu.id}
                selected={selectedMenu === menu.id}
                onClick={() => setSelectedMenu(menu.id)}
              >
                <ListItemIcon>{menu.icon}</ListItemIcon>
                <ListItemText primary={menu.label} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* 메인 콘텐츠 */}
        <Paper className="mypage-main">
          {renderContent()}
        </Paper>
      </Box>
    </Container>
  );
};

export default MyPage; 