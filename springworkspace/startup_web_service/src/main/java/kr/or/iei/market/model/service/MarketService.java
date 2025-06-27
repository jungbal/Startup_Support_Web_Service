package kr.or.iei.market.model.service;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.or.iei.market.model.dao.MarketDao;
import kr.or.iei.market.model.dto.Market;

@Service
public class MarketService {
	@Autowired
	private MarketDao dao;

	public ArrayList<Market> selectMarketList() {
		
		return dao.selectMarketList();
	}
	
	
}
