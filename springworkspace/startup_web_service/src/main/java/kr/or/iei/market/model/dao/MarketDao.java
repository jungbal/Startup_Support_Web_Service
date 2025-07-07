package kr.or.iei.market.model.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import kr.or.iei.common.dto.PageInfo;
import kr.or.iei.market.model.dto.MarketFile;
import kr.or.iei.member.model.dto.Market;

@Mapper
public interface MarketDao {

	ArrayList<Market> selectMarketList(PageInfo pageInfo);

	int selectBoardCount();

	int insertMarket(Market market);

	int selectMarketNo(Market market);

	int insertMarketFile(MarketFile file);

	Market selectOneMarket(int marketNo);

	ArrayList<MarketFile> selectFileByMarketNo(int marketNo);

	int deleteMarket(int marketNo);

	int updateMarket(Market market);

	ArrayList<MarketFile> selectMarketDelFile(int[] delMarketFileNo);

	void deleteMarketFile(int[] delMarketFileNo);

	void updateMarketFile(MarketFile file);

	

}
