package kr.or.iei.publicservice.controller;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.or.iei.common.annotation.NoTokenCheck;
import kr.or.iei.publicservice.model.dto.PublicService;
import kr.or.iei.publicservice.model.service.PublicServiceService;


@RestController
@CrossOrigin("*")
@RequestMapping("/publicservice")
public class PublicServiceController {
	
	@Autowired
    private PublicServiceService service;

    // 전체 조회 (GET)
	@NoTokenCheck
    @GetMapping
    public ArrayList<PublicService> getAll() {
        return service.selectAll();
    }
	
	 // 상세 조회 (GET) - /{serviceId} 경로로 요청을 받습니다.
    @NoTokenCheck
    @GetMapping("/{serviceId}") // 이 엔드포인트를 추가
    public PublicService getServiceDetail(@PathVariable String serviceId) {
        return service.selectServiceDetail(serviceId);
    }

}
