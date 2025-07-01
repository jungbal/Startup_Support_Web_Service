import React, { useState, useEffect } from 'react';
import { Fab, Box, Zoom } from '@mui/material';
import { Chat, KeyboardArrowUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 200); // 200px 이상 스크롤 시 top 버튼 표시
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 최상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 채팅 페이지로 이동
  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Top 버튼 - 스크롤 시에만 표시 */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          aria-label="scroll to top"
          onClick={scrollToTop}
          sx={{
            backgroundColor: '#ff8c00',
            '&:hover': {
              backgroundColor: '#e67e00'
            }
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>

      {/* 채팅 버튼 - 항상 표시 */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleChatClick}
        sx={{
          backgroundColor: '#ff8c00',
          '&:hover': {
            backgroundColor: '#e67e00'
          },
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(255, 140, 0, 0.7)'
            },
            '70%': {
              boxShadow: '0 0 0 10px rgba(255, 140, 0, 0)'
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(255, 140, 0, 0)'
            }
          },
          animation: 'pulse 2s infinite'
        }}
      >
        <Chat />
      </Fab>
    </Box>
  );
} 