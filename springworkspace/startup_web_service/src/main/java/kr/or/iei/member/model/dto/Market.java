package kr.or.iei.member.model.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Market {
	private int marketNo;
	private String userId;
	private String marketType;
	private String marketTitle;
	private String marketContent;
	private Date marketDate;
	private int readCount;
	private Integer price;  // Integer로 선언 (null 허용)
	private String marketStatus;
	
	private String filePath; // 썸네일 표기를 위한 join 해오기 위함
	
} 