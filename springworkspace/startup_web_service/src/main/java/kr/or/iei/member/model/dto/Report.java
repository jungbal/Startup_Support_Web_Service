package kr.or.iei.member.model.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Report {
	private String reportId;
	private String reporterId;
	private String postType;
	private int postId;
	private String reason;
	private Date reportDate;
	private String reportStatus;
	private String adminId;
	private Date processDate;
} 