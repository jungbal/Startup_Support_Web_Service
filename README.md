# 🚀 소상공인 창업지원 웹서비스 (창업든든)

## 📋 프로젝트 개요
소상공인과 예비창업자를 위한 종합 창업지원 플랫폼으로, 상권 분석, 커뮤니티, 마켓플레이스, 보조금 정보 등을 제공하는 웹 애플리케이션입니다.

## 👥 팀 구성 및 역할 분담

- **팀장**: 이정원
- **팀원**: 박상윤, 조예운

### 팀장: 이정원
- **기획안 작성**
  
- **ERD 및 DB 스키마 설계**
  - 테이블 설계
  - 컬럼 정의
  - 관계 설정
  - 제약조건 설정
  - 트리거, 시퀀스 생성
    
- **회원 관리 시스템**
  - 회원가입 (실시간 유효성 검증, 이메일/아이디 중복 확인)
  - 로그인/로그아웃 (JWT 토큰 인증)
  - 아이디/비밀번호 찾기 (이메일 인증)
  - JWT 토큰 유효성 검증 및 자동 갱신
  - 비밀번호 암호화 (BCrypt)

- **마이페이지**
  - 기본정보 수정 (실시간 이메일 중복 확인)
  - 비밀번호 변경 (실시간 보안 강도 검증)
  - 내가 쓴 게시글/마켓글 조회
  - 관리자 전용 기능 (회원 관리, 신고 관리, 공지사항 관리)

- **커뮤니티**
  - 게시글 CRUD (작성, 조회, 수정, 삭제)
  - 파일 첨부 및 다운로드 (최대 5개)
  - 게시글 신고 시스템 (3회 누적 시 자동 비공개 처리)
  - 실시간 검색 및 페이징
  - 공지사항/일반글/Q&A 분류

- **상권 검색 (부분)**
  - 인포윈도우 상세 정보 표시
  - 세부정보 페이지 그리드 필터링
  - 엑셀 다운로드 기능
  - 상권 데이터 분석

### 팀원: 박상윤
- **와이어프레임 설계**
  
- **상권 검색 (부분)**
  - 지도 표시 및 마커 관리
  - 차트 및 그래프 시각화
  - 상권 데이터 분석

- **보조금 조회**
  - 정부 지원사업 정보 조회
  - 카테고리별 필터링
  - 상세 정보 제공

### 팀원: 조예운
- **마켓플레이스**
  - 상품 등록/조회/수정/삭제
  - 이미지 업로드 및 관리
  - 카테고리별 상품 분류
  - 검색 및 필터링

- **1:1 채팅 시스템** (개발 중)
  - 실시간 메시징 (WebSocket + STOMP)
  - 채팅방 관리
  - 메시지 상태 관리

## 🛠️ 기술 스택

### Frontend
```json
{
  "framework": "React 19.1.0",
  "ui_library": "Material-UI 7.1.2",
  "state_management": "Zustand 5.0.5",
  "http_client": "Axios 1.10.0",
  "form_validation": "React Hook Form 7.58.1 + Yup 1.6.1",
  "routing": "React Router DOM 7.6.2",
  "styling": "Emotion 11.14.0 + Custom CSS",
  "charts": "Chart.js 4.5.0 + React-Chartjs-2 5.3.0",
  "data_grid": "AG-Grid React 34.0.0",
  "notifications": "SweetAlert2 11.22.2 + React Hot Toast 2.5.2",
  "real_time": "STOMP.js 7.1.1 + SockJS Client 1.6.1",
  "file_processing": "XLSX 0.18.5",
  "build_tool": "Vite 6.3.5"
}
```

### Backend
```xml
<dependencies>
  <!-- Core Framework -->
  <spring-boot.version>3.4.6</spring-boot.version>
  <java.version>17</java.version>
  
  <!-- Security & Authentication -->
  <spring-boot-starter-security/>
  <jjwt.version>0.12.6</jjwt.version>
  
  <!-- Database & ORM -->
  <mybatis-spring-boot-starter.version>3.0.4</mybatis-spring-boot-starter.version>
  <ojdbc11/> <!-- Oracle Database -->
  
  <!-- Real-time Communication -->
  <spring-boot-starter-websocket/>
  
  <!-- API Documentation -->
  <springdoc-openapi.version>2.8.8</springdoc-openapi.version>
  <springfox-swagger.version>3.0.0</springfox-swagger.version>
  
  <!-- Utilities -->
  <lombok/>
  <spring-boot-starter-aop/>
  <spring-boot-starter-mail/>
  <org.json.version>20240303</org.json.version>
</dependencies>
```

### Database
- **Oracle Database** 11g 이상
- **시퀀스 및 트리거** 활용한 자동 증가 및 비즈니스 로직
- **외래키 제약조건** 및 **CASCADE 삭제** 설정

## 🏗️ 시스템 아키텍처

### 보안 시스템
- **JWT 토큰 인증** (Access Token + Refresh Token)
- **BCrypt 비밀번호 암호화**
- **Spring Security** 기반 인증/인가
- **CORS 설정** 및 **CSRF 보호**
- **토큰 자동 갱신** 및 **만료 처리**

### 실시간 기능
- **WebSocket + STOMP** 프로토콜
- **SockJS** 폴백 지원
- **실시간 채팅** 및 **알림 시스템**

### 파일 관리
- **멀티파트 파일 업로드** (최대 5개)
- **서버 디스크 저장** 및 **DB 메타데이터 관리**
- **파일 다운로드** 및 **보안 검증**
- **자동 파일 정리** (게시글 삭제 시)

## 📁 프로젝트 구조

