# 🚀 소상공인 창업지원 웹서비스 (Startup Support Web Service)

## 📋 프로젝트 개요

소상공인들의 창업을 지원하는 종합 웹서비스의 백엔드 API 서버입니다. 회원 관리, 게시판, 중고거래 마켓, 실시간 채팅, 신고 시스템 등의 기능을 제공합니다.

## 🎯 주요 기능

### 👤 회원 관리
- ✅ 회원가입 / 로그인
- ✅ JWT 토큰 기반 인증
- ✅ 아이디/비밀번호 찾기 (이메일 발송)
- ✅ 회원 정보 조회/수정
- ✅ 비밀번호 변경
- ✅ 회원 탈퇴

### 📝 게시판 기능
- ✅ 게시글 작성/조회/수정/삭제
- ✅ 댓글 시스템 (대댓글 지원)
- ✅ 첨부파일 업로드
- ✅ 조회수 카운트

### 🛒 중고거래 마켓
- ✅ 판매/구매 게시글 관리
- ✅ 상품 이미지 업로드
- ✅ 내가 쓴 마켓글 조회

### 💬 실시간 채팅
- ✅ 1:1 채팅방 생성
- ✅ 실시간 메시지 송수신
- ✅ 채팅 내역 조회

### 🚨 신고 시스템
- ✅ 게시글/댓글 신고
- ✅ 관리자 신고 처리
- ✅ 신고 누적 시 계정 제재

### 👨‍💼 관리자 기능
- ✅ 신고 목록 조회
- ✅ 신고 승인/거절 처리
- ✅ 회원 제재 관리

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 3.4.6
- **Security**: Spring Security + JWT
- **Database**: Oracle 11g
- **ORM**: MyBatis
- **API Documentation**: Springfox Swagger 3.0.0
- **Email**: Gmail SMTP

### Frontend (예정)
- **Framework**: React.js
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI

## 📁 프로젝트 구조

```
startup_web_service/
├── src/main/java/kr/or/iei/
│   ├── common/
│   │   ├── SecurityConfig.java          # 보안 설정
│   │   ├── SwaggerConfig.java           # API 문서 설정
│   │   ├── service/
│   │   │   └── EmailService.java        # 이메일 발송 서비스
│   │   ├── annotation/
│   │   │   ├── NoTokenCheck.java        # 토큰 검증 제외 어노테이션
│   │   │   └── TokenRequired.java       # 토큰 검증 필수 어노테이션
│   │   ├── dto/
│   │   │   └── ResponseDTO.java         # 공통 응답 DTO
│   │   ├── exception/
│   │   │   ├── CommonException.java     # 공통 예외 클래스
│   │   │   └── CommonExceptionHandler.java # 예외 처리 핸들러
│   │   └── util/
│   │       └── JwtUtils.java            # JWT 토큰 유틸리티
│   ├── member/
│   │   ├── controller/
│   │   │   └── MemberController.java    # 회원 관리 API
│   │   ├── model/
│   │   │   ├── service/
│   │   │   │   └── MemberService.java   # 회원 비즈니스 로직
│   │   │   ├── dao/
│   │   │   │   └── MemberDao.java       # 회원 데이터 접근
│   │   │   └── dto/
│   │   │       ├── Member.java          # 회원 DTO
│   │   │       ├── LoginMember.java     # 로그인 회원 DTO
│   │   │       ├── Post.java            # 게시글 DTO
│   │   │       ├── Market.java          # 마켓글 DTO
│   │   │       └── Report.java          # 신고 DTO
│   └── StartupWebServiceApplication.java # 메인 애플리케이션 클래스
├── src/main/resources/
│   ├── application.properties           # 애플리케이션 설정
│   └── mapper/
│       └── member-mapper.xml            # SQL 쿼리 매핑
└── pom.xml                              # Maven 의존성 관리
```

## 🚀 시작하기

### 필수 요구사항
- Java 17 이상
- Oracle Database 11g 이상
- Maven 3.6 이상

### 1. 데이터베이스 설정
```sql
-- Oracle 데이터베이스에 startup_support 사용자 생성
CREATE USER startup_support IDENTIFIED BY 1234;
GRANT CONNECT, RESOURCE TO startup_support;
GRANT CREATE SESSION TO startup_support;
GRANT UNLIMITED TABLESPACE TO startup_support;
```

### 2. 애플리케이션 설정
`src/main/resources/application.properties` 파일에서 다음 설정을 확인/수정:

```properties
# 데이터베이스 연결 설정
spring.datasource.url=jdbc:oracle:thin:@127.0.0.1:1521:xe
spring.datasource.username=startup_support
spring.datasource.password=1234

# Gmail 이메일 설정 (비밀번호 찾기 기능용)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3. Gmail 앱 비밀번호 설정
1. Gmail 2단계 인증 활성화
2. 앱 비밀번호 생성 (16자리)
3. `application.properties`에 앱 비밀번호 입력

### 4. 애플리케이션 실행
```bash
# 프로젝트 루트 디렉토리에서
mvn spring-boot:run
```

### 5. API 문서 확인
- **Swagger UI**: http://localhost:9999/swagger-ui/
- **API JSON**: http://localhost:9999/v2/api-docs

## 📚 API 사용법

### 인증이 필요하지 않은 API
```bash
# 회원가입
POST /member
{
  "userId": "test123",
  "userPw": "password123",
  "userName": "홍길동",
  "userPhone": "010-1234-5678",
  "userEmail": "test@example.com",
  "userAddr": "서울시 강남구"
}

# 로그인
POST /member/login
{
  "userId": "test123",
  "userPw": "password123"
}

# 아이디 찾기
POST /member/findId?userEmail=test@example.com

# 비밀번호 찾기
POST /member/findPw?userId=test123&userEmail=test@example.com
```

### 인증이 필요한 API
```bash
# 1. 로그인하여 JWT 토큰 발급
# 2. Swagger UI에서 Authorize 버튼 클릭
# 3. Bearer [JWT_TOKEN] 형식으로 토큰 입력
# 4. API 호출

# 회원 정보 조회
GET /member/{userId}

# 비밀번호 변경
PATCH /member/memberPw
{
  "userId": "test123",
  "userPw": "newpassword123"
}

# 회원 탈퇴
DELETE /member/{userId}
```

## 🔧 개발 환경 설정

### 테스트용 보안 설정
개발 중 API 테스트를 위해 `SecurityConfig.java`에서 다음 주석을 해제:

```java
// 테스트용 허용 경로들 (필요시 주석 해제)
.requestMatchers("/member/memberPw", "/member/*").permitAll()
```

### 이메일 발송 테스트
1. Gmail 앱 비밀번호 설정 완료
2. 비밀번호 찾기 API 호출
3. 실제 이메일 수신 확인

## 🐛 주요 오류 및 해결방법

### 1. Gmail 인증 실패
**오류**: `Authentication failed`

**해결**: 일반 비밀번호 대신 Gmail 앱 비밀번호 사용

### 2. 403 Forbidden 오류
**오류**: `Error: response status is 403`

**해결**: JWT 토큰 인증 또는 테스트용 보안 설정 활성화

### 3. Docket 클래스 찾을 수 없음
**오류**: `java.lang.ClassNotFoundException: Docket`

**해결**: `pom.xml`에 Springfox 의존성 추가
