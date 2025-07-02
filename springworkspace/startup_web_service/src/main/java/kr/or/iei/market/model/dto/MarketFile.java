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
}
