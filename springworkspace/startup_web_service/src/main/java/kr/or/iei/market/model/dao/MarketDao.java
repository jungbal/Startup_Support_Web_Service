package kr.or.iei.market.model.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import kr.or.iei.market.model.dto.MarketFile;
import kr.or.iei.member.model.dto.Market;

@Mapper
public interface MarketDao {

	ArrayList<Market> selectMarketList();

	int selectBoardCount();

	int insertMarket(Market market);

	int selectMarketNo(Market market);

	int insertMarketFile(MarketFile file);

	

}
