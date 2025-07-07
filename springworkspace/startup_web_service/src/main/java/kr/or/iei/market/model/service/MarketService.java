package kr.or.iei.market.model.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kr.or.iei.common.dto.PageInfo;
import kr.or.iei.common.util.PageUtil;
import kr.or.iei.market.model.dao.MarketDao;
import kr.or.iei.market.model.dto.MarketFile;
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
		ArrayList<Market> marketList=dao.selectMarketList(pageInfo);
		
		HashMap<String, Object> marketMap=new HashMap<String, Object>();
		marketMap.put("marketList", marketList);
		marketMap.put("pageInfo", pageInfo);
		
		return marketMap;
	}

	@Transactional
	public int insertMarket(Market market, ArrayList<MarketFile> fileList) {
		//마지막 게시글의 다음 게시글 번호 조회
		int marketNo=dao.selectMarketNo(market);
		market.setMarketNo(marketNo);
		
		//게시글 등록
		int result=dao.insertMarket(market);
		
		//게시글 첨부파일 등록
		if(result>0) {
			for(int i=0;i<fileList.size();i++) {
				MarketFile file=fileList.get(i);
				file.setMarketNo(marketNo);		//마켓글 번호 세팅

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

	@Transactional
	public ArrayList<MarketFile> updateMarket(Market market) {
		//게시글 정보 수정
		int result=dao.updateMarket(market);
		
		ArrayList<MarketFile> delFileList = new ArrayList<MarketFile>();
		
		if(result>0) {
			//삭제할 마켓파일 넘버 리스트가 있는 경우
			if(market.getDelMarketFileNo() != null) {
				//삭제할 파일 리스트 조회
				delFileList = dao.selectMarketDelFile(market.getDelMarketFileNo());
				//삭제할 파일 정보 삭제
				dao.deleteMarketFile(market.getDelMarketFileNo());
			}
			
			//수정/등록 파일 리스트가 있을 경우
			if(market.getFileList() != null) {
				for (MarketFile file : market.getFileList()) {
				    if ("new".equals(file.getFileType())) {
				        // 새 파일은 insert
				        dao.insertMarketFile(file);
				    } else if ("old".equals(file.getFileType())) {
				        // 기존 파일은 update - 순서, isMainFile만 update
				        dao.updateMarketFile(file);
				    }
				}
			}
		}
		return delFileList;
	}
	
	
	
}
