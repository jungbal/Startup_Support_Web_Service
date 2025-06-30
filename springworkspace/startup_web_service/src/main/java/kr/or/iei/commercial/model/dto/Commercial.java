package kr.or.iei.commercial.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Commercial {
    private String storeId;         // 상가업소 ID (M_NO)
    private String storeName;       // 상호명 (M_NM)
    private String provinceName;    // 시도명 (SIDO_NM)
    private String districtName;    // 시군구명 (SIGUN_NM)
    private String townName;        // 행정동명 (HANG_NM)
    private String roadAddr;        // 도로명 주소 (DORO_ADDR)
    private String landAddr;        // 지번 주소 (ZIBUN_ADDR)
    private String categoryLarge;   // 업종 대분류명 (G_GB_NM)
    private String categoryMedium;  // 업종 중분류명 (S_GB_NM)
    private String categorySmall;   // 업종 소분류명 (T_GB_NM)
    private String largeCode;       // 대분류 코드 (G_GB_CD)
    private String mediumCode;      // 중분류 코드 (S_GB_CD)
    private String smallCode;       // 소분류 코드 (T_GB_CD)
}