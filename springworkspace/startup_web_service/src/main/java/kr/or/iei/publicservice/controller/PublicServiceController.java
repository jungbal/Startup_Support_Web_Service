package kr.or.iei.publicservice.controller;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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

}
