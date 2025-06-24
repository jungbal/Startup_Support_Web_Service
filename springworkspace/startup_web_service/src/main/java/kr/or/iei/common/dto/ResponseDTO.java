package kr.or.iei.common.dto;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class ResponseDTO {
	

	private HttpStatus httpStatus;

	private String clientMsg;
	
	private Object resData;
	
	private String alertIcon;
	
	
	
}
