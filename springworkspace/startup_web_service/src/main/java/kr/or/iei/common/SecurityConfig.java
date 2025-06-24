package kr.or.iei.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 보안 설정 클래스
 * - 웹 애플리케이션의 보안 규칙을 정의
 * - 어떤 URL에 누가 접근할 수 있는지 설정
 */
@Configuration  // 이 클래스가 설정 클래스임을 Spring에게 알림
@EnableWebSecurity  // Spring Security 기능을 활성화
public class SecurityConfig {

    /**
     * 보안 필터 체인 설정
     * - HTTP 요청에 대한 보안 규칙을 정의
     * - 어떤 URL은 인증 없이 접근 가능하고, 어떤 URL은 인증이 필요한지 설정
     */
    @Bean  // 이 메소드가 Spring Bean으로 등록됨을 의미
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 공격 방지 기능 비활성화 (REST API에서는 불필요)
            .csrf(csrf -> csrf.disable())
            
            // 세션 관리 설정 - JWT 토큰을 사용하므로 세션을 사용하지 않음
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // HTTP 요청에 대한 권한 설정
            .authorizeHttpRequests(auth -> auth
                // Swagger UI 관련 경로 허용 (API 문서 확인용)
                // - /swagger-ui/** : Swagger UI 페이지
                // - /v3/api-docs/** : API 문서 JSON
                // - /swagger-resources/** : Swagger 리소스
                // - /v2/api-docs/** : API 문서 (v2)
                // - /webjars/** : 웹 자바스크립트 라이브러리
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/v2/api-docs/**", "/webjars/**").permitAll()
                
                // 회원가입, 로그인, 아이디/비밀번호 찾기 허용 (인증 없이 접근 가능)
                // - /member/*/chkId : 아이디 중복 체크
                // - /member : 회원가입 (POST)
                // - /member/login : 로그인
                // - /member/findId : 아이디 찾기
                // - /member/findPw : 비밀번호 찾기
                // - /member/refresh : 토큰 갱신
                .requestMatchers("/member/*/chkId", "/member", "/member/login", "/member/findId", "/member/findPw", "/member/refresh").permitAll()
                
                // 테스트용 허용 경로들 (필요시 주석 해제)
                // - 모든 회원 관련 API를 인증 없이 테스트할 수 있음
                // - 실제 운영에서는 반드시 주석 처리해야 함
                // .requestMatchers("/member/memberPw", "/member/*").permitAll()
                
                // 기타 모든 요청은 인증 필요 (JWT 토큰이 있어야 접근 가능)
                .anyRequest().authenticated()
            )
            
            // HTTP 기본 인증 비활성화 (JWT 토큰 사용)
            .httpBasic(basic -> basic.disable())
            
            // 폼 로그인 비활성화 (REST API에서는 불필요)
            .formLogin(form -> form.disable());
            
        // 설정된 보안 규칙을 반환
        return http.build();
    }
} 