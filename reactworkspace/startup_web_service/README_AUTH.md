# 창업든든 인증 시스템 가이드

## 프로젝트 실행 방법

### 1. 백엔드 서버 실행 (Spring Boot)

### 2. 프론트엔드 서버 실행 (React)
```bash
# React 프로젝트 디렉토리에서
cd reactworkspace/startup_web_service
npm run dev
```

## 주요 기능

### 1. 회원가입
- URL: `/signup`
- 아이디 중복 체크 기능
- 실시간 유효성 검사
- 필수 입력 필드:
  - 아이디 (4-20자, 영문/숫자)
  - 이름 (최소 2자)
  - 비밀번호 (8자 이상, 대소문자/숫자/특수문자 포함)
  - 전화번호 (010-0000-0000 형식)
  - 이메일
  - 주소

### 2. 로그인
- URL: `/login`
- JWT 토큰 기반 인증
- 아이디 저장 기능
- 자동 토큰 갱신

### 3. 아이디/비밀번호 찾기
- URL: `/find-account`
- 아이디 찾기: 이메일로 검색
- 비밀번호 찾기: 임시 비밀번호 발급

## 기술 스택

### Frontend
- React 19
- Material-UI
- React Router v7
- React Hook Form + Yup (폼 유효성 검사)
- Zustand (상태 관리)
- Axios (HTTP 통신)
- React Hot Toast (알림)

### Backend
- Spring Boot
- JWT 인증
- MyBatis

## 디자인 특징
- 창업든든 로고: 악수를 형상화한 아이콘
- 주요 색상:
  - Primary: 남색 (#1e3c72)
  - Secondary: 주황색 (#f39c12)
- 모던하고 깔끔한 UI/UX

## API 엔드포인트
- `GET /member/{userId}/chkId` - 아이디 중복 체크
- `POST /member` - 회원가입
- `POST /member/login` - 로그인
- `POST /member/findId` - 아이디 찾기
- `POST /member/findPw` - 비밀번호 찾기

## 보안 기능
- JWT 토큰 기반 인증
- Access Token & Refresh Token
- 자동 토큰 갱신
- CORS 설정 