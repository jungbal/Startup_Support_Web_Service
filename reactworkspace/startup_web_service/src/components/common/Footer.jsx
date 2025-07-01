import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Divider } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ 
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e0e0e0',
      mt: 'auto',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* 상단 로고 섹션 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 4,
          mb: 3,
          flexWrap: 'wrap'
        }}>
          <img 
            src="/image/footer1.png" 
            alt="정부 로고 1" 
            style={{ height: '40px', width: 'auto' }}
          />
          <img 
            src="/image/footer2.png" 
            alt="정부 로고 2" 
            style={{ height: '40px', width: 'auto' }}
          />
          <img 
            src="/image/footer3.png" 
            alt="정부 로고 3" 
            style={{ height: '40px', width: 'auto' }}
          />
          <img 
            src="/image/footer4.png" 
            alt="정부 로고 4" 
            style={{ height: '40px', width: 'auto' }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 중간 메뉴 섹션 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4,
          mb: 3,
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/service-info" 
            style={{ 
              textDecoration: 'none',
              color: '#666',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            서비스 소개
          </Link>
          <Typography sx={{ color: '#ccc' }}>|</Typography>
          <Link 
            to="/terms" 
            style={{ 
              textDecoration: 'none',
              color: '#666',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            이용약관
          </Link>
          <Typography sx={{ color: '#ccc' }}>|</Typography>
          <Link 
            to="/privacy" 
            style={{ 
              textDecoration: 'none',
              color: '#666',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            개인정보처리방침
          </Link>
          <Typography sx={{ color: '#ccc' }}>|</Typography>
          <Link 
            to="/customer-service" 
            style={{ 
              textDecoration: 'none',
              color: '#666',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            고객센터
          </Link>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 하단 회사 정보 섹션 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap'
        }}>
          {/* 창업든든 로고 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/image/logo.png" 
              alt="창업든든 로고" 
              style={{ height: '50px', width: 'auto' }}
            />
          </Box>

          {/* 회사 정보 */}
          <Box sx={{ flex: 1 }}>
          <Typography sx={{ 
              fontSize: '12px', 
              color: '#666',
              lineHeight: 1.6,
              mb: 0.5
            }}>
              <strong>관리자:</strong> 이정원
            </Typography>
            <Typography sx={{ 
              fontSize: '12px', 
              color: '#666',
              lineHeight: 1.6,
              mb: 0.5
            }}>
              <strong>전화번호:</strong> 010-1234-5678 | <strong>팩스:</strong> 123-45-67891
            </Typography>
            <Typography sx={{ 
              fontSize: '12px', 
              color: '#666',
              lineHeight: 1.6,
              mb: 0.5
            }}>
              <strong>주소:</strong> 서울특별시 강남구 역삼동 10
            </Typography>
            <Typography sx={{ 
              fontSize: '12px', 
              color: '#666',
              lineHeight: 1.6
            }}>
              <strong>이메일:</strong> admin@naver.com
            </Typography>
          </Box>
        </Box>

        {/* 저작권 정보 */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 3, 
          pt: 2, 
          borderTop: '1px solid #e0e0e0' 
        }}>
          <Typography sx={{ 
            fontSize: '11px', 
            color: '#999'
          }}>
            © 2025 창업든든. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 