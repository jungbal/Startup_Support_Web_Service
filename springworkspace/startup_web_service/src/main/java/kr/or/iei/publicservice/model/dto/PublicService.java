package kr.or.iei.publicservice.model.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PublicService {

	private String serviceId;
	private String userType;
	private String serviceName;
	private String serviceSummary;
	private String serviceUrl;
}
