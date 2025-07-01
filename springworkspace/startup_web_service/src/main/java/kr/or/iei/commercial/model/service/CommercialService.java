package kr.or.iei.commercial.model.service;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.or.iei.commercial.model.dao.CommercialDao;
import kr.or.iei.commercial.model.dto.Commercial;

@Service
public class CommercialService {

    @Autowired
    private CommercialDao dao;

    // 조건 검색 리스트
    public ArrayList<Commercial> getCommercialByFilter(Map<String, Object> param) {
        return dao.selectByCondition(param);
    }

    // 총 개수 반환
    public int getTotalCount(Map<String, Object> param) {
        return dao.selectTotalCount(param);
    }

    // 대분류 목록
    public ArrayList<Map<String, String>> getLargeCategories(String largeCode) {
        return dao.selectLargeCategories(largeCode);
    }

    // 중분류 목록
    public ArrayList<Map<String, String>> getMiddleCategories(String mediumCode) {
        return dao.selectMiddleCategories(mediumCode);
    }

    // 소분류 목록
    public ArrayList<Map<String, String>> getSmallCategories(Map<String, String> param) {
        return dao.selectSmallCategories(param);
    }
}
