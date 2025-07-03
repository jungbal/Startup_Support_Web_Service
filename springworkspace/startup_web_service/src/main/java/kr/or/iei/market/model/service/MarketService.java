package kr.or.iei.market.model.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.cors.CorsConfigurationSource;
import kr.or.iei.common.dto.PageInfo;
import kr.or.iei.common.util.PageUtil;
import kr.or.iei.market.model.dao.MarketDao;
import kr.or.iei.market.model.dto.MarketFile;
import kr.or.iei.member.model.dto.Market;

@Service
public class MarketService {

    private final CorsConfigurationSource corsConfigurationSource;
	@Autowired
	private MarketDao dao;
	
	@Autowired
	private PageUtil pageUtil;

    MarketService(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

	public HashMap<String, Object> selectMarketList(int reqPage) {
		int viewCnt =12;		// 한 페이지당 게시글 수 
		int pageNaviSize=5;		// 페이지 네이게이션 길이
		int totalCount = dao.selectBoardCount(); //현재 게시글 수
		
		PageInfo pageInfo=pageUtil.getPageInfo(reqPage ,viewCnt, pageNaviSize, totalCount);
		
		//게시글 목록
		ArrayList<Market> marketList=dao.selectMarketList(pageInfo);
		
		HashMap<String, Object> marketMap=new HashMap<String, Object>();
		marketMap.put("marketList", marketList);
		marketMap.put("pageInfo", pageInfo);
		
		return marketMap;
	}

	@Transactional
	public int insertBoard(Market market, ArrayList<MarketFile> fileList) {
		//등록된 게시글 번호 조회
		int marketNo=dao.selectMarketNo(market);
		market.setMarketNo(marketNo);
		
		//게시글 등록
		int result=dao.insertMarket(market);
		
		//게시글 첨부파일 등록
		if(result>0) {
			for(int i=0;i<fileList.size();i++) {
				MarketFile file=fileList.get(i);
				file.setMarketNo(marketNo);		//마켓글 번호 세팅
				
				if (i == 0) {					//메인 이미지 여부 
	                file.setIsMainFile("Y");	
	            } else {
	                file.setIsMainFile("N");
	            }
				result=dao.insertMarketFile(file);
			}
		}
		
		return result;
	}

	public Map<String, Object> selectOneMarket(int marketNo) {
		Market market=dao.selectOneMarket(marketNo); //게시글 1개 조회
		ArrayList<MarketFile> files = dao.selectFileByMarketNo(marketNo);
		
		Map<String, Object> marketData = new HashMap<String, Object>();
		marketData.put("market", market);
		marketData.put("files", files);
		
		return marketData;
	}

	public Market deleteMarket(int marketNo) {
		Market market = dao.selectOneMarket(marketNo); //DB뿐만 아니라 저장된 사진도 삭제 위해 파일 path 가져옴
		if(market != null) {
			//file은 cascade 설정되어있어 따로 삭제필요x
			int result= dao.deleteMarket(marketNo);
			if(result>0) { //DB에서 삭제 성공시 
				return market;
			}else {
				return null;
			}
		}
		return null;
	}
	
	
}
