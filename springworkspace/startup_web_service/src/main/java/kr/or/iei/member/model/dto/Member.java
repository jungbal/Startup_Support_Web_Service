package kr.or.iei.member.model.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Member {
	private String userId;
	private String userName;
	private String userPw;
	private String userPhone;
	private String userEmail;
	private String userAddr;
	private int userLevel;
	private int reportCount;
	private Date banUntil;
	
	
}
