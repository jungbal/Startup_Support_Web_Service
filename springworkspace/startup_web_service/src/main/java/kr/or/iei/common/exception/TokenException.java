package kr.or.iei.common.exception;

/**
 * JWT 토큰 관련 예외 클래스
 */
public class TokenException extends RuntimeException {
    
    public TokenException(String message) {
        super(message);
    }
    
    public TokenException(String message, Throwable cause) {
        super(message, cause);
    }
} 