```
├── reactworkspace/startup_web_service/          # Frontend (React)
│   ├── src/
│   │   ├── components/                          # 컴포넌트
│   │   │   ├── common/                         # 공통 컴포넌트
│   │   │   ├── community/                      # 커뮤니티 관련
│   │   │   ├── mypage/                         # 마이페이지 관련
│   │   │   ├── Market/                         # 마켓 관련
│   │   │   ├── commercial/                     # 상권 검색 관련
│   │   │   ├── service/                        # 보조금 조회 관련
│   │   │   └── chat/                           # 채팅 관련
│   │   ├── pages/                              # 페이지 컴포넌트
│   │   ├── store/                              # Zustand 상태 관리
│   │   ├── api/                                # API 호출 함수
│   │   └── styles/                             # CSS 스타일
│   └── package.json
│
└── springworkspace/startup_web_service/         # Backend (Spring Boot)
    ├── src/main/java/kr/or/iei/
    │   ├── member/                             # 회원 관리
    │   ├── post/                               # 게시글 관리
    │   ├── market/                             # 마켓 관리
    │   ├── commercial/                         # 상권 정보
    │   ├── publicservice/                      # 보조금 정보
    │   ├── chat/                               # 채팅 시스템
    │   └── common/                             # 공통 설정 (Security, CORS, JWT 등)
    ├── src/main/resources/
    │   ├── mapper/                             # MyBatis XML 매퍼
    │   └── application.properties              # 설정 파일
    └── pom.xml
```

## 🚀 실행 방법

### 1. 사전 준비사항
```bash
# 필수 소프트웨어
- Java 17 이상
- Node.js 18 이상
- Oracle Database 11g 이상
- Maven 3.6 이상
```

### 2. 데이터베이스 설정
```sql
-- Oracle Database에서 실행
-- 스키마 생성 및 테이블, 시퀀스, 트리거 생성
-- (프로젝트 내 DB 스키마 스크립트 실행)
```

### 3. 백엔드 실행
```bash
# springworkspace/startup_web_service 디렉토리로 이동
cd springworkspace/startup_web_service

# application.properties 설정 (DB 연결 정보 등)
# Maven 의존성 설치
mvnw clean install

# Spring Boot 애플리케이션 실행
mvnw spring-boot:run

# 또는 IDE에서 StartupWebServiceApplication.java 실행
# 서버 실행 확인: http://localhost:9999
```

### 4. 프론트엔드 실행
```bash
# reactworkspace/startup_web_service 디렉토리로 이동
cd reactworkspace/startup_web_service

# npm 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 확인: http://localhost:5173
```

### 5. 환경 설정 파일

#### Backend (application.properties)
```properties
# Database
spring.datasource.driver-class-name=oracle.jdbc.driver.OracleDriver
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:xe
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT
jwt.secret=your_jwt_secret_key
jwt.access-token-validity=3600
jwt.refresh-token-validity=86400

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB

# Mail (선택사항)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

#### Frontend (환경변수 - 선택사항) EX)
```env
VITE_API_BASE_URL=http://localhost:9999
VITE_WS_URL=ws://localhost:9999/ws
```

## 🌟 주요 기능

### 회원 관리
- ✅ 실시간 유효성 검증 회원가입
- ✅ JWT 기반 로그인/로그아웃
- ✅ 이메일 인증 아이디/비밀번호 찾기
- ✅ 토큰 자동 갱신
- ✅ 비밀번호 암호화

### 마이페이지
- ✅ 기본정보 수정 (실시간 이메일 중복 확인)
- ✅ 비밀번호 변경 (보안 강도 실시간 검증)
- ✅ 내 게시글/마켓글 조회
- ✅ 관리자 전용 기능

### 커뮤니티
- ✅ 게시글 CRUD
- ✅ 파일 첨부/다운로드 (최대 5개)
- ✅ 신고 시스템 (3회 누적 시 자동 비공개)
- ✅ 검색 및 페이징
- ✅ 카테고리별 분류

### 상권 검색
- ✅ 지도 기반 상권 정보 표시
- ✅ 차트/그래프 시각화
- ✅ 상세 정보 그리드 필터링
- ✅ 엑셀 다운로드

### 마켓플레이스
- ✅ 상품 CRUD
- ✅ 이미지 업로드
- ✅ 카테고리별 분류
- ✅ 검색 및 필터링

### 보조금 조회
- ✅ 정부 지원사업 정보
- ✅ 카테고리별 필터링
- ✅ 상세 정보 제공

### 실시간 채팅 (개발 중)
- 🚧 WebSocket 기반 1:1 채팅
- 🚧 채팅방 관리
- 🚧 메시지 상태 관리

## 🔧 개발 도구

### Code Quality
```bash
# Frontend ESLint 검사
npm run lint

# Backend Maven 테스트
mvnw test
```

### API 문서
- **Swagger UI**: http://localhost:9999/swagger-ui.html
- **OpenAPI 3.0**: http://localhost:9999/v3/api-docs

### 개발 모드
```bash
# Frontend 핫 리로드
npm run dev

# Backend 자동 재시작 (DevTools)
mvnw spring-boot:run
```

## 📝 주의사항

1. **데이터베이스 연결**: Oracle Database 설정 및 스키마 생성 필수
2. **포트 설정**: 백엔드(9999), 프론트엔드(5173) 포트 충돌 방지
3. **JWT 시크릿**: 운영 환경에서는 보안 강화된 시크릿 키 사용
4. **파일 업로드**: 서버 디스크 용량 및 권한 확인
5. **CORS 설정**: 프론트엔드 도메인 허용 설정 확인

---

⭐ **창업든든**은 소상공인과 예비창업자의 성공적인 창업을 지원합니다!
