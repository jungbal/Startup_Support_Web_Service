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
} 