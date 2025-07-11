package kr.or.iei.member.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Report {
    private String reportId;        // 신고 ID
    private String reporterId;      // 신고자 ID
    private String postType;        // 게시글 타입 (post, market 등)
    private int postId;            // 게시글 번호
    private String reason;         // 신고 사유
    private String reportDate;     // 신고 일자
    private String reportStatus;   // 신고 처리 상태 (wait, approved, rejected)
    private String adminId;        // 신고 처리자 ID
    private String processDate;    // 처리 일자
} 