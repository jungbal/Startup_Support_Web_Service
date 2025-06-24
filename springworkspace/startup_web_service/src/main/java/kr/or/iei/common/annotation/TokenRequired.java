package kr.or.iei.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * JWT 토큰 검증이 필요한 메소드에 사용하는 어노테이션
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface TokenRequired {
    /**
     * 필요한 최소 권한 레벨 (기본값: 1)
     */
    int level() default 1;
    
    /**
     * 토큰 검증 실패 시 반환할 메시지
     */
    String message() default "인증이 필요한 서비스입니다.";
} 