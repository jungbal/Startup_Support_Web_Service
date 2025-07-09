package kr.or.iei.member.model.dto;

import java.util.Date;
import java.util.List;

import kr.or.iei.market.model.dto.MarketFile;
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
	private String marketDate;
	private int readCount;
	private int reportCount;
	private Integer price;  // Integer로 선언 (null 허용)
	private String marketStatus;
	
	private String filePath; // 썸네일 표기를 위한 join 해오기 위함
	private List<MarketFile> fileList; // 게시글에 대한 파일 정보
	private int [] delMarketFileNo; //삭제 파일 번호 배열 저장 변수
	
	
} 