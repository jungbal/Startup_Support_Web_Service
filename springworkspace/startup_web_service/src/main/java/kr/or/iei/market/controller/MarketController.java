package kr.or.iei.market.controller;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.or.iei.common.dto.ResponseDTO;
import kr.or.iei.market.model.dto.Market;
import kr.or.iei.market.model.service.MarketService;

@RestController
@CrossOrigin("*")
@RequestMapping("/market")
public class MarketController {
	
	@Autowired
	private MarketService service;
	
	@GetMapping("/list")
	public ResponseEntity<ResponseDTO> selectMarketList(){
		ResponseDTO res= new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR,"마켓글 조회 중 오류가 발생하였습니다",null,"error");
		
		try {
			ArrayList<Market> marketList=service.selectMarketList();
			res = new ResponseDTO(HttpStatus.OK,"", marketList, "");
		}catch(Exception e) {
			e.printStackTrace();
		}
		
		return new ResponseEntity<ResponseDTO>(res, res.getHttpStatus());
	}
}
