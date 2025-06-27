package kr.or.iei.commercial.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.or.iei.commercial.model.service.CommercialService;

@RestController
@CrossOrigin("*")
@RequestMapping("/commercial")
public class CommercialController {

	@Autowired
	private CommercialService service;
}
