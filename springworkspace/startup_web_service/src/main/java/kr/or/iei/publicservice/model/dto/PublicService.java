package kr.or.iei.publicservice.model.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PublicService {

	private String serviceId;            // 서비스 ID
    private String userType;             // 사용자 구분
    private String serviceName;          // 서비스명
    private String serviceSummary;       // 서비스 목적 요약
    private String serviceUrl;           // 상세조회 URL
    private String supportContent;       // 지원 내용
    private String targetAudience;       // 지원 대상
    private String selectionCriteria;    // 선정 기준
    private String applicationPeriod;    // 신청 기간
    private String contactInfo;          // 문의처 정보
    private String organizationName;     // 소관 기관명
    private String supportType;          // 지원 유형
    private String serviceField;         // 서비스 분야
}
