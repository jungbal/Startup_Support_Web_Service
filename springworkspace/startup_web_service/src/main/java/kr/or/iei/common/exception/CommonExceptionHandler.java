package kr.or.iei.common.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import kr.or.iei.common.dto.ResponseDTO;

//RestController가 작성된 컨트롤러에서 예외 발생 시, 처리할 핸들러 클래스
@RestControllerAdvice
public class CommonExceptionHandler {

	//발생한 예외 종류가 CommonException일 때 처리할 핸들러 메소드
	@ExceptionHandler(CommonException.class)
	public ResponseEntity<ResponseDTO> commonExceptionHandle(CommonException ex){
		ex.printStackTrace();
		
		ResponseDTO res = new ResponseDTO(ex.getErrorCode(), "", null, "");
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
	
}
