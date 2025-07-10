package kr.or.iei.member.model.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Post {
	private int postNo;
	private String userId;
	private String postType;
	private String postTitle;
	private String postContent;
	private Date postDate;
	private int readCount;
	private String postStatus;
	private int reportCount;
	private String userName;  // 조인해서 가져올 작성자 이름
} 