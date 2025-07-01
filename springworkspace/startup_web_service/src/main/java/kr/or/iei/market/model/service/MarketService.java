package kr.or.iei.market.model.service;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.or.iei.common.dto.PageInfo;
import kr.or.iei.common.util.PageUtil;
import kr.or.iei.market.model.dao.MarketDao;
import kr.or.iei.member.model.dto.Market;

@Service
public class MarketService {
	@Autowired
	private MarketDao dao;
	
	@Autowired
	private PageUtil pageUtil;

	public HashMap<String, Object> selectMarketList(int reqPage) {
		int viewCnt =12;		// 한 페이지당 게시글 수 
		int pageNaviSize=5;		// 페이지 네이게이션 길이
		int totalCount = dao.selectBoardCount(); //현재 게시글 수
		
		PageInfo pageInfo=pageUtil.getPageInfo(reqPage ,viewCnt, pageNaviSize, totalCount);
		
		//게시글 목록
		ArrayList<Market> marketList=dao.selectMarketList();
		
		HashMap<String, Object> marketMap=new HashMap<String, Object>();
		marketMap.put("marketList", marketList);
		marketMap.put("pageInfo", pageInfo);
		
		return marketMap;
	}
	
	
}
