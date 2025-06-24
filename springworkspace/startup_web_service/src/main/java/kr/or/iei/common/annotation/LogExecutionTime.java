package kr.or.iei.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 메소드 실행 시간을 로깅하는 어노테이션
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {
    /**
     * 로그에 표시할 작업 이름
     */
    String value() default "";
    
    /**
     * 경고 임계값 (밀리초) - 이 시간을 초과하면 WARN 레벨로 로깅
     */
    long threshold() default 1000;
} 