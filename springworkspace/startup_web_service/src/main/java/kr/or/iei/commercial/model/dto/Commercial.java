package kr.or.iei.commercial.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Commercial {

	private String storeId;
	private String storeName;
	private String provinceName;
	private String districtName;
	private String townName;
	private String roadAddr;
	private String landAddr;
	private String categoryLarge;
	private String categoryMedium;
	private String categorySmall;
	private String LargeCode;
	private String MediumCode;
	private String SmallCode;
}
