package kr.or.iei.common.exception;

import org.springframework.http.HttpStatus;

/*
 * 사용자 정의 예외 : 컴파일 및 실행(인타임) 중, 예외가 발생하지는 않지만
 * 				논리적인(비즈니스 설계 원칙) 오류가 발생했을 떄, 강제로 예외를 발생시키기 위한 용도로 작성
 * 
 * */
public class CommonException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
	
	private HttpStatus errorCode;	//HTTP 응답 코드
	private String userMsg;			//사용자 출력 메시지
	
	public CommonException() {
		super();
	}
	
	public CommonException(String systemMsg) {
		super(systemMsg);
	}
	
	public HttpStatus getErrorCode() {
		return this.errorCode;
	}
	
	public void setErrorCode(HttpStatus errorCode) {
		this.errorCode = errorCode;
	}
	
	public String getUserMsg() {
		return this.userMsg;
	}
	public void setUserMsg(String userMsg) {
		this.userMsg = userMsg;
	}
}
