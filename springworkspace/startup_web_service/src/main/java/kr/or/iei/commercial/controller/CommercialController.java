package kr.or.iei.commercial.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import kr.or.iei.commercial.model.dto.Commercial;
import kr.or.iei.commercial.model.service.CommercialService;
import kr.or.iei.common.annotation.NoTokenCheck;

@RestController
@CrossOrigin("*") // 프론트 요청 허용
@RequestMapping("/commercial")
public class CommercialController {

    @Autowired
    private CommercialService service;

    /**
     * 조건 검색 API
     * - 대/중/소 분류 + 키워드 + 페이징
     */
    @NoTokenCheck
    @GetMapping("/filter")
    public Map<String, Object> getFilteredCommercial(
        @RequestParam(required = false) String largeCode,
        @RequestParam(required = false) String mediumCode,
        @RequestParam(required = false) String smallCode,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int numOfRows
    ) {
        int startRow = (page - 1) * numOfRows + 1;
        int endRow = page * numOfRows;

        Map<String, Object> param = new HashMap<>();
        param.put("largeCode", largeCode);
        param.put("mediumCode", mediumCode);
        param.put("smallCode", smallCode);
        param.put("keyword", keyword);
        param.put("startRow", startRow);
        param.put("endRow", endRow);

        ArrayList<Commercial> list = service.getCommercialByFilter(param);
        int totalCount = service.getTotalCount(param);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCount", totalCount);
        result.put("page", page);
        result.put("numOfRows", numOfRows);
        return result;
    }

    // 대분류 목록 조회
    @NoTokenCheck
    @GetMapping("/large")
    public ArrayList<Map<String, String>> getLargeCategories() {
        return service.getLargeCategories();
    }

    // 중분류 목록 조회
    @NoTokenCheck
    @GetMapping("/middle")
    public ArrayList<Map<String, String>> getMiddleCategories(@RequestParam String largeCode) {
        return service.getMiddleCategories(largeCode);
    }

    // 소분류 목록 조회
    @NoTokenCheck
    @GetMapping("/small")
    public ArrayList<Map<String, String>> getSmallCategories(
        @RequestParam String largeCode,
        @RequestParam String mediumCode
    ) {
        Map<String, String> param = new HashMap<>();
        param.put("largeCode", largeCode);
        param.put("mediumCode", mediumCode);
        return service.getSmallCategories(param);
    }
}
