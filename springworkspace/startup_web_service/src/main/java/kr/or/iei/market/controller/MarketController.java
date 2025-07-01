package kr.or.iei.market.controller;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.or.iei.common.annotation.NoTokenCheck;
import kr.or.iei.common.dto.ResponseDTO;
import kr.or.iei.market.model.service.MarketService;

@RestController
@CrossOrigin("*")
@RequestMapping("/market")
public class MarketController {
	
	@Autowired
	private MarketService service;
	
	
	@GetMapping("/list")
	@NoTokenCheck
	public ResponseEntity<ResponseDTO> selectMarketList(@PathVariable int reqPage){
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"마켓글 조회 중 오류가 발생하였습니다",null,"error");
		
		try {
			HashMap<String, Object> marketList=service.selectMarketList(reqPage);
			res = new ResponseDTO(HttpStatus.OK,"", marketList, "");
			
		}catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
}
