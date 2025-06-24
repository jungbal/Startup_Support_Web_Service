package kr.or.iei.common.exception;

/**
 * 유효성 검증 관련 예외 클래스
 */
public class ValidationException extends RuntimeException {
    
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
} 