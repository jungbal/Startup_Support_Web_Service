package kr.or.iei.commercial.model.dao;

import java.util.ArrayList;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.or.iei.commercial.model.dto.Commercial;

@Mapper
public interface CommercialDao {

    // 조건 검색 목록
    ArrayList<Commercial> selectByCondition(Map<String, Object> param);

    // 총 상가 수
    int selectTotalCount(Map<String, Object> param);

    // 대분류 목록
    ArrayList<Map<String, String>> selectLargeCategories(@Param("largeCode") String largeCode);

    // 중분류 목록
    ArrayList<Map<String, String>> selectMiddleCategories(@Param("largeCode") String largeCode);

    // 소분류 목록
    ArrayList<Map<String, String>> selectSmallCategories(Map<String, String> param);
}
