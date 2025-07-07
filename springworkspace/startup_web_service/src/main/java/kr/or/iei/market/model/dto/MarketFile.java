package kr.or.iei.market.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MarketFile {
	private int fileNo; 		//m_file_no   //파일 번호
	private int marketNo;	
	private String fileName;	//m_file_name //파일 이름
	private String filePath;	//m_file_path //파일 경로
	private String isMainFile;	//메인 이미지 // Y or N
	private int fileOrder;		//파일 순서
	
	
	private String fileType;	//기존이미지 or 새로운 이미지 여부
}
