package kr.or.iei.common.aop;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import kr.or.iei.common.exception.CommonException;
import kr.or.iei.common.util.JwtUtils;
import lombok.extern.slf4j.Slf4j;

/**
 * AOP를 사용한 JWT 토큰 검증
 * 모든 컨트롤러 메소드 실행 전에 토큰을 검증합니다.
 * @NoTokenCheck 어노테이션이 있는 메소드는 검증에서 제외됩니다.
 */
@Component
@Aspect
@Slf4j
public class ValidateAOP {
    
    @Autowired
    private JwtUtils jwtUtils;
    
    // 모든 Controller 메소드를 대상으로 하는 Pointcut
    @Pointcut("execution(* kr.or.iei.*.controller.*.*(..))")
    public void allControllerPointcut() {}
    
    // @NoTokenCheck 어노테이션이 있는 메소드를 대상으로 하는 Pointcut
    @Pointcut("@annotation(kr.or.iei.common.annotation.NoTokenCheck)")
    public void noTokenCheckAnnotation() {}
    
    // @NoTokenCheck 어노테이션이 없는 모든 Controller 메소드 실행 전 토큰 검증
    @Before("allControllerPointcut() && !noTokenCheckAnnotation()")
    public void validateTokenAop() {
        // 요청 객체 가져오기
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        
        // URI 확인
        String uri = request.getRequestURI();
        log.debug("토큰 검증 시작 - URI: {}", uri);
        
        // 헤더에서 토큰 추출
        // refresh 요청인 경우 refreshToken, 그 외에는 Authorization 헤더에서 추출
        String token = uri.endsWith("refresh")
                ? request.getHeader("refreshToken")
                : request.getHeader("Authorization");
        
        // 토큰이 없는 경우
        if (token == null || token.isEmpty()) {
            log.error("토큰이 없습니다 - URI: {}", uri);
            CommonException ex = new CommonException("토큰이 필요한 서비스입니다.");
            ex.setErrorCode(HttpStatus.UNAUTHORIZED);
            throw ex;
        }
        
        // 토큰 검증
        boolean isValid = jwtUtils.validateToken(token);
        
        if (!isValid) {
            log.error("유효하지 않은 토큰 - URI: {}", uri);
            CommonException ex = new CommonException("유효하지 않은 토큰입니다.");
            ex.setErrorCode(HttpStatus.UNAUTHORIZED);
            throw ex;
        }
        
        log.debug("토큰 검증 성공 - URI: {}", uri);
    }
} 