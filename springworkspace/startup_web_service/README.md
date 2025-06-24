# Startup Support Web Service - Member API 명세서

## 구현된 기능

### 1. 회원 관련 기능

#### 1-1. 아이디 중복 체크
- **URL**: `GET /member/{userId}/chkId`
- **설명**: 회원가입 시 아이디 중복 확인
- **토큰 필요**: 없음
- **응답**: 중복된 아이디 개수 (0: 사용 가능, 1: 중복)

#### 1-2. 회원가입
- **URL**: `POST /member`
- **설명**: 새 회원 등록
- **토큰 필요**: 없음
- **Request Body**:
```json
{
  "userId": "test123",
  "userName": "홍길동",
  "userPw": "password123",
  "userPhone": "010-1234-5678",
  "userEmail": "test@email.com",
  "userAddr": "서울시 강남구"
}
```

#### 1-3. 로그인
- **URL**: `POST /member/login`
- **설명**: 회원 로그인 및 JWT 토큰 발급
- **토큰 필요**: 없음
- **Request Body**:
```json
{
  "userId": "test123",
  "userPw": "password123"
}
```

#### 1-4. 회원 정보 조회
- **URL**: `GET /member/{userId}`
- **설명**: 특정 회원의 정보 조회
- **토큰 필요**: 있음

#### 1-5. 회원 정보 수정
- **URL**: `PATCH /member`
- **설명**: 회원 정보 수정 (이름, 전화번호, 이메일, 주소)
- **토큰 필요**: 있음
- **Request Body**:
```json
{
  "userId": "test123",
  "userName": "김철수",
  "userPhone": "010-9876-5432",
  "userEmail": "new@email.com",
  "userAddr": "부산시 해운대구"
}
```

#### 1-6. 비밀번호 확인
- **URL**: `POST /member/checkPw`
- **설명**: 현재 비밀번호 확인
- **토큰 필요**: 있음
- **Request Body**:
```json
{
  "userId": "test123",
  "userPw": "currentPassword"
}
```

#### 1-7. 비밀번호 변경
- **URL**: `PATCH /member/memberPw`
- **설명**: 비밀번호 변경
- **토큰 필요**: 있음
- **Request Body**:
```json
{
  "userId": "test123",
  "userPw": "newPassword123"
}
```

#### 1-8. 아이디 찾기
- **URL**: `POST /member/findId?userEmail={email}`
- **설명**: 이메일로 아이디 찾기
- **토큰 필요**: 없음

#### 1-9. 비밀번호 찾기 (임시 비밀번호 발급)
- **URL**: `POST /member/findPw?userId={userId}&userEmail={email}`
- **설명**: 임시 비밀번호 발급
- **토큰 필요**: 없음

#### 1-10. 회원 탈퇴
- **URL**: `DELETE /member/{userId}`
- **설명**: 회원 탈퇴
- **토큰 필요**: 있음

### 2. 내가 쓴 게시물 조회

#### 2-1. 내가 쓴 게시글 조회
- **URL**: `GET /member/{userId}/posts`
- **설명**: 특정 회원이 작성한 게시글 목록 조회 (QNA, 자유게시판 등)
- **토큰 필요**: 있음

#### 2-2. 내가 쓴 마켓글 조회
- **URL**: `GET /member/{userId}/markets`
- **설명**: 특정 회원이 작성한 마켓글(판매글) 목록 조회
- **토큰 필요**: 있음

### 3. 관리자 기능

#### 3-1. 신고 목록 조회
- **URL**: `GET /member/admin/reports`
- **설명**: 모든 신고 목록 조회 (관리자용)
- **토큰 필요**: 있음 (관리자 권한)

#### 3-2. 신고 처리
- **URL**: `PATCH /member/admin/reports?action={approve|reject}`
- **설명**: 신고 승인/거절 처리
- **토큰 필요**: 있음 (관리자 권한)
- **Request Body**:
```json
{
  "reportId": "RPT001",
  "reportStatus": "approved",
  "adminId": "admin123"
}
```

### 4. 토큰 관리

#### 4-1. 토큰 갱신
- **URL**: `POST /member/refresh`
- **설명**: Access Token 갱신
- **토큰 필요**: 없음 (Refresh Token 필요)
- **Request Body**:
```json
{
  "userId": "test123",
  "userLevel": 4
}
```

## 데이터베이스 테이블

### t_users (회원 테이블)
- user_id: 회원 아이디 (PK)
- user_name: 회원 이름
- user_pw: 암호화된 비밀번호
- user_phone: 전화번호
- user_email: 이메일
- user_addr: 주소
- user_level: 회원 등급 (4: 일반회원, 1: 관리자)
- report_count: 신고 누적 횟수
- ban_until: 이용 제한 기간

### t_posts (게시글 테이블)
- post_no: 게시글 번호 (PK)
- user_id: 작성자 아이디
- post_type: 게시글 타입 (QNA, 자유게시판 등)
- post_title: 제목
- post_content: 내용
- post_date: 작성일
- read_count: 조회수

### t_market (마켓글 테이블)
- market_no: 마켓글 번호 (PK)
- user_id: 작성자 아이디
- market_type: 마켓글 타입
- market_title: 제목
- market_content: 내용
- market_date: 작성일
- read_count: 조회수

### t_reports (신고 테이블)
- report_id: 신고 ID (PK)
- reporter_id: 신고자 아이디
- post_type: 게시글 타입
- post_id: 게시글 번호
- reason: 신고 사유
- report_date: 신고 일자
- report_status: 신고처리 상태 (wait, approved, rejected)
- admin_id: 신고처리자
- process_date: 처리일자

## 보안 설정

- JWT 토큰 기반 인증
- 비밀번호 BCrypt 암호화
- CORS 설정 완료
- 토큰 없이 접근 가능한 API에 @NoTokenCheck 어노테이션 적용

## 특이사항

1. **신고 누적 제재**: 신고 3회 누적 시 7일 이용 제한
2. **계정 제재 확인**: 로그인 시 제재 기간 확인
3. **임시 비밀번호**: UUID 기반 8자리 임시 비밀번호 발급
4. **컬럼 매핑**: MyBatis ResultMap을 통한 snake_case ↔ camelCase 변환 